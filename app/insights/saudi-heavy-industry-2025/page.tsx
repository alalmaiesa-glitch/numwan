import type { Metadata } from "next";
import Link from "next/link";
import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";
import LaunchLeadForm from "@/components/launch-lead-form";
import StoreViewTracker from "@/components/store-view-tracker";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getPublishedStoreProduct } from "@/lib/store/public-product";
import { getSiteUrl } from "@/lib/site-url";
import "./snapshot.module.css";

export const dynamic="force-dynamic";

export const metadata:Metadata={
  title:"لمحة الصناعات الثقيلة السعودية 2025 | نُموان",
  description:"لمحة مجانية عن الصناعات الثقيلة السعودية في بيانات 2025: 46 سجلًا عبر 7 قطاعات فرعية مع مؤشرات الملكية والانبعاثات وحدود التغطية.",
  alternates:{
    canonical:"/insights/saudi-heavy-industry-2025",
    languages:{
      "ar-SA":"/insights/saudi-heavy-industry-2025",
      "en":"/en/insights/saudi-heavy-industry-2025"
    }
  }
};

type SnapshotMetrics={
  records?:number;
  subsectors?:number;
  with_owner?:number;
  emissions_co2e_2025_t?:number;
};

type BreakdownItem={
  code:string;
  name_ar:string;
  name_en:string;
  records:number;
};

