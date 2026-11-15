import { verifyToken } from '../../../lib/mail/token.js';
import { truncateIp, decodeCity } from '../../../lib/mail/classifier.js';
import { k, hgetall, hincrby, hset, lpush, expire, exists, set } from '../../../lib/mail/redis.js';
import { dispatchTelegramAlert } from '../../../lib/mail/telegram.js';

/**
 * Telemetry Beacon Endpoint.
 * Ingests navigator.sendBeacon visibility dwell duration and custom download events.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(204).end();
  }

  let payload = req.body;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (_) {
      payload = {};
    }
  }

  const { t, event, dwell_ms } = payload || {};

  // Fail-open: immediate 204 No Content if token is missing or invalid
  if (!t || typeof t !== 'string' || !verifyToken(t)) {
    return res.status(204).end();
  }

  try {
    const msg = await hgetall(k(`mail:m:${t}`));

    // Only process events if message exists and is not voided
    if (msg && Object.keys(msg).length > 0 && msg.status !== 'voided') {
      const ua = req.headers['user-agent'] || '';
      const forwardedFor = req.headers['x-forwarded-for'];
      const rawIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (req.socket?.remoteAddress || '');
      const ipTrunc = truncateIp(rawIp);
      const country = req.headers['x-vercel-ip-country'] || '';
      const region = req.headers['x-vercel-ip-country-region'] || '';
      const city = decodeCity(req.headers['x-vercel-ip-city']);
      const now = Date.now();

      if (event === 'resume_view') {
        const lastViewKey = k(`mail:debounce:${t}:view`);
        const isRecent = await exists(lastViewKey);
        if (isRecent) {
          return res.status(204).end();
        }
        await set(lastViewKey, '1', { ex: 5 });

        const updatedViews = await hincrby(k(`mail:m:${t}`), 'resume_views', 1);
        await hset(k(`mail:m:${t}`), {
          last_event_at: now,
          status: 'resume_viewed'
        });

        const eventData = JSON.stringify({
          event: 'resume_view',
          ts: now,
          ua,
          ip_trunc: ipTrunc,
          country,
          region,
          city
        });

        await lpush(k(`mail:events:${t}`), eventData);
        await expire(k(`mail:events:${t}`), 5184000);

        await dispatchTelegramAlert({
          eventType: 'resume_view',
          recipientName: msg.recipient_name,
          recipientEmail: msg.recipient_email || msg.recipient,
          company: msg.company,
          track: msg.track,
          detail: `Web resume viewed (Session #${updatedViews})`,
          ua,
          country,
          region,
          city,
          ipTrunc,
          timestamp: now
        });
      } else if (event === 'beacon_dwell' || dwell_ms) {
        const ms = Number(dwell_ms || 0);
        if (ms > 0) {
          await hincrby(k(`mail:m:${t}`), 'total_dwell_ms', ms);
          const eventData = JSON.stringify({
            event: 'beacon_dwell',
            ts: now,
            dwell_ms: ms
          });
          await lpush(k(`mail:events:${t}`), eventData);
          await expire(k(`mail:events:${t}`), 5184000);
        }
      } else if (event === 'resume_download') {
        const lastDownloadKey = k(`mail:debounce:${t}:download`);
        const isRecent = await exists(lastDownloadKey);
        if (isRecent) {
          return res.status(204).end();
        }
        await set(lastDownloadKey, '1', { ex: 5 });

        const updatedDownloads = await hincrby(k(`mail:m:${t}`), 'downloads', 1);
        const eventData = JSON.stringify({
          event: 'resume_download',
          ts: now,
          ua,
          ip_trunc: ipTrunc,
          country,
          region,
          city
        });

        await lpush(k(`mail:events:${t}`), eventData);
        await expire(k(`mail:events:${t}`), 5184000);

        await dispatchTelegramAlert({
          eventType: 'resume_download',
          recipientName: msg.recipient_name,
          recipientEmail: msg.recipient_email || msg.recipient,
          company: msg.company,
          track: msg.track,
          detail: `Resume downloaded via web viewer (Download #${updatedDownloads})`,
          ua,
          country,
          region,
          city,
          ipTrunc,
          timestamp: now
        });
      }
    }
  } catch (err) {
    console.warn(`[MailTracker:Beacon] Error processing telemetry: ${err.message}`);
  }

  return res.status(204).end();
}
