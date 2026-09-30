import type { ReactNode } from "react";
import PublicHeaderEn from "@/components/public-header-en";
import PublicFooterEn from "@/components/public-footer-en";
import { createClient } from "@/lib/supabase/server";
export default async function PublicPageShellEn({children}:{children:ReactNode}) {
 const supabase=await createClient(); const {data}=await supabase.auth.getClaims(); const signedIn=Boolean(data?.claims);
 return <main className="publicSite staticPublic englishSite" lang="en" dir="ltr"><PublicHeaderEn signedIn={signedIn} light/>{children}<PublicFooterEn signedIn={signedIn}/></main>
}
