#!/usr/bin/env node

/**
 * Historical Telemetry Bot Reclassification Script.
 * Scans Redis events for automated security scanner signatures (AS8075, Chrome 109,
 * Chrome 140+, legacy crawlers) and reclassifies them as machine prefetches.
 *
 * Preserves all historical records while restoring accurate human telemetry metrics.
 */

import { isSecurityScanner } from '../src/lib/mail/classifier.js';
import { executeCommand, pipeline, k } from '../src/lib/mail/redis.js';

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`[Reclassify] Running in ${isDryRun ? 'DRY RUN' : 'LIVE'} mode...`);

  const rawTokens = await executeCommand('SMEMBERS', k('mail:index:messages'));
  const tokens = Array.isArray(rawTokens) ? rawTokens : [];
  console.log(`[Reclassify] Found ${tokens.length} total outreach tokens in datastore.`);

  let reclassifiedEventsCount = 0;
  let reclassifiedMessagesCount = 0;
  const affectedCompanies = [];

  const CHUNK_SIZE = 50;
  for (let c = 0; c < tokens.length; c += CHUNK_SIZE) {
    const chunkTokens = tokens.slice(c, c + CHUNK_SIZE);
    const pipelineCmds = [];
    for (const t of chunkTokens) {
      pipelineCmds.push(['HGETALL', k(`mail:m:${t}`)]);
      pipelineCmds.push(['LRANGE', k(`mail:events:${t}`), 0, -1]);
    }

    const results = await pipeline(pipelineCmds);
    const updatePipelineCmds = [];

    for (let i = 0; i < chunkTokens.length; i++) {
      const token = chunkTokens[i];
      const rawMsg = results[i * 2];
      const rawEvents = results[i * 2 + 1];

      if (!Array.isArray(rawEvents) || rawEvents.length === 0) continue;

      const msg = Array.isArray(rawMsg)
        ? Object.fromEntries(Array.from({ length: Math.floor(rawMsg.length / 2) }, (_, idx) => [rawMsg[idx * 2], rawMsg[idx * 2 + 1]]))
        : (rawMsg && typeof rawMsg === 'object' ? rawMsg : {});

      let messageModified = false;
      const updatedEvents = [];
      let humanOpens = 0;
      let humanViews = 0;
      let humanClicks = 0;
      let prefetches = 0;

      for (const evStr of rawEvents) {
        let ev;
        try {
          ev = typeof evStr === 'string' ? JSON.parse(evStr) : evStr;
        } catch (_) {
          updatedEvents.push(evStr);
          continue;
        }

        const ua = ev.ua || '';
        const ip = ev.ip_trunc || '';
        const as = String(ev.as_number || '');
        const via = ev.via || '';
        const deltaSec = Number(ev.delta_sec || 0);

        const isScanner = isSecurityScanner(ua, ip, as, via);
        const isProxyPrefetch = (ev.client_class === 'gmail_proxy' || ev.client_class === 'apple_mpp') && deltaSec < 60;
        const isRapidScan = deltaSec > 0 && deltaSec < 30;

        if (ev.event === 'prefetch' || ev.is_prefetch || isScanner || isProxyPrefetch || isRapidScan) {
          prefetches++;
          if (ev.event !== 'prefetch' || !ev.is_prefetch) {
            messageModified = true;
            reclassifiedEventsCount++;
            ev.event = 'prefetch';
            ev.is_prefetch = true;
            ev.prefetch_type = isScanner
              ? (ev.event === 'click' ? 'scanner_link_detonation' : (ev.event === 'resume_view' ? 'scanner_doc_detonation' : 'security_scanner'))
              : (isProxyPrefetch ? (ev.client_class === 'gmail_proxy' ? 'gmail_prefetch' : 'apple_prefetch') : 'bot_rapid_scan');
          }
        } else if (ev.event === 'open') {
          humanOpens++;
        } else if (ev.event === 'resume_view') {
          humanViews++;
        } else if (ev.event === 'click') {
          humanClicks++;
        }

        updatedEvents.push(JSON.stringify(ev));
      }

      if (messageModified) {
        reclassifiedMessagesCount++;
        const newStatus = (msg.status === 'blocked' || msg.status === 'bounced' || msg.status === 'voided')
          ? msg.status
          : (humanViews > 0 ? 'resume_viewed' : (humanClicks > 0 ? 'clicked' : (humanOpens > 0 ? 'opened' : 'registered')));

        affectedCompanies.push({
          company: msg.company || 'Unknown',
          recipient: msg.recipient_email || msg.recipient || '',
          oldStatus: msg.status,
          newStatus,
          prefetches,
          humanOpens,
          humanViews,
          humanClicks
        });

        if (!isDryRun) {
          updatePipelineCmds.push(['DEL', k(`mail:events:${token}`)]);
          for (const uEv of updatedEvents) {
            updatePipelineCmds.push(['RPUSH', k(`mail:events:${token}`), uEv]);
          }
          updatePipelineCmds.push(['EXPIRE', k(`mail:events:${token}`), 5184000]);

          updatePipelineCmds.push(['HSET', k(`mail:m:${token}`),
            'opens', String(humanOpens),
            'resume_views', String(humanViews),
            'clicks', String(humanClicks),
            'machine_prefetches', String(prefetches),
            'status', newStatus
          ]);
        }
      }
    }

    if (!isDryRun && updatePipelineCmds.length > 0) {
      await pipeline(updatePipelineCmds);
    }
  }

  console.log('\n====================================================');
  console.log(`[Reclassify] Completed! Summary:`);
  console.log(` - Reclassified Events: ${reclassifiedEventsCount}`);
  console.log(` - Reclassified Messages: ${reclassifiedMessagesCount}`);
  console.log(` - Affected Companies:`);
  for (const c of affectedCompanies) {
    console.log(`    • ${c.company} (${c.recipient}) | Status: ${c.oldStatus} -> ${c.newStatus} | Prefetches: ${c.prefetches} | Human Opens: ${c.humanOpens} | Views: ${c.humanViews} | Clicks: ${c.humanClicks}`);
  }
  console.log('====================================================\n');
}

main().catch(console.error);
