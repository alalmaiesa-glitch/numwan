"use client";
import Link from "next/link";
import { useEffect,useState } from "react";

export default function PublicHeaderEn({signedIn,light=false}:{signedIn:boolean;light?:boolean}) {
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{const f=()=>setScrolled(window.scrollY>56);f();window.addEventListener("scroll",f,{passive:true});return()=>window.removeEventListener("scroll",f)},[]);
  return <header className={`publicHeader ${light?"lightMode":""} ${scrolled?"isScrolled":""}`} dir="ltr">
    <div className="publicHeaderInner shellWide">
      <Link href="/en" className="wordmark"><strong>NUMWAN</strong></Link>
      <nav className="publicLinks"><Link href="/en/store">Store</Link><Link href="/en#method">How it works</Link><Link href="/en/about">About</Link></nav>
      <div className="headerActions"><Link href="/">Arabic</Link><Link className="headerAction" href={signedIn?"/dashboard":"/login"}>{signedIn?"Account":"Login"}</Link></div>
    </div>
  </header>
}
