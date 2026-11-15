# 02 — Product Requirements Document (PRD): Mail Tracker

| Field | Value |
|---|---|
| Document | 02-prd.md |
| Version | 1.0 (Approved Baseline) |
| Date | 15 Nov 2026 |
| Status | Approved. Incorporates all Phase 1 decisions and governance rules. |
| Companion | `03-srs.md` provides formal testable specification requirements. |

## 1. Overview

The Mail Tracker is a private, self-hosted recruitment engagement analytics engine integrated into the portfolio repository. It captures telemetry from outbound job outreach emails dispatched via the local Python engine (`send_outreach.py`) to recruiters and hiring managers. It operates under the canonical production domain `https://urvagandhi.tech`, maintaining zero recipient branding and zero recurring infrastructure cost.

## 2. Personas

| Persona ID | Role | Profile | Core Motivations & Needs | Experience Boundaries |
|---|---|---|---|---|
| **P-1** | **Urva Gandhi (Sender & Operator)** | Final-year CS student actively seeking software engineering positions | Needs immediate notification when a recruiter opens an email, clicks project demos or reads the resume. Requires clear signal on recruiter interest to guide timely follow-ups | Sole user of administrative features: receives mobile push alerts, logs into the private analytics portal, inspects engagement metrics |
| **P-2** | **Technical Recruiter / Hiring Lead** | Engineering recruiter or hiring manager receiving outreach | Evaluates candidate viability quickly on desktop or mobile. Reads emails, clicks portfolio links, inspects code repositories and reviews resume PDFs | Passive subject. Must experience zero friction, zero page loading delays, zero tracking watermarks and preserved attachment fidelity |

## 3. Goals and Non-Goals

### 3.1 Product Goals
- **G1 (Fidelity)**: Reliably detect and log email opens, showcase project clicks and resume views without altering email rendering.
- **G2 (Immediacy)**: Transmit real-time push alerts via Telegram within 1.5 seconds of an event, displaying candidate track and recipient details formatted in IST.
- **G3 (Integration)**: Synchronise engagement milestones back into Gmail via IMAP thread labels (`"✓✓ Opened"`, `"✓ Viewed Resume"`).
- **G4 (Privacy & Security)**: Enforce strict access control on analytics data, ensuring unauthenticated visitors receive a 404 response.
- **G5 (Cost Efficiency)**: Operate entirely within the free tiers of Vercel and Upstash Redis.
- **G6 (Multi-Resume Support)**: Dynamically serve company-tailored resumes alongside standard static track resumes.

### 3.2 Non-Goals
- **NG1**: Direct outbound email delivery from the web server (delivery remains strictly with `send_outreach.py`).
- **NG2**: Telemetry on offline opens of physical email attachments (technically impossible without recipient callbacks).
- **NG3**: Unmasking individual human identity behind corporate proxies (Gmail Image Proxy and Apple MPP mask client IPs by design).
- **NG4**: Public visitor tracking (visitors browsing `https://urvagandhi.tech` remain 100% untracked).
- **NG5**: Heavy client-side canvas PDF rendering via third-party libraries (native `<object>` embedding selected).

## 4. User Stories and Functional Acceptance

### US-01: Email Open Tracking (R1)
*As the sender, I want to know when a recruiter opens my outreach message so that I can gauge initial interest.*

- **AC-01.1**: When the email client fetches the tracking URL `/api/mail/pixel?t=<token>`, the server validates the cryptographic token and records an `open` event in Upstash Redis before concluding the response.
- **AC-01.2**: The HTTP response returns a 42-byte transparent GIF89a (`image/gif`) with strict cache-invalidation headers (`Cache-Control: no-store, no-cache, must-revalidate, max-age=0`).
- **AC-01.3**: The open event captures timestamp, incremental sequence count (1st open, 2nd open), raw user agent, derived client category and country/region derived from Vercel edge headers.
- **AC-01.4**: If the user agent indicates Apple Mail Privacy Protection (bare `Mozilla/5.0`), the event is tagged `[⚠️ Probable Apple MPP Prefetch]`. If the request originates from Google Image Proxy (`GoogleImageProxy`), it is tagged `[Gmail Proxy Open]`. All other direct opens are labelled `[Direct Open (Unclassified)]`.
- **AC-01.5**: If the token is invalid or missing, the server returns the identical 42-byte GIF without logging an event or throwing an error (fail-open).

### US-02: Resume PDF Tracking (R2)
*As the sender, I want to know when a recruiter reviews my resume online, while preserving physical PDF attachment for ATS processing.*

