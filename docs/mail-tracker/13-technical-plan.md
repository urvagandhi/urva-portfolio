# 13 — Technical Plan: Mail Tracker Implementation (Phase 3 & Phase 4)

| Field | Value |
|---|---|
| Document | 13-technical-plan.md |
| Version | 1.0 (Formal Technical Plan) |
| Date | 15 Nov 2026 |
| Status | Approved baseline for Phase 4 implementation slices. |

---

## 1. System Architecture & Technical Constraints

The Mail Tracker subsystem is an integrated, zero-dependency telemetry platform embedded directly inside Urva Gandhi's Next.js portfolio (`urva-portfolio`).

### 1.1 Technical Stack & Decisions Summary
- **Framework**: Next.js ^16.3.0 (Pages Router, `src/pages/`), React ^19, plain JavaScript (no TypeScript).
- **Datastore**: Upstash Redis via HTTPS REST API (`UPSTASH_REDIS_KV_REST_API_URL`). Free tier 256 MB, zero auto-pause.
- **Alert Channel**: Telegram Bot API (`@urva_personal_alerts_bot`, chat `6008118995`). Formatted in HTML, IST (`Asia/Kolkata`), 1.5s execution cap.
- **Cryptographic Security**: Native Node.js `crypto` module (HMAC-SHA256 signatures, constant-time `crypto.timingSafeEqual`).
- **Zero Runtime Dependencies**: No `@upstash/redis` or `pdfjs-dist` npm packages added; relies strictly on native Node.js and browser standards.

---

## 2. File Layout & Structural Blueprint

```text
urva-portfolio/
├── docs/mail-tracker/                  # Formal engineering documentation (13 files)
├── todo-docs/                          # Synchronised documentation mirror
├── scripts/
│   └── test-mail-tracker.js            # [NEW] Native zero-dependency test runner
├── public/
│   └── resumes/
│       ├── Urva_Gandhi.pdf             # Existing standard resume
│       └── Urva_Gandhi_s_Resume_AI-ML.pdf # [NEW] Synced AI/ML track resume
├── src/
│   ├── lib/
│   │   └── mail/
│   │       ├── redis.js                # [NEW] Native REST client for Upstash Redis
│   │       ├── token.js                # [NEW] HMAC-SHA256 token generator & validator
│   │       ├── allowlist.js            # [NEW] 10 allowlisted project & repo slugs
│   │       ├── classifier.js           # [NEW] Client User-Agent classifier & IP truncator
│   │       └── telegram.js             # [NEW] Telegram push alert service
│   ├── pages/
│   │   ├── _app.js                     # [MODIFY] UI shell decoupling for /portal/*
│   │   ├── privacy.js                  # [MODIFY] Recruitment telemetry disclosure
│   │   ├── portal/
│   │   │   └── outreach-telemetry.js   # [NEW] Private React analytics dashboard
│   │   └── api/
│   │       ├── contact.js              # [MODIFY] HTML sanitisation (escapeHtml)
│   │       └── mail/
│   │           ├── pixel.js            # [NEW] 42-byte GIF open beacon (5m debounce)
│   │           ├── link.js             # [NEW] 302 redirect wrapper for allowlisted slugs
│   │           ├── doc.js              # [NEW] HTML viewer with <object> embed & dwell beacon
│   │           ├── pdf.js              # [NEW] Raw PDF stream with SAMEORIGIN override
│   │           ├── beacon.js           # [NEW] Dwell time & custom download tracking
│   │           ├── register.js         # [NEW] Pre-registration & Base64 PDF cache endpoint
│   │           ├── void.js             # [NEW] Rollback endpoint for failed SMTP sends
│   │           ├── status.js           # [NEW] State endpoint for Gmail IMAP label sync
│   │           ├── auth.js             # [NEW] Secret passkey auth endpoint (HttpOnly cookie)
│   │           └── stats.js            # [NEW] Session-authenticated analytics API
│   └── proxy.js                        # [MODIFY] Whitelist /api/mail/* and /portal
├── next.config.js                      # [MODIFY] Header overrides for /portal and /api/mail/pdf
├── next-sitemap.config.js              # [MODIFY] Exclude /portal* and /api/mail*
└── .env.local.example                  # [MODIFY] Mail Tracker environment variables
```

---

## 3. Existing Files Diff Blueprints

### 3.1 `src/proxy.js`
- **Goal**: Allow `/api/mail/*` endpoints through `knownApiRoutes` and protect `/portal` from markdown crawler redirects.
```diff
--- a/src/proxy.js
+++ b/src/proxy.js
@@ -1167,6 +1167,7 @@ export async function proxy(req) {
       pathname.startsWith("/api") ||
       pathname.startsWith("/v1") ||
       pathname.startsWith("/images") ||
+      pathname.startsWith("/portal") ||
       pathname === "/favicon.ico" ||
       pathname.startsWith("/resumes");

@@ -1213,6 +1214,16 @@ export async function proxy(req) {
     "/api/contact",
     "/api/mcp",
     "/api/openapi.json",
+    "/api/mail/register",
+    "/api/mail/void",
+    "/api/mail/pixel",
+    "/api/mail/link",
+    "/api/mail/doc",
+    "/api/mail/pdf",
+    "/api/mail/beacon",
+    "/api/mail/status",
+    "/api/mail/auth",
+    "/api/mail/stats",
     "/api/keys",
     "/api/sandbox",
```

