# Asset Transition & Operational Workflow V1

Status: **Foundation implemented — transition action intentionally gated**  
Date: 2026-09-30

## Implemented

- Added `assets.source_idea_id` as an explicit provenance link back to the Vault/Lab opportunity.
- The link uses `ON DELETE RESTRICT` so an opportunity cannot be deleted while an asset still depends on it.
- Asset INSERT/UPDATE RLS now permits a non-null `source_idea_id` only when the authenticated user owns that opportunity.
- Added automatic audit events:
  - `ASSET_CREATED`
  - `ASSET_STATUS_CHANGED`
- Audit logging is performed by a private security-definer trigger and is not client-executable.
- Existing asset lifecycle and disclosure constraints are unchanged.
- No public publication policy was changed.
- No commercial fields, pricing logic, scoring logic, or deal semantics were introduced.

## Intentionally not implemented yet

The actual “convert opportunity to asset” action remains disabled until the approved V1 rules resolve:

1. Which asset lifecycle status must be assigned at the exact moment an opportunity leaves the Lab.
2. Which role/authority is allowed to approve that transition.

These are business/workflow decisions and are not inferred from the database lifecycle names.

## Acceptance checks

- `source_idea_id` exists and is indexed.
- Asset ownership RLS also validates source-opportunity ownership.
- Asset insert/status-change audit trigger exists.
- Security Advisor has no new High/Critical findings introduced by this migration.
- Existing production test opportunity remains unchanged.
