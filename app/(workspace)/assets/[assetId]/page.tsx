import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assetStatusAr, labelOf } from "@/lib/labels-ar";

const assetStages=["IDEA","RESEARCH","LAB","DEVELOPMENT","READY","LISTED","INTEREST","NEGOTIATION","RESERVED","SOLD","LICENSED","ARCHIVED"];

export default async function AssetDetailPage({params}:{params:Promise<{assetId:string}>}){
 const {assetId}=await params; const supabase=await createClient();
 const {data:asset}=await supabase.from("assets").select("id,asset_code,title,summary,status,disclosure_level,created_at,updated_at").eq("id",assetId).single();
 if(!asset)notFound();
 const [{data:documents},{data:deals}]=await Promise.all([
   supabase.from("data_room_documents").select("id,title,created_at").eq("asset_id",assetId).order("created_at",{ascending:false}),
   supabase.from("deals").select("id,status,created_at").eq("asset_id",assetId).order("created_at",{ascending:false})
 ]);
 const stageIndex=assetStages.indexOf(asset.status);
 return <>
 <header className="assetDetailHead"><div><span className="sectionKicker">{asset.asset_code||"أصل نُموان"}</span><h1>{asset.title}</h1><p>{asset.summary||"لم يُسجل وصف مختصر لهذا الأصل بعد."}</p></div><span className="assetDisclosure">{asset.disclosure_level}</span></header>
 <section className="assetInfoStrip"><div><span>الحالة</span><strong>{labelOf(assetStatusAr,asset.status)}</strong></div><div><span>الإفصاح</span><strong>{asset.disclosure_level}</strong></div><div><span>غرفة البيانات</span><strong>{documents?.length??0}</strong></div><div><span>الصفقات</span><strong>{deals?.length??0}</strong></div><div><span>آخر تحديث</span><strong>{new Date(asset.updated_at).toLocaleDateString("ar-SA")}</strong></div></section>
 <section className="assetDetailVisual"><span>{asset.asset_code||"أصل / نُموان"}</span><strong>أصل<br/>أعمال</strong><i/><small>منتقى / مطوّر / وصول منضبط</small></section>
 <section className="assetNarrative"><div className="assetNarrativeTitle"><span className="sectionKicker">ملف الأصل</span><h2>المعلومات المعتمدة في الإصدار الأول</h2></div><div className="assetNarrativeBody"><div className="narrativeRow"><span>01</span><div><h3>الملخص</h3><p>{asset.summary||"لم يُسجل ملخص لهذا الأصل بعد."}</p></div></div><div className="narrativeRow"><span>02</span><div><h3>الحالة الحالية</h3><p>{labelOf(assetStatusAr,asset.status)}</p></div></div><div className="narrativeRow"><span>03</span><div><h3>مستوى الإفصاح</h3><p>{asset.disclosure_level}</p></div></div></div></section>
 <section className="statusJourney"><span className="sectionKicker">دورة حياة الأصل</span><div className="statusTrack">{assetStages.map((stage,index)=><div className={`statusNode ${index<stageIndex?"done":""} ${index===stageIndex?"current":""}`} key={stage}><span>{String(index+1).padStart(2,"0")}</span><strong>{labelOf(assetStatusAr,stage)}</strong></div>)}</div></section>
 <section className="detailActionGrid"><Link href={`/assets/${asset.id}/data-room`}><span>غرفة البيانات</span><strong>المستندات والوصول</strong><p>{documents?.length??0} مستندات متاحة وفق صلاحياتك.</p><i>↗</i></Link><Link href="/deals"><span>الصفقات</span><strong>مسار الصفقات</strong><p>{deals?.length??0} صفقات مرتبطة ظاهرة لحسابك.</p><i>↗</i></Link></section>
 <aside className="schemaNotice"><strong>ملاحظة بنيوية</strong><p>حقول «الفرصة، المشكلة، الحل، السوق، النموذج التجاري، نموذج الإيراد» ليست حقولًا في بنية الأصل الحالية في الإصدار الأول، لذلك لم تُختلق ولم تُضف ضمن إعادة التصميم.</p></aside>
 </>
}
