import Link from "next/link";

export default function NotFound() {
  return (
    <main className="authPage">
      <section className="authCard">
        <span className="eyebrow">404</span>
        <h1>العنصر غير موجود</h1>
        <p className="muted">قد لا يكون موجودًا أو لا تملك صلاحية الوصول إليه.</p>
        <Link className="button" href="/dashboard">العودة إلى لوحة التحكم</Link>
      </section>
    </main>
  );
}
