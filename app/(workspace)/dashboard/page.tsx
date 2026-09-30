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

  return (
    <>
      <section className="dashboardHero">
        <div>
          <span className="eyebrow">نظرة عامة</span>
          <h1>مساحة العمل</h1>
          <p>ملخص العناصر التي تملك صلاحية الوصول إليها في نُموان.</p>
        </div>
        <span className="dashboardHeroBadge">V1 · ACTIVE WORKSPACE</span>
      </section>

      <section className="stats">
        <article className="stat"><strong>{ideas}</strong><span>أفكار في Vault</span></article>
        <article className="stat"><strong>{assets}</strong><span>أصول</span></article>
        <article className="stat"><strong>{deals}</strong><span>صفقات</span></article>
        <article className="stat"><strong>{documents}</strong><span>مستندات Data Room</span></article>
      </section>

      <section className="dashboardColumns">
        <article className="panel">
          <h2>مسار بناء الأصل</h2>
          <div className="workflowList">
            <div className="workflowRow"><span>01</span><div><b>Vault</b><small>التقاط الفرصة وسياقها الأولي</small></div><i>الفرص</i></div>
            <div className="workflowRow"><span>02</span><div><b>Lab</b><small>الفرضيات والأدلة والتجارب</small></div><i>التحقق</i></div>
            <div className="workflowRow"><span>03</span><div><b>Assets</b><small>الأصول التي انتقلت لمسار النضج</small></div><i>الأصل</i></div>
            <div className="workflowRow"><span>04</span><div><b>Deals</b><small>مسار الصفقات المصرح لك بها</small></div><i>المسار</i></div>
          </div>
        </article>

        <article className="panel">
          <h2>مبدأ العمل</h2>
          <p className="muted">
            نُموان يحافظ على العلاقة بين الفرصة وما يدعم القرار حولها:
            فرضية واضحة، دليل موثّق، تجربة قابلة للتقييم، ثم انتقال منضبط إلى الأصل.
          </p>
        </article>
      </section>
    </>
  );
}
