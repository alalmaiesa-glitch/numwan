import Link from "next/link";
import LoginForm from "./login-form";
export default function LoginPage(){return <main className="loginPage">
 <section className="loginEditorial"><Link href="/" className="loginWordmark"><strong>نُموان</strong></Link><div><span className="sectionKicker light">مساحة عمل خاصة</span><h2>من الفرضية<br/>إلى أصل قابل للتقييم.</h2></div><p>منصة أصول أعمال منتقاة ومطوّرة</p></section>
 <section className="loginPanel"><div className="loginPanelInner"><Link href="/" className="backLink">→ العودة إلى نُموان</Link><span className="sectionKicker">مساحة العمل</span><h1>تسجيل الدخول</h1><p className="muted">استخدم بيانات حسابك للوصول إلى خزنة الفرص والمختبر والأصول والصفقات.</p><LoginForm/></div></section>
 </main>}
