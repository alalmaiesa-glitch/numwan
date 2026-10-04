with product as (
  select id,created_by
  from public.store_products
  where slug='saudi-industrial-intelligence-v1'
),
targets(company_name,domain,country,segment,rationale,source_url,language,status,priority) as (
  values
    ('Frost & Sullivan','frost.com','Saudi Arabia','MARKET_RESEARCH',
     'Riyadh office plus dedicated Industrial, Supply Chain & Logistics, and Sustainability analytics make the dataset directly relevant to Saudi industrial market research.',
     'https://www.frost.com/about/our-locations/','en','RESEARCHED',1),
    ('AstroLabs','astrolabs.com','Saudi Arabia','MARKET_ENTRY',
     'Runs Saudi market-entry and industrial-base programs for international companies; the dataset can support sector mapping and early market-entry research.',
     'https://astrolabs.com/solutions/industry/build-your-industrial-base-in-saudi-arabia','en','RESEARCHED',1),
    ('KPMG Saudi Arabia','kpmg.com','Saudi Arabia','INDUSTRIAL_POLICY',
     'Publishes Saudi industrial-policy and supply-chain work, making structured facility-level industrial intelligence relevant to strategy and public-policy teams.',
     'https://kpmg.com/sa/en/insights/sector-insights/advancing-industrial-policy-in-saudi-arabia.html','en','RESEARCHED',1),
    ('PwC Middle East','pwc.com','Saudi Arabia','INDUSTRIAL_CONSULTING',
     'Active in Middle East industrial manufacturing and Saudi export-competitiveness analysis; the asset can support industrial strategy and market-mapping engagements.',
     'https://www.pwc.com/m1/en/publications/industrial-manufacturing-race-to-2030.html','en','RESEARCHED',1),
    ('Roland Berger Middle East','rolandberger.com','Saudi Arabia','INDUSTRIAL_STRATEGY',
     'Riyadh office with explicit industrial-policy, manufacturing, operations, localization and supply-chain expertise; high fit for facility-level industrial intelligence.',
     'https://www.rolandberger.com/en/Locations/Middle-East/Offices/','en','RESEARCHED',1),
    ('ERM','erm.com','Saudi Arabia / Middle East','SUSTAINABILITY_MANUFACTURING',
     'Manufacturing sustainability, climate, environmental-risk and asset advisory create direct use cases for facility, emissions and ownership intelligence.',
     'https://www.erm.com/industries/manufacturing/','en','RESEARCHED',1),
    ('Bureau Veritas Saudi Arabia','bureauveritas.com','Saudi Arabia','ESG_VERIFICATION',
     'Saudi presence plus metals/minerals, sustainability, GHG verification and industrial services make the dataset relevant to research and advisory work.',
     'https://middle-east.bureauveritas.com/newsroom/bureau-veritas-expands-its-presence-kingdom-saudi-arabia-it-celebrates-25-years-trusted','en','RESEARCHED',1),
    ('Strategy& Middle East','strategyand.pwc.com','Saudi Arabia','STRATEGY',
     'Longstanding Riyadh operation serving public and private sector strategy clients; Saudi industrial and energy-transition work can benefit from structured market intelligence.',
     'https://www.strategyand.pwc.com/m1/en/about-us/our-offices.html','en','RESEARCHED',2),
    ('Deloitte Middle East','deloitte.com','Saudi Arabia','DIGITAL_MANUFACTURING',
     'Large Saudi consulting presence and demonstrated smart-manufacturing work make facility and sector intelligence relevant to manufacturing transformation and market analysis.',
     'https://www.deloitte.com/middle-east/en/offices/middle-east-offices/riyadh.html','en','RESEARCHED',2),
    ('Arthur D. Little','adlittle.com','Saudi Arabia','STRATEGY_TRANSFORMATION',
     'Saudi-based strategy and transformation practice provides a potential buyer profile for structured industrial market and policy research.',
     'https://www.adlittle.com/en/management-team/ammar-shawoosh','en','RESEARCHED',2)
)
insert into public.store_target_accounts(
  product_id,company_name,domain,country,segment,rationale,
  source_url,language,status,priority,created_by
)
select
  product.id,t.company_name,t.domain,t.country,t.segment,t.rationale,
  t.source_url,t.language,t.status,t.priority,product.created_by
from product
cross join targets t
on conflict (product_id,(lower(domain))) where domain is not null
do update set
  company_name=excluded.company_name,
  country=excluded.country,
  segment=excluded.segment,
  rationale=excluded.rationale,
  source_url=excluded.source_url,
  language=excluded.language,
  status=excluded.status,
  priority=excluded.priority,
  updated_at=now();
