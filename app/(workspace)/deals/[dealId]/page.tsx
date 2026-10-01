import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dealStatusAr, labelOf } from "@/lib/labels-ar";
import TransitionArrow from "@/components/transition-arrow";
import DealParticipantManager from "@/components/deal-participant-manager";

const dealStages=["NEW","QUALIFIED","DATA_ROOM","INTEREST","OFFER","NEGOTIATION","RESERVED","AGREEMENT","SOLD","LICENSED","CLOSED"];

type Participant={
  user_id:string;
  email:string;
  created_at:string;
};

export const dynamic="force-dynamic";
export const revalidate=0;

export default async function DealDetailPage({params}:{params:Promise<{dealId:string}>}){
 const {dealId}=await params;
 const supabase=await createClient();

 const [{data:contextRows},{data:participantsData}]=await Promise.all([
   supabase.rpc("get_deal_context_v1",{p_deal_id:dealId}),
   supabase.rpc("get_deal_participants_v1",{p_deal_id:dealId}),
 ]);

 const deal=contextRows?.[0];
 if(!deal)notFound();

 const participants=(participantsData??[]) as Participant[];
 const stageIndex=dealStages.indexOf(deal.deal_status);
 const isOwner=Boolean(deal.is_owner);

 return <>
 <header className="assetDetailHead dealDetailHead">
   <div>
     <span className="sectionKicker">صفقة / {deal.asset_code||"أصل"}</span>
     <h1>{deal.asset_title||"صفقة"}</h1>
     <p>{deal.asset_summary||"مسار الصفقة المرتبط بهذا الأصل."}</p>
   </div>
   <span className="assetDisclosure">{labelOf(dealStatusAr,deal.deal_status)}</span>
 </header>

 <section className="assetInfoStrip">
   <div><span>الحالة</span><strong>{labelOf(dealStatusAr,deal.deal_status)}</strong></div>
   <div><span>المشاركون</span><strong>{isOwner?participants.length:(participants.length?"مشارك":"—")}</strong></div>
   <div><span>الإفصاح</span><strong>{deal.disclosure_level||"—"}</strong></div>
   <div><span>الإنشاء</span><strong>{new Date(deal.deal_created_at).toLocaleDateString("ar-SA")}</strong></div>
   <div><span>آخر تحديث</span><strong>{new Date(deal.deal_updated_at).toLocaleDateString("ar-SA")}</strong></div>
 </section>

 <section className="statusJourney dealJourney">
   <span className="sectionKicker">دورة حياة الصفقة</span>
   <div className="statusTrack">
     {dealStages.map((stage,index)=>
       <div className={`statusNode ${index<stageIndex?"done":""} ${index===stageIndex?"current":""}`} key={stage}>
         <span>{String(index+1).padStart(2,"0")}</span>
         <strong>{labelOf(dealStatusAr,stage)}</strong>
       </div>
     )}
   </div>
 </section>

 <DealParticipantManager
   dealId={deal.deal_id}
   isOwner={isOwner}
   participants={participants}
 />

 {isOwner
   ? <section className="detailActionGrid single">
       <Link href={`/assets/${deal.asset_id}`}>
         <span>الأصل</span>
         <strong>العودة إلى الأصل</strong>
         <p>عرض ملف الأصل وغرفة البيانات المرتبطة.</p>
         <TransitionArrow/>
       </Link>
     </section>
   : null}

 <aside className="schemaNotice">
   <strong>الإصدار الأول</strong>
   <p>إنشاء الصفقة وإدارة المشاركين مفعّلان. انتقالات الحالة التجارية تبقى للقراءة فقط حتى اعتماد قواعد الانتقال رسميًا.</p>
 </aside>
 </>;
}
