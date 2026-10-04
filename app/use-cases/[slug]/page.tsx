import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Product1UseCasePage from "@/components/product1-use-case-page";
import { getProduct1UseCase } from "@/lib/store/product1-use-cases";

export const dynamic="force-dynamic";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const useCase=getProduct1UseCase(slug);
  if(!useCase) return {title:"غير موجود | نُموان",robots:{index:false,follow:false}};

  return {
    title:useCase.ar.title+" | نُموان",
    description:useCase.ar.summary,
    alternates:{
      canonical:"/use-cases/"+slug,
      languages:{
        "ar-SA":"/use-cases/"+slug,
        "en":"/en/use-cases/"+slug
      }
    }
  };
}

export default async function ArabicUseCasePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const useCase=getProduct1UseCase(slug);
  if(!useCase) notFound();
  return <Product1UseCasePage useCase={useCase} language="ar"/>;
}
