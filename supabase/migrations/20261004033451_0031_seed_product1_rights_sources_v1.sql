with owner as (
  select created_by from public.store_products where slug='saudi-industrial-intelligence-v1'
)
insert into public.store_sources (
  source_key,name_ar,name_en,publisher,source_url,source_type,
  license_name,license_url,rights_status,commercial_use_allowed,
  redistribution_allowed,attribution_required,attribution_text,
  reviewed_at,review_notes,created_by
)
select * from (
  select 'climate-trace-manufacturing','بيانات Climate TRACE للصناعة','Climate TRACE Manufacturing Data','Climate TRACE','https://climatetrace.org/data','OPEN_DATA','CC BY 4.0','https://climatetrace.org/terms','ALLOWED',true,true,true,'Climate TRACE — CC BY 4.0',now(),'Commercial reuse and redistribution are permitted with attribution; external datasets inside Climate TRACE may carry separate terms and must be reviewed before inclusion.',owner.created_by from owner
  union all
  select 'saudi-open-data-license','ترخيص البيانات المفتوحة السعودي','Saudi Open Data License','Government of Saudi Arabia','https://my.gov.sa/content/open-Data','REFERENCE','Saudi Open Data License','https://my.gov.sa/content/open-Data','ALLOWED',true,true,true,'المصدر والجهة الناشرة وفق ترخيص البيانات المفتوحة السعودي',now(),'License framework permits sharing, derivative works, modification and reuse of datasets published on official Saudi open data platforms subject to attribution and license disclosure.',owner.created_by from owner
  union all
  select 'industry-com-sa-directory','دليل الصناعة والصادرات السعودية','Saudi Industry and Exports Directory','Tazamun Information Technology','https://industry.com.sa/ar/vendors','THIRD_PARTY','Restricted website terms','https://industry.com.sa/ar/vendors_terms_condition','RESTRICTED',false,false,false,null,now(),'Terms prohibit copying, downloading, reproducing or republishing platform information, files and databases without authorization. Discovery-only; do not redistribute.',owner.created_by from owner
  union all
  select 'numwan-industrial-research-workbook','ملف نُموان البحثي الأولي للمنشآت الصناعية','Numwan Industrial Research Workbook','Numwan internal research','library://saudi_industrial_establishments_directory_sources_tracked.xlsx','INTERNAL','Mixed-source internal research',null,'PENDING',false,false,false,null,now(),'Contains mixed-source research including restricted directory content. Use for discovery and verification planning only; not for commercial redistribution.',owner.created_by from owner
) x
on conflict (source_key) do update set
  name_ar=excluded.name_ar,
  name_en=excluded.name_en,
  publisher=excluded.publisher,
  source_url=excluded.source_url,
  source_type=excluded.source_type,
  license_name=excluded.license_name,
  license_url=excluded.license_url,
  rights_status=excluded.rights_status,
  commercial_use_allowed=excluded.commercial_use_allowed,
  redistribution_allowed=excluded.redistribution_allowed,
  attribution_required=excluded.attribution_required,
  attribution_text=excluded.attribution_text,
  reviewed_at=excluded.reviewed_at,
  review_notes=excluded.review_notes,
  updated_at=now();

with p as (
  select id from public.store_products where slug='saudi-industrial-intelligence-v1'
),
src as (
  select id,source_key from public.store_sources
  where source_key in ('climate-trace-manufacturing','saudi-open-data-license','industry-com-sa-directory','numwan-industrial-research-workbook')
)
insert into public.store_product_sources(product_id,source_id,usage_mode,fields_used,notes)
select p.id,src.id,
  case src.source_key
    when 'climate-trace-manufacturing' then 'INCLUDED'
    when 'saudi-open-data-license' then 'REFERENCE_ONLY'
    else 'DISCOVERY_ONLY'
  end,
  case src.source_key
    when 'climate-trace-manufacturing' then array['facility_name','asset_type','subsector','location','capacity','capacity_units','owner','emissions','activity']::text[]
    else null
  end,
  case src.source_key
    when 'climate-trace-manufacturing' then 'Primary reusable data source for V1.'
    when 'saudi-open-data-license' then 'Rights framework reference for future Saudi government open datasets.'
    when 'industry-com-sa-directory' then 'Discovery only. No content or database records may be redistributed.'
    else 'Internal discovery workbook only; mixed-source rows are excluded from the commercial deliverable.'
  end
from p cross join src
on conflict(product_id,source_id) do update set
  usage_mode=excluded.usage_mode,
  fields_used=excluded.fields_used,
  notes=excluded.notes;

update public.store_products
set
  title_ar='ذكاء الصناعة السعودية — خريطة الصناعات الثقيلة V1',
  title_en='Saudi Industrial Intelligence — Heavy Industry Map V1',
  summary_ar='خريطة بيانات منظمة للصناعات الثقيلة والمنشآت الصناعية الكبرى في السعودية، تشمل الموقع والقطاع ونوع المنشأة ومؤشرات السعة والملكية والانبعاثات حيث تتوفر، مع سجل مصادر وترخيص واضح.',
  summary_en='A structured map of Saudi heavy-industry facilities with location, sector, asset type, and available capacity, ownership and emissions indicators, backed by a transparent source and licensing register.',
  preview_ar='يشمل الإصدار الأول بيانات منشآت الصناعات الثقيلة المتاحة من مصادر مفتوحة مرخصة، مع تنظيف الحقول، تصنيف القطاعات، توثيق المصدر، وبيان حدود التغطية. لا يتضمن أي بيانات من أدلة خاصة تمنع إعادة النشر.',
  preview_en='V1 contains heavy-industry facility data from openly licensed sources, with normalized fields, sector classification, source traceability and explicit coverage limitations. Restricted private-directory data is excluded.',
  rights_basis='Primary commercial dataset uses Climate TRACE data under CC BY 4.0. Restricted third-party directory records and mixed-source internal research are discovery-only and excluded from redistribution.',
  source_attribution='Climate TRACE (CC BY 4.0). Additional Saudi open-data sources will be attributed per dataset when included.',
  updated_at=now()
where slug='saudi-industrial-intelligence-v1';

select public.recalculate_store_product_rights_v1(
  (select id from public.store_products where slug='saudi-industrial-intelligence-v1')
);
