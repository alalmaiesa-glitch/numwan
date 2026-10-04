import { createClient } from "@/lib/supabase/server";
import { sampleCsv } from "@/lib/store/product1-export";

export const dynamic="force-dynamic";

export async function GET(){
  const supabase=await createClient();
  const {data:rows,error}=await supabase.rpc("get_numwan_product1_sample_v1");

  if(error || !rows?.length) return new Response("Sample not available",{status:404});

  return new Response(sampleCsv(rows),{
    status:200,
    headers:{
      "Content-Type":"text/csv; charset=utf-8",
      "Content-Disposition":'attachment; filename="Numwan_Saudi_Industrial_Intelligence_V1_Free_Sample.csv"',
      "Cache-Control":"public, max-age=3600",
      "X-Content-Type-Options":"nosniff"
    }
  });
}
