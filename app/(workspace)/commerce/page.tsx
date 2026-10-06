import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const rightsLabel:Record<string,string>={PENDING:"معلّق",REVIEW:"مراجعة",CLEARED:"مجاز",BLOCKED:"محظور"};
const deliveryLabel:Record<string,string>={NOT_READY:"غير جاهز",PREPARING:"تجهيز",READY:"جاهز",BLOCKED:"محظور"};
const checkoutLabel:Record<string,string>={NOT_READY:"غير جاهز",CONFIGURING:"إعداد",READY:"جاهز",BLOCKED:"محظور"};

export default async function CommercePage(){
  const supabase=await createClient();

  const [
    {data:products},
    {data:productFiles},
    {data:orders},
    {count:insightViews},
    {data:landingEvents},
    {count:views},
    {count:samples},
    {count:leads},
    {data:targets},
    {data:campaignAssets}
  ]=await Promise.all([
    supabase.from("store_products")
      .select("id,sku,title_ar,status,price_sar,rights_status,delivery_status,checkout_status,updated_at")
      .order("updated_at",{ascending:false}),
    supabase.from("store_product_files")
      .select("id,product_id")
      .eq("is_active",true),
    supabase.from("store_orders")
      .select("id,order_code,status,total_sar,created_at")
      .order("created_at",{ascending:false}),
    supabase.from("store_funnel_events")
      .select("*",{count:"exact",head:true})
      .eq("event_type","INSIGHT_VIEW"),
    supabase.from("store_funnel_events")
      .select("path")
      .eq("event_type","LANDING_VIEW"),
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
      .limit(20),
    supabase.from("store_campaign_assets")
      .select("id,asset_key,phase,channel,language,headline,status,sequence_order,target_path")
      .order("sequence_order",{ascending:true})
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
  const landingCounts={
    marketEntry:(landingEvents??[]).filter(event=>event.path?.includes("/saudi-market-entry")).length,
    industrialResearch:(landingEvents??[]).filter(event=>event.path?.includes("/industrial-research")).length,
    esg:(landingEvents??[]).filter(event=>event.path?.includes("/esg-industrial-intelligence")).length
  };
  const landingViews=(landingEvents??[]).length;
  const campaignReady=(campaignAssets??[]).filter(asset=>asset.status==="READY").length;
  const campaignBlocked=(campaignAssets??[]).filter(asset=>asset.status==="BLOCKED_PAYMENT").length;
  const fileCountByProduct=new Map<string,number>();
  for(const file of productFiles??[]){
    fileCountByProduct.set(file.product_id,(fileCountByProduct.get(file.product_id)||0)+1);
  }

  const metrics=[
    ["01",insightViews??0,"مشاهدة الرؤية"],
    ["02",leads??0,"مهتمون بالإطلاق"],
    ["03",prelaunchConversion.toLocaleString("ar-SA",{maximumFractionDigits:1})+"%","تحويل رؤية ← اهتمام"],
    ["04",landingViews,"مشاهدة صفحات الاستخدام"],
    ["05",views??0,"مشاهدة منتج"],
    ["06",samples??0,"تحميل عينة"],
    ["07",allOrders.length,"طلبات بدأت"],
    ["08",paidOrders.length,"طلبات مدفوعة"],
    ["09",revenue.toLocaleString("ar-SA"),"إيراد مدفوع (ر.س)"],
    ["10",conversion.toLocaleString("ar-SA",{maximumFractionDigits:1})+"%","تحويل منتج ← شراء"],
    ["11",targets?.length??0,"حسابات مستهدفة أولية"],
    ["12",published,"منتجات منشورة"],
    ["13",ready,"جاهز للنشر"],
    ["14",campaignReady,"مواد حملة جاهزة"],
    ["15",campaignBlocked,"مواد تنتظر الدفع"]
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
      <span className="sectionKicker">زوايا الطلب</span>
      <h1>أي رسالة تعمل؟</h1>
      <p>نقارن صفحات الاستخدام الثلاث قبل توسيع النشر أو الإنفاق.</p>
    </header>

    <section className="workspaceProcess">
      <div><span>01</span><strong>{landingCounts.marketEntry}</strong><p>دخول السوق السعودي</p></div>
      <div><span>02</span><strong>{landingCounts.industrialResearch}</strong><p>البحث والاستراتيجية الصناعية</p></div>
      <div><span>03</span><strong>{landingCounts.esg}</strong><p>الاستدامة وESG</p></div>
    </section>

    <header className="workspacePageHead">
      <span className="sectionKicker">Launch Pack V1</span>
      <h1>الحملة جاهزة قبل الدفع</h1>
      <p>مواد ما قبل الإطلاق تبقى جاهزة، ومواد الإطلاق والمتابعة تُفتح تلقائيًا فقط بعد نشر المنتج والدفع الجاهز.</p>
    </header>

    <section className="assetWorkspaceList">
      {campaignAssets?.length ? campaignAssets.map((asset,index)=>
        <article className="assetWorkspaceRow" key={asset.id}>
          <span className="assetWorkspaceIndex">{String(index+1).padStart(2,"0")}</span>
          <div className="assetWorkspaceMain">
            <small>{asset.phase} · {asset.channel} · {asset.language.toUpperCase()}</small>
            <h2>{asset.headline}</h2>
            <p>{asset.target_path}</p>
          </div>
          <div className="assetWorkspaceMeta">
            <div><span>الحالة</span><strong>{asset.status}</strong></div>
            <div><span>الترتيب</span><strong>{asset.sequence_order}</strong></div>
          </div>
        </article>
      ) : <div className="editorialEmpty"><span>00</span><h2>لا توجد مواد حملة.</h2><p>يجب أن يكون لكل إطلاق محتوى وقناة وUTM وحالة تشغيل واضحة.</p></div>}
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
              {" · "}ملفات التسليم: {fileCountByProduct.get(product.id)||0}
            </p>
            <div className="assetWorkspaceActions">
              <Link className="button ghost small" href={"/commerce/products/"+product.id}>استعراض المنتج</Link>
            </div>
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
