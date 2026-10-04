import "server-only";
import { createSimpleXlsx } from "@/lib/export/simple-xlsx";

type DataRow=Record<string,unknown>;

type Column={
  key:string;
  label:string;
};

export const PRODUCT1_COLUMNS:Column[]=[
  {key:"source_id",label:"source_id"},
  {key:"facility_name",label:"facility_name"},
  {key:"subsector_code",label:"subsector_code"},
  {key:"subsector_en",label:"subsector_en"},
  {key:"subsector_ar",label:"subsector_ar"},
  {key:"asset_type",label:"asset_type"},
  {key:"source_type",label:"source_type"},
  {key:"latitude",label:"latitude"},
  {key:"longitude",label:"longitude"},
  {key:"owner_names",label:"owner_names"},
  {key:"owner_ids",label:"owner_ids"},
  {key:"capacity",label:"capacity"},
  {key:"capacity_units",label:"capacity_units"},
  {key:"activity_2025",label:"activity_2025"},
  {key:"activity_units",label:"activity_units"},
  {key:"capacity_factor",label:"capacity_factor"},
  {key:"emissions_co2e_2025_t",label:"emissions_co2e_2025_t"},
  {key:"emissions_factor",label:"emissions_factor"},
  {key:"emissions_factor_units",label:"emissions_factor_units"},
  {key:"subsector_rank_2025",label:"subsector_rank_2025"},
  {key:"confidence_emissions",label:"confidence_emissions"},
  {key:"confidence_activity",label:"confidence_activity"},
  {key:"confidence_capacity",label:"confidence_capacity"},
  {key:"data_year",label:"data_year"},
  {key:"source_api_url",label:"source_api_url"},
  {key:"source_name",label:"source_name"},
  {key:"source_license",label:"source_license"},
  {key:"attribution_text",label:"attribution_text"},
  {key:"retrieved_at",label:"retrieved_at"}
];

const DICTIONARY=[
  ["source_id","معرّف المصدر","Climate TRACE source identifier","integer"],
  ["facility_name","اسم المنشأة/المصدر","Facility/source name","text"],
  ["subsector_code","رمز القطاع الفرعي","Subsector code","text"],
  ["subsector_en","القطاع الفرعي بالإنجليزية","English subsector label","text"],
  ["subsector_ar","القطاع الفرعي بالعربية","Arabic subsector label","text"],
  ["asset_type","نوع الأصل الصناعي","Industrial asset type","text"],
  ["source_type","نوع مصدر الانبعاث","Emission-source type","text"],
  ["latitude","خط العرض التقريبي","Approximate latitude","decimal degrees"],
  ["longitude","خط الطول التقريبي","Approximate longitude","decimal degrees"],
  ["owner_names","الملاك المتاحون في المصدر","Owner names when available","text; semicolon separated"],
  ["owner_ids","معرّفات الملاك في المصدر","Owner identifiers when available","text; semicolon separated"],
  ["capacity","السعة المبلّغ عنها","Reported capacity","numeric"],
  ["capacity_units","وحدة السعة","Capacity units","text"],
  ["activity_2025","النشاط المقدر لعام 2025","Estimated 2025 activity","numeric"],
  ["activity_units","وحدة النشاط","Activity units","text"],
  ["capacity_factor","معامل السعة","Capacity factor","ratio"],
  ["emissions_co2e_2025_t","انبعاثات 2025 طن مكافئ CO2","2025 emissions in tonnes CO2e (100-year GWP)","tonnes CO2e"],
  ["emissions_factor","معامل الانبعاث","Emissions factor","numeric"],
  ["emissions_factor_units","وحدة معامل الانبعاث","Emissions-factor units","text"],
  ["subsector_rank_2025","ترتيب المصدر داخل قطاعه الفرعي","2025 source rank within subsector","integer"],
  ["confidence_emissions","ثقة تقدير الانبعاثات","Emissions estimate confidence","categorical"],
  ["confidence_activity","ثقة تقدير النشاط","Activity estimate confidence","categorical"],
  ["confidence_capacity","ثقة تقدير السعة","Capacity estimate confidence","categorical"],
  ["data_year","سنة الأساس","Base data year","year"],
  ["source_api_url","رابط سجل المصدر في API","Source API record URL","url"],
  ["source_name","اسم مزود البيانات","Data provider","text"],
  ["source_license","ترخيص المصدر","Source license","text"],
  ["attribution_text","نص الإسناد","Required attribution","text"],
  ["retrieved_at","تاريخ سحب السجل","Retrieval timestamp","ISO timestamp"]
] as const;