export default async function SaudiHeavyIndustrySnapshot(){
  const auth=await createClient();
  const {data:claims}=await auth.auth.getClaims();
  const signedIn=Boolean(claims?.claims);

  const publicClient=createPublicClient();
  const [{data:snapshot},product]=await Promise.all([
    publicClient
      .from("store_public_snapshots")
      .select("slug,product_id,title_ar,summary_ar,data_year,metrics,breakdown,methodology_ar,updated_at")
      .eq("slug","saudi-heavy-industry-2025")
      .eq("is_public",true)
      .maybeSingle(),
    getPublishedStoreProduct("saudi-industrial-intelligence-v1")
  ]);

  if(!snapshot) return null;

  const metrics=(snapshot.metrics||{}) as SnapshotMetrics;
  const breakdown=(snapshot.breakdown||[]) as BreakdownItem[];
  const maxRecords=Math.max(...breakdown.map(item=>Number(item.records)||0),1);
  const base=getSiteUrl();
  const canonical=base+"/insights/saudi-heavy-industry-2025";

  const structuredData={
    "@context":"https://schema.org",
    "@type":"Dataset",
    name:snapshot.title_ar,
    description:snapshot.summary_ar,
    url:canonical,
    inLanguage:["ar","en"],
    spatialCoverage:{"@type":"Place",name:"Saudi Arabia"},
    temporalCoverage:String(snapshot.data_year),
    creator:{"@type":"Organization",name:"نُموان",url:base},
    publisher:{"@type":"Organization",name:"نُموان",url:base},
    license:{
      "@type":"CreativeWork",
      name:"Climate TRACE data terms / CC BY 4.0 with source-specific exceptions",
      url:"https://climatetrace.org/terms"
    },
    isAccessibleForFree:true,
    dateModified:new Date(snapshot.updated_at).toISOString(),
    isBasedOn:"https://climatetrace.org/data",
    variableMeasured:[
      "facility coverage",
      "industrial subsector",
      "ownership availability",
      "CO2e emissions indicators"
    ]
  };

  return <main className="publicSite snapshotPage">
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData).replace(/</g,"\u003c")}}
    />
    <StoreViewTracker productId={snapshot.product_id} eventType="INSIGHT_VIEW"/>
    <PublicHeader signedIn={signedIn} light/>

    <section className="snapshotHero shellWide">
      <div className="snapshotHeroCopy">
        <span className="sectionKicker">رؤى نُموان · السعودية</span>
        <h1>{snapshot.title_ar}</h1>
        <p>{snapshot.summary_ar}</p>
        <div className="snapshotMeta">
          <span>سنة الأساس {snapshot.data_year}</span>
          <span>المصدر الأساسي: Climate TRACE</span>
          <span>آخر تحديث: {new Date(snapshot.updated_at).toLocaleDateString("ar-SA")}</span>
        </div>
      </div>
      <aside className="snapshotAside">
        <span className="snapshotAsideLabel">ما الذي تقيسه هذه الصفحة؟</span>
        <strong>نطاق البيانات، لا حجم الصناعة السعودية بالكامل.</strong>
        <p>الأرقام التالية تصف المنشآت والمصادر الممثلة في قاعدة المصدر، وليست تعدادًا حكوميًا شاملًا لجميع المصانع.</p>
      </aside>
    </section>

    <section className="snapshotMetrics shellWide" aria-label="المؤشرات الرئيسية">
      <article><span>01</span><strong>{Number(metrics.records||0).toLocaleString("ar-SA")}</strong><p>سجلًا صناعيًا</p></article>
      <article><span>02</span><strong>{Number(metrics.subsectors||0).toLocaleString("ar-SA")}</strong><p>قطاعات فرعية</p></article>
      <article><span>03</span><strong>{Number(metrics.with_owner||0).toLocaleString("ar-SA")}</strong><p>سجلًا ببيانات ملكية</p></article>
      <article><span>04</span><strong>{(Number(metrics.emissions_co2e_2025_t||0)/1_000_000).toLocaleString("ar-SA",{maximumFractionDigits:2})}م</strong><p>طن CO₂e ممثلة في المصدر</p></article>
    </section>

    <section className="snapshotBreakdown shellWide">
      <div className="snapshotSectionHead">
        <span className="sectionKicker">توزيع التغطية</span>
        <h2>سبعة قطاعات، بتغطية غير متساوية.</h2>
        <p>نعرض عدد السجلات كما هو في المصدر بدل تحويله إلى نسبة سوق أو حصة صناعية غير مثبتة.</p>
      </div>

      <div className="snapshotBars">
        {breakdown.map((item,index)=>
          <article className="snapshotBarRow" key={item.code}>
            <span className="snapshotBarIndex">{String(index+1).padStart(2,"0")}</span>
            <div className="snapshotBarMain">
              <div className="snapshotBarLabel">
                <strong>{item.name_ar}</strong>
                <span>{Number(item.records).toLocaleString("ar-SA")} سجل</span>
              </div>
              <div className="snapshotBarTrack">
                <span style={{width:Math.max(6,(Number(item.records)/maxRecords)*100)+"%"}}/>
              </div>
            </div>
          </article>
        )}
      </div>
    </section>

    <section className="snapshotMethod shellWide">
      <div>
        <span className="sectionKicker">المنهجية</span>
        <h2>ما نعرفه، وما لا ندّعي معرفته.</h2>
      </div>
      <p>{snapshot.methodology_ar}</p>
    </section>

    <section className="snapshotUseCases shellWide">
      <div className="snapshotSectionHead">
        <span className="sectionKicker">كيف تستخدم البيانات؟</span>
        <h2>نفس الأصل، ثلاث قرارات مختلفة.</h2>
        <p>اختر الزاوية الأقرب لعملك لترى ما الذي يمكن للبيانات أن تختصره، وما الذي لا تستبدله.</p>
      </div>
      <div className="snapshotUseCaseLinks">
        <Link href="/use-cases/saudi-market-entry"><span>01</span><strong>دخول السوق السعودي</strong><p>للمصنعين الدوليين وفرق التوسع والمستشارين.</p></Link>
        <Link href="/use-cases/industrial-research"><span>02</span><strong>البحث والاستراتيجية الصناعية</strong><p>للبحوث والسياسات والعروض الاستشارية.</p></Link>
        <Link href="/use-cases/esg-industrial-intelligence"><span>03</span><strong>الاستدامة وESG</strong><p>لفرز المنشآت والانبعاثات مع درجات الثقة.</p></Link>
      </div>
    </section>

    <section className="snapshotCta shellWide">
      <div className="snapshotCtaCopy">
        <span className="sectionKicker">{product?"الأصل الكامل متاح":"قبل الإطلاق"}</span>
        <h2>{product?"انتقل من اللمحة إلى البيانات القابلة للتحليل.":"أبلغني عند إطلاق مجموعة البيانات الكاملة."}</h2>
        <p>{product
          ?"النسخة الكاملة تتضمن XLSX وCSV وقاموس البيانات وسجل المصادر والحقوق وملاحظات الإصدار."
          :"سنرسل إشعار إطلاق هذا الأصل وتحديثاته المرتبطة فقط. لا نشرة عامة ولا رسائل يومية."}</p>
      </div>
      <div className="snapshotCtaAction">
        {product
          ? <Link className="snapshotProductLink" href={"/store/"+product.slug}>استكشف الأصل الكامل <span>↗</span></Link>
          : <LaunchLeadForm language="ar"/>}
      </div>
    </section>

    <PublicFooter signedIn={signedIn}/>
  </main>;
}
