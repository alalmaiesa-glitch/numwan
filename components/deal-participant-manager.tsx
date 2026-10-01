"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Participant = {
  user_id: string;
  email: string;
  created_at: string;
};

export default function DealParticipantManager({
  dealId,
  isOwner,
  participants,
}: {
  dealId: string;
  isOwner: boolean;
  participants: Participant[];
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function addParticipant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setBusy("add");

    try {
      const form = new FormData(event.currentTarget);
      const email = String(form.get("email") || "").trim();

      if (!email) {
        setMessage("أدخل بريد المستخدم.");
        return;
      }

      const { error } = await supabase.rpc("add_deal_participant_v1", {
        p_deal_id: dealId,
        p_email: email,
      });

      if (error) {
        setMessage("تعذر إضافة المشارك. تأكد أن البريد مرتبط بحساب نُموان.");
        return;
      }

      event.currentTarget.reset();
      setMessage("تمت إضافة المشارك إلى الصفقة.");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function removeParticipant(userId: string) {
    setMessage(null);
    setBusy("remove:" + userId);

    try {
      const { error } = await supabase.rpc("remove_deal_participant_v1", {
        p_deal_id: dealId,
        p_user_id: userId,
      });

      if (error) {
        setMessage("تعذر إزالة المشارك.");
        return;
      }

      setMessage("تمت إزالة المشارك من الصفقة.");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="dealParticipantsPanel">
      <div className="dealParticipantsHead">
        <span className="sectionKicker">الأطراف</span>
        <h2>المشاركون في الصفقة</h2>
        <p>
          {isOwner
            ? "يمكن لمالك الأصل إضافة مستخدمين مسجلين في نُموان أو إزالتهم من هذه الصفقة."
            : "يعرض نُموان مشاركتك المصرح بها في هذه الصفقة."}
        </p>
      </div>

      {isOwner ? (
        <form className="dealParticipantForm" onSubmit={addParticipant}>
          <label>إضافة مشارك بالبريد</label>
          <div>
            <input name="email" type="email" placeholder="name@example.com" required />
            <button type="submit" disabled={busy === "add"}>
              {busy === "add" ? "جارٍ الإضافة…" : "إضافة مشارك"}
            </button>
          </div>
        </form>
      ) : null}

      {message ? <p className="dealParticipantMessage">{message}</p> : null}

      <div className="dealParticipantList">
        {participants.length ? (
          participants.map((participant, index) => (
            <div className="dealParticipantRow" key={participant.user_id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{participant.email}</strong>
                <small>
                  أضيف في {new Date(participant.created_at).toLocaleDateString("ar-SA")}
                </small>
              </div>
              {isOwner ? (
                <button
                  type="button"
                  onClick={() => removeParticipant(participant.user_id)}
                  disabled={busy === "remove:" + participant.user_id}
                >
                  إزالة المشارك
                </button>
              ) : (
                <i>مشارك</i>
              )}
            </div>
          ))
        ) : (
          <div className="dealParticipantsEmpty">لا يوجد مشاركون إضافيون في هذه الصفقة.</div>
        )}
      </div>
    </section>
  );
}
