# Nُموان — one-time full-history secret audit

**Date:** 2026-10-10
**Scope:** Gitleaks full reachable Git history (`--all`) using the existing EIMDADAT Secret Scan workflow.

This file introduces no code or configuration changes and contains no credential values. It intentionally triggers the repository's existing full-history audit through a PR whose title includes `[full-history]`. The audit must be judged by the GitHub Actions job results, not by the existence of this file.

No secret values may be pasted into PR discussions, GitHub logs, artifacts or this repository. Any high-confidence historical finding should be triaged privately, with credential revocation and replacement before history cleanup.

**Security approval:** Pending actual successful scanner results.
