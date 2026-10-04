import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic="force-dynamic";

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const base=getSiteUrl();
  const supabase=createPublicClient();
  const {data:products}=await supabase
    .from("store_products")
    .select("slug,updated_at")
    .eq("status","PUBLISHED")
    .order("updated_at",{ascending:false});

  const now=new Date();
  const pages:MetadataRoute.Sitemap=[
    {url:base+"/",lastModified:now,changeFrequency:"weekly",priority:1},
    {url:base+"/store",lastModified:now,changeFrequency:"weekly",priority:.9},
    {url:base+"/about",lastModified:now,changeFrequency:"monthly",priority:.5},
    {url:base+"/en",lastModified:now,changeFrequency:"weekly",priority:.8},
    {url:base+"/en/store",lastModified:now,changeFrequency:"weekly",priority:.8},
    {url:base+"/en/about",lastModified:now,changeFrequency:"monthly",priority:.4}
  ];

  for(const product of products??[]){
    const modified=product.updated_at ? new Date(product.updated_at) : now;
    pages.push({
      url:base+"/store/"+product.slug,
      lastModified:modified,
      changeFrequency:"monthly",
      priority:.85
    });
    pages.push({
      url:base+"/en/store/"+product.slug,
      lastModified:modified,
      changeFrequency:"monthly",
      priority:.75
    });
  }

  return pages;
}
