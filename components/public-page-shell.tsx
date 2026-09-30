import type { ReactNode } from "react";
import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";
import { createClient } from "@/lib/supabase/server";
export default async function PublicPageShell({children}:{children:ReactNode}) {
  const supabase=await createClient(); const {data}=await supabase.auth.getClaims(); const signedIn=Boolean(data?.claims);
  return <main className="publicSite staticPublic"><PublicHeader signedIn={signedIn} light />{children}<PublicFooter signedIn={signedIn}/></main>
}
