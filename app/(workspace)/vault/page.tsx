import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createIdea } from "./actions";

export default async function VaultPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data: ideas } = await supabase
    .from("ideas")
    .select("id,title,short_description,sector,confidentiality_level,created_at")
    .order("created_at", { ascending: false });
  const params = await searchParams;

  return (
    <>
      <div className="pageHead">
        <div><h1>Vault الأفكار</h1><p>التقاط الفكرة قبل انتقالها إلى الاختبار والتطوير.</p></div>
      </div>

      <section className="panel">
        <h2>فكرة جديدة</h2>
        {params.error ? <p className="error">تعذر حفظ الفكرة. تحقق من الحقول وحاول مرة أخرى.</p> : null}
        <form action={createIdea} className="form">
          <div className="grid2">
            <div className="field"><label>العنوان</label><input name="title" required /></div>
            <div className="field"><label>وصف مختصر</label><input name="short_description" /></div>
            <div className="field"><label>القطاع</label><input name="sector" /></div>
            <div className="field"><label>السوق</label><input name="market" /></div>
            <div className="field"><label>العميل</label><input name="customer" /></div>
            <div className="field"><label>المشتري المحتمل</label><input name="potential_buyer" /></div>
            <div className="field"><label>مصدر الفكرة</label><input name="idea_source" /></div>
            <div className="field"><label>مستوى السرية</label><select name="confidentiality_level" defaultValue="P0"><option>P0</option><option>P1</option><option>P2</option><option>P3</option></select></div>
          </div>
          <div className="field"><label>المشكلة</label><textarea name="problem" /></div>
          <div className="field"><label>الحل الأولي</label><textarea name="initial_solution" /></div>
          <div className="field"><label>ملاحظات</label><textarea name="notes" /></div>
          <div><button className="button" type="submit">حفظ وفتح Lab</button></div>
        </form>
      </section>

      <section className="panel">
        <h2>الأفكار</h2>
        {ideas?.length ? (
          <div className="list">
            {ideas.map((idea) => (
              <Link className="listItem" href={"/lab/" + idea.id} key={idea.id}>
                <div><strong>{idea.title}</strong><div className="muted">{idea.short_description || idea.sector || "بدون وصف مختصر"}</div></div>
                <span className="pill">{idea.confidentiality_level}</span>
              </Link>
            ))}
          </div>
        ) : <div className="empty">لا توجد أفكار محفوظة حتى الآن.</div>}
      </section>
    </>
  );
}
