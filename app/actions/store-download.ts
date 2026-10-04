"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function downloadStoreFile(entitlementId:string,productFileId:string){
  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();
  const userId=typeof claims?.claims?.sub==="string" ? claims.claims.sub : "";

  if(!userId){
    redirect("/login?next="+encodeURIComponent("/account/purchases"));
  }

  const {data:entitlement,error:entitlementError}=await supabase
    .from("store_entitlements")
    .select("id,product_id,status,expires_at")
    .eq("id",entitlementId)
    .eq("status","ACTIVE")
    .maybeSingle();

  if(entitlementError || !entitlement){
    throw new Error("ENTITLEMENT_NOT_AVAILABLE");
  }

  if(entitlement.expires_at && new Date(entitlement.expires_at).getTime()<=Date.now()){
    throw new Error("ENTITLEMENT_EXPIRED");
  }

  const {data:file,error:fileError}=await supabase
    .from("store_product_files")
    .select("id,product_id,file_label,storage_path,is_active")
    .eq("id",productFileId)
    .eq("product_id",entitlement.product_id)
    .eq("is_active",true)
    .maybeSingle();

  if(fileError || !file){
    throw new Error("PRODUCT_FILE_NOT_AVAILABLE");
  }

  const {data:signed,error:signedError}=await supabase.storage
    .from("numwan-store-products")
    .createSignedUrl(file.storage_path,120,{download:file.file_label});

  if(signedError || !signed?.signedUrl){
    throw new Error("SIGNED_DOWNLOAD_FAILED");
  }

  const {error:eventError}=await supabase.from("store_download_events").insert({
    entitlement_id:entitlement.id,
    product_file_id:file.id,
    user_id:userId
  });

  if(eventError){
    throw new Error("DOWNLOAD_AUDIT_FAILED");
  }

  redirect(signed.signedUrl);
}
