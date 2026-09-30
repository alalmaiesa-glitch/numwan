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
        <Link href="/dashboard" className="brand">
          <span className="brandMark">ن</span>
          <span><strong>نُموان</strong><small>مساحة العمل V1</small></span>
        </Link>
        <nav className="sidebarNav">
          <Link href="/dashboard">لوحة التحكم</Link>
          <Link href="/vault">Vault الأفكار</Link>
          <Link href="/assets">الأصول</Link>
          <Link href="/deals">الصفقات</Link>
        </nav>
        <div className="sidebarFoot"><small>{email}</small></div>
      </aside>
      <section className="content">
        <header className="workspaceHeader">
          <span className="muted">نُموان V1</span>
          <LogoutButton />
        </header>
        <main className="workspaceMain">{children}</main>
      </section>
    </div>
  );
}
