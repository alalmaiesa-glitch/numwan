import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dealStatusAr, labelOf } from "@/lib/labels-ar";

const dealStages=["NEW","QUALIFIED","DATA_ROOM","INTEREST","OFFER","NEGOTIATION","RESERVED","AGREEMENT","SOLD","LICENSED","CLOSED"];

export default async function DealDetailPage({params}:{params:Promise<{dealId:string}>}){
 const {dealId}=await params; const supabase=await createClient();
 const {data:deal}=await supabase.from("deals").select("id,asset_id,status,created_at,updated_at,assets(id,title,asset_code,summary,disclosure_level)").eq("id",dealId).single();
 if(!deal)notFound();
 const asset=Array.isArray(deal.assets)?deal.assets[0]:deal.assets;
 const {count:participantCount}=await supabase.from("deal_participants").select("*",{count:"exact",head:true}).eq("deal_id",dealId);
 const stageIndex=dealStages.indexOf(deal.status);
 return <>
 <header className="assetDetailHead dealDetailHead"><div><span className="sectionKicker">صفقة / {asset?.asset_code||"أصل"}</span><h1>{asset?.title||"صفقة"}</h1><p>{asset?.summary||"مسار الصفقة المرتبط بهذا الأصل."}</p></div><span className="assetDisclosure">{labelOf(dealStatusAr,deal.status)}</span></header>
 <section className="assetInfoStrip"><div><span>الحالة</span><strong>{labelOf(dealStatusAr,deal.status)}</strong></div><div><span>المشاركون</span><strong>{participantCount??0}</strong></div><div><span>الإفصاح</span><strong>{asset?.disclosure_level||"—"}</strong></div><div><span>الإنشاء</span><strong>{new Date(deal.created_at).toLocaleDateString("ar-SA")}</strong></div><div><span>آخر تحديث</span><strong>{new Date(deal.updated_at).toLocaleDateString("ar-SA")}</strong></div></section>
 <section className="statusJourney dealJourney"><span className="sectionKicker">دورة حياة الصفقة</span><div className="statusTrack">{dealStages.map((stage,index)=><div className={`statusNode ${index<stageIndex?"done":""} ${index===stageIndex?"current":""}`} key={stage}><span>{String(index+1).padStart(2,"0")}</span><strong>{labelOf(dealStatusAr,stage)}</strong></div>)}</div></section>
 <section className="detailActionGrid single">{asset?.id?<Link href={`/assets/${asset.id}`}><span>الأصل</span><strong>العودة إلى الأصل</strong><p>عرض ملف الأصل وغرفة البيانات المرتبطة.</p><i>↗</i></Link>:null}</section>
 <aside className="schemaNotice"><strong>الإصدار الأول</strong><p>هذه الصفحة تعرض حالة الصفقة والبيانات المصرح بها فقط. لم تُضف أزرار انتقال حالة أو شروط تجارية غير معتمدة.</p></aside>
 </>
}
