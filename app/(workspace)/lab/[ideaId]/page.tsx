import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { convertIdeaToAsset, createEvidence, createExperiment, createHypothesis } from "./actions";
import { assetStatusAr, hypothesisImportanceAr, verificationStatusAr, labelOf } from "@/lib/labels-ar";

export default async function LabPage({
  params, searchParams,
}: {
  params: Promise<{ideaId:string}>;
  searchParams: Promise<{error?:string}>;
}) {
  const {ideaId}=await params;
  const query=await searchParams;
  const supabase=await createClient();

  const {data:idea}=await supabase.from("ideas").select("*").eq("id",ideaId).single();
  if(!idea) notFound();

  const [{data:hypothesesData},{data:linkedAsset}]=await Promise.all([
    supabase.from("hypotheses").select("*").eq("idea_id",ideaId).order("created_at",{ascending:true}),
    supabase.from("assets").select("id,status").eq("source_idea_id",ideaId).maybeSingle(),
  ]);
  const hypotheses=hypothesesData??[];
  const hypothesisIds=hypotheses.map(item=>item.id);
  let evidence:Array<Record<string,unknown>>=[];
  let experiments:Array<Record<string,unknown>>=[];

  if(hypothesisIds.length){
    const [{data:evidenceData},{data:experimentsData}]=await Promise.all([
      supabase.from("evidence").select("*").in("hypothesis_id",hypothesisIds).order("created_at",{ascending:true}),
      supabase.from("experiments").select("*").in("hypothesis_id",hypothesisIds).order("created_at",{ascending:true}),
    ]);
    evidence=(evidenceData??[]) as Array<Record<string,unknown>>;
    experiments=(experimentsData??[]) as Array<Record<string,unknown>>;
  }

  return <>
    <header className="labHead">
      <div><span className="sectionKicker">مختبر الفرصة / {idea.confidentiality_level}</span><h1>{idea.title}</h1><p>{idea.short_description||"مختبر التحقق والتطوير للفكرة."}</p></div>
      <div className="labCounts"><div><strong>{hypotheses.length}</strong><span>فرضيات</span></div><div><strong>{evidence.length}</strong><span>أدلة</span></div><div><strong>{experiments.length}</strong><span>تجارب</span></div></div>
    </header>

    <div className="tabs"><span className="tab active">نظرة عامة</span><span className="tab">الفرضيات</span><span className="tab">الأدلة</span><span className="tab">التجارب</span><span className="tab disabled">المخاطر</span><span className="tab disabled">التقييم</span><span className="tab disabled">القرار</span></div>
    {query.error?<p className="error">{query.error==="asset-transition"?"تعذر تحويل الفرصة إلى أصل. تحقق من الصلاحيات وحاول مرة أخرى.":"تعذر حفظ العنصر. تحقق من البيانات والصلاحيات."}</p>:null}

    <section className="labOverview">
      {[
        ["01","المشكلة",idea.problem],["02","الحل الأولي",idea.initial_solution],["03","السوق",idea.market],
        ["04","العميل",idea.customer],["05","المشتري المحتمل",idea.potential_buyer],["06","مصدر الفكرة",idea.idea_source],
      ].map(([n,label,value])=><div className="overviewDatum" key={n}><span>{n}</span><strong>{label}</strong><p>{value||"—"}</p></div>)}
    </section>

    <section className="labModule">
      <div className="labModuleHead"><span>01</span><div><small>الفرضيات</small><h2>الفرضيات</h2><p>ما الذي يجب أن يكون صحيحًا حتى تستحق الفرصة الانتقال إلى المرحلة التالية؟</p></div></div>
      <div className="labModuleBody">
        <form action={createHypothesis} className="form">
          <input type="hidden" name="idea_id" value={ideaId}/>
          <div className="grid3">
            <div className="field"><label>الرمز</label><input name="code" required placeholder="ف1"/></div>
            <div className="field"><label>النوع</label><input name="hypothesis_type"/></div>
            <div className="field"><label>الأهمية</label><select name="importance" defaultValue="MAJOR"><option value="CRITICAL">حرجة</option><option value="MAJOR">رئيسية</option><option value="SECONDARY">ثانوية</option></select></div>
          </div>
          <div className="field"><label>وصف الفرضية</label><textarea name="description" required/></div>
          <div><button className="button small">إضافة فرضية</button></div>
        </form>
        {hypotheses.length?<div className="recordList">{hypotheses.map(h=><div className="recordRow" key={h.id}><span>{h.code}</span><p>{h.description}</p><i>{labelOf(hypothesisImportanceAr,h.importance)}</i><b>{labelOf(verificationStatusAr,h.verification_status)}</b></div>)}</div>:<div className="empty">لا توجد فرضيات بعد.</div>}
      </div>
    </section>

    <section className="labModule">
      <div className="labModuleHead"><span>02</span><div><small>الأدلة</small><h2>الأدلة</h2><p>ما الذي يدعم الادعاء، وما حدود ما يمكن لهذا الدليل أن يثبته؟</p></div></div>
      <div className="labModuleBody">
        {hypotheses.length?<form action={createEvidence} className="form">
          <input type="hidden" name="idea_id" value={ideaId}/>
          <div className="grid3">
            <div className="field"><label>الفرضية</label><select name="hypothesis_id">{hypotheses.map(h=><option key={h.id} value={h.id}>{h.code}</option>)}</select></div>
            <div className="field"><label>رمز الدليل</label><input name="code" required placeholder="د1"/></div>
            <div className="field"><label>قوة الدليل</label><select name="evidence_strength" defaultValue="E1"><option value="E1">المستوى 1</option><option value="E2">المستوى 2</option><option value="E3">المستوى 3</option><option value="E4">المستوى 4</option><option value="E5">المستوى 5</option></select></div>
          </div>
          <div className="field"><label>الادعاء / الدليل</label><textarea name="claim" required/></div>
          <div className="grid2"><div className="field"><label>المصدر</label><input name="source"/></div><div className="field"><label>التاريخ</label><input name="evidence_date" type="date"/></div><div className="field"><label>نوع الدليل</label><input name="evidence_type"/></div><div className="field"><label>ما الذي يثبته؟</label><input name="proves"/></div></div>
          <div className="field"><label>ما الذي لا يثبته؟</label><textarea name="does_not_prove"/></div>
          <div><button className="button small">إضافة دليل</button></div>
        </form>:<div className="empty">أضف فرضية أولًا لربط الأدلة بها.</div>}
        {evidence.length?<div className="recordList">{evidence.map(item=><div className="recordRow" key={String(item.id)}><span>{String(item.code??"")}</span><p>{String(item.claim??"")}</p><i>{String(item.evidence_strength??"")}</i><b>{String(item.source??"—")}</b></div>)}</div>:null}
      </div>
    </section>

    <section className="labModule">
      <div className="labModuleHead"><span>03</span><div><small>التجارب</small><h2>التجارب</h2><p>اختبارات محددة بمعيار نجاح وفشل لتقليل عدم اليقين.</p></div></div>
      <div className="labModuleBody">
        {hypotheses.length?<form action={createExperiment} className="form">
          <input type="hidden" name="idea_id" value={ideaId}/>
          <div className="grid3"><div className="field"><label>الفرضية</label><select name="hypothesis_id">{hypotheses.map(h=><option key={h.id} value={h.id}>{h.code}</option>)}</select></div><div className="field"><label>المقياس</label><input name="metric"/></div><div className="field"><label>التكلفة</label><input name="cost" type="number" min="0" step="any"/></div></div>
          <div className="field"><label>طريقة الاختبار</label><textarea name="method" required/></div>
          <div className="grid2"><div className="field"><label>معيار النجاح</label><textarea name="success_criteria" required/></div><div className="field"><label>معيار الفشل</label><textarea name="failure_criteria" required/></div><div className="field"><label>النتيجة</label><textarea name="result"/></div><div className="field"><label>القرار</label><textarea name="decision"/></div></div>
          <div><button className="button small">إضافة تجربة</button></div>
        </form>:<div className="empty">أضف فرضية أولًا لربط التجارب بها.</div>}
        {experiments.length?<div className="recordList">{experiments.map(item=><div className="recordRow" key={String(item.id)}><span>تجربة</span><p>{String(item.method??"")}</p><i>{String(item.metric??"—")}</i><b>{String(item.decision??"—")}</b></div>)}</div>:null}
      </div>
    </section>

    <section className="deferredModules">
      <div><span>04</span><strong>المخاطر</strong><p>موجودة ضمن الإصدار الأول، وتظل مقفلة حتى اعتماد مقياس الاحتمال والأثر وقيم الحالة.</p></div>
      <div><span>05</span><strong>التقييم / القرار</strong><p>لا توجد قاعدة حساب أو قرار مشفّرة قبل اعتمادها صراحة.</p></div>
    </section>

    <section className="labModule">
      <div className="labModuleHead"><span>06</span><div><small>الانتقال</small><h2>تحويل الفرصة إلى أصل</h2><p>ينشئ أصلًا مرتبطًا بهذه الفرصة بحالة «تطوير». يحتفظ نُموان ببيانات المختبر كاملة، ولا يعني التحويل نشر الأصل للعامة.</p></div></div>
      <div className="labModuleBody">
        {linkedAsset
          ? <div className="recordList"><Link className="recordRow" href={`/assets/${linkedAsset.id}`}><span>أصل</span><p>تم تحويل هذه الفرصة إلى أصل.</p><i>{labelOf(assetStatusAr,linkedAsset.status)}</i><b>فتح الأصل ↗</b></Link></div>
          : <form action={convertIdeaToAsset} className="form"><input type="hidden" name="idea_id" value={ideaId}/><p>التحويل متاح لمالك الفرصة فقط، وينفذ مرة واحدة لهذه الفرصة.</p><div><button className="button" type="submit">تحويل إلى أصل ↗</button></div></form>}
      </div>
    </section>
  </>
}
