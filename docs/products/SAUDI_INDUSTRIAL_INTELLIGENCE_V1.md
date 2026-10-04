# Saudi Industrial Intelligence — Heavy Industry Map V1

Status: **Delivery-ready; payment integration pending**
SKU: **NW-DATA-SA-IND-001**
Public status: **DRAFT**
Launch price: **SAR 349**
Primary market: Saudi Arabia / GCC / international industrial, ESG, consulting and market-entry teams

## Product promise

A clean, structured and source-traceable map of Saudi heavy-industry facilities that gives analysts a usable starting point for industrial market mapping without rebuilding the underlying open-data research.

This is not a resale of a private industrial directory and is not a complete Saudi factory registry.

## Verified V1 coverage

Base year: **2025 full-year**

Master dataset:
- **46** facility/source records.
- **7** manufacturing subsectors.
- **38** records with ownership data.
- **46** records with emissions-confidence metadata.
- represented source-level 2025 emissions: **79,562,925.60 t CO2e (100-year GWP)**.

Subsector coverage:
- Cement: 20.
- Petrochemicals — Steam Cracking: 13.
- Iron & Steel: 6.
- Aluminum: 2.
- Glass: 2.
- Pulp & Paper: 2.
- Chemicals: 1.

Emissions-confidence distribution:
- Medium: 16.
- Low: 12.
- Very low: 18.

Confidence is shipped as a first-class field. Lower-confidence values must be treated as analytical signals rather than audited disclosures.

## Source and rights

Primary INCLUDED source:
- Climate TRACE API v7.
- License: CC BY 4.0.
- Commercial use: allowed.
- Redistribution: allowed with attribution.

Registered but excluded from the commercial dataset:
- industry.com.sa — RESTRICTED / DISCOVERY_ONLY.
- Numwan mixed-source industrial research workbook — DISCOVERY_ONLY.

Saudi Open Data License is registered as a rights framework reference for later official-dataset enrichment.

Current rights gate: **CLEARED**.

## Data pipeline

The product is reproducible from source:

Climate TRACE API → Saudi manufacturing filter → staging → source-detail enrichment → normalization → quality checks → master dataset → entitlement-protected exports.

The current 2025 pipeline returns 46 normalized rows.

## V1 fields

- facility/source name,
- industrial subsector,
- asset type,
- source type,
- latitude / longitude,
- owner names and owner IDs where available,
- capacity and capacity units,
- 2025 activity and activity units,
- capacity factor,
- 2025 CO2e emissions,
- emissions factor and units,
- 2025 subsector rank,
- emissions/activity/capacity confidence,
- source URL,
- source license,
- attribution,
- retrieval timestamp.

## Explicit exclusions

- No records copied from industry.com.sa.
- No redistribution of the mixed-source Numwan research workbook.
- No invented phone, email, commercial registration, HS code, owner or city value.
- No claim that V1 is a census of all Saudi factories.
- Capacity values with unlike units are not aggregated into a single headline number.

## Delivery

Current delivery gate: **READY**.

Entitlement-protected deliverables are generated on demand:
1. Master Dataset — XLSX.
2. Master Dataset — CSV.
3. Data Dictionary — CSV.
4. Source & Rights Register — CSV.
5. Release Notes / coverage statement.
6. Buyer Guide.

A representative free CSV sample becomes available only when the product is published.

## Quality gates — current result

Passed:
- 0 duplicate source IDs.
- 0 duplicate normalized facility names.
- 0 missing coordinates.
- 0 coordinates outside the Saudi bounding check.
- 0 missing emissions values.
- 0 missing capacity units when capacity is present.
- 0 trailing punctuation defects after normalization.
- every commercial row traces to the INCLUDED source.

## Positioning

Arabic:
"خريطة بيانات موثقة للصناعات الثقيلة السعودية — جاهزة للتحليل، وليست مجرد قائمة أسماء."

English:
"Source-traceable Saudi heavy-industry intelligence, structured for analysis and market mapping."

## Remaining release gate

Checkout: **CONFIGURING**.

The product must remain DRAFT until the payment provider, webhook verification, paid-order finalization and entitlement issuance pass end-to-end testing.

## Upgrade path

V1.1:
- sector packs,
- regional views,
- ownership enrichment,
- additional Saudi government open-data enrichment where dataset-level reuse rights are recorded.

V2:
- scheduled updates,
- change tracking,
- API/data subscription if repeat demand is proven.

## Revenue role

The first NUMWAN 20K product exists to prove the full automated loop:

Discovery → Preview → Payment → Entitlement → Secure Download → Repeatable Sale.
