# Deals Operational Workflow V1

Status: **Operational baseline enabled**  
Date: 2026-10-01

## Enabled

- Asset owners can create a deal associated with an asset.
- New deals use the existing database default status: `NEW`.
- Asset owners can add an existing Numwan user to a deal by email.
- Asset owners can remove a participant.
- Participants can read the deal they are explicitly attached to.
- Authorized deal list/detail context exposes only the deal and limited linked-asset context needed by the workflow.
- Material actions are appended to the audit log:
  - `DEAL_CREATED`
  - `DEAL_PARTICIPANT_ADDED`
  - `DEAL_PARTICIPANT_REMOVED`

## Authorization

- Deal creation requires ownership of the linked asset.
- Participant management requires ownership of the deal's linked asset.
- A participant can read only deals they participate in.
- Participants do not gain general ownership or editing rights over the asset.
- Data Room access is not automatically inherited from deal participation. Explicit Data Room grants remain separate.

## Intentionally locked

The approved lifecycle vocabulary remains:

`NEW → QUALIFIED → DATA_ROOM → INTEREST → OFFER → NEGOTIATION → RESERVED → AGREEMENT → SOLD / LICENSED → CLOSED`

However, V1 does not yet encode allowed transition rules, prerequisites, reversal rules, or commercial consequences. Therefore no status-transition buttons or update RPCs are exposed yet.

## Not introduced

No pricing, offer amount, payment, KYC, agreement terms, investment instrument, reservation terms, or commercial fields were invented.
