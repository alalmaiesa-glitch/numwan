import Link from "next/link";
export default function PublicFooter({signedIn}:{signedIn:boolean}) {
  return <footer className="publicFooter shellWide">
    <div className="footerBrand"><strong>نُموان</strong><small>CURATED BUSINESS ASSETS</small></div>
    <nav><Link href="/about">عن المنصة</Link><Link href="/#assets">الأصول</Link><Link href="/privacy">الخصوصية</Link><Link href="/terms">الشروط</Link><Link href="/contact">التواصل</Link></nav>
    <Link href={signedIn?"/dashboard":"/login"}>{signedIn?"حسابي":"دخول"} ↗</Link>
  </footer>
}