- **AC-02.1**: Outreach emails contain a tracked call-to-action: `"View Resume (PDF)"` pointing to `https://urvagandhi.tech/api/mail/doc?t=<token>`.
- **AC-02.2**: The route renders a fast HTML container embedding the PDF binary stream (`/api/mail/pdf?t=<token>`) via a native `<object>` element.
- **AC-02.3**: To overcome global `X-Frame-Options: DENY` constraints, the endpoint `/api/mail/pdf` explicitly overrides security headers with `X-Frame-Options: SAMEORIGIN` and `Content-Security-Policy: frame-ancestors 'self'`.
- **AC-02.4**: A prominent "Open PDF" direct link is provided to guarantee immediate mobile access (particularly on iOS Safari where `<object>` rendering is restricted).
- **AC-02.5**: Client-side JavaScript dispatches an engagement beacon to `/api/mail/beacon` tracking tab-visible dwell time (`visibilitychange` and `pagehide` events).
- **AC-02.6**: Clicks on the container's custom "Download PDF" button dispatch a download telemetry event. The browser's native PDF plugin toolbar download button remains untrackable.

### US-03: Showcase Link Tracking (R3)
*As the sender, I want to know which project demos and profiles a recruiter explores.*

- **AC-03.1**: When a recruiter clicks a wrapped link (`/api/mail/link?t=<token>&slug=<slug>`), the server logs a `link_click` event with the slug identifier.
- **AC-03.2**: The server responds immediately with an HTTP 302 redirect pointing to the allowlisted destination URL.
- **AC-03.3**: The slug allowlist is strictly restricted to verified destinations:
  - `cointrack` -> `https://cointrack-finance.vercel.app/`
  - `cointrack_gh` -> `https://github.com/urvagandhi/cointrack`
  - `fleetflow` -> `https://fleet-flow-jade.vercel.app/`
  - `fleetflow_gh` -> `https://github.com/urvagandhi/Odoo-Hackathon-26`
  - `paperpal` -> `https://paper-pal-gules.vercel.app/`
  - `paperpal_gh` -> `https://github.com/urvagandhi/TBD`
  - `rwesearch_gh` -> `https://github.com/urvagandhi/RWEsearch-Hackathon`
  - `github` -> `https://github.com/urvagandhi`
  - `linkedin` -> `https://www.linkedin.com/in/urva-gandhi/`
  - `portfolio` -> `https://urvagandhi-portfolio.vercel.app/`
- **AC-03.4**: Arbitrary URL parameters (`?to=http://...`) are discarded to eliminate open redirect vulnerabilities.

### US-04: Real-Time Mobile Push Alerts (R4)
*As the sender, I want immediate phone alerts on Telegram whenever a recruiter interacts with my outreach.*

- **AC-04.1**: For every valid engagement event, the system dispatches an alert to the owner's Telegram chat ID via the Telegram Bot API.
- **AC-04.2**: Alerts are formatted using HTML parse mode, displaying candidate name, track (`Java Backend`, `AI/ML`, `SWE`), recipient email, company name, interaction type, sequence count, client classification and timestamp in IST.
- **AC-04.3**: **Debounce Rule**: Multiple `open` events for the same message and client class within a 5-minute rolling window are stored in Redis but debounced in Telegram, alerting on the initial trigger and aggregating rapid reloads (`"+N more"`).
- **AC-04.4**: **Zero Debounce on Intent**: `link_click` and `resume_view` events are never debounced and trigger immediate notifications on every occurrence.

### US-05: Gmail Thread Status Labelling (R5)
*As the sender, I want sent email threads in Gmail automatically tagged based on outreach status.*

- **AC-05.1**: `send_outreach.py` invokes `GET /api/mail/status` with Bearer secret authentication.
- **AC-05.2**: The endpoint returns a JSON mapping of RFC 822 `Message-ID` values to current engagement status (`sent`, `opened`, `resume_viewed`, `clicked`).
- **AC-05.3**: The local IMAP engine inspects `[Gmail]/Sent Mail` and applies labels via `+X-GM-LABELS`:
  - `resume_viewed` -> `"✓ Viewed Resume"`
  - `opened` -> `"✓✓ Opened"`

### US-06: Private Analytics Dashboard (R6)
*As the sender, I want a private, secure analytics interface to review aggregate metrics and recruiter engagement feeds.*

- **AC-06.1**: The dashboard resides at `src/pages/portal/outreach-telemetry.js` within the portfolio application, reusing the shared `Layout` component and dark design tokens.
- **AC-06.2**: Access requires submitting a secret passkey matching `DASHBOARD_SECRET_KEY`. Successful validation sets an `HttpOnly`, `Secure`, `SameSite=Strict` session cookie.
- **AC-06.3**: Unauthenticated visitors or automated crawlers accessing `/portal/outreach-telemetry` receive an HTTP 404 response.
- **AC-06.4**: The dashboard displays pipeline summary cards: Total Sent, Verified Opens, Open Rate %, Resume Views, Project Click Leaderboard, Company-Level Rollups and an active Recruiter Interaction Feed with engagement scoring.

### US-07: Outreach Pre-Registration & SMTP Void Step (D6)
*As the sender, I want pre-registration of tracking metadata with rollback protection if local SMTP dispatch fails.*

- **AC-07.1**: Before dispatching an email, `send_outreach.py` calls `POST /api/mail/register` with Bearer auth, passing recipient email, name, company, track, custom `Message-ID` and optional tailored PDF Base64.
- **AC-07.2**: The server registers the record in Redis with status `registered` and returns the generated tracking URLs.
- **AC-07.3**: If the local SMTP connection fails, `send_outreach.py` calls `POST /api/mail/void` to mark the record as voided, preventing phantom sent counts.

