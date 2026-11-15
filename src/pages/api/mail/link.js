import { verifyToken } from '../../../lib/mail/token.js';
import { resolveDestination } from '../../../lib/mail/allowlist.js';
import { truncateIp, decodeCity } from '../../../lib/mail/classifier.js';
import { k, hgetall, hincrby, hset, lpush, expire, zincrby, incr, sadd, smembers, get, set } from '../../../lib/mail/redis.js';
import { dispatchTelegramAlert } from '../../../lib/mail/telegram.js';

/**
 * Showcase Link Redirector and Click Telemetry Wrapper.
 * Hardened against open redirect vulnerabilities with an immutable allowlist.
 */
export default async function handler(req, res) {
  const { t, slug } = req.query;

  // Verify slug against immutable server-side allowlist
  const destUrl = resolveDestination(slug);
  if (!destUrl) {
    res.setHeader('Content-Type', 'application/problem+json');
    return res.status(404).json({
      type: 'https://urvagandhi.tech/docs/errors/not-found',
      title: 'Invalid Destination Slug',
      status: 404,
      detail: 'The requested showcase slug is not permitted.',
      instance: '/api/mail/link'
    });
  }

  // FR-26: HEAD filter to avoid automated pre-fetchers and scanners corrupting metrics
  if (req.method === 'HEAD') {
    res.setHeader('Location', destUrl);
    res.setHeader('Cache-Control', 'no-store, private');
    return res.status(302).end();
  }

  // Fail-open: if token is invalid or missing, execute redirection immediately without logging
  if (!t || !verifyToken(t)) {
    res.setHeader('Location', destUrl);
    res.setHeader('Cache-Control', 'no-store, private');
    return res.status(302).end();
  }

  try {
    const msg = await hgetall(k(`mail:m:${t}`));

    // Only record clicks if message exists and is not voided
    if (msg && Object.keys(msg).length > 0 && msg.status !== 'voided') {
      const ua = req.headers['user-agent'] || '';
      const forwardedFor = req.headers['x-forwarded-for'];
      const rawIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (req.socket?.remoteAddress || '');
      const ipTrunc = truncateIp(rawIp);
      const country = req.headers['x-vercel-ip-country'] || '';
      const region = req.headers['x-vercel-ip-country-region'] || '';
      const city = decodeCity(req.headers['x-vercel-ip-city']);
      const now = Date.now();

      // Increment click metrics in hash and global leaderboard sorted set
      const currentOpens = Number(msg.opens || 0);
      const newOpens = currentOpens > 0 ? currentOpens : 1;
      const updatedClicks = await hincrby(k(`mail:m:${t}`), 'clicks', 1);
      await zincrby(k('mail:stats:slug_clicks'), 1, slug);

      await hset(k(`mail:m:${t}`), {
        last_event_at: now,
        opens: newOpens,
        status: msg.status === 'registered' || msg.status === 'opened' ? 'clicked' : msg.status
      });

      if (currentOpens === 0) {
        const openEvent = JSON.stringify({
          event: 'open',
          ts: now,
          client_class: 'direct_unclassified',
          ua,
          ip_trunc: ipTrunc,
          country,
          region,
          city
        });
        await lpush(k(`mail:events:${t}`), openEvent);
      }

      const eventPayload = JSON.stringify({
        event: 'click',
        ts: now,
        slug,
        dest_url: destUrl,
        ua,
        ip_trunc: ipTrunc,
        country,
        region,
        city
      });

      await lpush(k(`mail:events:${t}`), eventPayload);
      await expire(k(`mail:events:${t}`), 5184000);

      // Rate-limit automated email security scanners while preserving human Ctrl-clicks
      // A human recruiter using Ctrl-click to open multiple tabs typically opens 2 to 4 links from a single IP.
      // An enterprise scanner systematically opens 8 to 20 links, often across multiple cloud datacenter IPs.
      const burstKey = k(`mail:burst:click:${t}`);
      const ipSetKey = k(`mail:burst:ips:${t}`);

      const burstCount = await incr(burstKey);
      if (burstCount === 1) {
        await expire(burstKey, 45); // 45-second sliding window
      }

      await sadd(ipSetKey, ipTrunc || 'unknown');
      if (burstCount === 1) {
        await expire(ipSetKey, 45);
      }
      const ipMembers = await smembers(ipSetKey);
      const isMultiIp = Array.isArray(ipMembers) && ipMembers.length >= 2;

      // Allow up to 4 clicks from the same IP (accommodates human recruiter Ctrl-clicking multiple links)
      if (burstCount <= 4 && !isMultiIp) {
        await dispatchTelegramAlert({
          eventType: 'link_click',
          recipientName: msg.recipient_name,
          recipientEmail: msg.recipient_email || msg.recipient,
          company: msg.company,
          track: msg.track,
          detail: `Clicked slug: ${slug} (Click #${updatedClicks}) → ${destUrl}`,
          ua,
          country,
          region,
          city,
          ipTrunc,
          timestamp: now
        });
      } else if (burstCount === 5 || (burstCount >= 3 && isMultiIp)) {
        // Triggered only on genuine automated security scanner behavior:
        // Either >= 5 links visited in under 45s, OR multiple distinct IP addresses scanning simultaneously
        const scannerKey = k(`mail:scanner:alerted:${t}`);
        const alreadyAlerted = await get(scannerKey);
        if (!alreadyAlerted) {
          await set(scannerKey, '1', { ex: 300 }); // Alert at most once per 5 minutes per token
          await dispatchTelegramAlert({
            eventType: 'scanner_burst',
            recipientName: msg.recipient_name,
            recipientEmail: msg.recipient_email || msg.recipient,
            company: msg.company,
            track: msg.track,
            detail: `Automated security gateway scanner detected (${burstCount}+ links pre-screened in seconds). Subsequent link click alerts suppressed to protect Telegram inbox.`,
            ua: 'Automated Security Scanner',
            country,
            region,
            city,
            ipTrunc,
            timestamp: now
          });
        }
      }
      // For higher counts: completely suppressed on Telegram to protect inbox from scanner floods
    }
  } catch (err) {
    console.warn(`[MailTracker:Link] Fail-open error handled: ${err.message}`);
  }

  res.setHeader('Location', destUrl);
  res.setHeader('Cache-Control', 'no-store, private');
  return res.status(302).end();
}
