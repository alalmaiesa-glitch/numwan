import Link from "next/link";
import PublicHeader from "@/components/public-header";
import { createClient } from "@/lib/supabase/server";

const methodology = [
  ["01", "اكتشاف", "رصد مشكلة أو فرصة تستحق الدراسة."],
  ["02", "بحث", "فهم السوق والعملاء والمنافسة."],
  ["03", "تحقق", "اختبار الفرضيات الرئيسية."],
  ["04", "تصميم", "بناء النموذج التجاري والمنتج."],
  ["05", "نمذجة", "صياغة الاقتصاديات ومسار التنفيذ."],
  ["06", "تجهيز", "تنظيم الحزمة والأدلة والحقوق."],
  ["07", "عرض", "تهيئة الأصل ليصبح قابلًا للتقييم."],
];

const assetContents = [
  "Market Research",
  "Business Model",
  "Product Blueprint",
  "Unit Economics",
  "Roadmap",
  "Evidence Register",
  "Rights Package",
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  return (
    <main className="publicSite">
      <section className="editorialHero">
        <PublicHeader signedIn={signedIn} />

        <div className="editorialHeroGrid shellWide">
          <div className="editorialHeroCopy">
            <span className="sectionKicker light">CURATED BUSINESS ASSETS</span>
            <h1>أفكارٌ بُنيت<br/>لتصبح مشاريع.</h1>
            <p>
              نُموان يطوّر فرص أعمال وأصولًا جاهزة للانتقال من الدراسة إلى التنفيذ.
            </p>
            <div className="heroActions">
              <a className="editorialCta lightCta" href="#assets">استكشف الأصول <span>↗</span></a>
              <a className="quietCta" href="#method">كيف يُبنى الأصل؟</a>
            </div>
          </div>

          <div className="assetHeroVisual" aria-label="تصور تحريري لبنية أصل نُموان">
            <div className="visualIndex">A / 01</div>
            <div className="visualTitle">
              <span>NUMWAN</span>
              <strong>BUSINESS<br/>ASSET</strong>
            </div>
            <div className="visualGrid">
              <span>RESEARCH</span>
              <span>MODEL</span>
              <span>PRODUCT</span>
              <span>ECONOMICS</span>
              <span>EVIDENCE</span>
              <span>RIGHTS</span>
            </div>
            <div className="visualRule" />
            <p>FROM POSSIBILITY<br/>TO EVALUABLE ASSET</p>
          </div>
        </div>
      </section>

      <section id="assets" className="portfolioSection shellWide">
        <div className="sectionHeading">
          <span className="sectionIndex">01</span>
          <div>
            <span className="sectionKicker">المحفظة</span>
            <h2>أصول مختارة</h2>
            <p>فرص دُرست وصُممت وطُوّرت لتبدأ من نقطة أبعد.</p>
          </div>
        </div>

        <div className="portfolioHolding">
          <div className="holdingVisual" aria-hidden="true">
            <span>CURATED</span>
            <b>01—</b>
            <i />
            <small>NUMWAN PORTFOLIO</small>
          </div>
          <div className="holdingCopy">
            <span className="microMeta">النشر العام</span>
            <h3>المحفظة العامة تُعرض فقط بعد اعتماد الأصل للنشر.</h3>
            <p>
              لا نستخدم بيانات تجريبية أو أصولًا مختلقة. عند اعتماد أول أصل للنشر سيظهر هنا
              بهذا الإيقاع التحريري، مع صورة وهوية مصغّرة وبياناته الأساسية.
            </p>
          </div>
        </div>
      </section>

      <section id="about" className="manifestoSection">
        <div className="shellWide manifestoGrid">
          <span className="sectionKicker">ما هو نُموان؟</span>
          <div>
            <h2>لا نعرض الفكرة<br/>قبل أن نبني ما حولها.</h2>
            <p>
              يبدأ كل أصل بالبحث والتحقق، ثم تصميم نموذج العمل والمنتج والاقتصاديات
              وخارطة التنفيذ، وصولًا إلى حزمة منظمة تساعد المشتري على تقييم الأصل
              والانتقال إلى المرحلة التالية.
            </p>
          </div>
        </div>
      </section>

      <section className="assetAnatomy shellWide">
        <div className="sectionHeading compact">
          <span className="sectionIndex">02</span>
          <div>
            <span className="sectionKicker">داخل كل أصل</span>
            <h2>حزمة مبنية للتقييم.</h2>
          </div>
        </div>

        <div className="anatomyList">
          {assetContents.map((item, index) => (
            <div className="anatomyRow" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
              <i>↗</i>
            </div>
          ))}
        </div>
      </section>

      <section id="method" className="methodSection">
        <div className="shellWide">
          <div className="methodIntro">
            <span className="sectionIndex inverted">03</span>
            <div>
              <span className="sectionKicker light">منهجية نُموان</span>
              <h2>كيف يتحول الاحتمال<br/>إلى أصل؟</h2>
            </div>
          </div>

          <div className="methodTrack">
            {methodology.map(([number, title, copy]) => (
              <article className="methodStep" key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="closingSection shellWide">
        <p className="sectionKicker">نُموان</p>
        <h2>المشروع القادم<br/>قد لا يبدأ من الصفر.</h2>
        <a className="editorialCta darkCta" href="#assets">استكشف الأصول <span>↗</span></a>
      </section>

      <footer className="publicFooter shellWide">
        <div className="footerBrand">
          <strong>نُموان</strong>
          <small>CURATED BUSINESS ASSETS</small>
        </div>
        <nav>
          <a href="#about">عن المنصة</a>
          <a href="#assets">الأصول</a>
          <span>الخصوصية</span>
          <span>الشروط</span>
          <span>التواصل</span>
        </nav>
        <Link href={signedIn ? "/dashboard" : "/login"}>{signedIn ? "حسابي" : "دخول"} ↗</Link>
      </footer>
    </main>
  );
}
