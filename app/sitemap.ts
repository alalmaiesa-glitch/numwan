import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { PRODUCT1_USE_CASES } from "@/lib/store/product1-use-cases";

export default function sitemap():MetadataRoute.Sitemap{
  const base=getSiteUrl();

  const pages:MetadataRoute.Sitemap=[
    {url:base+"/",changeFrequency:"weekly",priority:1},
    {url:base+"/store",changeFrequency:"weekly",priority:.9},
    {url:base+"/about",changeFrequency:"monthly",priority:.5},
    {url:base+"/insights/saudi-heavy-industry-2025",changeFrequency:"monthly",priority:.85},
    {url:base+"/en",changeFrequency:"weekly",priority:.8},
    {url:base+"/en/store",changeFrequency:"weekly",priority:.8},
    {url:base+"/en/about",changeFrequency:"monthly",priority:.4},
    {url:base+"/en/insights/saudi-heavy-industry-2025",changeFrequency:"monthly",priority:.75}
  ];

  for(const useCase of PRODUCT1_USE_CASES){
    pages.push({
      url:base+"/use-cases/"+useCase.slug,
      changeFrequency:"monthly",
      priority:.72
    });
    pages.push({
      url:base+"/en/use-cases/"+useCase.slug,
      changeFrequency:"monthly",
      priority:.68
    });
  }

  return pages;
}
