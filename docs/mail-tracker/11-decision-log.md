# 11 — Decision Log: Mail Tracker

| Field | Value |
|---|---|
| Document | 11-decision-log.md |
| Version | 1.0 (Approved Baseline) |
| Date | 15 Nov 2026 |
| Status | Approved. Formal record of architectural decisions D1 through D11. |

---

## 1. Overview and Governance

This document records all architectural and operational decisions approved by Urva Gandhi at the conclusion of Phase 1 Discovery on 15 November 2026. Every decision is immutable during Phase 2 and Phase 3 unless formally re-opened with a dated addendum.

---

## 2. Decision Records

### Decision D1: Real-Time Alert Channel
- **Date**: 15 Nov 2026
- **Status**: **APPROVED / LOCKED**
- **Options Considered**:
  - *Option A*: Telegram Bot API sending direct messages to personal chat ID (`6008118995`).
  - *Option B*: Discord Webhook posting cards to a private channel.
- **Chosen Option**: **Option A (Telegram Bot API)**.
- **Rationale**:
  - Reliable mobile push delivery that immediately wakes the device.
  - Supports clean HTML formatting, bold typography and click-through links.
  - Eliminates the security risk of webhook URL exposure (Telegram requires private bot token and chat ID).
- **Configuration**:
  - Bot Handle: `@urva_personal_alerts_bot`
  - Chat ID: `6008118995`
  - Parse Mode: `HTML`
  - Timestamps: Indian Standard Time (`Asia/Kolkata`, UTC+05:30).

---

### Decision D2: Telemetry Datastore
- **Date**: 15 Nov 2026
- **Status**: **APPROVED / LOCKED**
- **Options Considered**:
  - *Option A*: Upstash Redis (Vercel Integration over HTTPS REST).
  - *Option B*: Supabase (PostgreSQL relational database).
- **Chosen Option**: **Option A (Upstash Redis)**.
- **Rationale**:
  - Supabase free tier automatically pauses after 7 consecutive days of inactivity, dropping tracking events if outreach pauses.
  - Upstash Redis free tier offers 256 MB storage, 500,000 monthly commands and **zero auto-pause**.
  - Operates over stateless HTTPS REST (`fetch`), eliminating connection pool overhead in serverless cold starts.

---

### Decision D3: Resume Viewing & Multi-Resume Tailoring Strategy
- **Date**: 15 Nov 2026
- **Status**: **APPROVED / LOCKED**
- **Options Considered**:
  - *Option A1*: HTML container page embedding PDF via native `<object>` tag with fallback direct link, visibility dwell time beacon and custom download button. Zero new npm dependencies.
  - *Option A2*: Custom client-side PDF viewer using `pdfjs-dist` to render pages to HTML canvas.
  - *Option B*: Serve raw PDF directly via 302 redirect / stream (no dwell time or download tracking).
- **Chosen Option**: **Option A1 (Native Embed Container + Deduplicated Redis Cache)**.
- **Rationale & Implementation Details**:
  - Eliminates heavy dependencies (`pdfjs-dist` rejected).
  - Global `X-Frame-Options: DENY` is overridden on `/api/mail/pdf` to `SAMEORIGIN` and `Content-Security-Policy: frame-ancestors 'self'`.
  - Prominent "Open PDF" direct link guarantees mobile access (iOS Safari).
  - Tab visibility duration (`visibilitychange` and `pagehide`) captures active dwell time.
  - Tailored resumes (36–41 KB PDFs) are uploaded as Base64 during pre-registration and cached in Upstash Redis indexed by SHA-256 (`mail:pdf:{sha256}`) with a **180-day TTL**. Multiple recipients at the same company share the same cached binary.
  - Missing or corrupted Redis binaries fall back gracefully to `public/resumes/Urva_Gandhi.pdf`.

---

### Decision D4: Dashboard Route & Access Control
- **Date**: 15 Nov 2026
- **Status**: **APPROVED / LOCKED**
- **Options Considered**:
  - *Option A*: Unified API route `/api/mail/dashboard` returning raw HTML.
  - *Option B*: Dedicated React page at `src/pages/portal/outreach-telemetry.js` reusing portfolio `Layout` and `Seo`.
- **Chosen Option**: **Option B (Dedicated React Page)**.
- **Rationale**:
  - Preserves the portfolio's native Tailwind styling, Lucide icons and dark theme without maintaining separate raw HTML strings.
  - Unauthenticated requests receive an HTTP 404 response.
  - Gated by secret passkey verifying against `DASHBOARD_SECRET_KEY` via constant-time comparison, issuing an `HttpOnly`, `Secure`, `SameSite=Strict` session-only cookie.
  - Excluded from `next-sitemap.config.js` and protected with `X-Robots-Tag: noindex, nofollow, noarchive`.

---

### Decision D5: Tracker URL Namespace
- **Date**: 15 Nov 2026
- **Status**: **APPROVED / LOCKED**
- **Options Considered**:
  - *Option A*: Subordinate all tracking and admin endpoints under `/api/mail/*`.
  - *Option B*: Short top-level paths (e.g. `/t/p`, `/t/l`, `/t/r`).
