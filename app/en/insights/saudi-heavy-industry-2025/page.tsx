import type { Metadata } from "next";
import Link from "next/link";
import PublicHeaderEn from "@/components/public-header-en";
import PublicFooterEn from "@/components/public-footer-en";
import LaunchLeadForm from "@/components/launch-lead-form";
import StoreViewTracker from "@/components/store-view-tracker";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getPublishedStoreProduct } from "@/lib/store/public-product";
import { getSiteUrl } from "@/lib/site-url";
import "../../../insights/saudi-heavy-industry-2025/snapshot.module.css";

export const dynamic="force-dynamic";

export const metadata:Metadata={
  title:"Saudi Heavy Industry Snapshot 2025 | NUMWAN",
  description:"A free snapshot of Saudi heavy-industry data for 2025: 46 represented records across 7 subsectors, with ownership availability, emissions indicators and explicit coverage limits.",
  alternates:{
    canonical:"/en/insights/saudi-heavy-industry-2025",
    languages:{
      "en":"/en/insights/saudi-heavy-industry-2025",
      "ar-SA":"/insights/saudi-heavy-industry-2025"
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

export default async function EnglishSaudiHeavyIndustrySnapshot(){
  const auth=await createClient();
  const {data:claims}=await auth.auth.getClaims();
  const signedIn=Boolean(claims?.claims);

  const publicClient=createPublicClient();
  const [{data:snapshot},product]=await Promise.all([
    publicClient
      .from("store_public_snapshots")
      .select("slug,product_id,title_en,summary_en,data_year,metrics,breakdown,methodology_en,updated_at")
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
  const canonical=base+"/en/insights/saudi-heavy-industry-2025";

  const structuredData={
    "@context":"https://schema.org",
    "@type":"Dataset",
    name:snapshot.title_en,
    description:snapshot.summary_en,
    url:canonical,
    inLanguage:["en","ar"],
    spatialCoverage:{"@type":"Place",name:"Saudi Arabia"},
    temporalCoverage:String(snapshot.data_year),
    creator:{"@type":"Organization",name:"NUMWAN"},
    isBasedOn:"https://climatetrace.org/data",
    variableMeasured:[
      "facility coverage",
      "industrial subsector",
      "ownership availability",
      "CO2e emissions indicators"
    ]
  };

  return <main className="publicSite snapshotPage englishSite" lang="en" dir="ltr">
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData).replace(/</g,"\u003c")}}
    />
    <StoreViewTracker productId={snapshot.product_id} eventType="INSIGHT_VIEW"/>
    <PublicHeaderEn signedIn={signedIn} light/>

    <section className="snapshotHero shellWide">
      <div className="snapshotHeroCopy">
        <span className="sectionKicker">NUMWAN INSIGHTS · SAUDI ARABIA</span>
        <h1>{snapshot.title_en}</h1>
        <p>{snapshot.summary_en}</p>
        <div className="snapshotMeta">
          <span>Base year {snapshot.data_year}</span>
          <span>Primary source: Climate TRACE</span>
          <span>Updated {new Date(snapshot.updated_at).toLocaleDateString("en-US")}</span>
        </div>
      </div>
      <aside className="snapshotAside">
        <span className="snapshotAsideLabel">What does this page measure?</span>
        <strong>Dataset coverage, not the total size of Saudi industry.</strong>
        <p>The figures describe facilities and sources represented in the source data. They are not a complete government census of Saudi factories.</p>
      </aside>
    </section>

    <section className="snapshotMetrics shellWide" aria-label="Key metrics">
      <article><span>01</span><strong>{Number(metrics.records||0).toLocaleString("en-US")}</strong><p>industrial records</p></article>
      <article><span>02</span><strong>{Number(metrics.subsectors||0).toLocaleString("en-US")}</strong><p>subsectors</p></article>
      <article><span>03</span><strong>{Number(metrics.with_owner||0).toLocaleString("en-US")}</strong><p>records with ownership</p></article>
      <article><span>04</span><strong>{(Number(metrics.emissions_co2e_2025_t||0)/1_000_000).toLocaleString("en-US",{maximumFractionDigits:2})}M</strong><p>t CO₂e represented</p></article>
    </section>

    <section className="snapshotBreakdown shellWide">
      <div className="snapshotSectionHead">
        <span className="sectionKicker">COVERAGE MIX</span>
        <h2>Seven subsectors, unevenly represented.</h2>
        <p>We show source record counts as-is rather than converting them into unsupported market-share claims.</p>
      </div>

      <div className="snapshotBars">
        {breakdown.map((item,index)=>
          <article className="snapshotBarRow" key={item.code}>
            <span className="snapshotBarIndex">{String(index+1).padStart(2,"0")}</span>
            <div className="snapshotBarMain">
              <div className="snapshotBarLabel">
                <strong>{item.name_en}</strong>
                <span>{Number(item.records).toLocaleString("en-US")} records</span>
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
        <span className="sectionKicker">METHODOLOGY</span>
        <h2>What we know, and what we do not claim.</h2>
      </div>
      <p>{snapshot.methodology_en}</p>
    </section>

    <section className="snapshotCta shellWide">
      <div className="snapshotCtaCopy">
        <span className="sectionKicker">{product?"FULL ASSET AVAILABLE":"PRE-LAUNCH"}</span>
        <h2>{product?"Move from the snapshot to analysis-ready data.":"Get notified when the full dataset launches."}</h2>
        <p>{product
          ?"The full release includes XLSX, CSV, a data dictionary, source and rights register, release notes and buyer guide."
          :"We will send the launch notice and related updates for this asset only. No general newsletter or daily messages."}</p>
      </div>
      <div className="snapshotCtaAction">
        {product
          ? <Link className="snapshotProductLink" href={"/en/store/"+product.slug}>Explore the full asset <span>↗</span></Link>
          : <LaunchLeadForm language="en"/>}
      </div>
    </section>

    <PublicFooterEn signedIn={signedIn}/>
  </main>;
}
