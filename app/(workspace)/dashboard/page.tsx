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
      <div className="pageHead">
        <div><h1>لوحة التحكم</h1><p>ملخص العناصر التي تملك صلاحية الوصول إليها.</p></div>
      </div>
      <section className="stats">
        <article className="stat"><strong>{ideas}</strong><span>أفكار في Vault</span></article>
        <article className="stat"><strong>{assets}</strong><span>أصول</span></article>
        <article className="stat"><strong>{deals}</strong><span>صفقات</span></article>
        <article className="stat"><strong>{documents}</strong><span>مستندات Data Room</span></article>
      </section>
    </>
  );
}
