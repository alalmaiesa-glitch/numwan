import { notFound } from "next/navigation";
import PublicHeaderEn from "@/components/public-header-en";
import PublicFooterEn from "@/components/public-footer-en";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const typeLabels: Record<string,string> = {
  DATASET:"Dataset",
  REPORT:"Report",
  FINANCIAL_MODEL:"Financial model",
  BLUEPRINT:"Execution blueprint",
  BUNDLE:"Bundle",
  TOOLKIT:"Toolkit"
};

export default async function EnglishStoreProductPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();
  const signedIn=Boolean(claims?.claims);
  const {data:product}=await supabase
    .from("store_products")
    .select("id,slug,sku,title_en,title_ar,summary_en,summary_ar,product_type,price_sar,compare_at_price_sar,delivery_mode,license_tier,preview_en,preview_ar,published_at")
    .eq("slug",slug)
    .eq("status","PUBLISHED")
    .maybeSingle();

  if(!product) notFound();

  return <main className="publicSite storePage englishSite" lang="en" dir="ltr">
    <PublicHeaderEn signedIn={signedIn} light/>
    <section className="productHero shellWide">
      <div className="productHeroCopy">
        <span className="sectionKicker">{typeLabels[product.product_type] ?? product.product_type}</span>
        <h1>{product.title_en || product.title_ar}</h1>
        <p>{product.summary_en || product.summary_ar}</p>
      </div>
      <aside className="productPurchase">
        <span>PRICE</span>
        <strong>SAR {Number(product.price_sar).toLocaleString("en-US")}</strong>
        <small>{product.license_tier === "COMMERCIAL" ? "Commercial license" : product.license_tier === "PROFESSIONAL" ? "Professional license" : "Standard license"}</small>
        <div className="purchasePending">Checkout and automated delivery are enabled before the first paid product is published.</div>
      </aside>
    </section>

    <section className="productPreview shellWide">
      <div className="sectionHeading compact">
        <span className="sectionIndex">01</span>
        <div><span className="sectionKicker">PREVIEW</span><h2>What do you get?</h2></div>
      </div>
      <div className="productPreviewText">{product.preview_en || product.preview_ar || "The detailed preview appears here once the product is approved for release."}</div>
    </section>
    <PublicFooterEn signedIn={signedIn}/>
  </main>;
}
