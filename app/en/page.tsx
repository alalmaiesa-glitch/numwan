import PublicHeaderEn from "@/components/public-header-en";
import PublicFooterEn from "@/components/public-footer-en";
import { createClient } from "@/lib/supabase/server";

const methodology=[
 ["01","Discover","Identify a problem or opportunity worth exploring."],
 ["02","Research","Understand the market, customers, and competition."],
 ["03","Validate","Test the core assumptions."],
 ["04","Design","Shape the business model and product."],
 ["05","Model","Build the economics and execution path."],
 ["06","Prepare","Organize the package, evidence, and rights."],
 ["07","Present","Prepare the asset for evaluation."]
];
const assetContents=["Market Research","Business Model","Product Blueprint","Unit Economics","Roadmap","Evidence Register","Rights Package"];

export default async function EnglishHomePage(){
 const supabase=await createClient(); const {data}=await supabase.auth.getClaims(); const signedIn=Boolean(data?.claims);
 return <main className="publicSite englishSite" lang="en" dir="ltr">
  <section className="editorialHero"><PublicHeaderEn signedIn={signedIn}/>
   <div className="editorialHeroGrid shellWide">
    <div className="editorialHeroCopy"><span className="sectionKicker light">CURATED BUSINESS ASSETS PLATFORM</span><h1>Ideas built<br/>to become ventures.</h1><p>Numwan develops business opportunities and assets ready to move from research toward execution.</p><div className="heroActions"><a className="editorialCta lightCta" href="#assets">Explore assets <span>↗</span></a><a className="quietCta" href="#method">How is an asset built?</a></div></div>
    <div className="assetHeroVisual"><div className="visualIndex">ASSET / 01</div><div className="visualTitle"><span>NUMWAN</span><strong>BUSINESS<br/>ASSET</strong></div><div className="visualGrid"><span>RESEARCH</span><span>MODEL</span><span>PRODUCT</span><span>ECONOMICS</span><span>EVIDENCE</span><span>RIGHTS</span></div><div className="visualRule"/><p>FROM POSSIBILITY<br/>TO EVALUABLE ASSET</p></div>
   </div>
  </section>
  <section id="assets" className="portfolioSection shellWide"><div className="sectionHeading"><span className="sectionIndex">01</span><div><span className="sectionKicker">PORTFOLIO</span><h2>Selected assets</h2><p>Opportunities researched, designed, and developed to start from a more advanced point.</p></div></div><div className="portfolioHolding"><div className="holdingVisual"><span>CURATED</span><b>01—</b><i/><small>NUMWAN PORTFOLIO</small></div><div className="holdingCopy"><span className="microMeta">PUBLIC RELEASE</span><h3>The public portfolio appears only after an asset is approved for publication.</h3><p>We do not use invented or placeholder assets. Once the first asset is approved for public release, it will appear here with its editorial identity and core information.</p></div></div></section>
  <section id="about" className="manifestoSection"><div className="shellWide manifestoGrid"><span className="sectionKicker">WHAT IS NUMWAN?</span><div><h2>We do not present an idea<br/>before building around it.</h2><p>Each asset begins with research and validation, followed by business model, product, economics, execution roadmap, evidence, and an organized package that supports evaluation.</p></div></div></section>
  <section className="assetAnatomy shellWide"><div className="sectionHeading compact"><span className="sectionIndex">02</span><div><span className="sectionKicker">INSIDE EACH ASSET</span><h2>A package built for evaluation.</h2></div></div><div className="anatomyList">{assetContents.map((item,index)=><div className="anatomyRow" key={item}><span>{String(index+1).padStart(2,"0")}</span><strong>{item}</strong><i>↗</i></div>)}</div></section>
  <section id="method" className="methodSection"><div className="shellWide"><div className="methodIntro"><span className="sectionIndex inverted">03</span><div><span className="sectionKicker light">NUMWAN METHOD</span><h2>How does possibility<br/>become an asset?</h2></div></div><div className="methodTrack">{methodology.map(([number,title,copy])=><article className="methodStep" key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>
  <section className="closingSection shellWide"><p className="sectionKicker">NUMWAN</p><h2>The next venture<br/>may not start from zero.</h2><a className="editorialCta darkCta" href="#assets">Explore assets <span>↗</span></a></section>
  <PublicFooterEn signedIn={signedIn}/>
 </main>
}
