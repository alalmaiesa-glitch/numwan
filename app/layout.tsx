import type { Metadata } from "next";
import { Alexandria, IBM_Plex_Sans_Arabic, Manrope } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";

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
  metadataBase: new URL(getSiteUrl()),
  title: "نُموان | أصول أعمال جاهزة للتنفيذ",
  description: "أصول أعمال رقمية منتقاة وجاهزة للاستخدام: بيانات، نماذج، تقارير ومخططات تنفيذية بمعاينة وسعر وترخيص واضح.",
  alternates:{
    canonical:"/",
    languages:{
      "ar-SA":"/",
      "en":"/en"
    }
  },
  openGraph:{
    type:"website",
    siteName:"نُموان",
    title:"نُموان | أصول أعمال جاهزة للتنفيذ",
    description:"أصول أعمال رقمية منتقاة وجاهزة للاستخدام، من البيانات والنماذج إلى مخططات التنفيذ."
  }
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
