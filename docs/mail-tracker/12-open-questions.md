# 12 — Open Decisions & Roadmap Register: Mail Tracker

| Field | Value |
|---|---|
| Document | 12-open-questions.md |
| Version | 1.0 (Approved Baseline) |
| Date | 15 Nov 2026 |
| Status | Approved. Tracks resolved decisions and non-blocking operational considerations. |

---

## 1. Resolved Decisions Register (Locked at Phase 1 Approval)

All core technical decisions from Phase 1 Discovery have been decided by Urva Gandhi and locked in `11-decision-log.md`:

| Decision ID | Topic | Resolution | Status |
|---|---|---|---|
| **D1** | Alert Channel | Telegram Bot API (`@urva_personal_alerts_bot`, chat `6008118995`). HTML parse mode in IST. | **RESOLVED & LOCKED** |
| **D2** | Datastore | Upstash Redis (Vercel Integration over HTTPS REST). 256 MB free tier, zero auto-pause. | **RESOLVED & LOCKED** |
| **D3** | Resume Serving | Option A1 (Native embed `<object>`, zero dependencies, `X-Frame-Options: SAMEORIGIN` override, "Open PDF" direct link, tab dwell time beacon, custom download tracking). Company-tailored PDFs deduplicated by SHA-256 in Redis (180-day TTL) with static local fallback. | **RESOLVED & LOCKED** |
| **D4** | Dashboard Access | Dedicated React page at `src/pages/portal/outreach-telemetry.js` (`Layout`, `Seo(noindex)`). 404 for unauthenticated visitors. Gated by secret passkey issuing an HttpOnly Secure SameSite=Strict session cookie. | **RESOLVED & LOCKED** |
| **D5** | Tracker Namespace | All public tracking, administrative registration, status sync and reporting routes consolidated under `/api/mail/*`. | **RESOLVED & LOCKED** |
| **D6** | Integration Pattern | Pattern 1: Authenticated pre-registration (`POST /api/mail/register`) with `POST /api/mail/void` rollback step if local SMTP dispatch fails in `send_outreach.py`. | **RESOLVED & LOCKED** |
| **D7** | Testing Strategy | Zero-dependency native Node.js test runner (`scripts/test-mail-tracker.js`) matching existing repository precedent. | **RESOLVED & LOCKED** |
| **D8** | Deployment Workflow | Feature branch `feat/mail-tracker` verified against Vercel Preview Deployments before merging to `main`. | **RESOLVED & LOCKED** |
| **D9** | Candidate Features | Approved: bot/prefetch heuristics, self-open exclusion, dashboard auth, dual TTL, company rollup, engagement scoring, link scanner HEAD filter, registration void rollback. Rejected: sub-daily cron, PDF.js, Telegram inline buttons, quiet hours. | **RESOLVED & LOCKED** |
| **D10** | Retention & Privacy | 60-day auto-TTL on telemetry keys, 180-day auto-TTL on cached PDF binaries. IPv4 truncated to 3 octets (`192.168.1.xxx`). Zero persistent recipient cookies. | **RESOLVED & LOCKED** |
| **D11** | Contact Form Hardening | Sanitize unescaped template parameters in `src/pages/api/contact.js` using `escapeHtml()`. | **RESOLVED & LOCKED** |

---

## 2. Non-Blocking Operational Considerations

The following items are operational preferences that do not block Phase 2 or Phase 3 architecture:

### OP-01: Exact Domain Expiry Date for `urvagandhi.tech`
- **Context**: Tracked links embedded in sent emails rely on `urvagandhi.tech`. The domain was purchased for 1 year.
- **Action**: Owner should note the exact expiration date in personal calendar to execute renewal at least 30 days prior to lapse.

### OP-02: Gmail Status Label Strings
- **Context**: `send_outreach.py` applies labels via IMAP.
- **Current Defaults**: `"✓✓ Opened"` and `"✓ Viewed Resume"`.
- **Alternative**: Cleaner labels without unicode checkmarks: `"Opened"` and `"Resume Viewed"`.
- **Recommendation**: Retain `"✓✓ Opened"` and `"✓ Viewed Resume"` as they provide immediate visual status within Gmail thread lists.

### OP-03: Secondary Project Repositories in Email Copy
- **Status**: **RESOLVED & LOCKED (Confirmed by Urva)**.
- **Context**: Analysis of `send_outreach.py` identified GitHub repository links for `cointrack`, `Odoo-Hackathon-26`, `TBD` and `RWEsearch-Hackathon` alongside live demo deployments.
- **Action**: All 10 repository and showcase slugs (`cointrack`, `cointrack-github`, `fleetflow`, `paperpal`, `odoo-github`, `tbd-github`, `rwesearch-github`, `portfolio`, `github`, `linkedin`) are mandatory and locked in `src/lib/mail/allowlist.js` so every repository link click is captured in telemetry.
