# Numwan Rights Ledger V1

## Goal

Rights clearance is a release gate, not a checklist item.

Every source used by a commercial Numwan product is registered with:
- publisher,
- source URL,
- license / terms URL,
- rights status,
- commercial-use permission,
- redistribution permission,
- attribution requirements,
- review notes,
- and usage mode inside each product.

## Usage modes

- INCLUDED — data/content is actually part of the commercial deliverable.
- DISCOVERY_ONLY — may help find or validate leads but is never redistributed.
- VALIDATION_ONLY — used only to check a fact.
- REFERENCE_ONLY — legal, methodological or contextual reference.

Only INCLUDED sources affect automated product rights clearance.

## Automatic decision

A product is:
- REVIEW when no INCLUDED source exists or an INCLUDED source has unresolved rights.
- BLOCKED when any INCLUDED source is restricted, blocks commercial use, or blocks redistribution.
- CLEARED when every INCLUDED source is explicitly allowed for commercial use and redistribution.

The product still cannot publish unless Delivery = READY and Checkout = READY.

## Product 1 decision

Saudi Industrial Intelligence — Heavy Industry Map V1 uses Climate TRACE as the first INCLUDED source.

Climate TRACE states its emissions data and metadata are available under CC BY 4.0, including commercial use with attribution, subject to reviewing any separately identified external datasets.

Saudi Open Data License is registered as a framework reference for later government datasets.

industry.com.sa is registered as RESTRICTED / DISCOVERY_ONLY. Its terms prohibit copying, downloading, reproducing or republishing platform information, files and databases without written authorization.

The existing Numwan industrial research workbook is INTERNAL / DISCOVERY_ONLY because it contains mixed-source material.

Therefore the product's rights gate can be CLEARED for its current included source set while Delivery and Checkout remain separate release gates.
