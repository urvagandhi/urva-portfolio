import { verifyToken, verifyAdminSession, isSenderEmail } from '../../../lib/mail/token.js';
import { truncateIp, decodeCity } from '../../../lib/mail/classifier.js';
import { k, hgetall, hincrby, hset, lpush, expire, exists, set, get } from '../../../lib/mail/redis.js';
import { dispatchTelegramAlert } from '../../../lib/mail/telegram.js';

// Industry-standard 30-minute rolling session inactivity window (DocSend / GA4 standard)
const SESSION_TTL_SEC = 1800;

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

  const { t, event, dwell_ms, sid } = payload || {};

  // Fail-open: immediate 204 No Content if token is missing or invalid
  if (!t || typeof t !== 'string' || !verifyToken(t)) {
    return res.status(204).end();
  }

  // Pass-through: if admin is logged in, do not record beacon events or send alerts
  if (verifyAdminSession(req)) {
    return res.status(204).end();
  }

  try {
    const msg = await hgetall(k(`mail:m:${t}`));

    // Only process events if message exists and is active (not voided, blocked, or bounced)
    const isInactive = msg.status === 'voided' || msg.status === 'blocked' || msg.status === 'bounced';
    if (msg && Object.keys(msg).length > 0 && !isInactive) {
      const recipientEmail = msg.recipient_email || msg.recipient || '';
      if (isSenderEmail(recipientEmail)) {
        return res.status(204).end();
      }

      const ua = req.headers['user-agent'] || '';
      const forwardedFor = req.headers['x-forwarded-for'];
      const rawIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (req.socket?.remoteAddress || '');
      const ipTrunc = truncateIp(rawIp);
      const country = req.headers['x-vercel-ip-country'] || '';
      const region = req.headers['x-vercel-ip-country-region'] || '';
      const city = decodeCity(req.headers['x-vercel-ip-city']);
      const now = Date.now();

      if (event === 'resume_view') {
        const sessionKey = k(`mail:session:${t}:resume`);
        const activeSession = await get(sessionKey);

        if (activeSession) {
          // Ongoing active session (within 30m window): extend rolling window, update last_event_at
          await expire(sessionKey, SESSION_TTL_SEC);
          await hset(k(`mail:m:${t}`), { last_event_at: now });
          return res.status(204).end();
        }

        // New session initiated! (First view, or return visit after 30+ minutes of inactivity)
        await set(sessionKey, sid || 'active_session', { ex: SESSION_TTL_SEC });

        const updatedViews = await hincrby(k(`mail:m:${t}`), 'resume_views', 1);
        await hset(k(`mail:m:${t}`), {
          last_event_at: now,
          status: 'resume_viewed'
        });

        const eventData = JSON.stringify({
          event: 'resume_view',
          ts: now,
          session_id: sid || '',
          session_num: updatedViews,
          ua,
          ip_trunc: ipTrunc,
          country,
          region,
          city
        });

        await lpush(k(`mail:events:${t}`), eventData);
        await expire(k(`mail:events:${t}`), 5184000);

        const sessionDetail = updatedViews > 1
          ? `Web resume viewed (Session #${updatedViews} — Returning Recruiter)`
          : `Web resume viewed (Session #1)`;

        await dispatchTelegramAlert({
          eventType: 'resume_view',
          recipientName: msg.recipient_name,
          recipientEmail: msg.recipient_email || msg.recipient,
          company: msg.company,
          track: msg.track,
          detail: sessionDetail,
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
          // Accumulate dwell duration into message hash and refresh active session window
          await hincrby(k(`mail:m:${t}`), 'total_dwell_ms', ms);
          await expire(k(`mail:session:${t}:resume`), SESSION_TTL_SEC);
          await hset(k(`mail:m:${t}`), { last_event_at: now });
        }
      } else if (event === 'resume_download') {
        const downloadSessionKey = k(`mail:session:${t}:download`);
        const alreadyDownloadedInSession = await exists(downloadSessionKey);

        if (alreadyDownloadedInSession) {
          return res.status(204).end();
        }

        await set(downloadSessionKey, '1', { ex: SESSION_TTL_SEC });
        const updatedDownloads = await hincrby(k(`mail:m:${t}`), 'downloads', 1);

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
