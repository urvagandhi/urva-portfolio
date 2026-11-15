import fs from 'node:fs/promises';
import path from 'node:path';
import { verifyToken, verifyAdminSession, isSenderEmail } from '../../../lib/mail/token.js';
import { truncateIp, decodeCity } from '../../../lib/mail/classifier.js';
import { k, hgetall, hincrby, hset, lpush, expire, get, exists, set } from '../../../lib/mail/redis.js';
import { dispatchTelegramAlert } from '../../../lib/mail/telegram.js';

/**
 * Raw PDF Streaming Endpoint with SAMEORIGIN Frame Overrides and Direct Telemetry.
 * Streams tailored candidate resume from Redis or falls back to static resume.
 * Directly records view or download events and alerts Telegram.
 */
export default async function handler(req, res) {
  const { t, dl, download } = req.query;
  const isDownload = dl === '1' || download === '1';
  const disposition = isDownload ? 'attachment' : 'inline';

  // Set framing policy and caching headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `${disposition}; filename="Urva_Gandhi_Resume.pdf"`);
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'self'");
  res.setHeader('Cache-Control', 'no-cache, private');

  // Verify HMAC signature of tracking token
  if (!t || typeof t !== 'string' || !verifyToken(t)) {
    res.setHeader('Content-Type', 'application/problem+json');
    return res.status(404).json({
      type: 'https://urvagandhi.tech/docs/errors/not-found',
      title: 'Resume Not Found',
      status: 404,
      detail: 'Invalid or missing tracking token.',
      instance: '/api/mail/pdf'
    });
  }

  try {
    const msg = await hgetall(k(`mail:m:${t}`));
    const now = Date.now();
    const ua = req.headers['user-agent'] || '';
    const forwardedFor = req.headers['x-forwarded-for'];
    const rawIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (req.socket?.remoteAddress || '');
    const ipTrunc = truncateIp(rawIp);
    const country = req.headers['x-vercel-ip-country'] || '';
    const region = req.headers['x-vercel-ip-country-region'] || '';
    const city = decodeCity(req.headers['x-vercel-ip-city']);

    // Record telemetry directly (unless admin session is active or recipient matches sender)
    const isAdmin = verifyAdminSession(req);
    const recipientEmail = msg ? (msg.recipient_email || msg.recipient || '') : '';
    const isSender = isSenderEmail(recipientEmail);

    if (!isAdmin && !isSender && msg && Object.keys(msg).length > 0 && msg.status !== 'voided') {
      const currentOpens = Number(msg.opens || 0);
      const newOpens = currentOpens > 0 ? currentOpens : 1;

      if (isDownload) {
        // Session-grouped download alert (max 1 alert & count increment per 30m window)
        const downloadSessionKey = k(`mail:session:${t}:download`);
        const alreadyDownloadedInSession = await exists(downloadSessionKey);

        if (!alreadyDownloadedInSession) {
          await set(downloadSessionKey, '1', { ex: 1800 }); // 30-minute session window
          const updatedDownloads = await hincrby(k(`mail:m:${t}`), 'downloads', 1);
          await hset(k(`mail:m:${t}`), { last_event_at: now, opens: newOpens });

          const eventData = JSON.stringify({
            event: 'resume_download',
            ts: now,
            download_num: updatedDownloads,
            ua,
            ip_trunc: ipTrunc,
            country,
            region,
            city
          });
          await lpush(k(`mail:events:${t}`), eventData);
          await expire(k(`mail:events:${t}`), 5184000);

          dispatchTelegramAlert({
            eventType: 'resume_download',
            recipientName: msg.recipient_name,
            recipientEmail: msg.recipient_email || msg.recipient,
            company: msg.company,
            track: msg.track,
            detail: `Direct PDF resume downloaded (Download #${updatedDownloads})`,
            ua,
            country,
            region,
            city,
            ipTrunc,
            timestamp: now
          }).catch(() => {});
        }
      }
    }

    // Attempt to load tailored PDF binary cached in Redis
    if (msg && msg.pdf_key) {
      const base64 = await get(msg.pdf_key);
      if (base64) {
        const buffer = Buffer.from(base64, 'base64');
        res.setHeader('Content-Length', buffer.length);
        return res.status(200).send(buffer);
      }
      console.warn(`[MailTracker:PDF] Tailored PDF key ${msg.pdf_key} not found in Redis, falling back to static file`);
    }

    // Static fallback to default portfolio resume
    const fallbackPath = path.join(process.cwd(), 'public', 'resumes', 'Urva_Gandhi.pdf');
    const fallbackBuffer = await fs.readFile(fallbackPath);
    res.setHeader('Content-Length', fallbackBuffer.length);
    return res.status(200).send(fallbackBuffer);
  } catch (err) {
    console.warn(`[MailTracker:PDF] Error retrieving resume: ${err.message}`);
    res.setHeader('Content-Type', 'application/problem+json');
    return res.status(404).json({
      type: 'https://urvagandhi.tech/docs/errors/not-found',
      title: 'Resume Not Found',
      status: 404,
      detail: 'The requested resume document could not be retrieved.',
      instance: '/api/mail/pdf'
    });
  }
}
