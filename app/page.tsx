import Link from "next/link";

const stages = [
  ["01", "اكتشاف", "التقاط الفرصة وصياغتها بوضوح"],
  ["02", "بحث", "فهم السوق والسياق والبدائل"],
  ["03", "اختبار", "فرضيات وأدلة وتجارب قابلة للتتبع"],
  ["04", "تطوير", "تقليل عدم اليقين وبناء الأصل"],
];

export default function HomePage() {
  return (
    <main className="marketing">
      <header className="topbar shell">
        <Link href="/" className="brand" aria-label="نُموان">
          <span className="brandMark">ن</span>
          <span className="brandCopy">
            <strong>نُموان</strong>
            <small>NUMWAN</small>
          </span>
        </Link>

        <nav className="publicNav" aria-label="التنقل الرئيسي">
          <a href="#method">المنهجية</a>
          <a href="#system">النظام</a>
          <a href="#about">عن نُموان</a>
          <Link className="button ghost" href="/login">تسجيل الدخول</Link>
        </nav>
      </header>

      <section className="hero shell">
        <div className="heroCopy">
          <span className="eyebrow">فرص اليوم · أصول الغد</span>
          <h1>نبني وضوحًا<br/><em>قبل أن نبني الأصل.</em></h1>
          <p className="lead">
            نُموان مساحة عمل لتحويل الفرص الواعدة إلى أصول أكثر نضجًا؛
            من الفكرة الأولى إلى فرضيات موثّقة، أدلة قابلة للتتبع وتجارب تقلّل عدم اليقين.
          </p>
          <div className="actions">
            <Link className="button primaryCta" href="/login">الدخول إلى نُموان <span>←</span></Link>
            <a className="textLink" href="#method">استكشف المنهجية</a>
          </div>
          <div className="heroMeta">
            <div><span>01</span><p>فكرة واضحة</p></div>
            <div><span>02</span><p>دليل موثّق</p></div>
            <div><span>03</span><p>قرار أكثر نضجًا</p></div>
          </div>
        </div>

        <div className="heroVisual" aria-label="نظام تطوير الفرصة">
          <div className="visualTop">
            <div>
              <span className="microLabel">NUMWAN / OPPORTUNITY LAB</span>
              <strong>مسار بناء الأصل</strong>
            </div>
            <span className="statusDot">نشط</span>
          </div>

          <div className="opportunityCard">
            <span className="opportunityIndex">فرصة 01</span>
            <h2>من الفكرة إلى قرار قابل للدفاع عنه</h2>
            <p>كل خطوة مرتبطة بما يدعمها من فرضيات وأدلة وتجارب.</p>
          </div>

          <div className="visualFlow">
            <div className="flowItem active"><span>01</span><div><b>Vault</b><small>التقاط الفرصة</small></div><i>✓</i></div>
            <div className="flowItem active"><span>02</span><div><b>Hypotheses</b><small>صياغة الافتراضات</small></div><i>✓</i></div>
            <div className="flowItem current"><span>03</span><div><b>Evidence</b><small>بناء سجل الأدلة</small></div><i>•••</i></div>
            <div className="flowItem"><span>04</span><div><b>Experiments</b><small>الاختبار والتحقق</small></div><i>—</i></div>
          </div>

          <div className="visualFoot">
            <span>فرضية</span><b>→</b><span>دليل</span><b>→</b><span>تجربة</span><b>→</b><span>قرار</span>
          </div>
        </div>
      </section>

      <section className="signalBar shell" aria-label="مبادئ نُموان">
        <div><b>01</b><span>وضوح قبل التنفيذ</span></div>
        <div><b>02</b><span>دليل قبل الحكم</span></div>
        <div><b>03</b><span>تتبّع قبل القرار</span></div>
        <div><b>04</b><span>أصل قبل العرض</span></div>
      </section>

      <section id="method" className="section shell methodSection">
        <div className="sectionIntro">
          <span className="eyebrow">منهجية نُموان</span>
          <h2>مسار منضبط لتقليل<br/>عدم اليقين.</h2>
          <p>لا تبدأ الرحلة ببناء الحل، بل بفهم الفرصة واختبار ما يجب أن يكون صحيحًا قبل الانتقال إلى الأصل.</p>
        </div>
        <div className="methodGrid">
          {stages.map(([number, title, copy]) => (
            <article className="methodCard" key={number}>
              <span className="methodNumber">{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="system" className="section darkSection">
        <div className="shell systemGrid">
          <div className="systemIntro">
            <span className="eyebrow light">نظام واحد · أثر كامل</span>
            <h2>كل ما يهم القرار<br/>في مسار واحد.</h2>
            <p>
              يحفظ نُموان العلاقة بين الفكرة، وما نفترضه عنها، وما يثبت أو ينفي تلك الفرضيات،
              ثم ينقل الأصل إلى مساره التشغيلي ضمن صلاحيات واضحة.
            </p>
          </div>

          <div className="systemCards">
            <article>
              <span>VAULT</span>
              <h3>خزنة الفرص</h3>
              <p>مساحة منظمة لالتقاط الفكرة وسياقها قبل التوسع في بنائها.</p>
            </article>
            <article>
              <span>LAB</span>
              <h3>مختبر التحقق</h3>
              <p>فرضيات، أدلة وتجارب مرتبطة ببعضها بدل ملاحظات مبعثرة.</p>
            </article>
            <article>
              <span>ASSETS</span>
              <h3>الأصول</h3>
              <p>انتقال من فكرة قيد الاختبار إلى أصل ذي سجل واضح ومسار محدد.</p>
            </article>
            <article>
              <span>DATA ROOM</span>
              <h3>غرفة البيانات</h3>
              <p>وصول خاص للمستندات وفق الصلاحيات الممنوحة ومسار تدقيق قابل للتتبع.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="about" className="section shell finalSection">
        <div className="finalCopy">
          <span className="eyebrow">نُموان</span>
          <h2>ليس مستودع أفكار.<br/>بل نظام لبناء قيمة.</h2>
        </div>
        <div className="finalAction">
          <p>
            عندما تكون الفكرة مرتبطة بفرضياتها وأدلتها وتجاربها، يصبح الانتقال
            إلى القرار والتنفيذ أكثر وضوحًا وأقل اعتمادًا على الانطباع.
          </p>
          <Link className="button primaryCta" href="/login">ابدأ من مساحة العمل <span>←</span></Link>
        </div>
      </section>

      <footer className="footer shell">
        <div className="brand mini">
          <span className="brandMark">ن</span>
          <span className="brandCopy"><strong>نُموان</strong><small>NUMWAN</small></span>
        </div>
        <p>من الفرصة إلى أصل ذي قيمة.</p>
      </footer>
    </main>
  );
}