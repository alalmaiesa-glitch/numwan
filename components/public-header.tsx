"use client";
import Link from "next/link";
import { useEffect,useState } from "react";

export default function PublicHeader({signedIn,light=false}:{signedIn:boolean;light?:boolean}) {
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{const f=()=>setScrolled(window.scrollY>56);f();window.addEventListener("scroll",f,{passive:true});return()=>window.removeEventListener("scroll",f)},[]);
  return <header className={`publicHeader ${light?"lightMode":""} ${scrolled?"isScrolled":""}`}>
    <div className="publicHeaderInner shellWide">
      <Link href="/" className="wordmark"><strong>نُموان</strong></Link>
      <nav className="publicLinks"><Link href="/store">المتجر</Link><Link href="/#method">كيف يعمل</Link><Link href="/about">عن نُموان</Link></nav>
      <div className="headerActions"><Link href="/en">الإنجليزية</Link><Link className="headerAction" href={signedIn?"/dashboard":"/login"}>{signedIn?"حسابي":"دخول"}</Link></div>
    </div>
  </header>
}
