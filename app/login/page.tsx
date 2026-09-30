import Link from "next/link";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="authPage">
      <div className="authShell">
        <aside className="authStory">
          <Link href="/" className="brand" aria-label="نُموان">
            <span className="brandMark">ن</span>
            <span className="brandCopy"><strong>نُموان</strong><small>NUMWAN</small></span>
          </Link>

          <div className="authStoryMain">
            <span>مساحة عمل لبناء الأصل</span>
            <h2>من الفكرة الأولى<br/>إلى قرار أوضح.</h2>
            <p>
              اجمع الفرضيات والأدلة والتجارب في مسار واحد، وحافظ على أثر
              القرار من لحظة اكتشاف الفرصة حتى نضج الأصل.
            </p>
          </div>

          <div className="authStoryFoot">
            <span>Vault</span>
            <span>Hypotheses</span>
            <span>Evidence</span>
            <span>Experiments</span>
          </div>
        </aside>

        <section className="authCard">
          <Link href="/" className="brand">
            <span className="brandMark">ن</span>
            <span className="brandCopy"><strong>نُموان</strong><small>NUMWAN</small></span>
          </Link>
          <Link href="/" className="backHome">→ العودة إلى الصفحة الرئيسية</Link>
          <h1>مرحبًا بعودتك</h1>
          <p className="muted">سجّل الدخول للوصول إلى مساحة العمل الخاصة بك.</p>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
