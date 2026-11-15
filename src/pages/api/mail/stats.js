import { verifyAdminSession } from '../../../lib/mail/token.js';
import { k, smembers, pipeline } from '../../../lib/mail/redis.js';
import { formatIstTimestamp } from '../../../lib/mail/telegram.js';
import { decodeCity } from '../../../lib/mail/classifier.js';

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
        const lastEventAt = Number(msg.last_event_at || msg.created_at || 0);

        // Verification: If recipient clicked a link or viewed resume, email is definitively verified open
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
          last_active: 0
        };

        existingComp.sent++;
        if (isOpened) existingComp.opened++;
        existingComp.resume_viewed += views;
        existingComp.clicks += clicks;
        existingComp.downloads += downloads;
        if (lastEventAt > existingComp.last_active) {
          existingComp.last_active = lastEventAt;
        }
        companyMap.set(comp, existingComp);

        // Collect interaction events
        const eventJsonList = Array.isArray(rawEventList) ? rawEventList : [];
        for (const item of eventJsonList) {
          try {
            const parsed = typeof item === 'string' ? JSON.parse(item) : item;
            parsed.token = token;
            parsed.company = msg.company;
            parsed.recipient = msg.recipient_email || msg.recipient;
            parsed.track = msg.track;
            parsed.city = parsed.city ? decodeCity(parsed.city) : '';
            parsed.ist_time = formatIstTimestamp(parsed.ts);
            parsed.engagement_score = computeEngagementScore(parsed);
            rawEvents.push(parsed);
          } catch (_) {}
        }
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

    // Sort company rollups by last active timestamp
    const companyRollups = Array.from(companyMap.values())
      .sort((a, b) => b.last_active - a.last_active)
      .map(c => ({
        ...c,
        last_active_formatted: c.last_active > 0 ? formatIstTimestamp(c.last_active) : 'Pending'
      }));

    // Sort events reverse-chronologically
    rawEvents.sort((a, b) => (b.ts || 0) - (a.ts || 0));

    const openRatePercent = totalSent > 0 ? Number(((verifiedOpens / totalSent) * 100).toFixed(1)) : 0;
    const avgDwellSeconds = totalResumeViews > 0 ? Math.round(totalDwellMs / totalResumeViews / 1000) : 0;

    return res.status(200).json({
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
    });
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
