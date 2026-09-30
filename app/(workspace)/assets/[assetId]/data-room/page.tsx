import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DataRoomManager from "@/components/data-room-manager";

type Grant = {
  user_id: string;
  email: string;
  created_at: string;
};

export default async function DataRoomPage({params}:{params:Promise<{assetId:string}>}){
  const {assetId}=await params;
  const supabase=await createClient();

  const {data:contextRows}=await supabase.rpc("get_data_room_context_v1",{p_asset_id:assetId});
  const asset=contextRows?.[0];
  if(!asset) notFound();

  const {data:documentsData}=await supabase
    .from("data_room_documents")
    .select("id,title,storage_path,created_at,updated_at")
    .eq("asset_id",assetId)
    .order("created_at",{ascending:false});

  const documents=documentsData??[];
  const grantsByDocument:Record<string,Grant[]>={};

  if(asset.is_owner){
    await Promise.all(documents.map(async(document)=>{
      const {data}=await supabase.rpc("get_data_room_access_v1",{p_document_id:document.id});
      grantsByDocument[document.id]=(data??[]) as Grant[];
    }));
  }

  const managerDocuments=documents.map(document=>({
    ...document,
    grants:grantsByDocument[document.id]??[],
  }));

  return <>
    <header className="workspacePageHead">
      <span className="sectionKicker">غرفة البيانات / {asset.asset_code||"أصل"}</span>
      <h1>{asset.title}</h1>
      <p>غرفة بيانات خاصة. الملفات لا تظهر إلا لمالك الأصل أو لمن مُنح وصولًا صريحًا إلى المستند.</p>
    </header>

    <div className="roomMeta">
      {asset.is_owner?<Link href={`/assets/${asset.asset_id}`}>→ العودة إلى الأصل</Link>:<Link href="/dashboard">→ لوحة التحكم</Link>}
      <span>مستوى الإفصاح: <strong>{asset.disclosure_level}</strong></span>
    </div>

    <DataRoomManager
      assetId={asset.asset_id}
      isOwner={Boolean(asset.is_owner)}
      documents={managerDocuments}
    />
  </>;
}
