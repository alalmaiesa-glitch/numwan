import type { Metadata } from "next";
import { Alexandria, IBM_Plex_Sans_Arabic, Manrope } from "next/font/google";
import "./globals.css";

const arabicBody = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic-body",
  display: "swap",
});

const arabicDisplay = Alexandria({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-arabic-display",
  display: "swap",
});

const latin = Manrope({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "نُموان | الفرص والأصول في قطاع الأعمال",
  description: "نُموان يطوّر فرصًا وأصولًا في قطاع الأعمال، جاهزة للانتقال من الفكرة والدراسة إلى التنفيذ الفعلي.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${arabicBody.variable} ${arabicDisplay.variable} ${latin.variable}`}>
        {children}
      </body>
    </html>
  );
}
