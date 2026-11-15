# 01 — Project Brief: Mail Tracker

| Field | Value |
|---|---|
| Document | 01-project-brief.md |
| Version | 1.0 (Approved Baseline) |
| Date | 15 Nov 2026 |
| Owner | Urva Gandhi |
| Host repository | https://github.com/urvagandhi/urva-portfolio (branch `feat/mail-tracker`) |
| Status | Approved. Baseline established following Phase 1 approval. |

## 0. Document Governance and Conventions

Statements in this specification suite carry explicit status tags to ensure transparency and traceability:

| Tag | Meaning |
|---|---|
| **STATED** | Explicitly directed by the project owner. Core requirements `R1` through `R8` are owner-defined. |
| **VERIFIED** | Verified against codebase files, live APIs or primary technical documentation. |
| **PROPOSED** | Architectural pattern designed to satisfy a requirement, subject to owner sign-off. |
| **OPEN** | Remaining implementation decisions or non-blocking design choices tracked in `12-open-questions.md`. |

The complete specification suite comprises:
- `01-project-brief.md`: Vision, scope, operational boundaries and project constraints
- `02-prd.md`: Personas, user stories, acceptance criteria and candidate feature classification
- `03-srs.md`: Software Requirements Specification with verifiable `FR-xx`, `NFR-xx` and `SEC-xx` items
- `04-user-flows.md`: Sequence diagrams for registration, delivery, opens, clicks, resume views, alerts and dashboard authentication
- `05-architecture.md`: Component layout, trust boundaries, Pages Router integration, Upstash Redis client and proxy routing
- `06-data-design.md`: Redis key schemas, hashes, sets, deduplicated PDF storage and dual TTL retention rules
- `07-api-spec.md`: Complete OpenAPI specification for all tracking, registration, voiding and reporting routes
- `08-ui-ux.md`: Layout, visual styling and interaction flows for `src/pages/portal/outreach-telemetry.js`
- `09-security.md`: Cryptographic token signing, allowlist constraints, session cookie design and privacy regulations
- `10-testing-strategy.md`: Zero-dependency native Node.js test harness, test matrices and regression gates
- `11-decision-log.md`: Formal record of architectural decisions D1 through D11
- `12-open-questions.md`: Resolved decisions register and non-blocking roadmap considerations

## 1. Problem Statement (STATED)

