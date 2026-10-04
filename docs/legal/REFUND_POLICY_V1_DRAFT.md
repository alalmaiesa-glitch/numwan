# NUMWAN — Digital Product Refund Policy V1 (WORKING DRAFT)

**Status: NOT PUBLIC — OWNER / LEGAL REVIEW REQUIRED**

This draft is intentionally consumer-friendly and conservative. It is not a substitute for formal legal review.

## Proposed launch policy

### A. Before first download/access

A purchaser may request cancellation within **7 days** of purchase if no paid product file has been downloaded and no material paid benefit has been consumed.

Proposed Numwan treatment:
- full refund to the original payment method,
- entitlement revoked after refund,
- no administrative deduction by Numwan.

This is simpler and more generous than attempting to calculate cancellation costs.

### B. After first download/access

After a paid downloadable file has been accessed, a change-of-mind refund is generally not offered, to the extent permitted by applicable law.

This does **not** remove mandatory rights relating to defects or non-conformity.

### C. Refund remains available for

- duplicate charge,
- successful payment but entitlement was not issued and Numwan cannot correct it promptly,
- technical defect that materially prevents download/use and Numwan cannot correct it,
- delivered product materially does not match the published description,
- other cases where applicable law requires cancellation or refund.

### D. Payment failure

A failed or abandoned payment must not create an entitlement.

### E. Refund mechanics

When the provider confirms a refund:
1. order status becomes REFUNDED,
2. active entitlement becomes REVOKED,
3. future paid downloads are denied,
4. refund event is retained in the order audit history.

The database workflow already implements this behavior.

### F. Delivery delay

Product 1 is designed for immediate automated entitlement after confirmed payment.

If delivery fails, Numwan should attempt correction immediately. Mandatory rights under Saudi E-Commerce Law remain unaffected, including applicable rights relating to material delivery delay.

### G. Request channel

**Owner input required:** public support email.

The final policy must publish:
- support channel,
- information needed to identify the order,
- expected acknowledgement time,
- refund processing method.

Do not promise a provider settlement timeline until the actual payment provider's refund SLA is known.

## Legal basis reviewed

Saudi E-Commerce Law Article 13 provides a seven-day cancellation right in cases where the consumer has not used or benefited from the product/service, subject to statutory exceptions. It also identifies exceptions for used information software and certain online software downloads while preserving defect/non-conformity protections.

Official law:
https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/360de590-0286-4fa5-a243-aa9100c31979/1

The implementing regulations require pre-contract disclosure of cancellation availability, total price/taxes, payment/delivery terms and related conditions:
https://mc.gov.sa/ar/ecc/pages/default.aspx

## Owner decisions required

- [ ] Support email.
- [ ] Final acknowledgement SLA for refund requests.
- [ ] Confirm full-refund-before-download approach.
- [ ] Confirm whether business customers under negotiated licenses receive separate refund terms.
