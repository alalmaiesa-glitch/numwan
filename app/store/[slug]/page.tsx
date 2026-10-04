import "../store.module.css";
import { notFound } from "next/navigation";
import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";
import { createClient } from "@/lib/supabase/server";
import { startStoreCheckout } from "@/app/actions/store-checkout";

export const dynamic = "force-dynamic";

const typeLabels: Record<string,string> = {
  DATASET:"بيانات",
  REPORT:"تقرير",
  FINANCIAL_MODEL:"نموذج مالي",
  BLUEPRINT:"مخطط تنفيذي",
  BUNDLE:"حزمة",
  TOOLKIT:"أدوات"
};

export default async function StoreProductPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();
  const signedIn=Boolean(claims?.claims);
  const {data:product}=await supabase
    .from("store_products")
    .select("id,slug,sku,title_ar,summary_ar,product_type,price_sar,compare_at_price_sar,delivery_mode,license_tier,preview_ar,published_at,checkout_status")
    .eq("slug",slug)
    .eq("status","PUBLISHED")
    .maybeSingle();

  if(!product) notFound();

  return <main className="publicSite storePage">
    <PublicHeader signedIn={signedIn} light/>
    <section className="productHero shellWide">
      <div className="productHeroCopy">
        <span className="sectionKicker">{typeLabels[product.product_type] ?? product.product_type}</span>
        <h1>{product.title_ar}</h1>
        <p>{product.summary_ar}</p>
      </div>
      <aside className="productPurchase">
        <span>السعر</span>
        <strong>{Number(product.price_sar).toLocaleString("ar-SA")} ر.س</strong>
        <small>{product.license_tier === "COMMERCIAL" ? "ترخيص تجاري" : product.license_tier === "PROFESSIONAL" ? "ترخيص احترافي" : "ترخيص قياسي"}</small>
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
      <div className="productPreviewText">{product.preview_ar || "ستظهر المعاينة التفصيلية هنا عند اعتماد المنتج للنشر."}</div>
    </section>
    <PublicFooter signedIn={signedIn}/>
  </main>;
}
