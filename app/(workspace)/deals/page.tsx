import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { dealStatusAr, labelOf } from "@/lib/labels-ar";
import TransitionArrow from "@/components/transition-arrow";

export default async function DealsPage(){
 const supabase=await createClient();
 const {data:deals}=await supabase.rpc("list_deals_v1");

 return <>
   <header className="workspacePageHead">
     <span className="sectionKicker">مسار الصفقة</span>
     <h1>الصفقات</h1>
     <p>الصفقات المصرح لك بها. انتقالات الحالة التجارية ما زالت مقفلة حتى اعتماد قواعدها.</p>
   </header>

   <section className="dealList">
     {deals?.length
       ? deals.map((deal,index)=>
         <Link href={`/deals/${deal.deal_id}`} className="dealRow" key={deal.deal_id}>
           <span>{String(index+1).padStart(2,"0")}</span>
           <div><small>{deal.asset_code||"أصل"}</small><strong>{deal.asset_title||"أصل"}</strong></div>
           <div><small>الحالة</small><strong>{labelOf(dealStatusAr,deal.status)}</strong></div>
           <div><small>الإنشاء</small><strong>{new Date(deal.created_at).toLocaleDateString("ar-SA")}</strong></div>
           <TransitionArrow/>
         </Link>)
       : <div className="editorialEmpty"><span>00</span><h2>لا توجد صفقات متاحة لهذا الحساب.</h2><p>أنشئ صفقة من صفحة الأصل، أو ستظهر هنا الصفقات التي أُضيفت إليها كمشارك.</p></div>}
   </section>
 </>;
}
