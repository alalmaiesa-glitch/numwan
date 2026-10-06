import "../../../store/store.module.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicHeaderEn from "@/components/public-header-en";
import PublicFooterEn from "@/components/public-footer-en";
import StoreViewTracker from "@/components/store-view-tracker";
import { createClient } from "@/lib/supabase/server";
import { getPublishedStoreProduct } from "@/lib/store/public-product";
import { getSiteUrl } from "@/lib/site-url";
import { startStoreCheckout } from "@/app/actions/store-checkout";

export const dynamic="force-dynamic";

const typeLabels:Record<string,string>={
  DATASET:"Dataset",
  REPORT:"Report",
  FINANCIAL_MODEL:"Financial model",
  BLUEPRINT:"Execution blueprint",
  BUNDLE:"Bundle",
  TOOLKIT:"Toolkit"
};

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const product=await getPublishedStoreProduct(slug);

  if(!product){
    return {
      title:"Product unavailable | NUMWAN",
      robots:{index:false,follow:false}
    };
  }

  const base=getSiteUrl();
  const canonical=base+"/en/store/"+product.slug;
  const arabic=base+"/store/"+product.slug;
  const isPaymentTest=product.slug==="payment-test-5-sar";

  return {
    title:(product.title_en||product.title_ar)+" | NUMWAN",
    description:product.summary_en||product.summary_ar,
    alternates:{
      canonical,
      languages:{
        "en":canonical,
        "ar-SA":arabic
      }
    },
    openGraph:{
      type:"website",
      url:canonical,
      title:product.title_en||product.title_ar,
      description:product.summary_en||product.summary_ar,
      siteName:"NUMWAN",
      locale:"en_US"
    },
    robots:isPaymentTest?{index:false,follow:false}:{index:true,follow:true}
  };
}

export default async function EnglishStoreProductPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const product=await getPublishedStoreProduct(slug);
  if(!product) notFound();

  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();
  const signedIn=Boolean(claims?.claims);
  const base=getSiteUrl();
  const canonical=base+"/en/store/"+product.slug;
  const isPaymentTest=product.slug==="payment-test-5-sar";

  const structuredData=isPaymentTest?null:{
    "@context":"https://schema.org",
    "@graph":[
      {
        "@type":"Dataset",
        "@id":canonical+"#dataset",
        name:product.title_en||product.title_ar,
        description:product.summary_en||product.summary_ar,
        url:canonical,
        inLanguage:["en","ar"],
        spatialCoverage:{
          "@type":"Place",
          name:"Saudi Arabia"
        },
        temporalCoverage:"2025",
        creator:{
          "@type":"Organization",
          name:"NUMWAN"
        },
        isBasedOn:"https://climatetrace.org/data",
        version:product.product_version,
        isAccessibleForFree:false,
        measurementTechnique:"Climate TRACE source-level industrial emissions and activity data normalized by Numwan",
        citation:product.source_attribution||"Climate TRACE — CC BY 4.0"
      },
      {
        "@type":"Product",
        "@id":canonical+"#product",
        name:product.title_en||product.title_ar,
        description:product.summary_en||product.summary_ar,
        sku:product.sku||undefined,
        category:typeLabels[product.product_type]||product.product_type,
        brand:{"@type":"Brand",name:"NUMWAN"},
        offers:{
          "@type":"Offer",
          url:canonical,
          price:String(product.price_sar),
          priceCurrency:"SAR",
          availability:"https://schema.org/InStock"
        }
      }
    ]
  };

  return <main className="publicSite storePage englishSite" lang="en" dir="ltr">
    {structuredData?<script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData).replace(/</g,"\u003c")}}
    />:null}
    <StoreViewTracker productId={product.id}/>
    <PublicHeaderEn signedIn={signedIn} light/>
    <section className="productHero shellWide">
      <div className="productHeroCopy">
        <span className="sectionKicker">{typeLabels[product.product_type]??product.product_type}</span>
        <h1>{product.title_en||product.title_ar}</h1>
        <p>{product.summary_en||product.summary_ar}</p>
      </div>
      <aside className="productPurchase">
        <span>PRICE</span>
        <strong>SAR {Number(product.price_sar).toLocaleString("en-US")}</strong>
        <small>{product.license_tier==="COMMERCIAL"?"Commercial license":product.license_tier==="PROFESSIONAL"?"Professional license":"Standard license"}</small>
        {product.checkout_status==="READY"
          ? <form className="purchaseForm" action={startStoreCheckout.bind(null,slug)}>
              <label className="purchaseField">
                <span>Name</span>
                <input name="buyer_name" autoComplete="name" required minLength={2} placeholder="Name used for payment"/>
              </label>
              <label className="purchaseField">
                <span>Mobile number</span>
                <input name="buyer_phone" autoComplete="tel" inputMode="tel" required placeholder="05xxxxxxxx"/>
              </label>
              <button className="purchaseButton" type="submit">Continue to secure payment</button>
              <span>Card payment is completed on EdfaPay's hosted page. Your files appear in Purchases after payment confirmation.</span>
            </form>
          : <div className="purchasePending">Checkout is not available for this product yet.</div>}
      </aside>
    </section>

    <section className="productPreview shellWide">
      <div className="sectionHeading compact">
        <span className="sectionIndex">01</span>
        <div><span className="sectionKicker">PREVIEW</span><h2>What do you get?</h2></div>
      </div>
      <div className="productPreviewText">{product.preview_en||product.preview_ar||"The detailed preview appears here once the product is approved for release."}</div>
      {slug==="saudi-industrial-intelligence-v1"
        ? <a className="sampleDownload" href="/api/store/sample/saudi-industrial-intelligence-v1">Download free CSV sample <span>↗</span></a>
        : null}
    </section>
    <PublicFooterEn signedIn={signedIn}/>
  </main>;
}