- **Chosen Option**: **Option A (`/api/mail/*`)**.
- **Rationale**:
  - Requires a single clean allowlist entry in [src/proxy.js](file:///Users/urvagandhi/Developer/Personal/urva-portfolio/src/proxy.js) (`knownApiRoutes`).
  - Eliminates collisions with current and future portfolio page routes.

---

### Decision D6: Script-to-Tracker Integration Pattern
- **Date**: 15 Nov 2026
- **Status**: **APPROVED / LOCKED**
- **Options Considered**:
  - *Pattern 1*: Authenticated server-side pre-registration (`POST /api/mail/register`) with rollback step.
  - *Pattern 2*: Stateless client-side HMAC signed tokens in URL query strings.
- **Chosen Option**: **Pattern 1 (Pre-Registration + Rollback)**.
- **Rationale**:
  - Ensures accurate Open Rate calculations (`opened / sent`).
  - Keeps URLs short and clean (32-character tokens), protecting deliverability.
  - Enables uploading and caching tailored resume binaries in Redis before email dispatch.
  - Associates RFC 822 Message-ID for IMAP label synchronisation.
  - **Rollback Step**: If local SMTP sending fails in `send_outreach.py`, it invokes `POST /api/mail/void` to mark the record voided, excluding it from analytics.

---

### Decision D7: Testing Strategy and Framework
- **Date**: 15 Nov 2026
- **Status**: **APPROVED / LOCKED**
- **Options Considered**:
  - *Option A*: Zero-dependency native Node.js test harness (`scripts/test-mail-tracker.js`).
  - *Option B*: Install Vitest or Jest.
- **Chosen Option**: **Option A (Zero-Dependency Native Harness)**.
- **Rationale**:
  - Matches the existing repository precedent established by [scripts/verify-agent-readiness.js](file:///Users/urvagandhi/Developer/Personal/urva-portfolio/scripts/verify-agent-readiness.js).
  - Zero added devDependencies or build config overhead.

---

### Decision D8: Deployment Workflow
- **Date**: 15 Nov 2026
- **Status**: **APPROVED / LOCKED**
- **Options Considered**:
  - *Option A*: Feature branch `feat/mail-tracker` verified against Vercel Preview Deployments.
  - *Option B*: Direct commits to `main`.
- **Chosen Option**: **Option A (Feature Branch with Previews)**.
- **Rationale**:
  - Prevents untested tracker logic from affecting the live portfolio site.
  - Full end-to-end verification against real Vercel edge infrastructure before production merge.

---

### Decision D9: Scope of Candidate Features
- **Date**: 15 Nov 2026
- **Status**: **APPROVED / LOCKED**
- **Summary**:
  - **Approved (Must)**: Bot/prefetch filtering, self-open exclusion, dashboard auth, dual data retention TTL (60-day telemetry, 180-day PDF), company rollup, recruiter engagement score, link scanner HEAD filter, registration void rollback.
  - **Approved (Should)**: Forwarded-email flagging, IMAP reply detection, token revocation.
  - **Rejected**: Sub-daily Vercel cron reminders (exceeds Hobby limits), heavy client PDF.js viewer, Telegram inline action buttons, quiet hours (24/7 alerts selected).

---

### Decision D10: Retention Periods & Privacy IP Policy
- **Date**: 15 Nov 2026
- **Status**: **APPROVED / LOCKED**
- **Policy**:
  - **Telemetry Keys**: 60-day auto-TTL (`EXPIRE 5184000`).
  - **Tailored PDF Binaries**: 180-day auto-TTL (`EXPIRE 15552000`).
  - **IP Addresses**: Truncated to 3 octets (IPv4) or 3 segments (IPv6) before persistence.

---

### Decision D11: Contact Form Hardening (`src/pages/api/contact.js`)
- **Date**: 15 Nov 2026
- **Status**: **APPROVED / LOCKED**
- **Action**: Apply HTML character escaping (`escapeHtml()`) to unescaped user input variables (`name`, `email`, `subject`, `message`) in [src/pages/api/contact.js](file:///Users/urvagandhi/Developer/Personal/urva-portfolio/src/pages/api/contact.js) during Phase 4 implementation. Zero change to runtime handler architecture.

---

## 3. Operational Requirements & Corrections Log

1. **Domain Expiry & Renewal**:
   - `urvagandhi.tech` expires within one year.
   - Removing the Vercel domain redirect upon expiration does not rescue sent emails because recipient clients query `urvagandhi.tech`.
   - **Requirement**: Renew `urvagandhi.tech` prior to expiry date.
2. **Alert Debouncing**:
   - 5-minute rolling window for `open` events only (same message + client class).
   - Subsequent opens increment Redis counts and append `(+N repeated opens in last 5m)` to the next alert.
   - Link clicks and resume views are never debounced.
3. **Environment Prefixing**:
   - Non-production deployments prefix Redis keys with `preview:`.
   - Separate preview secrets configured in Vercel.
   - Preview Telegram alerts tagged `[PREVIEW]`.
4. **Missing Resume Asset**:
   - Copy `Urva_Gandhi_s_Resume_AI-ML.pdf` from [`Job_Automation/Urva/`](file:///Users/urvagandhi/Documents/Resumes/Job_Automation/Urva) into [`public/resumes/`](file:///Users/urvagandhi/Developer/Personal/urva-portfolio/public/resumes) to ensure the AI track never 404s.
