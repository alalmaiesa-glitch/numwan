with p as (
  select id,created_by
  from public.store_products
  where slug='saudi-industrial-intelligence-v1'
),
assets(
  asset_key,phase,channel,language,use_case_slug,headline,body,target_path,
  utm_source,utm_medium,utm_campaign,utm_content,status,sequence_order
) as (
  values
  ('prelaunch-linkedin-ar-snapshot','PRELAUNCH','LINKEDIN','ar',null,
   'لمحة الصناعات الثقيلة السعودية 2025',
   'أطلقنا في نُموان لمحة مجانية عن بيانات الصناعات الثقيلة السعودية لعام 2025. التغطية الحالية تضم 46 سجلًا عبر 7 قطاعات فرعية، مع بيانات ملكية متاحة لـ38 سجلًا ومؤشرات انبعاثات مرتبطة بدرجات الثقة. الصفحة لا تقدّم الأرقام كتعداد شامل للصناعة السعودية؛ بل توضح بصرامة ما يغطيه المصدر وما لا يغطيه. إذا كنت تعمل في البحث الصناعي أو دخول السوق أو الاستدامة، ابدأ من اللمحة ثم حدّد أين تحتاج إلى تحقق أعمق.',
   '/insights/saudi-heavy-industry-2025','linkedin','organic','numwan-product1-prelaunch','snapshot-ar','READY',10),
  ('prelaunch-x-ar-snapshot','PRELAUNCH','X','ar',null,
   'لمحة الصناعات الثقيلة السعودية 2025',
   'لمحة مجانية من نُموان: 46 سجلًا للصناعات الثقيلة السعودية في بيانات 2025 عبر 7 قطاعات. نعرض الملكية والانبعاثات ودرجات الثقة وحدود التغطية بوضوح — بلا ادعاء أنها تعداد شامل للمصانع.',
   '/insights/saudi-heavy-industry-2025','x','organic','numwan-product1-prelaunch','snapshot-ar','READY',20),
  ('prelaunch-linkedin-en-market-entry','PRELAUNCH','LINKEDIN','en','saudi-market-entry',
   'Map Saudi heavy industry before entering the market',
   'Entering Saudi Arabia should not begin with a pile of disconnected pages. NUMWAN has prepared a structured 2025 heavy-industry intelligence layer covering 46 represented facilities/sources across seven subsectors, with available ownership, capacity, activity, emissions and confidence metadata. It is not a feasibility study or a complete factory registry. It is a faster starting point for deciding what deserves deeper primary research.',
   '/en/use-cases/saudi-market-entry','linkedin','organic','numwan-product1-prelaunch','market-entry-en','READY',30),
  ('prelaunch-linkedin-en-industrial-research','PRELAUNCH','LINKEDIN','en','industrial-research',
   'Industrial research should start with structured evidence',
   'For consulting and industrial-policy teams, the expensive part of early research is often not analysis — it is assembling a usable starting dataset. NUMWAN’s Saudi Heavy Industry 2025 layer normalizes 46 represented records across cement, petrochemicals, iron and steel, aluminum, glass, pulp and paper, and chemicals. Source and confidence metadata remain visible so uncertainty is not hidden.',
   '/en/use-cases/industrial-research','linkedin','organic','numwan-product1-prelaunch','industrial-research-en','READY',40),
  ('prelaunch-linkedin-en-esg','PRELAUNCH','LINKEDIN','en','esg-industrial-intelligence',
   'Emissions data needs confidence attached',
   'A number without context can be more misleading than no number at all. NUMWAN’s Saudi heavy-industry layer keeps source-level emissions indicators together with confidence metadata. It is designed for early ESG and sustainability screening — not as a substitute for GHG verification, assurance or company disclosures.',
   '/en/use-cases/esg-industrial-intelligence','linkedin','organic','numwan-product1-prelaunch','esg-en','READY',50),
  ('launch-linkedin-ar-product','LAUNCH','LINKEDIN','ar',null,
   'إطلاق ذكاء الصناعة السعودية — خريطة الصناعات الثقيلة V1',
   'أصبح الأصل الكامل متاحًا في نُموان: خريطة بيانات للصناعات الثقيلة السعودية مبنية على بيانات 2025 الكاملة من Climate TRACE. يتضمن الإصدار XLSX وCSV وقاموس بيانات وسجل مصادر وحقوق وملاحظات إصدار ودليل استخدام. 46 سجلًا، 7 قطاعات فرعية، 38 سجلًا ببيانات ملكية، مع درجات الثقة بدل إخفاء عدم اليقين.',
   '/store/saudi-industrial-intelligence-v1','linkedin','organic','numwan-product1-launch','product-ar','BLOCKED_PAYMENT',100),
  ('launch-x-ar-product','LAUNCH','X','ar',null,
   'إطلاق الأصل الأول من نُموان',
   'متاح الآن: ذكاء الصناعة السعودية — خريطة الصناعات الثقيلة V1. بيانات 2025، 46 سجلًا، 7 قطاعات، XLSX + CSV + قاموس بيانات + سجل مصادر وحقوق. صُمم للبحث والتحليل، لا كقائمة أسماء فقط.',
   '/store/saudi-industrial-intelligence-v1','x','organic','numwan-product1-launch','product-ar','BLOCKED_PAYMENT',110),
  ('launch-linkedin-en-product','LAUNCH','LINKEDIN','en',null,
   'Saudi Industrial Intelligence — Heavy Industry Map V1 is live',
   'NUMWAN’s first commercial data asset is now available: a source-traceable 2025 map of 46 represented Saudi heavy-industry facilities/sources across seven subsectors. The release includes XLSX, CSV, a data dictionary, source & rights register, release notes and buyer guide. Confidence metadata stays visible so analysts can distinguish signals from stronger evidence.',
   '/en/store/saudi-industrial-intelligence-v1','linkedin','organic','numwan-product1-launch','product-en','BLOCKED_PAYMENT',120),
  ('launch-email-ar-leads','LAUNCH','EMAIL_LEADS','ar',null,
   'تم إطلاق الأصل الذي طلبت إشعارك به',
   'أصبح «ذكاء الصناعة السعودية — خريطة الصناعات الثقيلة V1» متاحًا الآن. يتضمن الإصدار 46 سجلًا عبر 7 قطاعات فرعية، مع XLSX وCSV وقاموس بيانات وسجل مصادر وحقوق وملاحظات تغطية واضحة. سجلت اهتمامك بهذا الأصل، لذلك نرسل لك إشعار الإطلاق فقط كما طلبت.',
   '/store/saudi-industrial-intelligence-v1','email','lifecycle','numwan-product1-launch','lead-launch-ar','BLOCKED_PAYMENT',130),
  ('launch-email-en-leads','LAUNCH','EMAIL_LEADS','en',null,
   'The Saudi Heavy Industry Map you asked about is now available',
   'Saudi Industrial Intelligence — Heavy Industry Map V1 is now live. The release contains 46 represented records across seven subsectors, with XLSX, CSV, a data dictionary, source & rights register and explicit coverage notes. You asked to be notified about this asset, so this is the launch notice you opted into.',
   '/en/store/saudi-industrial-intelligence-v1','email','lifecycle','numwan-product1-launch','lead-launch-en','BLOCKED_PAYMENT',140),
  ('launch-target-account-en','LAUNCH','TARGET_ACCOUNT','en',null,
   'Saudi heavy-industry data for research teams',
   'We built a compact Saudi heavy-industry intelligence asset designed for teams doing market entry, industrial strategy, sustainability or sector research. V1 covers 46 represented facilities/sources across seven subsectors using 2025 data, with ownership where available and explicit confidence metadata. I am sharing the public methodology page first so you can judge whether the coverage is useful before considering the full dataset.',
   '/en/insights/saudi-heavy-industry-2025','outreach','account','numwan-product1-launch','target-account-en','BLOCKED_PAYMENT',150),
  ('followup-linkedin-en-quality','FOLLOW_UP','LINKEDIN','en',null,
   'What we deliberately did not put into the dataset',
   'Data products become less useful when missing values are quietly guessed. In NUMWAN’s Saudi Heavy Industry Map V1, missing owner or capacity values stay missing; restricted private-directory data is excluded; unlike capacity units are not summed; and emissions confidence remains visible. The product is designed to make the next research step faster without pretending uncertainty disappeared.',
   '/en/store/saudi-industrial-intelligence-v1','linkedin','organic','numwan-product1-followup','quality-en','BLOCKED_PAYMENT',200)
)
insert into public.store_campaign_assets(
  product_id,asset_key,phase,channel,language,use_case_slug,headline,body,target_path,
  utm_source,utm_medium,utm_campaign,utm_content,status,sequence_order,created_by
)
select
  p.id,a.asset_key,a.phase,a.channel,a.language,a.use_case_slug,a.headline,a.body,a.target_path,
  a.utm_source,a.utm_medium,a.utm_campaign,a.utm_content,a.status,a.sequence_order,p.created_by
from p cross join assets a
on conflict(product_id,asset_key) do update set
  phase=excluded.phase,
  channel=excluded.channel,
  language=excluded.language,
  use_case_slug=excluded.use_case_slug,
  headline=excluded.headline,
  body=excluded.body,
  target_path=excluded.target_path,
  utm_source=excluded.utm_source,
  utm_medium=excluded.utm_medium,
  utm_campaign=excluded.utm_campaign,
  utm_content=excluded.utm_content,
  status=excluded.status,
  sequence_order=excluded.sequence_order,
  updated_at=now();
