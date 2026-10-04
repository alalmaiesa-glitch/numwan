# NUMWAN — Payment & Launch Integration Session

Purpose: close the final Product 1 release gate in one focused session.

Current Product 1 gates:
- Rights: CLEARED
- Delivery: READY
- Checkout: CONFIGURING
- Public status: DRAFT

## Information to bring once

### 1. Payment provider / bank
- provider or bank name,
- merchant product name,
- API documentation URL or official integration guide,
- supported payment methods,
- supported currencies,
- sandbox/test environment availability,
- callback / return URL requirements,
- webhook documentation,
- webhook signing / verification method,
- refund API behavior,
- settlement and transaction-fee information if available.

### 2. Merchant configuration
Non-secret identifiers may be reviewed in the session:
- merchant / profile identifier,
- environment names,
- public integration identifier if the provider uses one.

Secrets must NOT be pasted into chat. Configure secret API keys, private keys and webhook secrets directly in secure Vercel environment variables.

### 3. Seller / invoice identity
Confirm the exact public seller identity that must appear on checkout, invoice and legal pages:
- legal trading name,
- commercial registration / entity details if applicable,
- VAT registration details if applicable,
- support/contact email,
- billing address or required statutory contact information.

### 4. Product commercial license
Confirm launch policy for:
- individual / Standard license scope,
- number of permitted users,
- internal business use,
- redistribution prohibition or conditions,
- derivative-work rules,
- source-attribution obligations inherited from included sources,
- refund policy for digital delivery,
- update entitlement for V1 purchases.

### 5. Final end-to-end test
The release gate becomes READY only after:
1. sandbox checkout starts,
2. provider confirms payment,
3. webhook signature is verified,
4. order becomes PAID,
5. entitlement is issued exactly once,
6. product appears in Purchases,
7. XLSX and CSV downloads work,
8. download is audited,
9. failed payment does not grant access,
10. refund revokes access,
11. production secrets are configured server-side,
12. seller/license/refund pages are linked from checkout.

Only then:
- checkout_status → READY
- product status → PUBLISHED
- free sample activates
- sitemap includes the product
- search / AI structured data becomes discoverable.
