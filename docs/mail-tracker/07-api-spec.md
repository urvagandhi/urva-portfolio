# 07 — API Specification: Mail Tracker

| Field | Value |
|---|---|
| Document | 07-api-spec.md |
| Version | 1.0 (Approved Baseline) |
| Date | 15 Nov 2026 |
| Status | Approved. Formal endpoint definitions, parameters, response formats and error schemas. |
| Standard | REST over HTTPS with RFC 9457 `application/problem+json` error responses. |

---

## 1. Global API Conventions

### 1.1 Base URL
All routes are mounted relative to `https://urvagandhi.tech/api/mail/`.

### 1.2 Authentication Schemes
1. **Public Tracking Endpoints**: Authenticated via cryptographically signed token `t=<token>` in query string or JSON payload. Fail-open semantics apply to public endpoints.
2. **Client Script Integration**: Protected by HTTP Bearer header matching `MAIL_API_SECRET`:
   `Authorization: Bearer <MAIL_API_SECRET>`
3. **Administrative Dashboard API**: Protected by session cookie `outreach_admin_session` issued upon successful passkey verification.

### 1.3 Standard Error Format (RFC 9457)
Errors return `Content-Type: application/problem+json`:
```json
{
  "type": "https://urvagandhi.tech/docs/errors/invalid-token",
  "title": "Invalid Tracking Token",
  "status": 400,
  "detail": "The tracking token signature failed HMAC verification.",
  "instance": "/api/mail/link"
}
```

---

## 2. Public Tracking Surface

### 2.1 `GET /api/mail/pixel`
Returns a 1×1 transparent GIF to record email open events.

- **Query Parameters**:
  - `t` (string, required): 32-character signed tracking token.
- **Headers Sent by Client**:
  - `User-Agent`: Inspected for classification (`Apple MPP`, `Gmail Proxy`, `Direct Open`).
- **Response**:
  - **Status**: `200 OK` (Always 200; fail-open on invalid token or datastore timeout).
  - **Headers**:
    `Content-Type: image/gif`
    `Content-Length: 42`
    `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0`
    `Pragma: no-cache`
    `Expires: 0`
  - **Body**: 42-byte binary GIF89a:
    `47 49 46 38 39 61 01 00 01 00 80 00 00 00 00 00 00 00 00 21 f9 04 01 00 00 00 00 2c 00 00 00 00 01 00 01 00 00 02 02 44 01 00 3b`

---

### 2.2 `GET /api/mail/link`
Logs project/profile showcase link clicks and executes an immediate HTTP 302 redirect.

- **Query Parameters**:
  - `t` (string, required): 32-character signed tracking token.
  - `slug` (string, required): Identifier matching the server allowlist.
- **Allowlist Values**:
  `cointrack`, `cointrack_gh`, `fleetflow`, `fleetflow_gh`, `paperpal`, `paperpal_gh`, `rwesearch_gh`, `github`, `linkedin`, `portfolio`.
- **Response**:
  - **Status**: `302 Found`
  - **Headers**:
    `Location: <allowlisted_destination_url>`
    `Cache-Control: no-store, private`
- **Error Responses**:
  - **404 Problem Details**: If `slug` is unknown or omitted.

---

### 2.3 `GET /api/mail/doc`
Renders a fast HTML container embedding the PDF stream via native `<object>` tag with dwell time telemetry scripts.

- **Query Parameters**:
  - `t` (string, required): 32-character signed tracking token.
- **Response**:
  - **Status**: `200 OK`
  - **Headers**:
    `Content-Type: text/html; charset=utf-8`
    `Cache-Control: no-store, private`
  - **Body**: HTML document embedding `<object data="/api/mail/pdf?t=<token>" type="application/pdf" width="100%" height="100%">` with an explicit fallback `"Open PDF"` link.

---

### 2.4 `GET /api/mail/pdf`
Streams the raw PDF binary (tailored from Redis or static fallback from `public/resumes/`).

- **Query Parameters**:
  - `t` (string, required): 32-character signed tracking token.
- **Response**:
  - **Status**: `200 OK`
  - **Headers**:
    `Content-Type: application/pdf`
    `Content-Disposition: inline; filename="Urva_Gandhi_Resume.pdf"`
    `X-Frame-Options: SAMEORIGIN`
    `Content-Security-Policy: frame-ancestors 'self'`
    `Cache-Control: public, max-age=86400`
  - **Body**: Binary PDF buffer.

---

### 2.5 `POST /api/mail/beacon`
Receives tab visibility duration and download click beacons from `/api/mail/doc`.

- **Headers**:
  `Content-Type: application/json`
- **Request Body**:
```json
{
  "t": "7f83b165c92e...",
  "event": "resume_view | beacon_dwell | resume_download",
  "dwell_ms": 15000
}
```
- **Response**:
  - **Status**: `204 No Content` (Immediate conclusion; fails open).

---

## 3. Client Engine Integration Surface (`send_outreach.py`)

### 3.1 `POST /api/mail/register`
Pre-registers an outreach message, stores tailored resume binaries if present, and returns tracking URLs.

