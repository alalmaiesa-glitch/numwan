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
          <span className="brandCopy"><strong>نُموان</strong><small>NUMWAN</small></span>
        </Link>

        <span className="sidebarLabel">WORKSPACE</span>

        <nav className="sidebarNav" aria-label="مساحة العمل">
          <Link href="/dashboard"><span>لوحة التحكم</span><span className="navCode">01</span></Link>
          <Link href="/vault"><span>Vault الأفكار</span><span className="navCode">02</span></Link>
          <Link href="/assets"><span>الأصول</span><span className="navCode">03</span></Link>
          <Link href="/deals"><span>الصفقات</span><span className="navCode">04</span></Link>
        </nav>

        <div className="sidebarFoot">
          <span className="sidebarFootLabel">الحساب الحالي</span>
          <small>{email}</small>
        </div>
      </aside>

      <section className="content">
        <header className="workspaceHeader">
          <div className="workspaceHeaderTitle">
            <strong>نظام تطوير الأصول</strong>
            <small>مساحة العمل · V1</small>
          </div>
          <LogoutButton />
        </header>
        <main className="workspaceMain">{children}</main>
      </section>
    </div>
  );
}
