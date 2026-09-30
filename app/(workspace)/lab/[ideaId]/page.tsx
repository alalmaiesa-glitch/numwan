import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createEvidence, createExperiment, createHypothesis } from "./actions";

export default async function LabPage({
  params,
  searchParams,
}: {
  params: Promise<{ ideaId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { ideaId } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const { data: idea } = await supabase
    .from("ideas")
    .select("*")
    .eq("id", ideaId)
    .single();

  if (!idea) notFound();

  const { data: hypothesesData } = await supabase
    .from("hypotheses")
    .select("*")
    .eq("idea_id", ideaId)
    .order("created_at", { ascending: true });

  const hypotheses = hypothesesData ?? [];
  const hypothesisIds = hypotheses.map((item) => item.id);

  let evidence: Array<Record<string, unknown>> = [];
  let experiments: Array<Record<string, unknown>> = [];

  if (hypothesisIds.length) {
    const [{ data: evidenceData }, { data: experimentsData }] = await Promise.all([
      supabase.from("evidence").select("*").in("hypothesis_id", hypothesisIds).order("created_at", { ascending: true }),
      supabase.from("experiments").select("*").in("hypothesis_id", hypothesisIds).order("created_at", { ascending: true }),
    ]);
    evidence = (evidenceData ?? []) as Array<Record<string, unknown>>;
    experiments = (experimentsData ?? []) as Array<Record<string, unknown>>;
  }

  return (
    <>
      <div className="pageHead">
        <div>
          <span className="pill">{idea.confidentiality_level}</span>
          <h1>{idea.title}</h1>
          <p>{idea.short_description || "مختبر التحقق والتطوير للفكرة."}</p>
        </div>
      </div>

      <div className="tabs" aria-label="أقسام Lab">
        <span className="tab active">Overview</span>
        <span className="tab">Hypotheses</span>
        <span className="tab">Evidence</span>
        <span className="tab">Experiments</span>
        <span className="tab disabled">Risks</span>
        <span className="tab disabled">Score</span>
        <span className="tab disabled">Decision</span>
      </div>

      {query.error ? <p className="error">تعذر حفظ العنصر. تحقق من البيانات والصلاحيات.</p> : null}

      <section className="panel">
        <h2>Overview</h2>
        <div className="grid2">
          <div><strong>المشكلة</strong><p className="muted">{idea.problem || "—"}</p></div>
          <div><strong>الحل الأولي</strong><p className="muted">{idea.initial_solution || "—"}</p></div>
          <div><strong>السوق</strong><p className="muted">{idea.market || "—"}</p></div>
          <div><strong>العميل</strong><p className="muted">{idea.customer || "—"}</p></div>
          <div><strong>المشتري المحتمل</strong><p className="muted">{idea.potential_buyer || "—"}</p></div>
          <div><strong>مصدر الفكرة</strong><p className="muted">{idea.idea_source || "—"}</p></div>
        </div>
      </section>

      <section className="panel">
        <h2>Hypotheses</h2>
        <form action={createHypothesis} className="form">
          <input type="hidden" name="idea_id" value={ideaId} />
          <div className="grid3">
            <div className="field"><label>الرمز</label><input name="code" required placeholder="H1" /></div>
            <div className="field"><label>النوع</label><input name="hypothesis_type" /></div>
            <div className="field"><label>الأهمية</label><select name="importance" defaultValue="MAJOR"><option value="CRITICAL">CRITICAL</option><option value="MAJOR">MAJOR</option><option value="SECONDARY">SECONDARY</option></select></div>
          </div>
          <div className="field"><label>وصف الفرضية</label><textarea name="description" required /></div>
          <div><button className="button small">إضافة فرضية</button></div>
        </form>
        <div className="tableWrap">
          <table className="table"><thead><tr><th>الرمز</th><th>الفرضية</th><th>الأهمية</th><th>الحالة</th></tr></thead>
          <tbody>{hypotheses.map((h) => <tr key={h.id}><td>{h.code}</td><td>{h.description}</td><td>{h.importance}</td><td>{h.verification_status}</td></tr>)}</tbody></table>
        </div>
        {!hypotheses.length ? <div className="empty">لا توجد فرضيات بعد.</div> : null}
      </section>

      <section className="panel">
        <h2>Evidence</h2>
        {hypotheses.length ? (
          <form action={createEvidence} className="form">
            <input type="hidden" name="idea_id" value={ideaId} />
            <div className="grid3">
              <div className="field"><label>الفرضية</label><select name="hypothesis_id">{hypotheses.map((h) => <option key={h.id} value={h.id}>{h.code}</option>)}</select></div>
              <div className="field"><label>رمز الدليل</label><input name="code" required placeholder="E1" /></div>
              <div className="field"><label>القوة</label><select name="evidence_strength" defaultValue="E1"><option>E1</option><option>E2</option><option>E3</option><option>E4</option><option>E5</option></select></div>
            </div>
            <div className="field"><label>الادعاء / الدليل</label><textarea name="claim" required /></div>
            <div className="grid2">
              <div className="field"><label>المصدر</label><input name="source" /></div>
              <div className="field"><label>التاريخ</label><input name="evidence_date" type="date" /></div>
              <div className="field"><label>نوع الدليل</label><input name="evidence_type" /></div>
              <div className="field"><label>ما الذي يثبته؟</label><input name="proves" /></div>
            </div>
            <div className="field"><label>ما الذي لا يثبته؟</label><textarea name="does_not_prove" /></div>
            <div><button className="button small">إضافة دليل</button></div>
          </form>
        ) : <div className="empty">أضف فرضية أولًا لربط الأدلة بها.</div>}
        {evidence.length ? <div className="tableWrap"><table className="table"><thead><tr><th>الرمز</th><th>الادعاء</th><th>القوة</th><th>المصدر</th></tr></thead><tbody>
          {evidence.map((item) => <tr key={String(item.id)}><td>{String(item.code ?? "")}</td><td>{String(item.claim ?? "")}</td><td>{String(item.evidence_strength ?? "")}</td><td>{String(item.source ?? "—")}</td></tr>)}
        </tbody></table></div> : null}
      </section>

      <section className="panel">
        <h2>Experiments</h2>
        {hypotheses.length ? (
          <form action={createExperiment} className="form">
            <input type="hidden" name="idea_id" value={ideaId} />
            <div className="grid3">
              <div className="field"><label>الفرضية</label><select name="hypothesis_id">{hypotheses.map((h) => <option key={h.id} value={h.id}>{h.code}</option>)}</select></div>
              <div className="field"><label>المقياس</label><input name="metric" /></div>
              <div className="field"><label>التكلفة</label><input name="cost" type="number" min="0" step="any" /></div>
            </div>
            <div className="field"><label>طريقة الاختبار</label><textarea name="method" required /></div>
            <div className="grid2">
              <div className="field"><label>معيار النجاح</label><textarea name="success_criteria" required /></div>
              <div className="field"><label>معيار الفشل</label><textarea name="failure_criteria" required /></div>
              <div className="field"><label>النتيجة</label><textarea name="result" /></div>
              <div className="field"><label>القرار</label><textarea name="decision" /></div>
            </div>
            <div><button className="button small">إضافة تجربة</button></div>
          </form>
        ) : <div className="empty">أضف فرضية أولًا لربط التجارب بها.</div>}
        {experiments.length ? <div className="tableWrap"><table className="table"><thead><tr><th>الطريقة</th><th>المقياس</th><th>النتيجة</th><th>القرار</th></tr></thead><tbody>
          {experiments.map((item) => <tr key={String(item.id)}><td>{String(item.method ?? "")}</td><td>{String(item.metric ?? "—")}</td><td>{String(item.result ?? "—")}</td><td>{String(item.decision ?? "—")}</td></tr>)}
        </tbody></table></div> : null}
      </section>

      <section className="split">
        <article className="panel locked"><h3>Risks</h3><p>موجود ضمن V1، لكن الإدخال مؤجل حتى اعتماد مقياس الاحتمال والأثر وقيم الحالة.</p></article>
        <article className="panel locked"><h3>Score / Decision</h3><p>موجودان ضمن V1، لكن لا توجد قاعدة حساب أو قرار مشفّرة قبل اعتمادها صراحة.</p></article>
      </section>
    </>
  );
}
