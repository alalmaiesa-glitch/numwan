import "../../store/store.module.css";
import { redirect } from "next/navigation";
import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";
import { createClient } from "@/lib/supabase/server";
import { downloadStoreFile } from "@/app/actions/store-download";

export const dynamic="force-dynamic";

export default async function PurchasesPage(){
  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();
  const signedIn=Boolean(claims?.claims);

  if(!signedIn){
    redirect("/login?next="+encodeURIComponent("/account/purchases"));
  }

  const {data:entitlements}=await supabase
    .from("store_entitlements")
    .select("id,product_id,status,granted_at,expires_at,order_id")
    .eq("status","ACTIVE")
    .order("granted_at",{ascending:false});

  const productIds=[...new Set((entitlements??[]).map(item=>item.product_id))];

  const [{data:products},{data:files}]=productIds.length
    ? await Promise.all([
        supabase.from("store_products")
          .select("id,slug,title_ar,summary_ar,product_version")
          .in("id",productIds),
        supabase.from("store_product_files")
          .select("id,product_id,file_label,file_version,mime_type,size_bytes")
          .in("product_id",productIds)
          .eq("is_active",true)
      ])
    : [{data:[]},{data:[]}];

  const productMap=new Map((products??[]).map(product=>[product.id,product]));
  const filesByProduct=new Map<string,typeof files>();

  for(const file of files??[]){
    const list=filesByProduct.get(file.product_id)??[];
    list.push(file);
    filesByProduct.set(file.product_id,list);
  }

  return <main className="publicSite storePage">
    <PublicHeader signedIn={true} light/>
    <section className="storeHero shellWide">
      <span className="sectionKicker">حسابي</span>
      <h1>مشترياتي</h1>
      <p>الأصول الرقمية التي تملك حق الوصول إليها. روابط التحميل مؤقتة وتصدر عند الطلب.</p>
    </section>

    <section className="storeCatalog shellWide">
      {entitlements?.length
        ? <div className="storeGrid">{entitlements.map(entitlement=>{
            const product=productMap.get(entitlement.product_id);
            const productFiles=filesByProduct.get(entitlement.product_id)??[];
            if(!product) return null;

            return <article className="storeCard" key={entitlement.id}>
              <div className="storeCardTop"><span>ترخيص نشط</span><b>V{product.product_version}</b></div>
              <h2>{product.title_ar}</h2>
              <p>{product.summary_ar}</p>
              <div className="purchaseFiles">
                {productFiles.length ? productFiles.map(file=>
                  <form action={downloadStoreFile.bind(null,entitlement.id,file.id)} key={file.id}>
                    <button className="purchaseFileButton" type="submit">
                      <span>{file.file_label}</span>
                      <small>الإصدار {file.file_version}</small>
                    </button>
                  </form>
                ) : <span className="muted">لا توجد ملفات نشطة لهذا الإصدار.</span>}
              </div>
            </article>;
          })}</div>
        : <div className="storeEmpty">
            <span>00</span>
            <div>
              <h2>لا توجد مشتريات حتى الآن.</h2>
              <p>بعد اكتمال أي عملية شراء مدفوعة سيظهر الأصل هنا تلقائيًا دون تسليم يدوي.</p>
            </div>
          </div>}
    </section>

    <PublicFooter signedIn={true}/>
  </main>;
}
