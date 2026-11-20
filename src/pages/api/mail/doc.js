import { verifyToken, verifyAdminSession } from '../../../lib/mail/token.js';

/**
 * Native HTML Resume Viewer Container.
 * Hosts an <object> embed pointing to /api/mail/pdf with mobile fallback and dwell beacon.
 */
export default async function handler(req, res) {
  const { t } = req.query;

  if (!t || typeof t !== 'string' || !verifyToken(t)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document Not Found</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { background-color: #030712; color: #f3f4f6; font-family: ui-sans-serif, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .box { text-align: center; max-width: 480px; padding: 2rem; background-color: #111827; border: 1px solid #1f2937; border-radius: 0.75rem; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #9ca3af; font-size: 0.875rem; line-height: 1.5; }
    a { color: #38bdf8; text-decoration: none; font-weight: 500; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Invalid or Expired Link</h1>
    <p>This document verification link is invalid or has expired.</p>
    <p style="margin-top: 1.5rem;"><a href="https://urvagandhi.tech">Return to Portfolio Homepage &rarr;</a></p>
  </div>
</body>
</html>`);
  }

  const encodedToken = encodeURIComponent(t);
  const pdfUrl = `/api/mail/pdf?t=${encodedToken}`;
  const isAdmin = verifyAdminSession(req);

  const beaconScript = isAdmin ? '' : `
  <script>
    (function() {
      // Discard automated headless browsers and synthetic webdrivers immediately
      if (navigator.webdriver) return;

      const TOKEN = "${t}";
      const SESS_STORAGE_KEY = 'outreach_sess_' + TOKEN;
      let sessionId = null;
      try {
        sessionId = sessionStorage.getItem(SESS_STORAGE_KEY);
        if (!sessionId) {
          sessionId = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
          sessionStorage.setItem(SESS_STORAGE_KEY, sessionId);
        }
      } catch (_) {
        sessionId = 'sess_' + Math.random().toString(36).substring(2, 10);
      }

      let visibleStartTime = document.visibilityState === 'visible' ? Date.now() : null;
      let accumulatedDwellMs = 0;

      function sendPayload(data) {
        const payload = JSON.stringify(Object.assign({ t: TOKEN, sid: sessionId }, data));
        let sent = false;
        if (navigator.sendBeacon) {
          try {
            sent = navigator.sendBeacon('/api/mail/beacon', payload);
          } catch (_) {}
        }
        if (!sent) {
          try {
            fetch('/api/mail/beacon', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: payload,
              keepalive: true
            }).catch(function() {});
          } catch (_) {}
        }
      }

      // Human-interaction gated resume_view trigger:
      // Real humans scroll, move their mouse, touch the screen, or dwell for >= 3 seconds.
      // Automated crawlers and detonation sandboxes close immediately without interaction.
      let viewTriggered = false;
      function triggerResumeView() {
        if (viewTriggered) return;
        viewTriggered = true;
        sendPayload({ event: 'resume_view' });
      }

      ['mousemove', 'scroll', 'touchstart', 'keydown'].forEach(function(evt) {
        window.addEventListener(evt, triggerResumeView, { once: true, passive: true });
      });

      setTimeout(function() {
        if (document.visibilityState === 'visible') {
          triggerResumeView();
        }
      }, 3000);

      // Track dwell time on visibility changes
      document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
          visibleStartTime = Date.now();
        } else if (visibleStartTime) {
          const delta = Date.now() - visibleStartTime;
          accumulatedDwellMs += delta;
          visibleStartTime = null;
          if (delta > 1000) {
            sendPayload({ event: 'beacon_dwell', dwell_ms: delta });
          }
        }
      });

      // Flush dwell time when navigating away
      window.addEventListener('pagehide', function() {
        if (visibleStartTime) {
          const delta = Date.now() - visibleStartTime;
          visibleStartTime = null;
          if (delta > 1000) {
            sendPayload({ event: 'beacon_dwell', dwell_ms: delta });
          }
        }
      });
    })();
  </script>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <title>Urva Gandhi — Curriculum Vitae</title>
  <meta name="robots" content="noindex, nofollow, noarchive">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; width: 100%; background-color: #030712; color: #f3f4f6; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; overflow: hidden; display: flex; flex-direction: column; }
    header { height: 56px; background-color: #0b0f19; border-bottom: 1px solid #1f2937; display: flex; align-items: center; justify-content: space-between; padding: 0 1.25rem; flex-shrink: 0; z-index: 10; }
    .brand { display: flex; align-items: center; gap: 0.75rem; }
    .brand-title { font-size: 0.9375rem; font-weight: 600; color: #f9fafb; letter-spacing: -0.01em; }
    .brand-sub { font-size: 0.75rem; color: #9ca3af; background-color: #1f2937; padding: 0.125rem 0.5rem; border-radius: 9999px; }
    .actions { display: flex; align-items: center; gap: 0.75rem; }
    .btn { display: inline-flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; font-weight: 500; padding: 0.375rem 0.75rem; border-radius: 0.375rem; text-decoration: none; transition: all 150ms ease; cursor: pointer; border: 1px solid transparent; }
    .btn-secondary { background-color: #1f2937; color: #d1d5db; border-color: #374151; }
    .btn-secondary:hover { background-color: #374151; color: #ffffff; }
    .btn-primary { background-color: #2563eb; color: #ffffff; }
    .btn-primary:hover { background-color: #1d4ed8; }
    main { flex: 1; width: 100%; height: calc(100% - 56px); position: relative; background-color: #030712; }
    object, iframe { width: 100%; height: 100%; border: none; display: block; }
    .fallback-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 2rem; }
    .fallback-card { max-width: 420px; background-color: #111827; border: 1px solid #1f2937; border-radius: 0.75rem; padding: 2rem; }
    .fallback-card h2 { font-size: 1.125rem; margin-bottom: 0.75rem; }
    .fallback-card p { font-size: 0.875rem; color: #9ca3af; margin-bottom: 1.5rem; line-height: 1.5; }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <span class="brand-title">Urva Gandhi</span>
      <span class="brand-sub">Verified Resume</span>
    </div>
    <div class="actions">
      <a href="${pdfUrl}" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        Open PDF
      </a>
      <a href="${pdfUrl}&dl=1" class="btn btn-primary" id="downloadBtn" download="Urva_Gandhi_Resume.pdf">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        Download PDF
      </a>
    </div>
  </header>
  <main>
    <object data="${pdfUrl}" type="application/pdf" width="100%" height="100%">
      <iframe src="${pdfUrl}#toolbar=1" width="100%" height="100%" style="border:none; width:100%; height:100%; display:block;" title="Urva Gandhi Resume">
        <div class="fallback-container">
          <div class="fallback-card">
            <h2>Resume Preview</h2>
            <p>Your browser could not preview the PDF inline. Click below to view or download the complete resume document directly.</p>
            <div style="display:flex; gap:0.5rem; justify-content:center;">
              <a href="${pdfUrl}" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">Open PDF</a>
              <a href="${pdfUrl}&dl=1" class="btn btn-primary" download="Urva_Gandhi_Resume.pdf">Download PDF</a>
            </div>
          </div>
        </div>
      </iframe>
    </object>
  </main>${beaconScript}
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, private');
  return res.status(200).send(html);
}
