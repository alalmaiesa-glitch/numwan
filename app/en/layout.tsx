import type { Metadata } from "next";

export const metadata:Metadata={
  title:"NUMWAN | Execution-Ready Business Assets",
  description:"Curated digital business assets ready for evaluation and use, from datasets and models to execution blueprints.",
  alternates:{
    canonical:"/en",
    languages:{
      "en":"/en",
      "ar-SA":"/"
    }
  },
  openGraph:{
    type:"website",
    siteName:"NUMWAN",
    title:"NUMWAN | Execution-Ready Business Assets",
    description:"Curated digital business assets ready for evaluation and use."
  }
};

export default function EnglishLayout({children}:{children:React.ReactNode}){
  return <div lang="en" dir="ltr">{children}</div>;
}
