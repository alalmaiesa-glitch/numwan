"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PublicHeader({ signedIn }: { signedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 56);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`publicHeader ${scrolled ? "isScrolled" : ""}`}>
      <div className="publicHeaderInner shellWide">
        <Link href="/" className="wordmark" aria-label="نُموان">
          <strong>نُموان</strong>
          <small>NUMWAN</small>
        </Link>

        <nav className="publicLinks" aria-label="التنقل الرئيسي">
          <a href="#assets">الأصول</a>
          <a href="#method">كيف يعمل</a>
          <a href="#about">عن نُموان</a>
        </nav>

        <Link className="headerAction" href={signedIn ? "/dashboard" : "/login"}>
          {signedIn ? "حسابي" : "دخول"}
        </Link>
      </div>
    </header>
  );
}
