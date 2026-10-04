import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Product1UseCasePage from "@/components/product1-use-case-page";
import { getProduct1UseCase } from "@/lib/store/product1-use-cases";

export const dynamic="force-dynamic";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const useCase=getProduct1UseCase(slug);
  if(!useCase) return {title:"Not found | NUMWAN",robots:{index:false,follow:false}};

  return {
    title:useCase.en.title+" | NUMWAN",
    description:useCase.en.summary,
    alternates:{
      canonical:"/en/use-cases/"+slug,
      languages:{
        "en":"/en/use-cases/"+slug,
        "ar-SA":"/use-cases/"+slug
      }
    }
  };
}

export default async function EnglishUseCasePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const useCase=getProduct1UseCase(slug);
  if(!useCase) notFound();
  return <Product1UseCasePage useCase={useCase} language="en"/>;
}
