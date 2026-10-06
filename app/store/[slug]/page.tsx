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

const checkoutErrorMessages:Record<string,string>={
  name:"أدخل اسمًا صحيحًا للمتابعة إلى الدفع.",
  phone:"تحقق من رقم الجوال ثم حاول مرة أخرى.",
  unavailable:"الدفع غير متاح لهذا المنتج حاليًا.",
  order:"تعذر إنشاء الطلب. لم يتم خصم أي مبلغ، ويمكنك المحاولة مرة أخرى.",
  provider:"تعذر فتح صفحة الدفع لدى مزود الخدمة. لم يتم خصم أي مبلغ.",
  state:"تم إنشاء جلسة الدفع لكن تعذر تثبيت حالة الطلب. حاول مرة أخرى."
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
  const isPaymentTest=product.slug==="payment-test-5-sar";

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
    robots:isPaymentTest?{index:false,follow:false}:{index:true,follow:true}
  };
}

export default async function StoreProductPage({
  params,
  searchParams
}:{
  params:Promise<{slug:string}>,
  searchParams:Promise<{checkout_error?:string,payment?:string}>
}){
  const {slug}=await params;
  const query=await searchParams;
  const product=await getPublishedStoreProduct(slug);
  if(!product) notFound();

  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();
  const userId=typeof claims?.claims?.sub==="string" ? claims.claims.sub : "";
  const signedIn=Boolean(userId);

  let owned=false;
  if(userId){
    const {data:entitlement}=await supabase
      .from("store_entitlements")
      .select("id")
      .eq("product_id",product.id)
      .eq("status","ACTIVE")
      .limit(1)
      .maybeSingle();
    owned=Boolean(entitlement);
  }

  const base=getSiteUrl();
  const canonical=base+"/store/"+product.slug;
  const isPaymentTest=product.slug==="payment-test-5-sar";
  const checkoutError=query.checkout_error ? checkoutErrorMessages[query.checkout_error]||checkoutErrorMessages.order : "";
  const cancelled=query.payment==="cancelled";

  const structuredData=isPaymentTest?null:{
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
        isBasedOn:"https://climatetrace.org/data",
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
    {structuredData?<script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData).replace(/</g,"\u003c")}}
    />:null}
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
        {owned
          ? <div className="purchaseState purchaseStateSuccess">
              <strong>تم تأكيد الشراء</strong>
              <span>هذا الأصل مضاف إلى حسابك وجاهز ضمن «مشترياتي».</span>
              <a className="purchaseButton purchaseLink" href="/account/purchases">فتح مشترياتي</a>
            </div>
          : product.checkout_status==="READY"
            ? <form className="purchaseForm" action={startStoreCheckout.bind(null,slug)}>
                {checkoutError?<div className="purchaseState purchaseStateError">{checkoutError}</div>:null}
                {cancelled?<div className="purchaseState">تم إلغاء عملية الدفع ولم يتم منح الأصل.</div>:null}
                <label className="purchaseField">
                  <span>الاسم</span>
                  <input name="buyer_name" autoComplete="name" required minLength={2} placeholder="الاسم كما سيظهر في عملية الدفع"/>
                </label>
                <label className="purchaseField">
                  <span>رقم الجوال</span>
                  <input name="buyer_phone" autoComplete="tel" inputMode="tel" required placeholder="05xxxxxxxx"/>
                </label>
                <button className="purchaseButton" type="submit">المتابعة إلى الدفع الآمن</button>
                <span>تتم عملية البطاقة في صفحة مزود الدفع، ويظهر التنزيل في «مشترياتي» بعد تأكيد العملية.</span>
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
