"use client";

import { FormEvent,useState } from "react";

export default function LaunchLeadForm({language}:{language:"ar"|"en"}){
  const [email,setEmail]=useState("");
  const [consent,setConsent]=useState(false);
  const [status,setStatus]=useState<"idle"|"sending"|"success"|"error">("idle");

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!email || !consent) return;

    setStatus("sending");
    const params=new URLSearchParams(window.location.search);

    try{
      const response=await fetch("/api/store/leads",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          email,
          consent,
          language,
          productSlug:"saudi-industrial-intelligence-v1",
          source:"saudi-heavy-industry-snapshot",
          website:(event.currentTarget.elements.namedItem("website") as HTMLInputElement)?.value||"",
          utmSource:params.get("utm_source"),
          utmMedium:params.get("utm_medium"),
          utmCampaign:params.get("utm_campaign")
        })
      });

      if(!response.ok) throw new Error("lead_capture_failed");

      setStatus("success");
      setEmail("");
      setConsent(false);
    }catch{
      setStatus("error");
    }
  }

  const ar=language==="ar";

  return <form className="snapshotLeadForm" onSubmit={submit}>
    <div className="snapshotLeadRow">
      <label>
        <span>{ar?"البريد الإلكتروني":"Email"}</span>
        <input
          type="email"
          value={email}
          onChange={event=>setEmail(event.target.value)}
          placeholder={ar?"name@company.com":"name@company.com"}
          autoComplete="email"
          required
        />
      </label>
      <label className="snapshotHoneypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off"/>
      </label>
      <button type="submit" disabled={status==="sending"}>
        {status==="sending"
          ? (ar?"جارٍ التسجيل...":"Submitting...")
          : (ar?"أبلغني عند الإطلاق":"Notify me at launch")}
      </button>
    </div>

    <label className="snapshotConsent">
      <input
        type="checkbox"
        checked={consent}
        onChange={event=>setConsent(event.target.checked)}
        required
      />
      <span>{ar
        ?"أوافق على استلام إشعار إطلاق هذا الأصل وتحديثاته ذات الصلة. يمكنني إلغاء الاشتراك لاحقًا."
        :"I agree to receive the launch notice and relevant updates for this asset. I can unsubscribe later."}</span>
    </label>

    {status==="success"
      ? <p className="snapshotFormSuccess">{ar?"تم تسجيل اهتمامك. سنستخدم البريد لهذا الأصل وتحديثاته المرتبطة فقط.":"You're on the launch list. We'll use this email only for this asset and related updates."}</p>
      : null}

    {status==="error"
      ? <p className="snapshotFormError">{ar?"تعذر التسجيل الآن. حاول مرة أخرى.":"Could not save your request. Please try again."}</p>
      : null}
  </form>;
}
