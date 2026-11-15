import { verifyAdminSession } from '../../../lib/mail/token.js';
import { k, smembers, pipeline } from '../../../lib/mail/redis.js';
import { formatIstTimestamp } from '../../../lib/mail/telegram.js';
import { decodeCity } from '../../../lib/mail/classifier.js';

// In-memory stats cache to prevent Upstash Redis quota exhaustion on polling
let memoryStatsCache = {
  data: null,
  cachedAt: 0
};

/**
 * Calculates a quantitative recruiter engagement score based on interaction depth.
 *
 * @param {Object} event Raw event object
 * @returns {number} Computed score
 */
function computeEngagementScore(event) {
  let score = 0;
  if (event.event === 'open') {
    score = event.client_class === 'apple_mpp' ? 0 : 1;
  } else if (event.event === 'click') {
    score = 3;
  } else if (event.event === 'resume_view') {
    score = 5;
  } else if (event.event === 'beacon_dwell') {
    score = Number(event.dwell_ms || 0) >= 30000 ? 2 : 1;
  } else if (event.event === 'download' || event.event === 'resume_download') {
    score = 3;
  }
  return score;
}

/**
 * Telemetry Analytics Aggregation Endpoint.
 * Protected by outreach_admin_session cookie authentication.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Content-Type', 'application/problem+json');
    return res.status(405).json({
      type: 'https://urvagandhi.tech/docs/errors/method-not-allowed',
      title: 'Method Not Allowed',
      status: 405,
      detail: 'Only GET method is permitted.',
      instance: '/api/mail/stats'
    });
  }

  // Session authentication check
  if (!verifyAdminSession(req)) {
    res.setHeader('Content-Type', 'application/problem+json');
    return res.status(401).json({
      type: 'https://urvagandhi.tech/docs/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Valid admin session cookie required.',
      instance: '/api/mail/stats'
    });
  }

  // Check 8-second memory cache to protect Redis quota (bypass with ?force=true)
  const force = req.query.force === 'true';
  const nowMs = Date.now();
  if (!force && memoryStatsCache.data && (nowMs - memoryStatsCache.cachedAt < 8000)) {
    res.setHeader('X-Stats-Cache', 'HIT');
    return res.status(200).json(memoryStatsCache.data);
  }

  try {
    const tokens = await smembers(k('mail:index:messages'));

    let totalSent = 0;
    let verifiedOpens = 0;
    let totalResumeViews = 0;
    let totalClicks = 0;
    let totalDownloads = 0;
    let totalDwellMs = 0;

    const companyMap = new Map();
    const rawEvents = [];
    const slugRankings = [];

    if (tokens && tokens.length > 0) {
      const pipelineCmds = [];
      for (const token of tokens) {
        pipelineCmds.push(['HGETALL', k(`mail:m:${token}`)]);
        pipelineCmds.push(['LRANGE', k(`mail:events:${token}`), 0, 20]);
      }
      pipelineCmds.push(['ZREVRANGE', k('mail:stats:slug_clicks'), 0, -1, 'WITHSCORES']);

      const pipelineResults = await pipeline(pipelineCmds);

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const rawMsg = pipelineResults[i * 2];
        const rawEventList = pipelineResults[i * 2 + 1];

        const msg = (rawMsg && typeof rawMsg === 'object' && !Array.isArray(rawMsg))
          ? rawMsg
          : (Array.isArray(rawMsg) ? Object.fromEntries(
              Array.from({ length: Math.floor(rawMsg.length / 2) }, (_, idx) => [rawMsg[idx * 2], rawMsg[idx * 2 + 1]])
            ) : {});

        if (!msg || Object.keys(msg).length === 0 || msg.status === 'voided') {
          continue;
        }

        totalSent++;
        const opens = Number(msg.opens || 0);
        const views = Number(msg.resume_views || 0);
        const clicks = Number(msg.clicks || 0);
        const downloads = Number(msg.downloads || 0);
        const dwellMs = Number(msg.total_dwell_ms || 0);
        
        // Find most recent timestamp across all possible event records on the message hash
        const msgLastEvent = Math.max(
          Number(msg.last_event_at || 0),
          Number(msg.last_opened_at || 0)
        );

        // Verification: If recipient clicked a link, viewed resume, or opened email
        const isOpened = opens > 0 || views > 0 || clicks > 0;
        if (isOpened) {
          verifiedOpens++;
        }
        totalResumeViews += views;
        totalClicks += clicks;
        totalDownloads += downloads;
        totalDwellMs += dwellMs;

        // Group by company
        const comp = msg.company || 'Unknown Organisation';
        const existingComp = companyMap.get(comp) || {
          company: comp,
          sent: 0,
          opened: 0,
          resume_viewed: 0,
          clicks: 0,
          downloads: 0,
          last_active: 0,
          first_sent: Number(msg.created_at || 0),
          click_timestamps: [],
          events: []
        };

        existingComp.sent++;
        if (isOpened) existingComp.opened++;
        existingComp.resume_viewed += views;
        existingComp.clicks += clicks;
        existingComp.downloads += downloads;
        if (msgLastEvent > existingComp.last_active) {
          existingComp.last_active = msgLastEvent;
        }
        const msgCreated = Number(msg.created_at || 0);
        if (!existingComp.first_sent || (msgCreated > 0 && msgCreated < existingComp.first_sent)) {
          existingComp.first_sent = msgCreated;
        }

        // Collect interaction events
        const eventJsonList = Array.isArray(rawEventList) ? rawEventList : [];
        for (const item of eventJsonList) {
          try {
            const parsed = typeof item === 'string' ? JSON.parse(item) : item;
            if (parsed.event === 'beacon_dwell') continue; // Skip continuous dwell ticks from milestone feed
            parsed.token = token;
            parsed.company = msg.company;
            parsed.recipient = msg.recipient_email || msg.recipient;
            parsed.track = msg.track;
            parsed.city = parsed.city ? decodeCity(parsed.city) : '';
            parsed.ist_time = formatIstTimestamp(parsed.ts);
            parsed.engagement_score = computeEngagementScore(parsed);

            const eventTs = Number(parsed.ts || 0);
            if (eventTs > existingComp.last_active) {
              existingComp.last_active = eventTs;
            }
            if (parsed.event === 'click' && eventTs > 0) {
              existingComp.click_timestamps.push(eventTs);
            }

            existingComp.events.push(parsed);
            rawEvents.push(parsed);
          } catch (_) {}
        }
        companyMap.set(comp, existingComp);
      }

      // Showcase link rankings from pipeline
      const rawSlugData = pipelineResults[pipelineResults.length - 1];
      if (Array.isArray(rawSlugData)) {
        for (let i = 0; i < rawSlugData.length; i += 2) {
          slugRankings.push({
            slug: rawSlugData[i],
            clicks: Number(rawSlugData[i + 1] || 0)
          });
        }
      }
    }

    // Flag automated enterprise email security scanner behavior (e.g. Proofpoint, SafeLinks, Mimecast)
    // Heuristic: >= 5 rapid link clicks executed within 120 seconds
    for (const comp of companyMap.values()) {
      const clickTimes = (comp.click_timestamps || []).sort((a, b) => a - b);
      if (clickTimes.length >= 5) {
        const spanMs = clickTimes[clickTimes.length - 1] - clickTimes[0];
        if (spanMs <= 120000) {
          comp.is_security_scanner = true;
          comp.scanner_note = `Automated Email Security Gateway (Pre-screened ${clickTimes.length} links in ${Math.round(spanMs / 1000)}s)`;
        }
      }
      delete comp.click_timestamps;
    }

    // Deterministic two-tier sorting:
    // Tier 1: Companies with engagement (last_active > 0), ordered by last_active DESCENDING (most recent first)
    // Tier 2: Pending companies (last_active === 0), ordered deterministically by company name
    const companyRollups = Array.from(companyMap.values())
      .sort((a, b) => {
        const aActive = a.last_active || 0;
        const bActive = b.last_active || 0;
        if (aActive > 0 && bActive > 0) {
          if (bActive !== aActive) return bActive - aActive;
          return a.company.localeCompare(b.company);
        }
        if (aActive > 0 && bActive === 0) return -1;
        if (aActive === 0 && bActive > 0) return 1;
        return a.company.localeCompare(b.company);
      })
      .map(c => {
        const sortedEvents = (c.events || []).sort((a, b) => (b.ts || 0) - (a.ts || 0));
        return {
          ...c,
          events: sortedEvents,
          last_active_formatted: c.last_active > 0 ? formatIstTimestamp(c.last_active) : 'Pending'
        };
      });

    // Sort events reverse-chronologically
    rawEvents.sort((a, b) => (b.ts || 0) - (a.ts || 0));

    const openRatePercent = totalSent > 0 ? Number(((verifiedOpens / totalSent) * 100).toFixed(1)) : 0;
    const avgDwellSeconds = totalResumeViews > 0 ? Math.round(totalDwellMs / totalResumeViews / 1000) : 0;

    const responsePayload = {
      summary: {
        total_sent: totalSent,
        verified_opens: verifiedOpens,
        open_rate_percent: openRatePercent,
        total_resume_views: totalResumeViews,
        total_clicks: totalClicks,
        total_downloads: totalDownloads,
        avg_dwell_seconds: avgDwellSeconds
      },
      slug_rankings: slugRankings,
      company_rollups: companyRollups,
      recent_events: rawEvents.slice(0, 50)
    };

    // Save to memory cache
    memoryStatsCache = {
      data: responsePayload,
      cachedAt: Date.now()
    };

    res.setHeader('X-Stats-Cache', 'MISS');
    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error(`[MailTracker:Stats] Error aggregating statistics: ${err.message}`);
    res.setHeader('Content-Type', 'application/problem+json');
    return res.status(500).json({
      type: 'https://urvagandhi.tech/docs/errors/internal-error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to aggregate outreach statistics.',
      instance: '/api/mail/stats'
    });
  }
}
