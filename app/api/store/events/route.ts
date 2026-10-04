import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime="nodejs";

function clean(value:unknown,max:number){
  if(typeof value!=="string") return null;
  const trimmed=value.trim();
  return trimmed ? trimmed.slice(0,max) : null;
}

function isUuid(value:unknown){
  return typeof value==="string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request:Request){
  try{
    const body=await request.json();
    const allowedTypes=["PRODUCT_VIEW","INSIGHT_VIEW","LANDING_VIEW"];

    if(!allowedTypes.includes(body?.eventType) || !isUuid(body?.productId)){
      return NextResponse.json({ok:false},{status:400});
    }

    const admin=createAdminClient();
    const {data:product}=await admin
      .from("store_products")
      .select("id,status")
      .eq("id",body.productId)
      .maybeSingle();

    if(!product) return NextResponse.json({ok:false},{status:404});

    if(body.eventType==="PRODUCT_VIEW" && product.status!=="PUBLISHED"){
      return NextResponse.json({ok:false},{status:404});
    }

    if(body.eventType==="INSIGHT_VIEW" || body.eventType==="LANDING_VIEW"){
      const {data:snapshot}=await admin
        .from("store_public_snapshots")
        .select("id")
        .eq("product_id",product.id)
        .eq("is_public",true)
        .limit(1)
        .maybeSingle();

      if(!snapshot) return NextResponse.json({ok:false},{status:404});
    }

    const sessionId=isUuid(body.sessionId) ? body.sessionId : null;

    const {error}=await admin.from("store_funnel_events").insert({
      product_id:product.id,
      event_type:body.eventType,
      session_id:sessionId,
      path:clean(body.path,300),
      referrer:clean(body.referrer,700),
      utm_source:clean(body.utmSource,120),
      utm_medium:clean(body.utmMedium,120),
      utm_campaign:clean(body.utmCampaign,160)
    });

    if(error) throw error;

    return new NextResponse(null,{status:204});
  }catch{
    return NextResponse.json({ok:false},{status:400});
  }
}