function csvCell(value:unknown){
  if(value===null || value===undefined) return "";
  const text=String(value);
  return /[",\r\n]/.test(text) ? '"'+text.replace(/"/g,'""')+'"' : text;
}

export function toCsv(rows:DataRow[],columns:Column[]=PRODUCT1_COLUMNS){
  const lines=[
    columns.map(column=>csvCell(column.label)).join(","),
    ...rows.map(row=>columns.map(column=>csvCell(row[column.key])).join(","))
  ];
  return "\uFEFF"+lines.join("\r\n");
}

export function toXlsx(rows:DataRow[]){
  const headers=PRODUCT1_COLUMNS.map(column=>column.label);
  const values=rows.map(row=>PRODUCT1_COLUMNS.map(column=>{
    const value=row[column.key];
    if(value===null || value===undefined) return null;
    if(typeof value==="number" || typeof value==="boolean") return value;
    return String(value);
  }));
  return createSimpleXlsx(headers,values,"Facilities");
}

export function dataDictionaryCsv(){
  const columns:Column[]=[
    {key:"field",label:"field"},
    {key:"description_ar",label:"description_ar"},
    {key:"description_en",label:"description_en"},
    {key:"type_or_unit",label:"type_or_unit"}
  ];
  const rows=DICTIONARY.map(([field,description_ar,description_en,type_or_unit])=>({field,description_ar,description_en,type_or_unit}));
  return toCsv(rows,columns);
}

export function sourceRightsCsv(rows:DataRow[]){
  const columns:Column[]=[
    {key:"source_key",label:"source_key"},
    {key:"name_en",label:"name_en"},
    {key:"publisher",label:"publisher"},
    {key:"source_url",label:"source_url"},
    {key:"source_type",label:"source_type"},
    {key:"license_name",label:"license_name"},
    {key:"license_url",label:"license_url"},
    {key:"rights_status",label:"rights_status"},
    {key:"commercial_use_allowed",label:"commercial_use_allowed"},
    {key:"redistribution_allowed",label:"redistribution_allowed"},
    {key:"attribution_required",label:"attribution_required"},
    {key:"attribution_text",label:"attribution_text"},
    {key:"usage_mode",label:"usage_mode"},
    {key:"fields_used",label:"fields_used"},
    {key:"review_notes",label:"review_notes"},
    {key:"reviewed_at",label:"reviewed_at"}
  ];
  const normalized=rows.map(row=>({
    ...row,
    fields_used:Array.isArray(row.fields_used) ? row.fields_used.join("; ") : row.fields_used
  }));
  return toCsv(normalized,columns);
}

export function releaseNotes(rows:DataRow[]){
  const counts=new Map<string,number>();
  let ownerCount=0;
  let emissionsTotal=0;

  for(const row of rows){
    const sector=String(row.subsector_en||row.subsector_code||"Unknown");
    counts.set(sector,(counts.get(sector)||0)+1);
    if(row.owner_names) ownerCount+=1;
    const emissions=Number(row.emissions_co2e_2025_t);
    if(Number.isFinite(emissions)) emissionsTotal+=emissions;
  }

  const breakdown=[...counts.entries()]
    .sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0]))
    .map(([sector,count])=>`- ${sector}: ${count}`)
    .join("\n");

  return `NUMWAN — Saudi Industrial Intelligence: Heavy Industry Map V1
Release: 1.0
Base year: 2025
Records: ${rows.length}
Records with ownership data: ${ownerCount}
Represented 2025 emissions: ${emissionsTotal.toFixed(2)} t CO2e (100-year GWP)

Coverage
${breakdown}

Source and license
Primary included source: Climate TRACE.
License: CC BY 4.0.
Attribution: Climate TRACE — CC BY 4.0.

Important limitations
- This is not a complete census of all Saudi factories.
- Values inherit Climate TRACE methodology, source coverage and confidence limitations.
- Missing fields remain missing and are not inferred by Numwan.
- Capacity values use sector-specific units and must not be summed across unlike units.
- Restricted private-directory records are not included in the commercial dataset.
`;
}

export function buyerGuide(){
  return `NUMWAN — Buyer Guide
Saudi Industrial Intelligence: Heavy Industry Map V1

What this product is
A structured, source-traceable dataset for Saudi heavy-industry market mapping and analytical work.

Good use cases
- industrial market mapping
- sector screening
- sourcing and competitor research
- ESG and emissions analysis
- market-entry research
- identifying facilities for deeper primary research

How to interpret confidence
Climate TRACE provides confidence labels for several estimates. Treat lower-confidence activity, capacity and emissions values as analytical signals rather than audited company disclosures.

What this product is not
It is not a government factory registry, legal due-diligence report, audited emissions inventory, or complete census of Saudi industrial establishments.

Data handling
Keep the included source attribution with any permitted derivative use. Refer to the Source & Rights Register for source-level rights notes.
`;
}

export function sampleCsv(rows:DataRow[]){
  const columns:Column[]=[
    {key:"source_id",label:"source_id"},
    {key:"facility_name",label:"facility_name"},
    {key:"subsector_en",label:"subsector_en"},
    {key:"subsector_ar",label:"subsector_ar"},
    {key:"asset_type",label:"asset_type"},
    {key:"latitude",label:"latitude"},
    {key:"longitude",label:"longitude"},
    {key:"owner_names",label:"owner_names"},
    {key:"capacity",label:"capacity"},
    {key:"capacity_units",label:"capacity_units"},
    {key:"emissions_co2e_2025_t",label:"emissions_co2e_2025_t"},
    {key:"confidence_emissions",label:"confidence_emissions"},
    {key:"source_license",label:"source_license"}
  ];
  return toCsv(rows,columns);
}
