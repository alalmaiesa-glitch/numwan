import { createClient } from "@/lib/supabase/server";
import {
  buyerGuide,
  dataDictionaryCsv,
  releaseNotes,
  sourceRightsCsv,
  toCsv,
  toXlsx
} from "@/lib/store/product1-export";

export const runtime="nodejs";
export const dynamic="force-dynamic";

function attachmentHeaders(contentType:string,fileName:string){
  return {
    "Content-Type":contentType,
    "Content-Disposition":`attachment; filename="${fileName}"`,
    "Cache-Control":"private, no-store, max-age=0",
    "X-Content-Type-Options":"nosniff"
  };
}

export async function GET(_request:Request,{params}:{params:Promise<{fileId:string}>}){
  const {fileId}=await params;
  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();
  const userId=typeof claims?.claims?.sub==="string" ? claims.claims.sub : "";

  if(!userId) return new Response("Unauthorized",{status:401});

  const {data:file,error:fileError}=await supabase
    .from("store_product_files")
    .select("id,product_id,file_label,storage_path,mime_type,is_active")
    .eq("id",fileId)
    .eq("is_active",true)
    .maybeSingle();

  if(fileError || !file) return new Response("Not found",{status:404});

  const {data:product}=await supabase
    .from("store_products")
    .select("id,created_by,slug")
    .eq("id",file.product_id)
    .eq("created_by",userId)
    .maybeSingle();

  if(!product) return new Response("Forbidden",{status:403});

  if(!file.storage_path.startsWith("generated://")){
    const {data:signed,error}=await supabase.storage
      .from("numwan-store-products")
      .createSignedUrl(file.storage_path,120,{download:file.file_label});

    if(error || !signed?.signedUrl) return new Response("Preview download unavailable",{status:500});
    return Response.redirect(signed.signedUrl,302);
  }

  if(!file.storage_path.startsWith("generated://product1/")){
    return new Response("Unsupported generated file",{status:404});
  }

  const key=file.storage_path.replace("generated://product1/","");
  let body:BodyInit;
  let contentType="text/plain; charset=utf-8";
  let fileName="Numwan_Product_Review.txt";

  if(key==="master.csv" || key==="master.xlsx" || key==="release_notes.txt"){
    const {data:rows,error}=await supabase.rpc("get_numwan_product1_dataset_v1",{
      p_product_id:file.product_id
    });
    if(error || !rows) return new Response("Dataset unavailable",{status:500});

    if(key==="master.csv"){
      body=toCsv(rows);
      contentType="text/csv; charset=utf-8";
      fileName="Numwan_Saudi_Industrial_Intelligence_Heavy_Industry_Map_V1.csv";
    }else if(key==="master.xlsx"){
      body=new Uint8Array(toXlsx(rows));
      contentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      fileName="Numwan_Saudi_Industrial_Intelligence_Heavy_Industry_Map_V1.xlsx";
    }else{
      body=releaseNotes(rows);
      fileName="Numwan_Saudi_Industrial_Intelligence_V1_Release_Notes.txt";
    }
  }else if(key==="source_rights_register.csv"){
    const {data:rows,error}=await supabase.rpc("get_numwan_product1_sources_v1",{
      p_product_id:file.product_id
    });
    if(error || !rows) return new Response("Source register unavailable",{status:500});
    body=sourceRightsCsv(rows);
    contentType="text/csv; charset=utf-8";
    fileName="Numwan_Saudi_Industrial_Intelligence_V1_Source_Rights_Register.csv";
  }else if(key==="data_dictionary.csv"){
    body=dataDictionaryCsv();
    contentType="text/csv; charset=utf-8";
    fileName="Numwan_Saudi_Industrial_Intelligence_V1_Data_Dictionary.csv";
  }else if(key==="buyer_guide.txt"){
    body=buyerGuide();
    fileName="Numwan_Saudi_Industrial_Intelligence_V1_Buyer_Guide.txt";
  }else{
    return new Response("Unsupported generated file",{status:404});
  }

  return new Response(body,{status:200,headers:attachmentHeaders(contentType,fileName)});
}
