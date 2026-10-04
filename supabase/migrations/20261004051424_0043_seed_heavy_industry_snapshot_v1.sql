with product as (
  select id,created_by
  from public.store_products
  where slug='saudi-industrial-intelligence-v1'
),
stats as (
  select
    count(*)::int as records,
    count(distinct subsector_code)::int as subsectors,
    count(*) filter(where owner_names is not null)::int as with_owner,
    round(sum(coalesce(emissions_co2e_2025_t,0))::numeric,2) as emissions
  from private.numwan_product1_dataset_v1
),
sector_counts as (
  select
    subsector_code,
    max(subsector_en) as sector_name_en,
    max(subsector_ar) as sector_name_ar,
    count(*)::int as records
  from private.numwan_product1_dataset_v1
  group by subsector_code
),
breakdown as (
  select jsonb_agg(
    jsonb_build_object(
      'code',subsector_code,
      'name_en',sector_name_en,
      'name_ar',sector_name_ar,
      'records',records
    )
    order by records desc,sector_name_en
  ) as items
  from sector_counts
)
insert into public.store_public_snapshots(
  slug,product_id,title_ar,title_en,summary_ar,summary_en,
  data_year,metrics,breakdown,methodology_ar,methodology_en,
  is_public,created_by
)
select
  'saudi-heavy-industry-2025',
  product.id,
  'لمحة الصناعات الثقيلة السعودية 2025',
  'Saudi Heavy Industry Snapshot 2025',
  'لمحة مجانية مبنية على بيانات 2025 الكاملة: حجم التغطية، توزيع القطاعات، توافر بيانات الملكية، ومؤشرات الانبعاثات للصناعات الثقيلة السعودية الممثلة في المصدر.',
  'A free full-year 2025 snapshot covering dataset scope, subsector distribution, ownership availability and emissions indicators for represented Saudi heavy-industry facilities.',
  2025,
  jsonb_build_object(
    'records',stats.records,
    'subsectors',stats.subsectors,
    'with_owner',stats.with_owner,
    'emissions_co2e_2025_t',stats.emissions
  ),
  breakdown.items,
  'المصدر الأساسي Climate TRACE. الأرقام تعكس المنشآت والمصادر الممثلة في بيانات المصدر وليست تعدادًا حكوميًا شاملًا لجميع المصانع السعودية. درجات الثقة تختلف بين السجلات، ولا تُستنتج القيم المفقودة.',
  'Primary source: Climate TRACE. Figures describe facilities/sources represented in the source dataset and are not a complete government census of Saudi factories. Confidence varies by record and missing values are not inferred.',
  true,
  product.created_by
from product,stats,breakdown
on conflict(slug) do update set
  product_id=excluded.product_id,
  title_ar=excluded.title_ar,
  title_en=excluded.title_en,
  summary_ar=excluded.summary_ar,
  summary_en=excluded.summary_en,
  data_year=excluded.data_year,
  metrics=excluded.metrics,
  breakdown=excluded.breakdown,
  methodology_ar=excluded.methodology_ar,
  methodology_en=excluded.methodology_en,
  is_public=excluded.is_public,
  updated_at=now();
