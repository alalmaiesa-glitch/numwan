import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { dealStatusAr, labelOf } from "@/lib/labels-ar";

export default async function DealsPage(){
 const supabase=await createClient();
 const {data:deals}=await supabase.from("deals").select("id,status,created_at,assets(title,asset_code)").order("created_at",{ascending:false});
 return <><header className="workspacePageHead"><span className="sectionKicker">مسار الصفقة</span><h1>الصفقات</h1><p>الصفقات المصرح لك بها. انتقالات الحالة التجارية للقراءة فقط في الواجهة الحالية.</p></header>
 <section className="dealList">{deals?.length?deals.map((deal,index)=>{const asset=Array.isArray(deal.assets)?deal.assets[0]:deal.assets;return <Link href={`/deals/${deal.id}`} className="dealRow" key={deal.id}><span>{String(index+1).padStart(2,"0")}</span><div><small>{asset?.asset_code||"أصل"}</small><strong>{asset?.title||"أصل"}</strong></div><div><small>الحالة</small><strong>{labelOf(dealStatusAr,deal.status)}</strong></div><div><small>الإنشاء</small><strong>{new Date(deal.created_at).toLocaleDateString("ar-SA")}</strong></div><i>↗</i></Link>}):<div className="editorialEmpty"><span>00</span><h2>لا توجد صفقات متاحة لهذا الحساب.</h2><p>ستظهر الصفقات هنا وفق صلاحيات الإصدار الأول.</p></div>}</section></>
}
