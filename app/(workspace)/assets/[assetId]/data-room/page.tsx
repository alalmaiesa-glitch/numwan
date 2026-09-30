import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export default async function DataRoomPage({params}:{params:Promise<{assetId:string}>}){
 const {assetId}=await params; const supabase=await createClient();
 const {data:asset}=await supabase.from("assets").select("id,asset_code,title,disclosure_level").eq("id",assetId).single(); if(!asset)notFound();
 const {data:documents}=await supabase.from("data_room_documents").select("id,title,created_at,updated_at").eq("asset_id",assetId).order("created_at",{ascending:false});
 return <><header className="workspacePageHead"><span className="sectionKicker">Data Room / {asset.asset_code||"ASSET"}</span><h1>{asset.title}</h1><p>غرفة بيانات خاصة. ما يظهر هنا يخضع لصلاحيات الوصول الحالية في V1.</p></header><div className="roomMeta"><Link href={`/assets/${asset.id}`}>→ العودة إلى الأصل</Link><span>مستوى الإفصاح: <strong>{asset.disclosure_level}</strong></span></div><section className="documentList">{documents?.length?documents.map((document,index)=><article className="documentRow" key={document.id}><span>{String(index+1).padStart(2,"0")}</span><div><strong>{document.title}</strong><small>{new Date(document.created_at).toLocaleDateString("ar-SA")}</small></div><i>PRIVATE</i></article>):<div className="editorialEmpty"><span>00</span><h2>لا توجد مستندات متاحة.</h2><p>لم نضف زر رفع أو تنزيل شكلي؛ عمليات الملفات ستظل مرتبطة بضوابط Data Room وسجل التدقيق.</p></div>}</section></>
}
