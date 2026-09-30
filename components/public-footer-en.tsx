import Link from "next/link";
export default function PublicFooterEn({signedIn}:{signedIn:boolean}) {
  return <footer className="publicFooter shellWide" dir="ltr">
    <div className="footerBrand"><strong>NUMWAN</strong><small>CURATED BUSINESS ASSETS PLATFORM</small></div>
    <nav><Link href="/en/about">About</Link><Link href="/en#assets">Assets</Link><Link href="/en/privacy">Privacy</Link><Link href="/en/terms">Terms</Link><Link href="/en/contact">Contact</Link></nav>
    <div className="footerActions"><Link href="/">Arabic</Link><Link href={signedIn?"/dashboard":"/login"}>{signedIn?"Account":"Login"} ↗</Link></div>
    <div className="footerEimdadat">
      <span>Numwan is a project of </span>
      <a href="http://eimdadat.com/" target="_blank" rel="noopener noreferrer">Eimdadat for Business ↗</a>
    </div>
  </footer>
}