The owner executes outbound job outreach to engineering recruiters and hiring managers using a local Python engine ([`send_outreach.py`](file:///Users/urvagandhi/Documents/Resumes/Job_Automation/send_outreach.py)), outside the portfolio repository. Following transmission, the owner has zero visibility into recipient engagement. 

Commercial tracking utilities (such as Mailtrack) operate exclusively as browser extensions for the Gmail desktop interface, impose subscription fees (\$12–\$24 monthly), inject recipient-facing branding and rely on third-party tracking domains that degrade deliverability. The owner requires an integrated, self-hosted tracking system embedded directly within the personal portfolio.

## 2. Objective (STATED)

Construct a free, self-hosted email engagement tracker inside the existing Next.js portfolio deployed on Vercel. The system must:

1. Detect and record email opens using a 1×1 transparent GIF with unguessable tokens (R1).
2. Record resume PDF views via an HTML-wrapped viewer while keeping the physical PDF attached for ATS compatibility (R2).
3. Record clicks and execute 302 redirects for project and profile showcase URLs (R3).
4. Dispatch immediate real-time push alerts to the owner's phone via Telegram for every event (R4).
5. Synchronise sent email thread status in Gmail via IMAP using the local outreach engine (R5).
6. Present aggregate analytics on a private, authenticated dashboard within the portfolio (R6).
7. Incur zero recurring infrastructure cost on free tier services (R7).
8. Maintain clean email formatting with zero tracker branding or disclosure footers (R8).

## 3. Users and Operational Roles

| Role | Actor | System Interaction |
|---|---|---|
| Sender / Operator | Urva Gandhi (STATED) | Executes outreach, receives real-time Telegram notifications, reviews engagement on the private dashboard |
| Recruiter / Tracked Subject | Recruiter or Hiring Manager (STATED) | Passive. Mail client or browser loads the pixel, redirect URLs or resume viewer. No authentication or login |
| Cloud Infrastructure | Vercel & Upstash Redis | Hosts Pages Router API functions, serves static assets and persists telemetry records over HTTPS REST |
| Notification Gateway | Telegram Bot API | Dispatches push alerts to the owner's authenticated chat ID |
| Local Client Engine | `send_outreach.py` | Local Python script generating MIME emails, registering outreach metadata and managing Gmail IMAP labels |

Single-tenant architecture. No multi-tenant accounts, external billing or third-party user roles exist.

## 4. Scope Definition

### 4.1 In-Scope Core Capabilities (STATED R1–R8)

- **R1 Email Open Tracking**: Transparent 1×1 GIF89a (42 bytes) with unguessable HMAC token, logging timestamp, sequence count, user agent and IP geo data.
- **R2 Resume PDF Tracking**: Tracked viewer link displaying the resume in browser with tab visibility dwell time and download tracking; physical PDF remains attached.
- **R3 Link Click Redirection**: Safe 302 redirects mapping approved slugs (`cointrack`, `fleetflow`, `paperpal`, `github`, `linkedin`, `portfolio` and repo mirrors) to destinations.
- **R4 Real-Time Push Alerts**: Telegram push notifications to the owner's mobile device formatted in IST with candidate track, recipient, company, event type and open counts.
- **R5 Gmail Visual Status**: IMAP thread labelling (`"✓✓ Opened"`, `"✓ Viewed Resume"`) integrated into `send_outreach.py`.
- **R6 Private Analytics Dashboard**: Authenticated React page (`src/pages/portal/outreach-telemetry.js`) showing aggregate pipeline metrics and an engagement feed.
- **R7 Zero Recurring Cost**: Deployment hosted on Vercel Hobby with Upstash Redis free tier storage.
- **R8 Clean Email Presentation**: No watermarks, tracking badges or marketing footers.

### 4.2 Derived Implementation Requirements (PROPOSED)

- **DN-1 Proxy Route Allowlisting**: Add `/api/mail/*` to `knownApiRoutes` and `/portal` to `isKnownPath` in [src/proxy.js](file:///Users/urvagandhi/Developer/Personal/urva-portfolio/src/proxy.js).
- **DN-2 Privacy Policy Clarification**: Update [src/pages/privacy.js](file:///Users/urvagandhi/Developer/Personal/urva-portfolio/src/pages/privacy.js) and markdown copy in `proxy.js` to detail outbound recruitment communication telemetry while preserving guarantees for regular web visitors.
- **DN-3 Dashboard Session Security**: Protect `/portal/outreach-telemetry` using secret passkey validation, setting an `HttpOnly`, `Secure`, `SameSite=Strict` session cookie. Unauthenticated visitors receive a 404 response.
- **DN-4 Search Engine Protection**: Enforce `X-Robots-Tag: noindex, nofollow, noarchive` on `/portal/*` and exclude the path from [next-sitemap.config.js](file:///Users/urvagandhi/Developer/Personal/urva-portfolio/next-sitemap.config.js).
- **DN-5 Dual Datastore TTL**: 180-day retention for cached tailored resume binaries and 60-day auto-TTL for telemetry records in Upstash Redis.
- **DN-6 SMTP Rollback / Void Step**: Dedicated endpoint `POST /api/mail/void` to invalidate registered tokens if local SMTP transmission encounters an error.

### 4.3 Explicitly Out of Scope

- Outbound email transmission (managed locally by `send_outreach.py`).
- Tracking offline opens of the physical email attachment (technically impossible without recipient callbacks).
- Tracking general website traffic visiting `https://urvagandhi.tech`.
- Client-side PDF rendering using heavy external libraries (`pdfjs-dist` excluded; native `<object>` embed utilised).
- Sub-daily cron execution on Vercel Hobby.

## 5. Technical Constraints

| ID | Constraint | Description | Source |
|---|---|---|---|
| C-1 | Hosting Environment | Vercel Hobby plan, deploying Next.js 16 under Pages Router (`src/pages`). Plain JavaScript (no TypeScript). | [package.json](file:///Users/urvagandhi/Developer/Personal/urva-portfolio/package.json) |
| C-2 | Next.js Architecture | Handlers must follow `export default async function handler(req, res)` with RFC 9457 error formatting. | [src/pages/api/contact.js](file:///Users/urvagandhi/Developer/Personal/urva-portfolio/src/pages/api/contact.js) |
| C-3 | Datastore Limits | Upstash Redis Free Tier: 256 MB storage, 500,000 commands monthly, 10 MB max request size, 100 MB max record size. Zero auto-pause. | Upstash Documentation (VERIFIED) |
| C-4 | Domain & DNS | Primary domain `https://urvagandhi.tech` expires within one year. `urvagandhi-portfolio.vercel.app` redirects to it. | [AGENTS.md](file:///Users/urvagandhi/Developer/Personal/urva-portfolio/AGENTS.md) |
| C-5 | Security Headers | Global `X-Frame-Options: DENY` in `next.config.js` blocks framing. The PDF stream route must override this header to `SAMEORIGIN`. | [next.config.js](file:///Users/urvagandhi/Developer/Personal/urva-portfolio/next.config.js#L53) |
| C-6 | Console Hygiene | Production build strips `console.log` automatically, leaving only `error` and `warn`. | `next.config.js` |
| C-7 | Execution Latency | Serverless functions in Pages Router execute inside AWS Lambda micro-containers. Redis persistence occurs first, followed by Telegram alert dispatch within a strict 1.5-second cap. | Pages Router runtime (VERIFIED) |

## 6. Operational Domain Renewal Requirement

Tracked links embedded in sent emails contain `https://urvagandhi.tech`. Removing the Vercel domain redirect upon domain expiration does not rescue sent emails, because recipient email clients will continue attempting connection to `urvagandhi.tech`. Renewing the domain registration prior to its expiry date is an essential operational requirement to ensure persistent link fidelity.

## 7. Glossary

| Term | Definition |
|---|---|
| **Message Record** | Registered outreach email record containing recipient metadata and state, stored in Redis. |
| **Tracking Token** | Cryptographically signed, unguessable string identifying a specific Message Record. |
| **Telemetry Event** | Logged interaction record (`open`, `link_click`, `resume_view`, `beacon_dwell`). |
| **Tailored Resume** | Company-specific PDF generated locally and cached in Upstash Redis indexed by SHA-256 hash. |
| **Direct Open (Unclassified)** | Open event from a non-proxy client where user agent and IP suggest direct rendering, but human presence is not guaranteed. |
| **Apple MPP** | Apple Mail Privacy Protection; automated proxy prefetch identified by bare `Mozilla/5.0` user agent. |
| **IST** | Indian Standard Time (`Asia/Kolkata`, UTC+05:30). |
