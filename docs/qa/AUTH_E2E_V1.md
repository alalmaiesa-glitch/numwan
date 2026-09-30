# Authentication & End-to-End V1

Status: PASSED
Date: 2026-09-30

## Verified production flow

1. Protected route requested while signed out.
2. Redirect to /login with a safe `next` path.
3. Email/password authentication against the Numwan Supabase project.
4. Return to the originally requested protected route.
5. Vault loaded under the authenticated session.
6. A test opportunity was created successfully.
7. Vault redirected to the Lab for the created opportunity.
8. A hypothesis was created successfully.
9. Evidence was created and linked to the hypothesis.
10. An experiment was created and linked to the hypothesis.
11. Logout returned the user to /login.
12. Browser Back after logout did not reopen the protected workspace.
13. Login again returned successfully to the dashboard.

## Database verification

- Auth user exists and is confirmed.
- Profile trigger created the matching profile.
- Idea persistence verified.
- Hypothesis persistence verified.
- Evidence persistence verified.
- Experiment persistence verified.
- RLS policies remain enabled for the V1 application tables.

## Regression coverage

Automated Playwright coverage verifies:
- Public homepage availability.
- Redirect protection for /dashboard.
- Redirect protection for /vault.
- Redirect protection for /assets.
- Redirect protection for /deals.
- Authenticated browser test is enabled when NUMWAN_E2E_EMAIL and NUMWAN_E2E_PASSWORD GitHub secrets are configured.

## Notes

The production test opportunity remains in the database intentionally until cleanup is explicitly approved.
