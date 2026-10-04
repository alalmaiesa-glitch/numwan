import "../../store/store.module.css";
import type { Metadata } from "next";
import Link from "next/link";
import PublicHeaderEn from "@/components/public-header-en";
import PublicFooterEn from "@/components/public-footer-en";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata:Metadata={
  title:"NUMWAN Store | Execution-Ready Business Assets",
  description:"Browse digital datasets, models, reports and execution blueprints with clear previews, pricing and licensing.",
  alternates:{
    canonical:"/en/store",
    languages:{
      "en":"/en/store",
      "ar-SA":"/store"
    }
  }
};

const typeLabels: Record<string,string> = {
  DATASET:"Dataset",
  REPORT:"Report",
  FINANCIAL_MODEL:"Financial model",
  BLUEPRINT:"Execution blueprint",
  BUNDLE:"Bundle",
  TOOLKIT:"Toolkit"
};

export default async function EnglishStorePage(){
  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();
  const signedIn=Boolean(claims?.claims);
  const {data:products}=await supabase
    .from("store_products")
    .select("id,slug,sku,title_en,title_ar,summary_en,summary_ar,product_type,price_sar,license_tier,is_featured,published_at")
    .eq("status","PUBLISHED")
    .order("is_featured",{ascending:false})
    .order("published_at",{ascending:false});

  return <main className="publicSite storePage englishSite" lang="en" dir="ltr">
    <PublicHeaderEn signedIn={signedIn} light/>
    <section className="storeHero shellWide">
      <span className="sectionKicker">NUMWAN STORE</span>
      <h1>Execution-ready business assets,<br/>without starting from zero.</h1>
      <p>Datasets, models, reports and execution blueprints with a clear preview, price and license.</p>
    </section>

    <section className="storeCatalog shellWide">
      <div className="storeCatalogHead">
        <div><span className="sectionKicker">AVAILABLE ASSETS</span><h2>Buy the asset, not a long consulting process.</h2></div>
        <span className="storeCount">{products?.length ?? 0} assets</span>
      </div>

      {products?.length
        ? <div className="storeGrid">{products.map(product=>
            <Link className="storeCard" href={"/en/store/"+product.slug} key={product.id}>
              <div className="storeCardTop">
                <span>{typeLabels[product.product_type] ?? product.product_type}</span>
                {product.is_featured?<b>Featured</b>:null}
              </div>
              <h2>{product.title_en || product.title_ar}</h2>
              <p>{product.summary_en || product.summary_ar}</p>
              <div className="storeCardFoot">
                <small>{product.license_tier === "COMMERCIAL" ? "Commercial license" : product.license_tier === "PROFESSIONAL" ? "Professional license" : "Standard license"}</small>
                <strong>SAR {Number(product.price_sar).toLocaleString("en-US")}</strong>
              </div>
            </Link>
          )}</div>
        : <div className="storeEmpty">
            <span>00</span>
            <div>
              <h2>No filler products.</h2>
              <p>Only real, completed and delivery-ready assets are published. The first paid Numwan asset is being prepared under NUMWAN 20K.</p>
            </div>
          </div>}
    </section>

    <section className="storePrinciple shellWide">
      <span className="sectionKicker">PRINCIPLE</span>
      <h2>Clear product. Clear price. Digital delivery.</h2>
      <p>Numwan Store is designed for self-service purchase rather than meetings and manual proposals.</p>
    </section>
    <PublicFooterEn signedIn={signedIn}/>
  </main>;
}
