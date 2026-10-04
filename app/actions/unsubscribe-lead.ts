"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

function validToken(value:string){
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function unsubscribeStoreLead(token:string){
  if(!validToken(token)){
    throw new Error("INVALID_UNSUBSCRIBE_TOKEN");
  }

  const admin=createAdminClient();
  const {data:lead,error:readError}=await admin
    .from("store_leads")
    .select("id,status")
    .eq("unsubscribe_token",token)
    .maybeSingle();

  if(readError || !lead){
    redirect("/unsubscribe/"+encodeURIComponent(token)+"?error=not-found");
  }

  if(lead.status!=="UNSUBSCRIBED"){
    const {error:updateError}=await admin
      .from("store_leads")
      .update({
        status:"UNSUBSCRIBED",
        unsubscribed_at:new Date().toISOString(),
        updated_at:new Date().toISOString()
      })
      .eq("id",lead.id);

    if(updateError){
      throw new Error("UNSUBSCRIBE_FAILED");
    }
  }

  redirect("/unsubscribe/"+encodeURIComponent(token)+"?done=1");
}
