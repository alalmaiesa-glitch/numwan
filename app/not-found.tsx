import Link from "next/link";
export default function NotFound(){return <main className="notFoundPage"><span>404</span><h1>العنصر غير موجود.</h1><p>قد لا يكون موجودًا، أو أن حسابك لا يملك صلاحية الوصول إليه.</p><Link className="editorialCta darkCta" href="/dashboard">العودة إلى لوحة التحكم ↗</Link></main>}
