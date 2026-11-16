import { verifyToken, verifyAdminSession, isSenderEmail } from '../../../lib/mail/token.js';
import { classifyClient, truncateIp, decodeCity, isSecurityScanner } from '../../../lib/mail/classifier.js';
import { isGoogleWorkspaceDomain } from '../../../lib/mail/domain-mx.js';
import { k, get, set, del, incr, hgetall, hincrby, hset, lpush, expire } from '../../../lib/mail/redis.js';
import { dispatchTelegramAlert } from '../../../lib/mail/telegram.js';

// Standard 42-byte transparent GIF89a binary buffer
const PIXEL_BUFFER = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

/**
 * 1x1 Transparent GIF Open Tracking Beacon.
 * Handles HMAC verification, client classification, 5-minute debounce and fail-open response.
 */
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Content-Length', '42');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const { t } = req.query;

  // Fail-open: return 200 OK without recording if token is missing or invalid
  if (!t || !verifyToken(t)) {
    return res.status(200).send(PIXEL_BUFFER);
  }

  // Pass-through: if admin is logged into telemetry portal, do not log or alert
  if (verifyAdminSession(req)) {
    return res.status(200).send(PIXEL_BUFFER);
  }

  try {
    const msg = await hgetall(k(`mail:m:${t}`));

    // Fail-open if message record does not exist or has been marked voided, blocked, or bounced
    if (!msg || Object.keys(msg).length === 0 || msg.status === 'voided' || msg.status === 'blocked' || msg.status === 'bounced') {
      return res.status(200).send(PIXEL_BUFFER);
    }

    const recipientEmail = msg.recipient_email || msg.recipient || '';

    // Ignore events if recipient email matches sender address
    if (isSenderEmail(recipientEmail)) {
      return res.status(200).send(PIXEL_BUFFER);
    }

    const ua = req.headers['user-agent'] || '';
    const asNumber = req.headers['x-vercel-ip-as-number'] || '';
    const via = req.headers['via'] || '';
    const clientClass = classifyClient(ua, asNumber, via);

    // Filter Sent-Folder opens: if request arrives from GoogleImageProxy/Google ASN but recipient domain
    // does not use Google Workspace (e.g. uses Outlook/Exchange), this is the sender viewing Sent Mail.
    if (clientClass === 'gmail_proxy') {
      const isRecipientGoogle = await isGoogleWorkspaceDomain(recipientEmail);
      if (!isRecipientGoogle) {
        return res.status(200).send(PIXEL_BUFFER);
      }
    }
    const forwardedFor = req.headers['x-forwarded-for'];
    const rawIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (req.socket?.remoteAddress || '');
    const ipTrunc = truncateIp(rawIp);
    const country = req.headers['x-vercel-ip-country'] || '';
    const region = req.headers['x-vercel-ip-country-region'] || '';
    const city = decodeCity(req.headers['x-vercel-ip-city']);
    const now = Date.now();
    const createdAt = Number(msg.created_at || now);
    const deltaSec = Math.max(0, (now - createdAt) / 1000);

    // Detect automated security crawlers and rapid proxy prefetching
    const isScanner = isSecurityScanner(ua, rawIp, asNumber, via);
    const isProxyPrefetch = (clientClass === 'gmail_proxy' || clientClass === 'apple_mpp') && deltaSec < 60;
    const isRapidBotScan = deltaSec < 15 && clientClass !== 'direct_unclassified';
    const isMachineOpen = isScanner || isProxyPrefetch || isRapidBotScan;

    if (isMachineOpen) {
      const prefetchType = isScanner
        ? 'security_scanner'
        : (clientClass === 'gmail_proxy' ? 'gmail_prefetch' : (clientClass === 'apple_mpp' ? 'apple_prefetch' : 'bot_rapid_scan'));

      // Increment machine_prefetches counter and record event without polluting human opens or alerting
      await hincrby(k(`mail:m:${t}`), 'machine_prefetches', 1);
      await hset(k(`mail:m:${t}`), { last_event_at: now });

      const prefetchPayload = JSON.stringify({
        event: 'prefetch',
        prefetch_type: prefetchType,
        ts: now,
        delta_sec: Math.round(deltaSec),
        client_class: clientClass,
        ua,
        ip_trunc: ipTrunc,
        as_number: asNumber,
        via,
        country,
        region,
        city
      });

      await lpush(k(`mail:events:${t}`), prefetchPayload);
      await expire(k(`mail:events:${t}`), 5184000); // 60 days TTL
      return res.status(200).send(PIXEL_BUFFER);
    }

    // Persist verified human open event to Redis hash and event log
    const updatedOpens = await hincrby(k(`mail:m:${t}`), 'opens', 1);
    await hset(k(`mail:m:${t}`), {
      last_opened_at: now,
      last_event_at: now,
      status: msg.status === 'registered' ? 'opened' : msg.status
    });

    const eventPayload = JSON.stringify({
      event: 'open',
      ts: now,
      delta_sec: Math.round(deltaSec),
      client_class: clientClass,
      ua,
      ip_trunc: ipTrunc,
      as_number: asNumber,
      via,
      country,
      region,
      city
    });

    await lpush(k(`mail:events:${t}`), eventPayload);
    await expire(k(`mail:events:${t}`), 5184000); // 60 days TTL

    // 5-minute rolling debounce for email opens per client classification
    const debounceKey = k(`mail:debounce:open:${t}:${clientClass}`);
    const counterKey = k(`mail:debounce:count:${t}:${clientClass}`);
    const isDebounced = await get(debounceKey);

    if (isDebounced) {
      // Increment counter tracking suppressed duplicate open alerts
      await incr(counterKey);
    } else {
      // Set active debounce lock for 300 seconds (5 minutes)
      await set(debounceKey, '1', { ex: 300 });
      const suppressedCount = await get(counterKey);
      if (suppressedCount) {
        await del(counterKey);
      }

      // Dispatch real-time Telegram push alert for verified human open
      const delayLabel = deltaSec > 60 ? `${Math.round(deltaSec / 60)}m post-send` : `${Math.round(deltaSec)}s post-send`;
      await dispatchTelegramAlert({
        eventType: 'open',
        clientClass,
        recipientName: msg.recipient_name,
        recipientEmail: msg.recipient_email || msg.recipient,
        company: msg.company,
        track: msg.track,
        detail: `Open #${updatedOpens} (${delayLabel})`,
        ua,
        country,
        region,
        city,
        ipTrunc,
        timestamp: now,
        debounceCount: suppressedCount ? Number(suppressedCount) : 0
      });
    }
  } catch (err) {
    console.warn(`[MailTracker:Pixel] Fail-open error handled: ${err.message}`);
  }

  return res.status(200).send(PIXEL_BUFFER);
}
