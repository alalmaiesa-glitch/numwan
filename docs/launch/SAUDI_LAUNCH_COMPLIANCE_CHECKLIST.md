# NUMWAN Product 1 — Saudi Launch Compliance Checklist

**Status: WORKING CHECKLIST — some items require owner data**

## Already implemented

- Product description and material coverage limitations.
- Price stored as a defined SAR amount.
- Rights / source register.
- Automated order ledger.
- Payment success / failure / refund states.
- Entitlement issuance and revocation.
- Download audit log.
- Public methodology / snapshot.
- Explicit marketing-consent capture for launch leads.
- Tokenized unsubscribe confirmation workflow; GET does not unsubscribe automatically, and POST marks the lead UNSUBSCRIBED.
- Checkout cannot publish until payment gate is READY.

## Must be confirmed in the single launch session

### Seller identity
- [ ] Legal seller / establishment name.
- [ ] Commercial Registration details applicable to the electronic store.
- [ ] Public business address.
- [ ] Public support/contact email.
- [ ] Required license/permit details, if any apply to the activity.

### Tax
- [ ] Is the seller VAT registered?
- [ ] VAT registration number, if applicable.
- [ ] Whether displayed SAR 349 price is VAT-inclusive or VAT-exclusive.
- [ ] E-invoicing / FATOORAH obligation and current integration phase for this seller.

ZATCA states that e-invoicing is mandatory for VAT-taxable persons and that tax invoice data must be in Arabic; invoices may also be bilingual.

### Contract / checkout disclosure
Before the final purchase action, show:
- [ ] exact product title/version,
- [ ] total price and taxes where applicable,
- [ ] license tier and core permitted-use scope,
- [ ] immediate digital-delivery method,
- [ ] refund/cancellation summary,
- [ ] seller identity/contact,
- [ ] acknowledgement that clicking the final payment action creates the payment obligation.

### Invoice / receipt
After contract:
- [ ] downloadable/savable invoice or receipt,
- [ ] seller identity,
- [ ] product description,
- [ ] contract/order date,
- [ ] total price/tax,
- [ ] payment details,
- [ ] delivery/access details,
- [ ] return/refund summary where applicable.

## Marketing consent

The e-commerce implementing regulations require a means for recipients to stop electronic advertising.

Before first lead email:
- [x] provide a dedicated unsubscribe path per lead,
- [x] set lead status to UNSUBSCRIBED immediately after confirmation,
- [x] retain unsubscribed status for future send filtering,
- [ ] ensure the final email sender appends the per-lead unsubscribe URL to every marketing email.

## Recommended public policies before launch

- [ ] Terms of Sale.
- [ ] Standard Data License.
- [ ] Refund Policy.
- [ ] Privacy Policy.
- [ ] Contact / Complaints channel.

## Sources reviewed

Saudi Ministry of Commerce — E-Commerce Law / guidance:
https://mc.gov.sa/ar/ecc/pages/default.aspx

Saudi E-Commerce Law — Bureau of Experts:
https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/360de590-0286-4fa5-a243-aa9100c31979/1

ZATCA — What is E-Invoicing:
https://zatca.gov.sa/ar/E-Invoicing/Introduction/Pages/What-is-e-invoicing.aspx

ZATCA — E-Invoicing FAQ:
https://zatca.gov.sa/ar/E-Invoicing/Introduction/FAQ/Pages/default.aspx
