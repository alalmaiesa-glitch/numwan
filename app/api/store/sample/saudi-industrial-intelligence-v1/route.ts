import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { sampleCsv } from "@/lib/store/product1-export";

export const dynamic="force-dynamic";

function isUuid(value:string|undefined){
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

export async function GET(){
  const admin=createAdminClient();
  const {data:rows,error}=await admin.rpc("get_numwan_product1_sample_v1");

  if(error || !rows?.length) return new Response("Sample not available",{status:404});

  try{
    const {data:product}=await admin
      .from("store_products")
      .select("id")
      .eq("slug","saudi-industrial-intelligence-v1")
      .eq("status","PUBLISHED")
      .maybeSingle();

    if(product){
      const cookieStore=await cookies();
      const sid=cookieStore.get("numwan_sid")?.value;
      await admin.from("store_funnel_events").insert({
        product_id:product.id,
        event_type:"SAMPLE_DOWNLOAD",
        session_id:isUuid(sid) ? sid : null,
        path:"/api/store/sample/saudi-industrial-intelligence-v1"
      });
    }
  }catch{
    // Analytics must never block delivery of a valid public sample.
  }

  return new Response(sampleCsv(rows),{
    status:200,
    headers:{
      "Content-Type":"text/csv; charset=utf-8",
      "Content-Disposition":'attachment; filename="Numwan_Saudi_Industrial_Intelligence_V1_Free_Sample.csv"',
      "Cache-Control":"no-store",
      "X-Content-Type-Options":"nosniff"
    }
  });
}
