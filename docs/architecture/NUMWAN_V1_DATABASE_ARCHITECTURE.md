# Numwan V1 — Database & System Architecture Baseline

Status: **Architecture baseline — pre-migration**  
Project: `xtoernoovaaflszdutnj`  
Repository: `alalmaiesa-glitch/numwan`

## Purpose

This document establishes the safe database baseline for Numwan V1 before the first production migration. It intentionally separates identity, assets, controlled document access, deal workflow, and immutable audit history.

## Design principles

1. Supabase Auth is the source of identity; application profile data lives in `public.profiles`.
2. Authorization is deny-by-default through Row Level Security (RLS).
3. Administrative privileges are represented explicitly and never inferred from client input.
4. Asset publication is separate from asset drafting.
5. Data Room files are private objects; database records govern who may discover/access them.
6. Deal workflow is explicit and auditable.
7. Security-sensitive actions append to an audit log rather than overwrite history.
8. V1 migrations must be additive and reversible where practical; no destructive migration without explicit approval.

## Core V1 domains

### Identity

- `profiles`: one application profile per `auth.users` identity.
- `user_roles`: role assignments. Initial role vocabulary should be kept minimal and expanded only when a product requirement needs it.

### Assets

- `assets`: canonical investment/development asset record, with lifecycle state separated from descriptive content.
- `asset_members`: explicit user-to-asset access/ownership relationship for non-public management.

### Data Room

- `data_room_documents`: metadata for private documents stored in a private Supabase Storage bucket.
- `data_room_access`: explicit grants where access cannot be derived from asset membership or deal participation.

### Deals

- `deals`: transaction/opportunity workflow associated with an asset.
- `deal_participants`: explicit parties/users participating in a deal.

### Governance

- `audit_events`: append-only security/business audit trail for material state changes and privileged actions.

## Relationship map

```text
auth.users
   │
   └── profiles
        ├── user_roles
        ├── asset_members ── assets ── data_room_documents
        │                       │
        │                       └── deals ── deal_participants
        │                                   │
        └───────────────────────────────────┘

assets / deals / documents / privileged actions ──> audit_events
```

## Lifecycle boundaries

### Asset

Use a constrained lifecycle rather than arbitrary free text. The initial migration should support at least a private drafting state and a publishable state, but the exact business-state vocabulary must remain aligned with the approved Product Specification before exposing workflow UI.

### Deal

The deal table should store a constrained workflow state. Transitions that carry commercial meaning should be written through server-side/RPC logic once the workflow is implemented, with an audit event recorded for each material transition.

## RLS baseline

Every V1 table exposed through the API must have RLS enabled immediately in the migration that creates it.

Baseline rules:

- A user can read/update only their own profile except privileged administration.
- Role assignment is not client-writable.
- Draft assets are visible only to authorized asset members/admins.
- Published asset visibility follows the Product Specification; publication must never implicitly expose private Data Room records.
- Data Room metadata and storage objects require authorized asset/deal access.
- Deal records are visible only to authorized participants, asset owners/managers, and privileged administration.
- Audit events are not client-editable or client-deletable.

## Storage baseline

Create a **private** bucket for V1 Data Room content. Do not use a public bucket. Object paths should be scoped by asset/document identifiers rather than user-supplied display names. Signed URLs should be short-lived and generated only after authorization.

## Migration sequence

1. `0001_core_identity_and_roles`
2. `0002_assets_and_membership`
3. `0003_data_room`
4. `0004_deals_and_participants`
5. `0005_audit_and_security_policies`
6. Storage bucket/policies and application-facing RPCs after schema/RLS verification.

Each migration must enable RLS in the same change that introduces API-visible tables. Security advisors should be checked after each group.

## Decisions deliberately deferred

The baseline does **not** invent commercial terms, pricing, investment instruments, payment flows, KYC rules, deal-state names beyond the minimum required for schema integrity, or public/private publication semantics not already fixed by the Product Specification. Those are business decisions and must not be silently encoded into V1.

## Acceptance criteria before first migration

- Supabase project is reachable and healthy.
- `public` schema contains no pre-existing application tables that could be overwritten.
- Migration history has no pre-existing Numwan migration that could conflict.
- Repository contains this architecture baseline.
- First migration is additive, enables RLS immediately, and introduces no public Storage bucket.

## Current verification

At baseline creation, the target Supabase project's `public` schema was empty and its migration history contained no migrations. This makes an additive first migration safe from application-schema collision. No database mutation was performed as part of this baseline step.
