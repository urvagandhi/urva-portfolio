# 09 — Security and Privacy Specification: Mail Tracker

| Field | Value |
|---|---|
| Document | 09-security.md |
| Version | 1.0 (Approved Baseline) |
| Date | 15 Nov 2026 |
| Status | Approved. Formal cryptographic designs, access boundaries, threat models and privacy compliance. |

---

## 1. Threat Model and Asset Classification

| Asset | Sensitivity | Primary Threat | Mitigation Control |
|---|---|---|---|
| **Recruiter PII** (Email, Name, Company) | Confidential | Unauthorized enumeration, scraping, search engine indexation | 128-bit unguessable tokens, 404 facade for unauthenticated portal access, `noindex` headers, sitemap exclusion |
| **API & Datastore Secrets** (`TELEGRAM_BOT_TOKEN`, `UPSTASH_TOKEN`, `MAIL_API_SECRET`, `DASHBOARD_SECRET_KEY`) | Critical | Repository exposure, build artifact leaks, client-side bundle leakage | Stored exclusively in Vercel Environment Variables and `.env.local`; removed from client build bundles |
| **Outreach Showcase URLs** | Integrity | Open redirect exploitation (CWE-601), domain phishing abuse | Immutable server allowlist (`allowlist.js`); arbitrary redirect parameters (`?to=...`) discarded |
| **PDF Binary Integrity** | Integrity | Framing injection, cross-site document embedding | `X-Frame-Options: SAMEORIGIN` and `Content-Security-Policy: frame-ancestors 'self'` on `/api/mail/pdf` |
| **Contact Form Interface** (`contact.js`) | Integrity | HTML injection / email spoofing via unescaped string interpolation | Dedicated sanitisation helper escaping `< > & " '` characters before template generation |

---

## 2. Token Architecture & Cryptographic Integrity

### 2.1 Token Format
A tracking token is an unguessable, tamper-evident 65-character string:
`<entropy_hex>.<signature_hex>`

- **`entropy_hex`**: 32 characters (16 bytes generated via `crypto.randomBytes(16).toString('hex')`), providing $2^{128}$ collision resistance.
- **`signature_hex`**: 32 characters (16-byte truncated HMAC-SHA256 computed over `entropy_hex` using `MAIL_SIGNING_SECRET`).

### 2.2 Signature Generation & Verification Routine
```javascript
import crypto from 'crypto';

const SIGNING_SECRET = process.env.MAIL_SIGNING_SECRET;

export function generateToken() {
  const entropy = crypto.randomBytes(16).toString('hex');
  const signature = crypto
    .createHmac('sha256', SIGNING_SECRET)
    .update(entropy)
    .digest('hex')
    .slice(0, 32);
  return `${entropy}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2 || parts[0].length !== 32 || parts[1].length !== 32) return false;

  const [entropy, providedSig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SIGNING_SECRET)
    .update(entropy)
    .digest('hex')
    .slice(0, 32);

  return crypto.timingSafeEqual(
    Buffer.from(providedSig, 'utf-8'),
    Buffer.from(expectedSig, 'utf-8')
  );
}
```

Timing attacks are eliminated using `crypto.timingSafeEqual`. An invalid token triggers immediate fail-open handling on public tracking endpoints (returning the 200 GIF or executing link redirection) without persisting events or alerting Telegram.

---

## 3. Open Redirect Prevention (CWE-601)

Public link tracking endpoints (`/api/mail/link`) are hardened against arbitrary URL redirection:

```javascript
// src/lib/mail/allowlist.js
export const ALLOWED_SLUGS = Object.freeze({
  cointrack: 'https://cointrack-finance.vercel.app/',
  cointrack_gh: 'https://github.com/urvagandhi/cointrack',
  fleetflow: 'https://fleet-flow-jade.vercel.app/',
  fleetflow_gh: 'https://github.com/urvagandhi/Odoo-Hackathon-26',
  paperpal: 'https://paper-pal-gules.vercel.app/',
  paperpal_gh: 'https://github.com/urvagandhi/TBD',
  rwesearch_gh: 'https://github.com/urvagandhi/RWEsearch-Hackathon',
  github: 'https://github.com/urvagandhi',
  linkedin: 'https://www.linkedin.com/in/urva-gandhi/',
  portfolio: 'https://urvagandhi-portfolio.vercel.app/'
});

export function resolveDestination(slug) {
  if (!slug || !Object.prototype.hasOwnProperty.call(ALLOWED_SLUGS, slug)) {
    return null;
  }
  return ALLOWED_SLUGS[slug];
}
```

Any query string parameters attempting to supply direct destination URLs (e.g. `?to=https://attacker.com` or `?url=...`) are strictly ignored. Unlisted slugs return RFC 9457 HTTP 404 Problem Details.

---

## 4. Administrative Authentication & Session Security

