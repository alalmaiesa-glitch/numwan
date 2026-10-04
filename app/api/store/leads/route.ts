import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime="nodejs";

function clean(value:unknown,max:number){
  if(typeof value!=="string") return null;
  const v=value.trim();
  return v ? v.slice(0,max) : null;
}

function validEmail(value:string){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length<=254;
}

export async function POST(request:Request){
  try{
    const body=await request.json();
    if(clean(body?.website,200)) return new NextResponse(null,{status:204});

    const email=clean(body?.email,254)?.toLowerCase()||"";
    const productSlug=clean(body?.productSlug,120)||"";
    const language=body?.language==="en" ? "en" : "ar";
    const consent=body?.consent===true;

    if(!validEmail(email) || !productSlug || !consent){
      return NextResponse.json({ok:false,error:"INVALID_INPUT"},{status:400});
    }

    const admin=createAdminClient();
    const {data:product,error:productError}=await admin
      .from("store_products")
      .select("id")
      .eq("slug",productSlug)
      .maybeSingle();

    if(productError || !product){
      return NextResponse.json({ok:false,error:"PRODUCT_NOT_FOUND"},{status:404});
    }

    const row={
      product_id:product.id,
      email,
      language,
      status:"SUBSCRIBED",
      consent:true,
      consent_version:"launch-updates-v1",
      source:clean(body?.source,120)||"snapshot",
      utm_source:clean(body?.utmSource,120),
      utm_medium:clean(body?.utmMedium,120),
      utm_campaign:clean(body?.utmCampaign,160),
      subscribed_at:new Date().toISOString(),
      unsubscribed_at:null,
      updated_at:new Date().toISOString()
    };

    const {error:insertError}=await admin.from("store_leads").insert(row);

    if(insertError?.code==="23505"){
      const {error:updateError}=await admin
        .from("store_leads")
        .update(row)
        .eq("product_id",product.id)
        .eq("email",email);
      if(updateError) throw updateError;
    }else if(insertError){
      throw insertError;
    }

    return NextResponse.json({ok:true});
  }catch(error){
    console.error("Numwan lead capture failed",error);
    return NextResponse.json({ok:false,error:"SERVER_ERROR"},{status:500});
  }
}
