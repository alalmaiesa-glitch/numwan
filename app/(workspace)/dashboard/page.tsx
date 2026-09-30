import { createClient } from "@/lib/supabase/server";

async function countRows(table: "ideas" | "assets" | "deals" | "data_room_documents") {
  const supabase = await createClient();
  const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
  return count ?? 0;
}

export default async function DashboardPage() {
  const [ideas, assets, deals, documents] = await Promise.all([
    countRows("ideas"),
    countRows("assets"),
    countRows("deals"),
    countRows("data_room_documents"),
  ]);

  const metrics = [
    ["01", ideas, "أفكار في Vault"],
    ["02", assets, "أصول"],
    ["03", deals, "صفقات"],
    ["04", documents, "مستندات Data Room"],
  ] as const;

  return (
    <>
      <header className="workspacePageHead">
        <span className="sectionKicker">نظرة عامة</span>
        <h1>لوحة التحكم</h1>
        <p>ملخص العناصر التي تملك صلاحية الوصول إليها.</p>
      </header>

      <section className="metricsGrid">
        {metrics.map(([index, value, label]) => (
          <article className="metricRow" key={index}>
            <span>{index}</span>
            <strong>{value}</strong>
            <p>{label}</p>
          </article>
        ))}
      </section>

      <section className="workspaceEditorial">
        <div>
          <span className="sectionKicker">مسار الأصل</span>
          <h2>العمل هنا يبدأ<br/>قبل أن يظهر الأصل.</h2>
        </div>
        <div className="workspaceProcess">
          <div><span>01</span><strong>Vault</strong><p>التقاط الفرصة وسياقها الأولي.</p></div>
          <div><span>02</span><strong>Lab</strong><p>الفرضيات والأدلة والتجارب.</p></div>
          <div><span>03</span><strong>Assets</strong><p>الأصول التي انتقلت إلى مسار النضج.</p></div>
          <div><span>04</span><strong>Deals</strong><p>مسار الصفقات المصرح لك بها.</p></div>
        </div>
      </section>
    </>
  );
}
