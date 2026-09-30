import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";

export default async function WorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) redirect("/login");

  const email = typeof data.claims.email === "string" ? data.claims.email : "";

  return (
    <div className="workspace">
      <aside className="sidebar">
        <Link href="/dashboard" className="workspaceWordmark">
          <strong>نُموان</strong>
          <small>NUMWAN / V1</small>
        </Link>

        <nav className="sidebarNav">
          <Link href="/dashboard"><span>لوحة التحكم</span><small>01</small></Link>
          <Link href="/vault"><span>Vault الأفكار</span><small>02</small></Link>
          <Link href="/assets"><span>الأصول</span><small>03</small></Link>
          <Link href="/deals"><span>الصفقات</span><small>04</small></Link>
        </nav>

        <div className="sidebarFoot">
          <span>الحساب</span>
          <small>{email}</small>
        </div>
      </aside>

      <section className="content">
        <header className="workspaceHeader">
          <div>
            <small>CURATED BUSINESS ASSETS PLATFORM</small>
            <strong>مساحة العمل</strong>
          </div>
          <LogoutButton />
        </header>
        <main className="workspaceMain">{children}</main>
      </section>
    </div>
  );
}
