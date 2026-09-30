"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import TransitionArrow from "@/components/transition-arrow";

type Grant = {
  user_id: string;
  email: string;
  created_at: string;
};

type DocumentItem = {
  id: string;
  title: string;
  storage_path: string;
  created_at: string;
  grants: Grant[];
};

export default function DataRoomManager({
  assetId,
  isOwner,
  documents,
}: {
  assetId: string;
  isOwner: boolean;
  documents: DocumentItem[];
}) {
  const router = useRouter();
  const uploadForm = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClient();

  function cleanFileName(name: string) {
    const cleaned = name
      .normalize("NFKC")
      .replace(/[^\p{L}\p{N}._-]+/gu, "-")
      .replace(/^-+|-+$/g, "");
    return cleaned || "file";
  }

  async function uploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setBusy("upload");

    try {
      const form = new FormData(event.currentTarget);
      const title = String(form.get("title") || "").trim();
      const file = form.get("file");

      if (!title || !(file instanceof File) || file.size === 0) {
        setMessage("اختر ملفًا وأدخل عنوانًا للمستند.");
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        setMessage("انتهت جلسة الدخول. سجّل الدخول من جديد.");
        return;
      }

      const documentId = crypto.randomUUID();
      const storagePath = `${assetId}/${documentId}/${cleanFileName(file.name)}`;

      const { error: rowError } = await supabase.from("data_room_documents").insert({
        id: documentId,
        asset_id: assetId,
        title,
        storage_path: storagePath,
        uploaded_by: userData.user.id,
      });

      if (rowError) {
        setMessage("تعذر إنشاء سجل المستند.");
        return;
      }

      const { error: uploadError } = await supabase.storage
        .from("numwan-data-room")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) {
        await supabase.from("data_room_documents").delete().eq("id", documentId);
        setMessage("تعذر رفع الملف. لم يُحتفظ بسجل مستند غير مكتمل.");
        return;
      }

      await supabase.rpc("record_data_room_event_v1", {
        p_document_id: documentId,
        p_event_type: "FILE_UPLOADED",
      });

      uploadForm.current?.reset();
      setMessage("تم رفع المستند إلى غرفة البيانات الخاصة.");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function downloadDocument(document: DocumentItem) {
    setMessage(null);
    setBusy("download:" + document.id);

    try {
      const { data, error } = await supabase.storage
        .from("numwan-data-room")
        .createSignedUrl(document.storage_path, 60);

      if (error || !data?.signedUrl) {
        setMessage("تعذر إنشاء رابط التنزيل.");
        return;
      }

      await supabase.rpc("record_data_room_event_v1", {
        p_document_id: document.id,
        p_event_type: "FILE_DOWNLOADED",
      });

      window.location.assign(data.signedUrl);
    } finally {
      setBusy(null);
    }
  }

  async function grantAccess(event: FormEvent<HTMLFormElement>, documentId: string) {
    event.preventDefault();
    setMessage(null);
    setBusy("grant:" + documentId);

    try {
      const form = new FormData(event.currentTarget);
      const email = String(form.get("email") || "").trim();

      if (!email) {
        setMessage("أدخل بريد المستخدم الذي سيُمنح الوصول.");
        return;
      }

      const { error } = await supabase.rpc("grant_data_room_access_v1", {
        p_document_id: documentId,
        p_email: email,
      });

      if (error) {
        setMessage("تعذر منح الوصول. تأكد أن البريد مرتبط بحساب نُموان.");
        return;
      }

      event.currentTarget.reset();
      setMessage("تم منح الوصول للمستند.");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function revokeAccess(documentId: string, userId: string) {
    setMessage(null);
    setBusy("revoke:" + documentId + ":" + userId);

    try {
      const { error } = await supabase.rpc("revoke_data_room_access_v1", {
        p_document_id: documentId,
        p_user_id: userId,
      });

      if (error) {
        setMessage("تعذر إلغاء الوصول.");
        return;
      }

      setMessage("تم إلغاء الوصول.");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      {isOwner ? (
        <section className="dataRoomUpload">
          <div>
            <span className="sectionKicker">إضافة مستند</span>
            <h2>رفع إلى غرفة البيانات</h2>
            <p>يُحفظ الملف في التخزين الخاص، ولا يصبح عامًا عند رفعه.</p>
          </div>

          <form ref={uploadForm} onSubmit={uploadDocument} className="form">
            <div className="field">
              <label>عنوان المستند</label>
              <input name="title" required />
            </div>

            <div className="field">
              <label>الملف</label>
              <input name="file" type="file" required />
            </div>

            <button className="button" type="submit" disabled={busy === "upload"}>
              {busy === "upload" ? "جارٍ الرفع…" : "رفع المستند"}
            </button>
          </form>
        </section>
      ) : null}

      {message ? <p className="roomMessage">{message}</p> : null}

      <section className="documentList documentCardList">
        {documents.length ? (
          documents.map((document, index) => (
            <article className="documentCard organizedDocumentCard" key={document.id}>
              <header className="documentCardHead">
                <div className="documentCardInfo">
                  <span className="documentIndex">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="documentTitleBlock">
                    <strong>{document.title}</strong>
                    <small>{new Date(document.created_at).toLocaleDateString("ar-SA")}</small>
                  </div>
                </div>

                <div className="documentHeadActions">
                  <span className="documentBadge">خاص</span>

                  <button
                    className="documentAction roomActionButton"
                    type="button"
                    onClick={() => downloadDocument(document)}
                    disabled={busy === "download:" + document.id}
                  >
                    {busy === "download:" + document.id ? (
                      <span>جارٍ…</span>
                    ) : (
                      <>
                        <span>تنزيل</span>
                        <TransitionArrow />
                      </>
                    )}
                  </button>
                </div>
              </header>

              {isOwner ? (
                <div className="documentAccessBlock">
                  <section className="documentAccessSection">
                    <span className="sectionMiniTitle">منح الوصول بالبريد</span>

                    <form
                      className="documentGrantForm"
                      onSubmit={(event) => grantAccess(event, document.id)}
                    >
                      <input
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                      />
                      <button
                        className="roomAccessButton"
                        type="submit"
                        disabled={busy === "grant:" + document.id}
                      >
                        منح الوصول
                      </button>
                    </form>
                  </section>

                  <section className="documentAccessSection">
                    <span className="sectionMiniTitle">صلاحيات الوصول الحالية</span>

                    <div className="grantList organizedGrantList">
                      {document.grants.length ? (
                        document.grants.map((grant) => (
                          <div className="grantRow" key={grant.user_id}>
                            <div className="grantIdentity">
                              <span>{grant.email}</span>
                              <small>وصول إلى هذا المستند فقط</small>
                            </div>

                            <button
                              className="roomRevokeButton"
                              type="button"
                              onClick={() => revokeAccess(document.id, grant.user_id)}
                              disabled={
                                busy === "revoke:" + document.id + ":" + grant.user_id
                              }
                            >
                              إلغاء الوصول
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="grantEmpty">
                          لا توجد صلاحيات وصول إضافية لهذا المستند.
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <div className="editorialEmpty">
            <span>00</span>
            <h2>لا توجد مستندات متاحة.</h2>
            <p>
              {isOwner
                ? "ارفع أول مستند إلى غرفة البيانات."
                : "لم يُمنح حسابك وصولًا إلى مستندات هنا."}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
