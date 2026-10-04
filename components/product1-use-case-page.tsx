import Link from "next/link";
import PublicHeader from "@/components/public-header";
import PublicHeaderEn from "@/components/public-header-en";
import PublicFooter from "@/components/public-footer";
import PublicFooterEn from "@/components/public-footer-en";
import LaunchLeadForm from "@/components/launch-lead-form";
import StoreViewTracker from "@/components/store-view-tracker";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getPublishedStoreProduct } from "@/lib/store/public-product";
import type { Product1UseCase } from "@/lib/store/product1-use-cases";
import "@/app/use-cases/use-case.module.css";

type Metrics={
  records?:number;
  subsectors?:number;
  with_owner?:number;
  emissions_co2e_2025_t?:number;
};

export default async function Product1UseCasePage({
  useCase,
  language
}:{
  useCase:Product1UseCase;
  language:"ar"|"en";
}){
  const ar=language==="ar";
  const copy=ar?useCase.ar:useCase.en;

  const auth=await createClient();
  const {data:claims}=await auth.auth.getClaims();
  const signedIn=Boolean(claims?.claims);

  const publicClient=createPublicClient();
  const [{data:snapshot},product]=await Promise.all([
    publicClient
      .from("store_public_snapshots")
      .select("product_id,data_year,metrics")
      .eq("slug","saudi-heavy-industry-2025")
      .eq("is_public",true)
      .maybeSingle(),
    getPublishedStoreProduct("saudi-industrial-intelligence-v1")
  ]);

  if(!snapshot) return null;

  const metrics=(snapshot.metrics||{}) as Metrics;
  const productHref=ar
    ? "/store/saudi-industrial-intelligence-v1"
    : "/en/store/saudi-industrial-intelligence-v1";
  const insightHref=ar
    ? "/insights/saudi-heavy-industry-2025"
    : "/en/insights/saudi-heavy-industry-2025";

  const Header=ar?PublicHeader:PublicHeaderEn;
  const Footer=ar?PublicFooter:PublicFooterEn;

  return <main className={"publicSite useCasePage "+(ar?"":"englishSite")} lang={ar?"ar":"en"} dir={ar?"rtl":"ltr"}>
    <StoreViewTracker productId={snapshot.product_id} eventType="LANDING_VIEW"/>
    <Header signedIn={signedIn} light/>

    <section className="useCaseHero shellWide">
      <div>
        <span className="sectionKicker">{copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p>{copy.summary}</p>
      </div>
      <aside>
        <span>{ar?"V1 بالأرقام":"V1 AT A GLANCE"}</span>
        <div><strong>{Number(metrics.records||0).toLocaleString(ar?"ar-SA":"en-US")}</strong><small>{ar?"سجلًا":"records"}</small></div>
        <div><strong>{Number(metrics.subsectors||0).toLocaleString(ar?"ar-SA":"en-US")}</strong><small>{ar?"قطاعات فرعية":"subsectors"}</small></div>
        <div><strong>{Number(metrics.with_owner||0).toLocaleString(ar?"ar-SA":"en-US")}</strong><small>{ar?"بسجل ملكية":"with ownership"}</small></div>
      </aside>
    </section>

    <section className="useCaseQuestions shellWide">
      <div className="useCaseIntro">
        <span className="sectionKicker">{ar?"أسئلة يساعدك الأصل على استكشافها":"QUESTIONS THIS ASSET HELPS YOU EXPLORE"}</span>
        <h2>{ar?"ابدأ بالسؤال الصحيح، ثم انتقل إلى التحقق الأعمق.":"Start with the right question, then move into deeper validation."}</h2>
      </div>
      <div className="useCaseQuestionGrid">
        {copy.questions.map((question,index)=>
          <article key={question}>
            <span>{String(index+1).padStart(2,"0")}</span>
            <p>{question}</p>
          </article>
        )}
      </div>
    </section>

    <section className="useCaseOutcomes shellWide">
      <div>
        <span className="sectionKicker">{ar?"القيمة العملية":"PRACTICAL VALUE"}</span>
        <h2>{ar?"ما الذي تختصره عليك هذه الطبقة؟":"What does this layer save you from rebuilding?"}</h2>
      </div>
      <div className="useCaseOutcomeList">
        {copy.outcomes.map((outcome,index)=>
          <div key={outcome}><span>{String(index+1).padStart(2,"0")}</span><p>{outcome}</p></div>
        )}
      </div>
    </section>

    <section className="useCaseLimits shellWide">
      <span className="sectionKicker">{ar?"حدود الاستخدام":"USE LIMITS"}</span>
      <strong>{copy.limits}</strong>
      <Link href={insightHref}>{ar?"راجع منهجية وتغطية البيانات":"Review dataset coverage and methodology"} <span>↗</span></Link>
    </section>

    <section className="useCaseCta shellWide">
      <div>
        <span className="sectionKicker">{product?(ar?"الأصل الكامل متاح":"FULL ASSET AVAILABLE"):(ar?"قبل الإطلاق":"PRE-LAUNCH")}</span>
        <h2>{product
          ? (ar?"انتقل إلى البيانات الكاملة القابلة للتحليل.":"Move into the full analysis-ready dataset.")
          : (ar?"أبلغني عندما يصبح الأصل الكامل متاحًا.":"Notify me when the full asset becomes available.")}</h2>
      </div>
      <div>
        {product
          ? <Link className="useCasePrimaryCta" href={productHref}>{ar?"استكشف الأصل الكامل":"Explore the full asset"} <span>↗</span></Link>
          : <LaunchLeadForm language={language}/>}
      </div>
    </section>

    <Footer signedIn={signedIn}/>
  </main>;
}
