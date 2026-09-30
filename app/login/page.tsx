import Link from "next/link";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="loginPage">
      <section className="loginEditorial">
        <Link href="/" className="loginWordmark">
          <strong>نُموان</strong>
          <small>NUMWAN</small>
        </Link>

        <div>
          <span className="sectionKicker light">PRIVATE WORKSPACE</span>
          <h2>من الفرضية<br/>إلى أصل قابل للتقييم.</h2>
        </div>

        <p>Curated Business Assets Platform</p>
      </section>

      <section className="loginPanel">
        <div className="loginPanelInner">
          <Link href="/" className="backLink">→ العودة إلى نُموان</Link>
          <span className="sectionKicker">مساحة العمل</span>
          <h1>تسجيل الدخول</h1>
          <p className="muted">استخدم بيانات حسابك للوصول إلى Vault وLab والأصول والصفقات.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
