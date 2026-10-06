import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  PRODUCT1_COLUMNS,
  buyerGuide,
  dataDictionaryCsv,
  releaseNotes
} from "@/lib/store/product1-export";

export const dynamic="force-dynamic";

type DataRow=Record<string,unknown>;

type Preview =
  | {kind:"table";columns:string[];rows:DataRow[];note:string}
  | {kind:"text";text:string;note:string}
  | {kind:"unavailable";message:string};

function cellText(value:unknown){
  if(value===null || value===undefined || value==="") return "—";
  if(Array.isArray(value)) return value.join("; ");
  if(typeof value==="object") return JSON.stringify(value);
  return String(value);
}

export default async function CommerceProductReviewPage({
  params,
  searchParams
}:{
  params:Promise<{productId:string}>,
  searchParams:Promise<{file?:string}>
}){
  const {productId}=await params;
  const query=await searchParams;
  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();
  const userId=typeof claims?.claims?.sub==="string" ? claims.claims.sub : "";

  if(!userId) notFound();

  const {data:product}=await supabase
    .from("store_products")
    .select("id,slug,sku,title_ar,summary_ar,preview_ar,product_type,status,price_sar,rights_status,delivery_status,checkout_status,product_version,source_attribution,updated_at,created_by")
    .eq("id",productId)
    .eq("created_by",userId)
    .maybeSingle();

  if(!product) notFound();

  const {data:files}=await supabase
    .from("store_product_files")
    .select("id,product_id,file_label,storage_path,mime_type,file_version,size_bytes,created_at")
    .eq("product_id",product.id)
    .eq("is_active",true)
    .order("created_at",{ascending:true});

  const activeFiles=files??[];
  const selectedFile=activeFiles.find(file=>file.id===query.file)??activeFiles[0]??null;
  let preview:Preview={kind:"unavailable",message:"لا يوجد ملف نشط لمعاينته."};

  if(selectedFile){
    if(selectedFile.storage_path.startsWith("generated://product1/")){
      const key=selectedFile.storage_path.replace("generated://product1/","");

      if(key==="master.csv" || key==="master.xlsx"){
        const {data:rows,error}=await supabase.rpc("get_numwan_product1_dataset_v1",{
          p_product_id:product.id
        });

        preview=error || !rows
          ? {kind:"unavailable",message:"تعذر تحميل بيانات الملف للمعاينة."}
          : {
              kind:"table",
              columns:PRODUCT1_COLUMNS.map(column=>column.key),
              rows:rows as DataRow[],
              note:"معاينة كاملة لنفس مجموعة البيانات التي يُنشأ منها ملف التسليم."
            };
      }else if(key==="source_rights_register.csv"){
        const {data:rows,error}=await supabase.rpc("get_numwan_product1_sources_v1",{
          p_product_id:product.id
        });

        const columns=[
          "source_key","name_en","publisher","source_url","source_type","license_name",
          "rights_status","commercial_use_allowed","redistribution_allowed",
          "attribution_required","attribution_text","usage_mode","fields_used","review_notes","reviewed_at"
        ];

        preview=error || !rows
          ? {kind:"unavailable",message:"تعذر تحميل سجل المصادر والحقوق."}
          : {
              kind:"table",
              columns,
              rows:rows as DataRow[],
              note:"المعاينة الحية لسجل المصادر والحقوق المرفق مع المنتج."
            };
      }else if(key==="data_dictionary.csv"){
        preview={
          kind:"text",
          text:dataDictionaryCsv(),
          note:"المحتوى الفعلي الذي يُولّد منه ملف Data Dictionary."
        };
      }else if(key==="release_notes.txt"){
        const {data:rows,error}=await supabase.rpc("get_numwan_product1_dataset_v1",{
          p_product_id:product.id
        });
        preview=error || !rows
          ? {kind:"unavailable",message:"تعذر إنشاء ملاحظات الإصدار للمعاينة."}
          : {
              kind:"text",
              text:releaseNotes(rows as DataRow[]),
              note:"ملاحظات الإصدار الفعلية المولدة من بيانات المنتج الحالية."
            };
      }else if(key==="buyer_guide.txt"){
        preview={
          kind:"text",
          text:buyerGuide(),
          note:"دليل المشتري الفعلي المرفق في حزمة التسليم."
        };
      }else{
        preview={kind:"unavailable",message:"نوع الملف المولد غير مدعوم في المعاينة بعد."};
      }
    }else{
      preview={
        kind:"unavailable",
        message:"هذا الملف محفوظ في التخزين الخاص. استخدم «تنزيل نسخة مراجعة» لفتحه محليًا."
      };
    }
  }

  return <>
    <div className="reviewTopbar">
      <Link className="button ghost small" href="/commerce">← العودة إلى التجارة</Link>
      <span>مراجعة داخلية · لا تظهر للمشتري</span>
    </div>

    <header className="workspacePageHead productReviewHead">
      <span className="sectionKicker">PRODUCT REVIEW</span>
      <h1>{product.title_ar}</h1>
      <p>{product.summary_ar}</p>
    </header>

    <section className="productReviewFacts">
      <div><span>الحالة</span><strong>{product.status}</strong></div>
      <div><span>السعر</span><strong>{Number(product.price_sar).toLocaleString("ar-SA")} ر.س</strong></div>
      <div><span>الإصدار</span><strong>{product.product_version}</strong></div>
      <div><span>ملفات التسليم</span><strong>{activeFiles.length}</strong></div>
    </section>

    <section className="productReviewCopy">
      <div>
        <span>وصف المعاينة التجاري</span>
        <p>{product.preview_ar||"لا يوجد نص معاينة تجاري."}</p>
      </div>
      <div>
        <span>إسناد المصدر</span>
        <p>{product.source_attribution||"—"}</p>
      </div>
    </section>

    <header className="workspacePageHead reviewSectionHead">
      <span className="sectionKicker">DELIVERY FILES</span>
      <h1>استعراض ملفات التسليم</h1>
      <p>اختر أي ملف لمراجعة محتواه الفعلي قبل إعادة نشر المنتج.</p>
    </header>

    {activeFiles.length ? <section className="reviewFileGrid">
      {activeFiles.map((file,index)=>{
        const active=file.id===selectedFile?.id;
        return <Link
          key={file.id}
          className={"reviewFileCard"+(active?" active":"")}
          href={"/commerce/products/"+product.id+"?file="+encodeURIComponent(file.id)}
        >
          <span>{String(index+1).padStart(2,"0")}</span>
          <strong>{file.file_label}</strong>
          <small>{file.mime_type||"ملف"} · v{file.file_version}</small>
        </Link>;
      })}
    </section> : <div className="editorialEmpty">
      <span>00</span><h2>لا توجد ملفات تسليم.</h2><p>لن يكون المنتج جاهزًا للمراجعة حتى تضاف ملفاته.</p>
    </div>}

    {selectedFile ? <section className="reviewPreview">
      <div className="reviewPreviewHead">
        <div>
          <span className="sectionKicker">FILE PREVIEW</span>
          <h2>{selectedFile.file_label}</h2>
          <p>{preview.kind==="unavailable"?preview.message:preview.note}</p>
        </div>
        <a className="button small" href={"/api/store/admin-download/"+encodeURIComponent(selectedFile.id)}>
          تنزيل نسخة مراجعة
        </a>
      </div>

      {preview.kind==="table" ? <div className="reviewTableWrap">
        <table className="table reviewTable">
          <thead>
            <tr>{preview.columns.map(column=><th key={column}>{column}</th>)}</tr>
          </thead>
          <tbody>
            {preview.rows.map((row,rowIndex)=><tr key={rowIndex}>
              {preview.columns.map(column=><td key={column}>{cellText(row[column])}</td>)}
            </tr>)}
          </tbody>
        </table>
      </div> : null}

      {preview.kind==="text" ? <pre className="reviewTextPreview" dir="ltr">{preview.text}</pre> : null}

      {preview.kind==="unavailable" ? <div className="editorialEmpty compactEmpty">
        <span>—</span><h2>المعاينة داخل الصفحة غير متاحة.</h2><p>{preview.message}</p>
      </div> : null}
    </section> : null}
  </>;
}
