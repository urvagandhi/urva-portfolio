import { verifyAdminSession } from '../../../lib/mail/token.js';
import { k, smembers, pipeline } from '../../../lib/mail/redis.js';
import { formatIstTimestamp } from '../../../lib/mail/telegram.js';
import { decodeCity, isSecurityScanner } from '../../../lib/mail/classifier.js';

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
  if (event.event === 'prefetch' || event.is_prefetch) {
    score = 0;
  } else if (event.event === 'open') {
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

  // In-memory cache to protect Redis quota (default 30 seconds, bypass with ?force=true)
  const force = req.query.force === 'true';
  const nowMs = Date.now();
  if (!force && memoryStatsCache.data && (nowMs - memoryStatsCache.cachedAt < 30000)) {
    res.setHeader('X-Stats-Cache', 'HIT');
    return res.status(200).json(memoryStatsCache.data);
  }

  try {
    const tokens = await smembers(k('mail:index:messages'));

    let totalSent = 0;
    let verifiedOpens = 0;
    let totalPrefetches = 0;
    let totalResumeViews = 0;
    let totalClicks = 0;
    let totalDownloads = 0;
    let totalDwellMs = 0;

    let totalBlocked = 0;
    let totalBounced = 0;
    let totalVoided = 0;
    const blockedCompanies = [];

    const companyMap = new Map();
    const rawEvents = [];
    const slugRankings = [];

    if (tokens && tokens.length > 0) {
      const pipelineCmds = [];
      for (const token of tokens) {
        pipelineCmds.push(['HGETALL', k(`mail:m:${token}`)]);
        pipelineCmds.push(['LRANGE', k(`mail:events:${token}`), 0, -1]);
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

        if (!msg || Object.keys(msg).length === 0) {
          continue;
        }

        // Tally blocked, bounced, and voided outreach records separately
        if (msg.status === 'blocked' || msg.status === 'bounced' || msg.status === 'voided') {
          if (msg.status === 'blocked') totalBlocked++;
          if (msg.status === 'bounced') totalBounced++;
          if (msg.status === 'voided') totalVoided++;

          blockedCompanies.push({
            token,
            company: msg.company || 'Unknown Organisation',
            recipient: msg.recipient_email || msg.recipient || '',
            name: msg.recipient_name || '',
            track: msg.track || '',
            status: msg.status,
            reason: msg.bounce_reason || (
              msg.status === 'blocked' ? 'Domain Access Blocked' :
              msg.status === 'voided' ? 'Deleted in Bin (Voided for Retry)' :
              'Email Address Bounced'
            ),
            bounced_at: Number(msg.bounced_at || msg.voided_at || msg.created_at || 0),
            bounced_at_formatted: formatIstTimestamp(Number(msg.bounced_at || msg.voided_at || msg.created_at || 0))
          });
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

        // Group by company
        const comp = msg.company || 'Unknown Organisation';
        const recipientEmail = msg.recipient_email || msg.recipient || '';
        const existingComp = companyMap.get(comp) || {
          company: comp,
          sent: 0,
          opened: 0,
          human_opens: 0,
          prefetches: 0,
          resume_viewed: 0,
          clicks: 0,
          downloads: 0,
          last_active: 0,
          first_sent: Number(msg.created_at || 0),
          recipients: [],
          active_attempts: [],
          click_timestamps: [],
          events: []
        };

        if (recipientEmail && !existingComp.recipients.includes(recipientEmail)) {
          existingComp.recipients.push(recipientEmail);
        }

        // Collect and dynamically classify interaction events
        const eventJsonList = Array.isArray(rawEventList) ? rawEventList : [];
        let msgHumanOpens = 0;
        let msgPrefetches = Number(msg.machine_prefetches || 0);

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

            const eventTs = Number(parsed.ts || 0);
            const msgCreated = Number(msg.created_at || 0);
            const deltaSec = msgCreated > 0 ? Math.max(0, (eventTs - msgCreated) / 1000) : (parsed.delta_sec || 0);
            parsed.delta_sec = Math.round(deltaSec);

            if (parsed.event === 'prefetch') {
              parsed.is_prefetch = true;
              msgPrefetches++;
            } else if (parsed.event === 'open') {
              const scanner = isSecurityScanner(parsed.ua, parsed.ip_trunc, parsed.as_number, parsed.via);
              const proxy = parsed.client_class === 'gmail_proxy' || parsed.client_class === 'apple_mpp';
              if (scanner || (proxy && deltaSec < 60) || deltaSec < 15) {
                parsed.is_prefetch = true;
                parsed.prefetch_type = scanner
                  ? 'security_scanner'
                  : (parsed.client_class === 'gmail_proxy' ? 'gmail_prefetch' : (parsed.client_class === 'apple_mpp' ? 'apple_prefetch' : 'bot_rapid_scan'));
                msgPrefetches++;
              } else {
                parsed.is_human_open = true;
                msgHumanOpens++;
              }
            }

            parsed.engagement_score = computeEngagementScore(parsed);

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

        const effectiveHumanOpens = (eventJsonList.length > 0) ? msgHumanOpens : Math.max(0, opens - msgPrefetches);
        const isHumanOpened = effectiveHumanOpens > 0 || views > 0 || clicks > 0 || downloads > 0;
        if (isHumanOpened) {
          verifiedOpens++;
        }
        totalPrefetches += msgPrefetches;
        totalResumeViews += views;
        totalClicks += clicks;
        totalDownloads += downloads;
        totalDwellMs += dwellMs;

        existingComp.active_attempts.push({
          token,
          recipient: recipientEmail,
          name: msg.recipient_name || '',
          track: msg.track || '',
          status: msg.status,
          opens,
          human_opens: effectiveHumanOpens,
          prefetches: msgPrefetches,
          views,
          clicks,
          downloads,
          created_at: Number(msg.created_at || 0),
          created_at_formatted: formatIstTimestamp(Number(msg.created_at || 0))
        });

        existingComp.sent++;
        if (isHumanOpened) existingComp.opened++;
        existingComp.human_opens = (existingComp.human_opens || 0) + effectiveHumanOpens;
        existingComp.prefetches = (existingComp.prefetches || 0) + msgPrefetches;
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

      // Cross-link any quarantined/bounced prior attempts for the same company
      const priorQuarantined = blockedCompanies.filter(
        (b) => (b.company || '').toLowerCase().trim() === comp.company.toLowerCase().trim()
      );
      if (priorQuarantined.length > 0) {
        comp.prior_quarantined = priorQuarantined.map((b) => ({
          token: b.token,
          recipient: b.recipient,
          name: b.name,
          track: b.track,
          status: b.status,
          reason: b.reason,
          date_formatted: b.bounced_at_formatted
        }));
      }

      // Assemble unified chronological outreach delivery journey (failed + active attempts)
      const allAttempts = [];
      for (const pq of priorQuarantined) {
        allAttempts.push({
          token: pq.token,
          recipient: pq.recipient,
          name: pq.name,
          track: pq.track,
          status: pq.status,
          is_active: false,
          reason: pq.reason,
          created_at: pq.bounced_at,
          created_at_formatted: pq.bounced_at_formatted,
          opens: 0,
          clicks: 0,
          resume_views: 0
        });
      }
      for (const act of (comp.active_attempts || [])) {
        allAttempts.push({
          token: act.token,
          recipient: act.recipient,
          name: act.name,
          track: act.track,
          status: act.status,
          is_active: true,
          reason: null,
          created_at: act.created_at,
          created_at_formatted: act.created_at_formatted,
          opens: act.opens,
          human_opens: act.human_opens,
          prefetches: act.prefetches,
          clicks: act.clicks,
          resume_views: act.views
        });
      }
      allAttempts.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
      comp.attempts_journey = allAttempts.map((att, idx) => ({
        step: idx + 1,
        ...att
      }));

      // Classify engagement confidence tier
      if (comp.clicks > 0 || comp.resume_viewed > 0 || comp.downloads > 0) {
        comp.confidence_tier = 'high';
        comp.confidence_label = 'Confirmed Read';
        comp.confidence_variant = 'emerald';
        comp.confidence_tooltip = 'High confidence: Recruiter clicked showcase links or inspected resume';
      } else if ((comp.human_opens || 0) > 0) {
        comp.confidence_tier = 'medium';
        comp.confidence_label = 'Probable Read';
        comp.confidence_variant = 'amber';
        comp.confidence_tooltip = 'Medium confidence: Email opened > 60s post-send';
      } else if ((comp.prefetches || 0) > 0) {
        comp.confidence_tier = 'low';
        comp.confidence_label = 'Prefetched';
        comp.confidence_variant = 'blue';
        comp.confidence_tooltip = 'Automated: Cached by Google Image Proxy or security scanner upon delivery';
      } else {
        comp.confidence_tier = 'unopened';
        comp.confidence_label = 'Unopened';
        comp.confidence_variant = 'muted';
        comp.confidence_tooltip = 'Delivered to inbox, pending recruiter opening';
      }

      // Classify outreach journey type and dynamic UI badge
      const retryCount = priorQuarantined.length;
      const activeCount = (comp.recipients || []).length;
      if (retryCount > 0) {
        comp.journey_type = 'retry_success';
        comp.journey_badge = {
          type: 'retry_success',
          label: `${retryCount} Retried`,
          variant: 'amber',
          tooltip: `${retryCount} prior failed attempt(s) replaced by current active recipient`
        };
      } else if (activeCount > 1) {
        comp.journey_type = 'multi_contact';
        comp.journey_badge = {
          type: 'multi_contact',
          label: `${activeCount} Contacts`,
          variant: 'blue',
          tooltip: `${activeCount} active recruiter contacts reached at this company`
        };
      } else {
        comp.journey_type = 'single';
        comp.journey_badge = {
          type: 'single',
          label: 'Direct',
          variant: 'emerald',
          tooltip: 'Direct delivery on first attempt'
        };
      }
      delete comp.active_attempts;
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

    // Sort blocked companies reverse-chronologically
    blockedCompanies.sort((a, b) => (b.bounced_at || 0) - (a.bounced_at || 0));

    // Group quarantined companies (companies where ALL attempts failed)
    const quarantinedCompanyMap = new Map();
    for (const b of blockedCompanies) {
      const cName = b.company || 'Unknown Organisation';
      const existing = quarantinedCompanyMap.get(cName) || {
        company: cName,
        total_attempts: 0,
        last_bounced_at: 0,
        attempts: []
      };
      existing.total_attempts++;
      if ((b.bounced_at || 0) > existing.last_bounced_at) {
        existing.last_bounced_at = b.bounced_at || 0;
      }
      existing.attempts.push(b);
      quarantinedCompanyMap.set(cName, existing);
    }
    const quarantinedCompanies = Array.from(quarantinedCompanyMap.values())
      .map(qc => ({
        ...qc,
        attempts: qc.attempts
          .sort((a, b) => (a.bounced_at || 0) - (b.bounced_at || 0))
          .map((att, idx) => ({
            step: idx + 1,
            ...att
          })),
        last_bounced_at_formatted: formatIstTimestamp(qc.last_bounced_at)
      }))
      .sort((a, b) => (b.last_bounced_at || 0) - (a.last_bounced_at || 0));

    const responsePayload = {
      summary: {
        total_sent: totalSent,
        verified_opens: verifiedOpens,
        open_rate_percent: openRatePercent,
        machine_prefetches: totalPrefetches,
        total_raw_opens: verifiedOpens + totalPrefetches,
        total_resume_views: totalResumeViews,
        total_clicks: totalClicks,
        total_downloads: totalDownloads,
        avg_dwell_seconds: avgDwellSeconds,
        total_blocked: totalBlocked,
        total_bounced: totalBounced,
        total_voided: totalVoided,
        total_inactive: totalBlocked + totalBounced + totalVoided
      },
      slug_rankings: slugRankings,
      company_rollups: companyRollups,
      blocked_companies: blockedCompanies,
      quarantined_companies: quarantinedCompanies,
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
