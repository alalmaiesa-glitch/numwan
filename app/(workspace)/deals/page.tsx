import { createClient } from "@/lib/supabase/server";

export default async function DealsPage() {
  const supabase = await createClient();
  const { data: deals } = await supabase
    .from("deals")
    .select("id,status,created_at,assets(title,asset_code)")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="pageHead"><div><h1>الصفقات</h1><p>مسار الصفقات المصرح لك بها. الانتقالات التجارية للقراءة فقط في هذه المرحلة.</p></div></div>
      <section className="panel">
        {deals?.length ? <div className="tableWrap"><table className="table">
          <thead><tr><th>الأصل</th><th>الحالة</th><th>تاريخ الإنشاء</th></tr></thead>
          <tbody>{deals.map((deal) => {
            const asset = Array.isArray(deal.assets) ? deal.assets[0] : deal.assets;
            return <tr key={deal.id}><td>{asset?.asset_code || "—"} — {asset?.title || "أصل"}</td><td>{deal.status}</td><td>{new Date(deal.created_at).toLocaleDateString("ar-SA")}</td></tr>;
          })}</tbody>
        </table></div> : <div className="empty">لا توجد صفقات متاحة لهذا الحساب.</div>}
      </section>
    </>
  );
}
