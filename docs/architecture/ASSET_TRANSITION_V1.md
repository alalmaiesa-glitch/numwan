# Asset Transition & Operational Workflow V1

Status: **Operational transition enabled**  
Date: 2026-09-30

## Approved V1 decisions

- The asset lifecycle status at conversion is `DEVELOPMENT`.
- The opportunity owner is the only actor allowed to perform the V1 conversion.
- Conversion does not publish the asset publicly.

## Implemented

- `assets.source_idea_id` preserves provenance back to the Vault/Lab opportunity.
- Source links use `ON DELETE RESTRICT`.
- Asset INSERT/UPDATE RLS validates source-opportunity ownership.
- One opportunity can produce at most one asset through a partial unique index.
- `public.convert_idea_to_asset_v1(uuid)` is the single operational conversion RPC.
- The RPC requires an authenticated owner, locks the source opportunity during conversion, is idempotent, and creates the asset in `DEVELOPMENT`.
- Asset title, summary, disclosure level, and owner are derived from the source opportunity.
- Lab data is retained; no hypotheses, evidence, or experiments are deleted or copied into invented asset fields.
- Automatic audit events remain active:
  - `ASSET_CREATED`
  - `ASSET_STATUS_CHANGED`
- The Lab UI exposes the conversion action and redirects to the resulting asset.
- If the opportunity has already been converted, the Lab shows a link to the existing asset instead of another conversion action.

## Explicitly unchanged / deferred

- Public publication semantics remain unchanged.
- Risks, Score, and Decision remain locked until their exact approved rules are recovered or supplied.
- Asset-code generation remains unchanged; conversion does not invent a code-generation rule.
- No pricing, commercial terms, investment instruments, KYC, or payment logic is introduced.
