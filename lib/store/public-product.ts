import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";

export const getPublishedStoreProduct=cache(async(slug:string)=>{
  if(slug==="saudi-industrial-intelligence-v1") return null;

  const supabase=createPublicClient();
  const {data,error}=await supabase
    .from("store_products")
    .select("id,slug,sku,title_ar,title_en,summary_ar,summary_en,preview_ar,preview_en,product_type,price_sar,compare_at_price_sar,delivery_mode,license_tier,published_at,updated_at,source_attribution,product_version,checkout_status")
    .eq("slug",slug)
    .eq("status","PUBLISHED")
    .maybeSingle();

  if(error) throw error;
  return data;
});
