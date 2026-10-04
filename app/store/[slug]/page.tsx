import "../store.module.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";
import StoreViewTracker from "@/components/store-view-tracker";
import { createClient } from "@/lib/supabase/server";
import { getPublishedStoreProduct } from "@/lib/store/public-product";
import { getSiteUrl } from "@/lib/site-url";
import { startStoreCheckout } from "@/app/actions/store-checkout";

export const dynamic="force-dynamic";

const typeLabels:Record<string,string>={
  DATASET:"بيانات",
  REPORT:"تقرير",
  FINANCIAL_MODEL:"نموذج مالي",
  BLUEPRINT:"مخطط تنفيذي",
  BUNDLE:"حزمة",
  TOOLKIT:"أدوات"
};

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const product=await getPublishedStoreProduct(slug);

  if(!product){
    return {
      title:"المنتج غير متاح | نُموان",
      robots:{index:false,follow:false}
    };
  }

  const base=getSiteUrl();
  const canonical=base+"/store/"+product.slug;
  const english=base+"/en/store/"+product.slug;

  return {
    title:product.title_ar+" | نُموان",
    description:product.summary_ar,
    alternates:{
      canonical,
      languages:{
        "ar-SA":canonical,
        "en":english
      }
    },
    openGraph:{
      type:"website",
      url:canonical,
      title:product.title_ar,
      description:product.summary_ar,
      siteName:"نُموان",
      locale:"ar_SA"
    },
    robots:{index:true,follow:true}
  };
}

export default async function StoreProductPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const product=await getPublishedStoreProduct(slug);
  if(!product) notFound();

  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();
  const signedIn=Boolean(claims?.claims);
  const base=getSiteUrl();
  const canonical=base+"/store/"+product.slug;

  const structuredData={
    "@context":"https://schema.org",
    "@graph":[
      {
        "@type":"Dataset",
        "@id":canonical+"#dataset",
        name:product.title_ar,
        alternateName:product.title_en||undefined,
        description:product.summary_ar,
        url:canonical,
        inLanguage:["ar","en"],
        spatialCoverage:{
          "@type":"Place",
          name:"Saudi Arabia"
        },
        temporalCoverage:"2025",
        creator:{
          "@type":"Organization",
          name:"Numwan"
        },
        license:"https://creativecommons.org/licenses/by/4.0/",
        version:product.product_version,
        isAccessibleForFree:false,
        measurementTechnique:"Climate TRACE source-level industrial emissions and activity data normalized by Numwan",
        citation:product.source_attribution||"Climate TRACE — CC BY 4.0"
      },
      {
        "@type":"Product",
        "@id":canonical+"#product",
        name:product.title_ar,
        description:product.summary_ar,
        sku:product.sku||undefined,
        category:typeLabels[product.product_type]||product.product_type,
        brand:{"@type":"Brand",name:"نُموان"},
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

  return <main className="publicSite storePage">
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData).replace(/</g,"\u003c")}}
    />
    <StoreViewTracker productId={product.id}/>
    <PublicHeader signedIn={signedIn} light/>
    <section className="productHero shellWide">
      <div className="productHeroCopy">
        <span className="sectionKicker">{typeLabels[product.product_type]??product.product_type}</span>
        <h1>{product.title_ar}</h1>
        <p>{product.summary_ar}</p>
      </div>
      <aside className="productPurchase">
        <span>السعر</span>
        <strong>{Number(product.price_sar).toLocaleString("ar-SA")} ر.س</strong>
        <small>{product.license_tier==="COMMERCIAL"?"ترخيص تجاري":product.license_tier==="PROFESSIONAL"?"ترخيص احترافي":"ترخيص قياسي"}</small>
        {product.checkout_status==="READY"
          ? <form className="purchaseForm" action={startStoreCheckout.bind(null,slug)}>
              <button className="purchaseButton" type="submit">اشتر الآن</button>
              <span>يتم التسليم تلقائيًا إلى «مشترياتي» بعد تأكيد الدفع.</span>
            </form>
          : <div className="purchasePending">الدفع غير متاح لهذا المنتج حاليًا.</div>}
      </aside>
    </section>

    <section className="productPreview shellWide">
      <div className="sectionHeading compact">
        <span className="sectionIndex">01</span>
        <div><span className="sectionKicker">المعاينة</span><h2>ما الذي تحصل عليه؟</h2></div>
      </div>
      <div className="productPreviewText">{product.preview_ar||"ستظهر المعاينة التفصيلية هنا عند اعتماد المنتج للنشر."}</div>
      {slug==="saudi-industrial-intelligence-v1"
        ? <a className="sampleDownload" href="/api/store/sample/saudi-industrial-intelligence-v1">تحميل عينة مجانية CSV <span>↗</span></a>
        : null}
    </section>
    <PublicFooter signedIn={signedIn}/>
  </main>;
}