- **Headers**:
  `Authorization: Bearer <MAIL_API_SECRET>`
  `Content-Type: application/json`
- **Request Body**:
```json
{
  "recipient_email": "recruiter@akamai.com",
  "name": "Sarah Jenkins",
  "company": "Akamai",
  "track": "java",
  "custom_msg_id": "<20261115120000.12345@gmail.com>",
  "resume_type": "tailored",
  "pdf_base64": "JVBERi0xLjUK..."
}
```
- **Response (201 Created)**:
```json
{
  "id": "7f83b165c92e...",
  "token": "7f83b165c92e...hmac_sig",
  "urls": {
    "pixel": "https://urvagandhi.tech/api/mail/pixel?t=...",
    "doc": "https://urvagandhi.tech/api/mail/doc?t=...",
    "pixel_html": "<img src=\"https://urvagandhi.tech/api/mail/pixel?t=...\" width=\"1\" height=\"1\" alt=\"\" style=\"display:none;\" />",
    "links": {
      "cointrack": "https://urvagandhi.tech/api/mail/link?t=...&slug=cointrack",
      "cointrack_gh": "https://urvagandhi.tech/api/mail/link?t=...&slug=cointrack_gh",
      "fleetflow": "https://urvagandhi.tech/api/mail/link?t=...&slug=fleetflow",
      "fleetflow_gh": "https://urvagandhi.tech/api/mail/link?t=...&slug=fleetflow_gh",
      "paperpal": "https://urvagandhi.tech/api/mail/link?t=...&slug=paperpal",
      "paperpal_gh": "https://urvagandhi.tech/api/mail/link?t=...&slug=paperpal_gh",
      "rwesearch_gh": "https://urvagandhi.tech/api/mail/link?t=...&slug=rwesearch_gh",
      "github": "https://urvagandhi.tech/api/mail/link?t=...&slug=github",
      "linkedin": "https://urvagandhi.tech/api/mail/link?t=...&slug=linkedin",
      "portfolio": "https://urvagandhi.tech/api/mail/link?t=...&slug=portfolio"
    }
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Missing mandatory fields (`recipient_email`, `company`, `track`, `custom_msg_id`).
  - `401 Unauthorized`: Invalid or missing Bearer secret.

---

### 3.2 `POST /api/mail/void`
Rolls back a registered message if SMTP transmission fails in `send_outreach.py`.

- **Headers**:
  `Authorization: Bearer <MAIL_API_SECRET>`
  `Content-Type: application/json`
- **Request Body**:
```json
{
  "token": "7f83b165c92e..."
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Message registration voided successfully."
}
```

---

### 3.3 `GET /api/mail/status`
Provides RFC 822 Message-ID mapping for Gmail IMAP label synchronisation.

- **Headers**:
  `Authorization: Bearer <MAIL_API_SECRET>`
- **Response (200 OK)**:
```json
{
  "messages": [
    {
      "custom_msg_id": "<20261115120000.12345@gmail.com>",
      "recipient": "recruiter@akamai.com",
      "company": "Akamai",
      "status": "resume_viewed",
      "opens": 2,
      "resume_views": 1,
      "clicks": 1,
      "last_event_at": 1794697350000
    }
  ]
}
```

---

## 4. Administrative Dashboard Surface

### 4.1 `POST /api/mail/auth`
Validates passkey and issues an `HttpOnly` session cookie.

- **Headers**:
  `Content-Type: application/json`
- **Request Body**:
```json
{
  "passkey": "secret_passphrase_here"
}
```
- **Response (200 OK)**:
  - **Headers**:
    `Set-Cookie: outreach_admin_session=<hmac_token>; Path=/; HttpOnly; Secure; SameSite=Strict`
  - **Body**:
```json
{
  "authenticated": true
}
```
- **Error Responses**:
  - `401 Unauthorized`: Invalid passkey.

---

### 4.2 `GET /api/mail/stats`
Fetches aggregate analytics and feed for `src/pages/portal/outreach-telemetry.js`.

- **Headers**:
  Cookie: `outreach_admin_session=<hmac_token>`
- **Response (200 OK)**:
```json
{
  "summary": {
    "total_sent": 142,
    "verified_opens": 98,
    "open_rate_percent": 69.0,
    "total_resume_views": 44,
    "total_clicks": 31
  },
  "slug_rankings": [
    { "slug": "cointrack", "clicks": 18 },
    { "slug": "paperpal", "clicks": 9 },
    { "slug": "fleetflow", "clicks": 4 }
  ],
  "company_rollups": [
    {
      "company": "Akamai",
      "sent": 4,
      "opened": 3,
      "resume_viewed": 2,
      "last_active": "2026-11-15T11:45:00Z"
    }
  ],
  "recent_events": [
    {
      "token": "7f83b165...",
      "company": "Akamai",
      "recipient": "recruiter@akamai.com",
      "event": "resume_view",
      "dwell_ms": 48000,
      "client_class": "direct_unclassified",
      "country": "US",
      "city": "Cambridge",
      "ist_time": "2026-11-15 17:15:00 IST",
      "engagement_score": 9
    }
  ]
}
```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid session cookie.
