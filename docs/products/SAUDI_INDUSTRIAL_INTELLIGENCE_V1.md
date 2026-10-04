# Saudi Industrial Intelligence — V1

Status: **Internal product build**
SKU: **NW-DATA-SA-IND-001**
Public status: **DRAFT**
Initial price hypothesis: **SAR 349**
Primary market: Saudi Arabia / GCC / international companies researching Saudi industry

## Product promise

A clean, structured and source-traceable industrial intelligence dataset that helps buyers discover and segment Saudi industrial establishments without rebuilding the research from scratch.

This is not a resale of a third-party directory.

## Rights rule

The commercial deliverable must be rebuilt from:
- Saudi government open data,
- sources whose licenses explicitly permit reuse,
- first-party information published by establishments,
- and original Numwan enrichment.

Restricted private-directory content may be used only as a discovery lead where legally appropriate. It must not be copied into the commercial deliverable unless reuse permission exists.

No product can be published while rights status is not CLEARED.

## V1 deliverables

1. Main dataset — XLSX.
2. Machine-readable dataset — CSV.
3. Data dictionary.
4. Source register with source URL / license basis / retrieval date.
5. Release notes and coverage statement.
6. Buyer guide explaining filters and fields.

## Target fields

- establishment_name_ar
- establishment_name_en (when verified)
- commercial_registration (when reusable and verified)
- region
- city
- industrial_activity
- sector
- products
- hs_codes
- website
- public_email
- public_phone
- source_url
- source_type
- source_license
- verified_at
- confidence
- notes

Not every row must contain every field. Missing data must remain missing rather than inferred.

## Quality gates

- No duplicated establishment identity after normalization.
- Every commercial row has at least one source.
- Every source has an explicit reuse basis.
- Source dates are stored.
- No fabricated email, phone, product, HS code, location, or company identity.
- Coverage limitations are stated on the product page.
- Sample rows are separated from the paid file and contain no restricted fields.

## Initial positioning

Arabic:
"بيانات صناعية سعودية منظمة، موثقة المصدر، وجاهزة للبحث والتحليل بدل البدء من الصفر."

English:
"Source-traceable Saudi industrial intelligence, structured for research, sourcing and market-entry work."

## Upgrade path

V1: one-time licensed download.

V1.1:
- regional filters,
- sector packs,
- buyer/supplier discovery views.

V2:
- update subscription,
- change tracking,
- API/data access if recurring demand is proven.

## Revenue role

This product is the first NUMWAN 20K validation product. Its job is not to maximize catalog size. Its job is to prove:

Discovery → Product page → Payment → Automated entitlement → Download → Repeatable sale.
