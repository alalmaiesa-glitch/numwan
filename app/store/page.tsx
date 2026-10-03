import "./store.module.css";
import Link from "next/link";
import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const typeLabels: Record<string,string> = {
  DATASET:"بيانات",
  REPORT:"تقرير",
  FINANCIAL_MODEL:"نموذج مالي",
  BLUEPRINT:"مخطط تنفيذي",
  BUNDLE:"حزمة",
  TOOLKIT:"أدوات"
};

export default async function StorePage(){
  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();
  const signedIn=Boolean(claims?.claims);
  const {data:products}=await supabase
    .from("store_products")
    .select("id,slug,sku,title_ar,summary_ar,product_type,price_sar,license_tier,is_featured,published_at")
    .eq("status","PUBLISHED")
    .order("is_featured",{ascending:false})
    .order("published_at",{ascending:false});

  return <main className="publicSite storePage">
    <PublicHeader signedIn={signedIn} light/>
    <section className="storeHero shellWide">
      <span className="sectionKicker">متجر نُموان</span>
      <h1>أصول أعمال جاهزة<br/>تختصر الطريق إلى التنفيذ.</h1>
      <p>بيانات، نماذج، تقارير ومخططات تنفيذية تُبنى مرة وتُستخدم بوضوح، مع معاينة وترخيص محدد لكل أصل.</p>
    </section>

    <section className="storeCatalog shellWide">
      <div className="storeCatalogHead">
        <div><span className="sectionKicker">الأصول المتاحة</span><h2>اشترِ ما تحتاجه، لا ما يحتاج شرحًا طويلًا.</h2></div>
        <span className="storeCount">{products?.length ?? 0} أصل</span>
      </div>

      {products?.length
        ? <div className="storeGrid">{products.map(product=>
            <Link className="storeCard" href={"/store/"+product.slug} key={product.id}>
              <div className="storeCardTop">
                <span>{typeLabels[product.product_type] ?? product.product_type}</span>
                {product.is_featured?<b>مختار</b>:null}
              </div>
              <h2>{product.title_ar}</h2>
              <p>{product.summary_ar}</p>
              <div className="storeCardFoot">
                <small>{product.license_tier === "COMMERCIAL" ? "ترخيص تجاري" : product.license_tier === "PROFESSIONAL" ? "ترخيص احترافي" : "ترخيص قياسي"}</small>
                <strong>{Number(product.price_sar).toLocaleString("ar-SA")} ر.س</strong>
              </div>
            </Link>
          )}</div>
        : <div className="storeEmpty">
            <span>00</span>
            <div>
              <h2>لن نملأ المتجر بمنتجات شكلية.</h2>
              <p>يظهر هنا فقط أصل حقيقي بعد اكتمال محتواه ومعاينته وترخيصه وتجهيزه للتسليم. أول أصل مدفوع قيد الإعداد ضمن NUMWAN 20K.</p>
            </div>
          </div>}
    </section>

    <section className="storePrinciple shellWide">
      <span className="sectionKicker">المبدأ</span>
      <h2>منتج واضح. سعر واضح. تسليم رقمي.</h2>
      <p>صُمّم متجر نُموان ليعمل دون اجتماعات أو عروض أسعار يدوية في المسار الافتراضي.</p>
    </section>
    <PublicFooter signedIn={signedIn}/>
  </main>;
}
