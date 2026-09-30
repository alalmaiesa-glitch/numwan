import Link from "next/link";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="authPage">
      <section className="authCard">
        <Link href="/" className="brand">
          <span className="brandMark">ن</span>
          <span><strong>نُموان</strong><small>V1</small></span>
        </Link>
        <h1>تسجيل الدخول</h1>
        <p className="muted">ادخل إلى مساحة العمل الخاصة بك في نُموان.</p>
        <LoginForm />
      </section>
    </main>
  );
}
