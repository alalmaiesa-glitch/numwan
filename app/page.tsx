import Link from "next/link";

export default function HomePage() {
  return (
    <main className="marketing">
      <header className="topbar shell">
        <Link href="/" className="brand" aria-label="نُموان">
          <span className="brandMark">ن</span>
          <span>
            <strong>نُموان</strong>
            <small>من الفرصة إلى أصل ذي قيمة</small>
          </span>
        </Link>
        <nav className="publicNav" aria-label="التنقل الرئيسي">
          <a href="#method">المنهجية</a>
          <a href="#about">عن نُموان</a>
          <Link className="button ghost" href="/login">تسجيل الدخول</Link>
        </nav>
      </header>

      <section className="hero shell">
        <div>
          <span className="eyebrow">فرص اليوم.. أصول الغد</span>
          <h1>نحوّل الفرص إلى أصول ذات قيمة.</h1>
          <p className="lead">
            نكتشف الفرص الواعدة، نبحثها ونختبرها ونطوّرها إلى أصول أكثر نضجًا
            لتكون نقطة انطلاق أقرب إلى القرار والتنفيذ.
          </p>
          <div className="actions">
            <Link className="button" href="/login">الدخول إلى نُموان</Link>
            <a className="button ghost" href="#method">كيف نعمل؟</a>
          </div>
        </div>
        <div className="heroPanel" aria-label="مسار تطوير الأصل">
          <span>01</span><strong>اكتشاف</strong>
          <span>02</span><strong>بحث</strong>
          <span>03</span><strong>اختبار</strong>
          <span>04</span><strong>تطوير</strong>
          <span>05</span><strong>أصل</strong>
        </div>
      </section>

      <section id="method" className="section shell">
        <span className="eyebrow">منهجية نُموان</span>
        <h2>من الفرصة إلى الأصل</h2>
        <div className="cards four">
          <article className="card"><b>01</b><h3>اكتشاف الفرصة</h3><p>التقاط الحاجة أو فجوة السوق وصياغة الفكرة.</p></article>
          <article className="card"><b>02</b><h3>الدراسة والتقييم</h3><p>تحليل السوق والجدوى والمخاطر والبدائل.</p></article>
          <article className="card"><b>03</b><h3>التحقق والتطوير</h3><p>فرضيات وأدلة وتجارب تقلل عدم اليقين.</p></article>
          <article className="card"><b>04</b><h3>أصل ذو قيمة</h3><p>حزمة أوضح قابلة للبيع أو الترخيص أو التنفيذ.</p></article>
        </div>
      </section>

      <section id="about" className="section soft">
        <div className="shell narrow">
          <span className="eyebrow">عن نُموان</span>
          <h2>نظام عمل يحفظ أثر القرار والدليل.</h2>
          <p className="lead small">
            V1 يربط الفكرة بالفرضيات والأدلة والتجارب، ثم يدير الأصل وغرفة البيانات
            ومسار الصفقة ضمن صلاحيات واضحة وسجل تدقيق.
          </p>
        </div>
      </section>
    </main>
  );
}
