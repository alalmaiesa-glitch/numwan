import type { Metadata } from "next";
export const metadata:Metadata={
  title:"NUMWAN | Curated Business Assets",
  description:"A curated business assets platform that develops opportunities from research and validation toward evaluation and execution."
};
export default function EnglishLayout({children}:{children:React.ReactNode}){return <div lang="en" dir="ltr">{children}</div>}
