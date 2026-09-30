import { createClient } from "@/lib/supabase/server";

export default async function AssetsPage() {
  const supabase = await createClient();
  const { data: assets } = await supabase
    .from("assets")
    .select("id,asset_code,title,summary,status,disclosure_level,updated_at")
    .order("updated_at", { ascending: false });

  return (
    <>
      <div className="pageHead"><div><h1>الأصول</h1><p>عرض الأصول المصرح لك بالوصول إليها. تغيير الحالة مؤجل لمسار مدقق.</p></div></div>
      <section className="panel">
        {assets?.length ? <div className="tableWrap"><table className="table">
          <thead><tr><th>الرمز</th><th>الأصل</th><th>الحالة</th><th>الإفصاح</th></tr></thead>
          <tbody>{assets.map((asset) => <tr key={asset.id}><td>{asset.asset_code || "—"}</td><td><strong>{asset.title}</strong><br/><span className="muted">{asset.summary || ""}</span></td><td>{asset.status}</td><td>{asset.disclosure_level}</td></tr>)}</tbody>
        </table></div> : <div className="empty">لا توجد أصول متاحة لهذا الحساب.</div>}
      </section>
    </>
  );
}
