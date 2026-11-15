# 03 — Software Requirements Specification (SRS): Mail Tracker

| Field | Value |
|---|---|
| Document | 03-srs.md |
| Version | 1.0 (Approved Baseline) |
| Date | 15 Nov 2026 |
| Status | Approved. Formal testable requirements traceable to R1–R8 and approved decisions. |
| Conventions | "shall" = mandatory verifiable requirement. "shall not" = strict prohibition. |

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the functional, interface, performance, security and data requirements for the Mail Tracker system within the `urva-portfolio` repository.

### 1.2 System Scope
The Mail Tracker comprises:
1. Public tracking endpoints under `/api/mail/*` handling open beacons, link redirection, resume document embedding and telemetry beacons.
2. Administrative endpoints under `/api/mail/*` handling outreach pre-registration, registration voiding, IMAP status sync and dashboard session authentication.
3. A private React dashboard at `src/pages/portal/outreach-telemetry.js`.
4. Integration interfaces used by the local Python outreach client ([`send_outreach.py`](file:///Users/urvagandhi/Documents/Resumes/Job_Automation/send_outreach.py)).

---

## 2. Functional Requirements

### 2.1 Email Open Tracking (R1)

- **FR-01**: The system shall provide an HTTP endpoint at `GET /api/mail/pixel?t=<token>`.
- **FR-02**: The endpoint shall validate the cryptographic integrity of `<token>` using HMAC-SHA256 signature verification.
- **FR-03**: Upon receiving a valid token, the system shall record an `open` event in Upstash Redis prior to completing the HTTP response.
- **FR-04**: The system shall return a 42-byte transparent GIF89a image with HTTP status `200 OK` and `Content-Type: image/gif`.
- **FR-05**: The endpoint shall emit HTTP response headers:
  `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0`
  `Pragma: no-cache`
  `Expires: 0`
- **FR-06**: The system shall extract and record: UTC timestamp, incremental sequence count (`opens = n`), raw `User-Agent`, country, region and city derived from Vercel edge headers (`x-vercel-ip-country`, `x-vercel-ip-country-region`, `x-vercel-ip-city`), and truncated client IP address.
- **FR-07 (Client Classification)**:
  - If the `User-Agent` equals the bare string `Mozilla/5.0` (with no operating system or browser version tokens), the system shall classify the event as `apple_mpp`.
  - If the `User-Agent` contains `GoogleImageProxy`, the system shall classify the event as `gmail_proxy`.
  - Otherwise, the system shall classify the event as `direct_unclassified`.
- **FR-08 (Fail-Open)**: If `<token>` is missing, invalid or expired, or if Upstash Redis is unreachable, the system shall still return the 42-byte transparent GIF with HTTP status 200 without raising an error.

### 2.2 Resume PDF Tracking & Serving (R2, D3)

- **FR-10**: The system shall provide an HTML document viewer endpoint at `GET /api/mail/doc?t=<token>`.
- **FR-11**: The endpoint shall validate `<token>` and serve a responsive HTML container page styled to match the portfolio dark theme.
- **FR-12 (Native Embedding)**: The HTML container shall embed the PDF stream via an `<object>` tag pointing to `/api/mail/pdf?t=<token>` with fallback text containing an explicit "Open PDF" direct link.
- **FR-13 (Header Override)**: The binary stream endpoint `GET /api/mail/pdf?t=<token>` shall override global security headers by emitting:
  `X-Frame-Options: SAMEORIGIN`
  `Content-Security-Policy: frame-ancestors 'self'`
  `Content-Disposition: inline; filename="Urva_Gandhi_Resume.pdf"`
  `Content-Type: application/pdf`
- **FR-14 (Tailored Binary Retrieval)**:
  - When `/api/mail/pdf` is requested, the system shall query Redis for the tailored resume binary key associated with `<token>`.
  - If present, it shall decode the Base64 payload and stream the raw PDF buffer.
  - If absent or corrupted, it shall log a warning and stream the static fallback file `public/resumes/Urva_Gandhi.pdf`.
- **FR-15 (Telemetry Beacon)**: The system shall provide an endpoint at `POST /api/mail/beacon` accepting JSON payloads containing `{ t, dwell_ms, event }`.
- **FR-16 (Dwell Time Tracking)**: Client-side JavaScript in the container shall measure tab visibility duration using the Page Visibility API (`document.visibilityState === 'visible'`) and dispatch accumulated visible milliseconds to `/api/mail/beacon` upon `visibilitychange` and `pagehide`.
- **FR-17 (Download Tracking Limit)**: The container shall provide a custom "Download PDF" button that dispatches a download telemetry event before triggering the browser download. The browser PDF plugin's internal toolbar download button is untrackable and shall be documented as an explicit boundary limit.

### 2.3 Showcase Link Redirection (R3)

- **FR-20**: The system shall provide a redirection endpoint at `GET /api/mail/link?t=<token>&slug=<slug>`.
- **FR-21**: The system shall validate `<token>` and verify `<slug>` against an immutable server-side allowlist.
- **FR-22 (Allowlist Map)**: The allowlist shall contain exactly:
  1. `cointrack` -> `https://cointrack-finance.vercel.app/`
  2. `cointrack_gh` -> `https://github.com/urvagandhi/cointrack`
  3. `fleetflow` -> `https://fleet-flow-jade.vercel.app/`
  4. `fleetflow_gh` -> `https://github.com/urvagandhi/Odoo-Hackathon-26`
  5. `paperpal` -> `https://paper-pal-gules.vercel.app/`
  6. `paperpal_gh` -> `https://github.com/urvagandhi/TBD`
  7. `rwesearch_gh` -> `https://github.com/urvagandhi/RWEsearch-Hackathon`
  8. `github` -> `https://github.com/urvagandhi`
  9. `linkedin` -> `https://www.linkedin.com/in/urva-gandhi/`
  10. `portfolio` -> `https://urvagandhi-portfolio.vercel.app/`
- **FR-23**: Upon validation, the system shall record a `link_click` event in Redis containing the slug and destination URL.
- **FR-24**: The system shall respond with HTTP status `302 Found` and `Location: <destination_url>`.
- **FR-25 (Open Redirect Immunity)**: Any request parameter attempting to specify a target URL (such as `?to=http://...`) shall be discarded.
- **FR-26 (HEAD Filter)**: If the HTTP request method is `HEAD`, the system shall return `302 Found` without recording an event or dispatching an alert, filtering automated link scanners.

### 2.4 Real-Time Push Alerts (R4, D1)

- **FR-30**: For every verified engagement event, the system shall dispatch an alert message to the owner's Telegram chat via `POST https://api.telegram.org/bot<TOKEN>/sendMessage`.
- **FR-31**: Alerts shall use HTML parse mode and include:
  - Header with event tag: `[Direct Open (Unclassified)]`, `[Gmail Proxy Open]`, `[⚠️ Probable Apple MPP Prefetch]`, `[Link Clicked]` or `[Resume Viewed]`
  - Candidate Name and Track (e.g. `Java Backend`, `AI/ML`, `SWE`)
  - Recruiter Name and Recruiter Email
  - Company Name
  - Event Detail (Slug destination, open sequence number or resume dwell seconds)
  - Client details: User Agent, Country and City
  - Timestamp in Indian Standard Time (`Asia/Kolkata`, formatted `YYYY-MM-DD HH:mm:ss IST`)
- **FR-32 (Debounce Policy)**:
  - For `open` events belonging to the same message and client classification occurring within 300 seconds (5 minutes) of a prior open, the system shall store the event in Redis but suppress immediate notification.
  - The subsequent notification shall include a tag indicating aggregated count: `(+N repeated opens in last 5m)`.
  - The system shall never debounce `link_click` or `resume_view` events.
- **FR-33 (Preview Tagging)**: If the environment variable `VERCEL_ENV` is not `production`, the alert header shall be prefixed with `[PREVIEW]`.

### 2.5 Gmail IMAP Status Synchronisation (R5)

- **FR-40**: The system shall provide an administrative endpoint at `GET /api/mail/status`.
- **FR-41**: The endpoint shall require Bearer token authentication matching `MAIL_API_SECRET`.
- **FR-42**: The endpoint shall return a JSON object mapping registered RFC 822 `Message-ID` strings to their current state:
  `{ "<msg_id>": { "status": "opened" | "resume_viewed" | "clicked" | "sent", "opens": n, "last_event_at": timestamp } }`.
- **FR-43**: The local outreach script ([`send_outreach.py`](file:///Users/urvagandhi/Documents/Resumes/Job_Automation/send_outreach.py)) shall use this payload to search `[Gmail]/Sent Mail` and update thread labels via `imap.store(uid, "+X-GM-LABELS", label)`.

### 2.6 Private Analytics Portal (R6, D4)

- **FR-50**: The system shall serve a private analytics dashboard page at `src/pages/portal/outreach-telemetry.js` accessible via route `/portal/outreach-telemetry`.
- **FR-51**: Unauthenticated requests to `/portal/outreach-telemetry` shall return an HTTP status `404 Not Found` response.
- **FR-52**: The system shall provide an authentication endpoint at `POST /api/mail/auth` verifying a submitted passkey against `DASHBOARD_SECRET_KEY` using constant-time comparison.
- **FR-53**: Upon successful verification, `POST /api/mail/auth` shall set a cookie:
  `Name: outreach_admin_session`
  `HttpOnly: true`
  `Secure: true`
  `SameSite: Strict`
  `Path: /`
  `Max-Age: Session only (deleted upon browser close)`
- **FR-54**: The dashboard shall fetch aggregate telemetry via `GET /api/mail/stats` using the session cookie.
- **FR-55 (Metrics Display)**: The dashboard shall display:
  - Total Outreach Dispatched
  - Verified Recruiter Opens & Open Rate %
  - Resume Views & Average Dwell Time
  - Project Link Click Distribution
  - Company-Level Rollup Table (grouping recruiters and engagement by company domain)
  - Recruiter Engagement Feed sorted by engagement score (`Resume View = 5`, `Link Click = 3`, `Open = 1`)

### 2.7 Outreach Registration and Voiding (D6)

- **FR-60**: The system shall provide an endpoint at `POST /api/mail/register` requiring Bearer authentication matching `MAIL_API_SECRET`.
- **FR-61**: The registration payload shall accept:
  `recipient_email` (required, string)
  `name` (optional, string)
  `company` (required, string)
  `track` (required, string: `generic` | `java` | `ai` | `intern`)
  `custom_msg_id` (required, string, RFC 822 Message-ID generated by client)
  `resume_type` (required, string: `standard` | `tailored`)
  `pdf_base64` (optional, string, Base64-encoded PDF binary)
- **FR-62**: The system shall generate a cryptographically signed tracking token, store the Message Record in Redis with status `registered` and return the set of wrapped URLs and the pixel HTML tag.
- **FR-63 (Void / Rollback Endpoint)**: The system shall provide `POST /api/mail/void` requiring Bearer auth.
- **FR-64**: If local SMTP sending fails in `send_outreach.py`, the script shall call `POST /api/mail/void` passing `{ id: <message_id> }`. The server shall update the record status to `voided`, excluding it from sent counts and analytics calculations.

### 2.8 Deduplicated PDF Storage (D3)

- **FR-70**: When `pdf_base64` is provided during registration, the server shall calculate the SHA-256 hash of the binary buffer.
- **FR-71**: The server shall store the Base64 buffer under key `mail:pdf:{sha256}` in Upstash Redis with a TTL of 180 days (15,552,000 seconds).
- **FR-72**: If the key `mail:pdf:{sha256}` already exists, the server shall skip writing the binary, refreshing only the TTL.
- **FR-73**: The Message Record shall store a reference field `pdf_key: "mail:pdf:{sha256}"`.

---

## 3. Non-Functional Requirements

### 3.1 Performance & Execution Latency
- **NFR-01 (Sequential Persistence Cap)**: On incoming telemetry requests (`/api/mail/pixel`, `/api/mail/link`, `/api/mail/beacon`), the system shall persist the event to Upstash Redis first, then dispatch the Telegram alert promise. The combined execution shall conclude within a strict **1.5-second cap** using `Promise.allSettled`.
- **NFR-02 (Low Redirect Overhead)**: Link redirection (`/api/mail/link`) shall issue HTTP 302 within 250 ms (excluding cold-start initialization).

### 3.2 Reliability & Fail-Open Behavior
- **NFR-03 (Fail-Open Mandate)**: If Upstash Redis or Telegram Bot API is unavailable or returns an error, tracking endpoints shall never return HTTP 5xx to the recruiter. The 1×1 GIF shall return 200 OK, and link redirects shall complete immediately to the destination URL.

### 3.3 Cost and Free Tier Boundaries
- **NFR-04 (Zero Cost)**: The system shall operate with $0 monthly spend on Vercel Hobby and Upstash Redis Free Tier (256 MB storage, 500,000 monthly commands).

### 3.4 Email Presentation & ATS Fidelity
- **NFR-05 (Zero Branding)**: Emails generated by `send_outreach.py` shall carry zero vendor watermarks, tracking disclosures or footer text.
- **NFR-06 (Physical Attachment Fidelity)**: Outbound emails shall retain the physical PDF attachment for ATS compatibility.

---

## 4. Security & Compliance Requirements

- **SEC-01 (Token Entropy & Integrity)**: Tracking tokens shall contain 16 bytes of cryptographically secure random entropy (Hex-encoded) concatenated with an HMAC-SHA256 signature generated using `MAIL_SIGNING_SECRET`.
- **SEC-02 (Open Redirect Prevention)**: All redirect destinations shall be resolved strictly from the server-side allowlist.
- **SEC-03 (Secrets Hygiene)**: All API keys, Redis tokens and Telegram secrets shall be stored exclusively in Vercel Environment Variables. Production builds shall not bundle secret keys into client code.
- **SEC-04 (Search Engine Cloaking)**: The dashboard path `/portal/outreach-telemetry` shall emit `X-Robots-Tag: noindex, nofollow, noarchive` and shall be excluded from `sitemap.xml`.
- **SEC-05 (Data Minimisation & Auto-TTL)**: Telemetry records and IP logs shall automatically expire in Redis after 60 days (5,184,000 seconds). Tailored PDF binaries shall expire after 180 days. Client IPv4 addresses shall be truncated to three octets (e.g. `192.168.1.xxx`) before storage.
- **SEC-06 (Frame Header Isolation)**: The endpoint `/api/mail/pdf` shall restrict framing to same-origin contexts via `X-Frame-Options: SAMEORIGIN` and `Content-Security-Policy: frame-ancestors 'self'`.
