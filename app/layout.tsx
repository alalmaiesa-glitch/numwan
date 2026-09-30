import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "نُموان | من الفرصة إلى أصل ذي قيمة",
  description: "منصة تطوير الأصول والفرص الاستثمارية.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
