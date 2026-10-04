import { createClient } from "@/lib/supabase/server";

const rightsLabel:Record<string,string>={PENDING:"معلّق",REVIEW:"مراجعة",CLEARED:"مجاز",BLOCKED:"محظور"};
const deliveryLabel:Record<string,string>={NOT_READY:"غير جاهز",PREPARING:"تجهيز",READY:"جاهز",BLOCKED:"محظور"};
const checkoutLabel:Record<string,string>={NOT_READY:"غير جاهز",CONFIGURING:"إعداد",READY:"جاهز",BLOCKED:"محظور"};

export default async function CommercePage(){
  const supabase=await createClient();

  const [
    {data:products},
    {data:orders},
    {count:insightViews},
    {count:views},
    {count:samples},
    {count:leads},
    {data:targets}
  ]=await Promise.all([
    supabase.from("store_products")
      .select("id,sku,title_ar,status,price_sar,rights_status,delivery_status,checkout_status,updated_at")
      .order("updated_at",{ascending:false}),
    supabase.from("store_orders")
      .select("id,order_code,status,total_sar,created_at")
      .order("created_at",{ascending:false}),
    supabase.from("store_funnel_events")
      .select("*",{count:"exact",head:true})
      .eq("event_type","INSIGHT_VIEW"),
    supabase.from("store_funnel_events")
      .select("*",{count:"exact",head:true})
      .eq("event_type","PRODUCT_VIEW"),
    supabase.from("store_funnel_events")
      .select("*",{count:"exact",head:true})
      .eq("event_type","SAMPLE_DOWNLOAD"),
    supabase.from("store_leads")
      .select("*",{count:"exact",head:true})
      .eq("status","SUBSCRIBED"),
    supabase.from("store_target_accounts")
      .select("id,company_name,domain,country,segment,status,priority,rationale,source_url")
      .order("priority",{ascending:true})
      .order("company_name",{ascending:true})
      .limit(20)
  ]);

  const allOrders=orders??[];
  const paidOrders=allOrders.filter(order=>order.status==="PAID");
  const revenue=paidOrders.reduce((sum,order)=>sum+Number(order.total_sar||0),0);
  const published=(products??[]).filter(product=>product.status==="PUBLISHED").length;
  const ready=(products??[]).filter(product=>
    product.rights_status==="CLEARED" &&
    product.delivery_status==="READY" &&
    product.checkout_status==="READY"
  ).length;
  const conversion=views && views>0 ? (paidOrders.length/views)*100 : 0;
  const prelaunchConversion=insightViews && insightViews>0 ? ((leads??0)/insightViews)*100 : 0;

  const metrics=[
    ["01",insightViews??0,"مشاهدة الرؤية"],
    ["02",leads??0,"مهتمون بالإطلاق"],
    ["03",prelaunchConversion.toLocaleString("ar-SA",{maximumFractionDigits:1})+"%","تحويل رؤية ← اهتمام"],
    ["04",views??0,"مشاهدة منتج"],
    ["05",samples??0,"تحميل عينة"],
    ["06",allOrders.length,"طلبات بدأت"],
    ["07",paidOrders.length,"طلبات مدفوعة"],
    ["08",revenue.toLocaleString("ar-SA"),"إيراد مدفوع (ر.س)"],
    ["09",conversion.toLocaleString("ar-SA",{maximumFractionDigits:1})+"%","تحويل منتج ← شراء"],
    ["10",targets?.length??0,"حسابات مستهدفة أولية"],
    ["11",published,"منتجات منشورة"],
    ["12",ready,"جاهز للنشر"]
  ] as const;

  return <>
    <header className="workspacePageHead">
      <span className="sectionKicker">NUMWAN 20K</span>
      <h1>التجارة</h1>
      <p>المقياس هنا ليس اكتمال المنصة؛ بل الانتقال من المشاهدة إلى العينة ثم الطلب والدفع والإيراد.</p>
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
        <span className="sectionKicker">مسار الإيراد</span>
        <h2>نقيس التسرب<br/>قبل أن نزيد التسويق.</h2>
      </div>
      <div className="workspaceProcess">
        <div><span>01</span><strong>مشاهدة</strong><p>دخل الزائر إلى صفحة المنتج.</p></div>
        <div><span>02</span><strong>عينة</strong><p>حمّل عينة ليفحص جودة الأصل.</p></div>
        <div><span>03</span><strong>طلب</strong><p>بدأ مسار الشراء وأنشئ الطلب.</p></div>
        <div><span>04</span><strong>دفع</strong><p>تحول الطلب إلى إيراد واستحقاق تلقائي.</p></div>
      </div>
    </section>

    <header className="workspacePageHead">
      <span className="sectionKicker">الحسابات المستهدفة</span>
      <h1>أول شريحة بيع</h1>
      <p>جهات بحثية واستشارية ودخول سوق لها استخدام واضح للبيانات الصناعية. لا توجد بيانات شخصية أو قوائم بريد مشتراة.</p>
    </header>

    <section className="assetWorkspaceList">
      {targets?.length ? targets.map((target,index)=>
        <article className="assetWorkspaceRow" key={target.id}>
          <span className="assetWorkspaceIndex">{String(index+1).padStart(2,"0")}</span>
          <div className="assetWorkspaceMain">
            <small>{target.segment} · أولوية {target.priority}</small>
            <h2>{target.company_name}</h2>
            <p>{target.rationale}</p>
          </div>
          <div className="assetWorkspaceMeta">
            <div><span>الدولة</span><strong>{target.country||"—"}</strong></div>
            <div><span>الحالة</span><strong>{target.status}</strong></div>
          </div>
        </article>
      ) : <div className="editorialEmpty"><span>00</span><h2>لا توجد حسابات مستهدفة بعد.</h2><p>تُضاف فقط الجهات التي لها سبب شراء واضح ومصدر علني موثوق.</p></div>}
    </section>

    <header className="workspacePageHead">
      <span className="sectionKicker">بوابة النشر</span>
      <h1>خط الإنتاج</h1>
      <p>لا يُنشر أي أصل قبل اجتياز الحقوق والتسليم والدفع معًا.</p>
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