### 4.1 Passkey Verification (`/api/mail/auth`)
- The passkey is compared against `DASHBOARD_SECRET_KEY` using `crypto.timingSafeEqual`:
```javascript
const isValid = (
  passkey.length === expected.length &&
  crypto.timingSafeEqual(Buffer.from(passkey), Buffer.from(expected))
);
```
- Rate limiting: To prevent brute-force attacks, `/api/mail/auth` restricts attempts to **5 per 15 minutes per IP** using Redis key `mail:ratelimit:auth:{ip}` with a 900-second TTL.

### 4.2 Session Cookie Parameters
Successful authentication sets an encrypted session cookie:
- **Name**: `outreach_admin_session`
- **Value**: HMAC-signed timestamp token (`<timestamp>.<hmac>`)
- **HttpOnly**: `true` (Inaccessible to client-side JavaScript, preventing XSS theft)
- **Secure**: `true` (Enforced across HTTPS)
- **SameSite**: `Strict` (Prevents CSRF transmission from external origins)
- **Path**: `/`
- **Max-Age**: Omitted (Session cookie; deleted upon browser closure)

### 4.3 404 Facade on Unauthorized Portal Requests
Requests to `/portal/outreach-telemetry` without a valid `outreach_admin_session` cookie return an HTTP 404 response. The portal does not advertise its existence to unauthorized visitors.

---

## 5. Header Isolation & Framing Policy

1. **Global Frame Deny**: [next.config.js](file:///Users/urvagandhi/Developer/Personal/urva-portfolio/next.config.js#L53) injects `X-Frame-Options: DENY` globally across `/:path*`.
2. **Selective Override for Resume PDF**: To allow `<object>` and iframe embedding within the portfolio's own HTML container (`/api/mail/doc`), `/api/mail/pdf` explicitly overrides headers:
   `X-Frame-Options: SAMEORIGIN`
   `Content-Security-Policy: frame-ancestors 'self'`
   `Content-Disposition: inline; filename="Urva_Gandhi_Resume.pdf"`
3. **Noindex for Portal**: The portal route injects:
   `X-Robots-Tag: noindex, nofollow, noarchive`

---

## 6. Privacy & Data Protection Compliance

### 6.1 Regulatory Status and Research Summary
- **India DPDP Act 2023**:
  - The DPDP Rules were formally notified on 13 November 2025. Core statutory compliance duties, data fiduciary obligations and Data Protection Board adjudication take effect in a phased rollout concluding around 13–14 May 2027.
  - *Engineering Practice*: In accordance with good-faith data minimisation principles, outreach data is retained strictly for verification purposes and automatically purged after 60 days.
- **European Union (GDPR & ePrivacy Directive)**:
  - Under EDPB Guidelines 2/2023 on the Technical Scope of Art. 5(3) of the ePrivacy Directive (Final version adopted 7 October 2024), tracking pixels and tracked URLs fall within the technical scope of Article 5(3).
  - *Mitigations Applied*:
    1. Zero persistent cookies are placed on recipient devices.
    2. Recruiter IP addresses are truncated immediately upon receipt.
    3. Outreach telemetry keys expire automatically via Redis TTL.
    4. General portfolio visitors browsing `https://urvagandhi.tech` remain 100% untracked.

### 6.2 IP Address Truncation Routine
```javascript
export function truncateIp(ip) {
  if (!ip || typeof ip !== 'string') return 'unknown';
  // IPv4 truncation: 192.168.1.123 -> 192.168.1.xxx
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
  }
  // IPv6 truncation: 2001:db8:85a3::8a2e:370:7334 -> 2001:db8:85a3:xxxx
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return `${parts.slice(0, 3).join(':')}:xxxx`;
  }
  return 'unknown';
}
```

### 6.3 Dual Data Retention Auto-TTL Matrix

| Record Type | Redis Storage Key Pattern | Auto-TTL | Justification |
|---|---|---|---|
| **Outreach Message Metadata** | `mail:m:{token}` | 60 days (5,184,000s) | Sufficient for active interview follow-up cycles |
| **Telemetry Event Logs** | `mail:events:{token}` | 60 days (5,184,000s) | Satisfies DPDP/GDPR storage minimisation |
| **Debounce State** | `mail:debounce:open:...` | 300 seconds (5m) | Rolling window for duplicate open alert debouncing |
| **Tailored PDF Binaries** | `mail:pdf:{sha256}` | 180 days (15,552,000s) | Preserves link fidelity for bookmarks and hiring committee shares |

---

## 7. Portfolio Contact API Hardening (`contact.js`)

Investigation revealed that [src/pages/api/contact.js](file:///Users/urvagandhi/Developer/Personal/urva-portfolio/src/pages/api/contact.js#L273) interpolates raw user input into HTML email templates. A sanitisation utility will be applied during Phase 4:

```javascript
function escapeHtml(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```
All variables (`name`, `email`, `subject`, `message`) are passed through `escapeHtml()` prior to template string assembly, neutralising email injection risks without modifying runtime handler structure.
