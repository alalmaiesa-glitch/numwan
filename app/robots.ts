import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots():MetadataRoute.Robots{
  const base=getSiteUrl();

  return {
    rules:[{
      userAgent:"*",
      allow:["/","/store","/en","/en/store"],
      disallow:[
        "/api/",
        "/dashboard",
        "/vault",
        "/assets",
        "/deals",
        "/commerce",
        "/account/",
        "/login"
      ]
    }],
    sitemap:base+"/sitemap.xml"
  };
}