### 3.2 `next.config.js`
- **Goal**: Inject `X-Robots-Tag: noindex, nofollow, noarchive` for `/portal/:path*` and override `X-Frame-Options: SAMEORIGIN` with CSP `frame-ancestors 'self'` for `/api/mail/pdf`.
```diff
--- a/next.config.js
+++ b/next.config.js
@@ -66,6 +66,24 @@ const nextConfig = {
           },
         ],
       },
+      {
+        source: "/portal/:path*",
+        headers: [
+          {
+            key: "X-Robots-Tag",
+            value: "noindex, nofollow, noarchive",
+          },
+        ],
+      },
+      {
+        source: "/api/mail/pdf",
+        headers: [
+          { key: "X-Frame-Options", value: "SAMEORIGIN" },
+          {
+            key: "Content-Security-Policy",
+            value: "default-src 'self'; frame-ancestors 'self'",
+          },
+        ],
+      },
     ];
   },
```

### 3.3 `next-sitemap.config.js`
- **Goal**: Prevent tracking routes and private portal from appearing in search engine sitemaps.
```diff
--- a/next-sitemap.config.js
+++ b/next-sitemap.config.js
@@ -1,6 +1,7 @@
 /** @type {import('next-sitemap').IConfig} */
 module.exports = {
   siteUrl: process.env.SITE_URL || "https://urvagandhi.tech",
+  exclude: ["/portal*", "/api/mail*"],
   generateRobotsTxt: true,
   generateIndexSitemap: false,
```

### 3.4 `src/pages/_app.js`
- **Goal**: Decouple private `/portal/*` routes from the public portfolio Navbar, Footer, ContactModal, and intro loader.
```diff
--- a/src/pages/_app.js
+++ b/src/pages/_app.js
@@ -38,7 +38,8 @@ export default function App({ Component, pageProps }) {
   const { scrollYProgress } = useScroll();
   const [particleColor, setParticleColor] = React.useState("#000000");
   const [mounted, setMounted] = React.useState(false);
-  const [loading, setLoading] = React.useState(true);
+  const isPortal = router.pathname.startsWith("/portal");
+  const [loading, setLoading] = React.useState(!isPortal);

@@ -191,13 +192,19 @@ export default function App({ Component, pageProps }) {
         {/* Global custom cursor */}
         {mounted && !loading && <CustomCursor />}

-        <NavBar />
+        {!isPortal && <NavBar />}
         <AnimatePresence initial={false} mode="wait">
           <Component key={router.asPath} {...pageProps} />
         </AnimatePresence>
-        <Footer />
-        <ContactModal />
+        {!isPortal && <Footer />}
+        {!isPortal && <ContactModal />}
       </main>
```

### 3.5 `src/pages/api/contact.js`
- **Goal**: Neutralise HTML injection by escaping template interpolation parameters.
```javascript
function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

---

## 4. Phase 4 Implementation Plan & Vertical Slices

Implementation will proceed strictly sequentially across six build slices:

### Build 1: Core Mail Library & Native Test Suite
- Author `src/lib/mail/redis.js`, `token.js`, `allowlist.js`, `classifier.js`, and `telegram.js`.
- Author `scripts/test-mail-tracker.js` with Unit Tests UT-01 through UT-10.
- Verify unit tests pass: `node scripts/test-mail-tracker.js --unit`.
- **Approval Gate**: Stop and await `APPROVED: BUILD 1`.

### Build 2: Public Tracking Endpoints & Proxy Whitelisting
- Author `src/pages/api/mail/pixel.js`, `link.js`, `doc.js`, `pdf.js`, and `beacon.js`.
- Update `src/proxy.js` with public tracking routes.
- Execute integration tests IT-01 through IT-07.
- **Approval Gate**: Stop and await `APPROVED: BUILD 2`.

### Build 3: Administrative, Void & Status Endpoints
- Author `src/pages/api/mail/register.js`, `void.js`, and `status.js`.
- Update `src/proxy.js` with administrative routes.
- Execute integration tests IT-08 through IT-12.
- **Approval Gate**: Stop and await `APPROVED: BUILD 3`.

### Build 4: Private Analytics Portal & UI Shell Decoupling
- Author `src/pages/api/mail/auth.js`, `stats.js`, and `src/pages/portal/outreach-telemetry.js`.
- Update `src/pages/_app.js`, `next.config.js`, `next-sitemap.config.js`, and `src/proxy.js`.
- Execute integration tests IT-13 through IT-18.
- **Approval Gate**: Stop and await `APPROVED: BUILD 4`.

### Build 5: Contact API Hardening, Privacy Updates & Asset Sync
- Apply `escapeHtml()` hardening in `src/pages/api/contact.js`.
- Update `src/pages/privacy.js` with recruitment telemetry disclosure.
- Update `.env.local.example` with Mail Tracker environment keys.
- Copy `Urva_Gandhi_s_Resume_AI-ML.pdf` to `public/resumes/`.
- **Approval Gate**: Stop and await `APPROVED: BUILD 5`.

### Build 6: Client Script Integration & Full Verification Gate
- Patch `/Users/urvagandhi/Documents/Resumes/Job_Automation/send_outreach.py` with pre-registration, rollback, and IMAP sync.
- Run complete test suite: `node scripts/test-mail-tracker.js`.
- Run production verification: `npm run lint` and `npm run build`.
- **Approval Gate**: Stop and present final walkthrough.