### US-08: Deduplicated Tailored Resume Caching (D3)
*As the sender, I want company-tailored resumes served dynamically without bloating datastore storage.*

- **AC-08.1**: When a tailored resume Base64 payload is received during registration, the server computes its SHA-256 hash and stores the binary buffer under `mail:pdf:{sha256}` with a 180-day TTL.
- **AC-08.2**: Multiple outreach messages sent to different recruiters at the same company reference the same cached binary key, eliminating redundant uploads.
- **AC-08.3**: When `/api/mail/pdf?t=<token>` is requested, the server retrieves the binary from Redis and streams it with `Content-Type: application/pdf`. If absent, it logs a warning and serves the static fallback `public/resumes/Urva_Gandhi.pdf`.

## 5. Candidate Features Evaluation

The candidate features requested during discovery are classified below in accordance with approved architectural decisions:

| Feature ID | Candidate Feature | Status | Implementation Decision & Requirement Trace |
|---|---|---|---|
| **CF-01** | Bot / Prefetch Heuristics | **Approved (Must)** | Classifies events into `Apple MPP Prefetch`, `Gmail Proxy Open` and `Direct Open (Unclassified)` (R1, R4). |
| **CF-02** | Self-Open Exclusion | **Approved (Must)** | Bypasses logging and alerts when the sender tests URLs using a dedicated administrative query parameter or session cookie (R1). |
| **CF-03** | Dashboard Authentication | **Approved (Must)** | Password gate on `/portal/outreach-telemetry` issuing an HttpOnly session cookie (R6). |
| **CF-04** | Dual Data Retention Auto-TTL | **Approved (Must)** | Enforces 60-day auto-TTL on telemetry keys and 180-day auto-TTL on cached PDF binaries (R7, C-3). |
| **CF-05** | Company-Level Rollup | **Approved (Must)** | Aggregates views and clicks by company domain across recruiters on the dashboard (R6). |
| **CF-06** | Per-Recruiter Engagement Score | **Approved (Must)** | Algorithmic score (`Open=1`, `Click=3`, `Resume View=5`) displayed in the recruiter engagement feed (R6). |
| **CF-07** | Link Scanners HEAD Filter | **Approved (Must)** | Rejects automated `HEAD` requests on tracking endpoints without logging false clicks (R3). |
| **CF-08** | Registration Void / Rollback | **Approved (Must)** | Provides `POST /api/mail/void` to ensure failed local SMTP dispatches do not inflate sent metrics (D6). |
| **CF-09** | Forwarded-Email Flagging | **Approved (Should)** | Flags opens occurring from distinct geographic regions or user agents after the initial event (R1). |
| **CF-10** | IMAP Reply Detection | **Approved (Should)** | Extends `send_outreach.py` IMAP sync to identify incoming replies and advance thread status to `Replied` (R5). |
| **CF-11** | Expiring / Revocable Tokens | **Approved (Should)** | Supports invalidating specific tokens via dashboard action (SEC-04). |
| **CF-12** | Quiet Hours & Digest Mode | **Rejected** | Owner confirmed 24/7 real-time alerts on all engagement events. |
| **CF-13** | Heavy Client PDF.js Viewer | **Rejected** | Owner approved Option A1 native `<object>` embed to avoid adding unapproved dependencies. |
| **CF-14** | Sub-Daily Vercel Cron Reminders | **Rejected** | Vercel Hobby strictly limits cron schedules to once per day. Automated follow-up reminders remain in the local Python script. |
| **CF-15** | Telegram Inline Interactive Buttons | **Rejected** | Requires an inbound public webhook listener and complex conversational state management, exceeding project complexity bounds. |

## 6. Product Acceptance Criteria

The system will be accepted upon satisfying the following verifiable criteria:

| Criteria ID | Verification Condition |
|---|---|
| **PA-01** | Sending a test message records an `open` event, increments sequence counters and dispatches a Telegram alert formatted in IST. |
| **PA-02** | Clicking all 10 allowlisted showcase slugs executes an immediate 302 redirect to correct destinations and logs click metrics. |
| **PA-03** | Clicking the resume link renders the PDF in desktop and mobile browsers, records view dwell time and download button clicks. |
| **PA-04** | A tailored resume uploaded during registration is served byte-for-byte to the recipient; missing keys fall back gracefully to `Urva_Gandhi.pdf`. |
| **PA-05** | Calling `POST /api/mail/void` rolls back a registered message, excluding it from sent counts and open rate calculations. |
| **PA-06** | Accessing `/portal/outreach-telemetry` without an authenticated session cookie yields an HTTP 404 response. |
| **PA-07** | Existing portfolio routes, SEO manifests and machine-readable endpoints pass automated regression tests with zero errors. |
| **PA-08** | Upstash Redis storage consumption remains below 10 MB (<4% of free tier) during standard testing volume. |
