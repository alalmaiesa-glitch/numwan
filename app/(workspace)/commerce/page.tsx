import { createClient } from "@/lib/supabase/server";

const rightsLabel:Record<string,string>={PENDING:"معلّق",REVIEW:"مراجعة",CLEARED:"مجاز",BLOCKED:"محظور"};
const deliveryLabel:Record<string,string>={NOT_READY:"غير جاهز",PREPARING:"تجهيز",READY:"جاهز",BLOCKED:"محظور"};
const checkoutLabel:Record<string,string>={NOT_READY:"غير جاهز",CONFIGURING:"إعداد",READY:"جاهز",BLOCKED:"محظور"};

export default async function CommercePage(){
  const supabase=await createClient();
  const [{data:products},{data:orders}]=await Promise.all([
    supabase.from("store_products")
      .select("id,sku,title_ar,status,price_sar,rights_status,delivery_status,checkout_status,updated_at")
      .order("updated_at",{ascending:false}),
    supabase.from("store_orders")
      .select("id,order_code,status,total_sar,created_at")
      .order("created_at",{ascending:false})
      .limit(20)
  ]);

  const paidOrders=(orders??[]).filter(order=>order.status==="PAID");
  const revenue=paidOrders.reduce((sum,order)=>sum+Number(order.total_sar||0),0);
  const published=(products??[]).filter(product=>product.status==="PUBLISHED").length;
  const ready=(products??[]).filter(product=>
    product.rights_status==="CLEARED" &&
    product.delivery_status==="READY" &&
    product.checkout_status==="READY"
  ).length;

  const metrics=[
    ["01",products?.length??0,"منتجات في خط نُموان"],
    ["02",published,"منتجات منشورة"],
    ["03",paidOrders.length,"طلبات مدفوعة"],
    ["04",revenue.toLocaleString("ar-SA"),"إيراد مدفوع (ر.س)"],
    ["05",ready,"جاهز للنشر"]
  ] as const;

  return <>
    <header className="workspacePageHead">
      <span className="sectionKicker">NUMWAN 20K</span>
      <h1>التجارة</h1>
      <p>لوحة الجاهزية والإيراد. لا يُنشر أي منتج قبل اجتياز بوابات الحقوق والتسليم والدفع.</p>
    </header>

    <section className="metricsGrid">
      {metrics.map(([index,value,label])=>
        <article className="metricRow" key={index}>
          <span>{index}</span><strong>{value}</strong><p>{label}</p>
        </article>
      )}
    </section>

    <section className="workspaceEditorial">
      <div>
        <span className="sectionKicker">بوابة النشر</span>
        <h2>ثلاثة أضواء خضراء<br/>قبل أول ريال.</h2>
      </div>
      <div className="workspaceProcess">
        <div><span>01</span><strong>الحقوق</strong><p>يجب أن تكون CLEARED قبل النشر.</p></div>
        <div><span>02</span><strong>التسليم</strong><p>الملف التجاري النهائي جاهز وآمن.</p></div>
        <div><span>03</span><strong>الدفع</strong><p>بوابة الدفع وWebhook يعملان فعليًا.</p></div>
        <div><span>04</span><strong>النشر</strong><p>عندها فقط يصبح المنتج ظاهرًا للبيع.</p></div>
      </div>
    </section>

    <header className="workspacePageHead">
      <span className="sectionKicker">المنتجات</span>
      <h1>خط الإنتاج</h1>
      <p>الحالة التجارية الحالية لكل أصل رقمي.</p>
    </header>

    <section className="assetWorkspaceList">
      {products?.length ? products.map((product,index)=>
        <article className="assetWorkspaceRow" key={product.id}>
          <span className="assetWorkspaceIndex">{String(index+1).padStart(2,"0")}</span>
          <div className="assetWorkspaceMain">
            <small>{product.sku||"منتج"}</small>
            <h2>{product.title_ar}</h2>
            <p>
              الحقوق: {rightsLabel[product.rights_status]??product.rights_status}
              {" · "}التسليم: {deliveryLabel[product.delivery_status]??product.delivery_status}
              {" · "}الدفع: {checkoutLabel[product.checkout_status]??product.checkout_status}
            </p>
          </div>
          <div className="assetWorkspaceMeta">
            <div><span>الحالة</span><strong>{product.status}</strong></div>
            <div><span>السعر</span><strong>{Number(product.price_sar).toLocaleString("ar-SA")} ر.س</strong></div>
          </div>
        </article>
      ) : <div className="editorialEmpty"><span>00</span><h2>لا توجد منتجات.</h2><p>يبدأ خط الإنتاج عند إنشاء أول أصل تجاري.</p></div>}
    </section>
  </>;
}
