/**
 * Telegram Bot API push alert notification service for Mail Tracker.
 * Dispatches real-time alerts formatted in Indian Standard Time (Asia/Kolkata).
 */

import { decodeCity } from './classifier.js';

/**
 * Formats a Date or epoch millisecond value into Indian Standard Time (IST).
 * Format: YYYY-MM-DD HH:mm:ss IST
 *
 * @param {Date|number} [date=new Date()] Target date or timestamp
 * @returns {string} Formatted IST timestamp string
 */
export function formatIstTimestamp(date = new Date()) {
  const d = typeof date === 'number' ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(d);

  const getPart = (type) => parts.find(p => p.type === type)?.value || '00';
  return `${getPart('year')}-${getPart('month')}-${getPart('day')} ${getPart('hour')}:${getPart('minute')}:${getPart('second')} IST`;
}

/**
 * Formats raw User-Agent headers into human-readable browser and operating system summaries.
 *
 * @param {string} ua Raw User-Agent string
 * @returns {string} Clean, readable client summary
 */
export function formatUserAgent(ua) {
  if (!ua || typeof ua !== 'string') return 'Unknown client';
  const trimmed = ua.trim();
  if (trimmed === 'Mozilla/5.0') return 'Apple Mail Privacy Proxy';
  if (trimmed.includes('GoogleImageProxy')) return 'Google Image Proxy (Gmail)';
  if (trimmed.startsWith('curl/')) return `curl CLI (${trimmed.split(' ')[0]})`;

  let browser = '';
  if (trimmed.includes('Edg/')) {
    const match = trimmed.match(/Edg\/(\d+)/);
    browser = match ? `Edge ${match[1]}` : 'Edge';
  } else if (trimmed.includes('Chrome/') || trimmed.includes('CriOS/')) {
    const match = trimmed.match(/(?:Chrome|CriOS)\/(\d+)/);
    browser = match ? `Chrome ${match[1]}` : 'Chrome';
  } else if (trimmed.includes('Firefox/') || trimmed.includes('FxiOS/')) {
    const match = trimmed.match(/(?:Firefox|FxiOS)\/(\d+)/);
    browser = match ? `Firefox ${match[1]}` : 'Firefox';
  } else if (trimmed.includes('Safari/') && trimmed.includes('Version/')) {
    const match = trimmed.match(/Version\/(\d+)/);
    browser = match ? `Safari ${match[1]}` : 'Safari';
  } else if (trimmed.includes('Safari/')) {
    browser = 'Safari';
  }

  let os = '';
  if (trimmed.includes('iPhone')) os = 'iPhone';
  else if (trimmed.includes('iPad')) os = 'iPad';
  else if (trimmed.includes('Android')) os = 'Android';
  else if (trimmed.includes('Macintosh') || trimmed.includes('Mac OS X')) os = 'macOS';
  else if (trimmed.includes('Windows NT')) os = 'Windows';
  else if (trimmed.includes('Linux')) os = 'Linux';

  if (browser && os) return `${browser} on ${os}`;
  if (browser) return browser;
  if (os) return os;
  return trimmed.length > 50 ? `${trimmed.substring(0, 47)}...` : trimmed;
}

/**
 * Formats the technical role track into a human-readable title.
 *
 * @param {string} track Technical track identifier
 * @returns {string} Human-friendly track title
 */
export function formatTrack(track) {
  if (!track || typeof track !== 'string') return 'Software Engineer';
  const t = track.toLowerCase().trim();
  if (t === 'generic' || t === 'swe') return 'Software Engineer (generic)';
  if (t === 'java') return 'Java Backend';
  if (t === 'ai') return 'AI / ML Engineer';
  if (t === 'intern') return 'Software Intern';
  return track;
}

/**
 * Builds the HTML alert message payload following the formal specification.
 *
 * @param {Object} params Interaction and candidate parameters
 * @returns {string} HTML-formatted Telegram message
 */
export function buildAlertMessage(params = {}) {
  const isPreview = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production';
  const previewPrefix = isPreview ? '<b>[PREVIEW]</b> ' : '';

  let headerTag = 'Outreach Interaction';
  let icon = '⚡';
  if (params.eventType === 'open') {
    if (params.clientClass === 'apple_mpp') {
      icon = '⚠️';
      headerTag = 'Apple MPP Prefetch';
    } else if (params.clientClass === 'gmail_proxy') {
      icon = '✉️';
      headerTag = 'Email Opened (Gmail Proxy)';
    } else {
      icon = '✉️';
      headerTag = 'Email Opened';
    }
  } else if (params.eventType === 'link_click') {
    icon = '🔗';
    headerTag = 'Link Clicked';
  } else if (params.eventType === 'resume_view') {
    icon = '📄';
    headerTag = 'Resume Viewed';
  } else if (params.eventType === 'resume_download' || params.eventType === 'download') {
    icon = '📥';
    headerTag = 'Resume Downloaded';
  }

  const debounceSuffix = params.debounceCount && Number(params.debounceCount) > 0
    ? ` <i>(+${params.debounceCount} repeated in last 5m)</i>`
    : '';

  const timestamp = formatIstTimestamp(params.timestamp || Date.now());
  const recipient = params.recipientName
    ? `${params.recipientName} (${params.recipientEmail || 'No email'})`
    : (params.recipientEmail || 'Unknown recipient');
  const company = params.company || 'Unknown organisation';
  const detail = params.detail || 'None';
  const cleanCity = params.city ? decodeCity(params.city) : '';
  const location = [cleanCity, params.region, params.country].filter(Boolean).join(', ') || 'Unknown location';
  const ip = params.ipTrunc || 'Unknown IP';
  const clientSummary = formatUserAgent(params.ua);
  const trackLabel = formatTrack(params.track);

  return `${previewPrefix}<b>${icon} ${headerTag} · ${company}</b>${debounceSuffix}

- <b>Recruiter:</b> ${recipient}
- <b>Company:</b> ${company}
- <b>Track:</b> ${trackLabel}
- <b>Detail:</b> ${detail}
- <b>Location:</b> ${location} (IP: ${ip})
- <b>Client:</b> ${clientSummary}
- <b>Time:</b> ${timestamp}`;
}

/**
 * Dispatches an HTML message to the personal Telegram alerts channel within a 1.5s timeout.
 *
 * @param {string} textHtml HTML formatted message content
 * @returns {Promise<{success: boolean, data?: any, error?: string, skipped?: boolean}>}
 */
export async function sendTelegramAlert(textHtml) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || '6008118995';

  if (!botToken) {
    return {
      success: true,
      skipped: true,
      reason: 'TELEGRAM_BOT_TOKEN not configured'
    };
  }

  const timeoutMs = process.env.TELEGRAM_TIMEOUT_MS
    ? Number(process.env.TELEGRAM_TIMEOUT_MS)
    : (process.env.VERCEL_ENV === 'production' ? 1500 : 5000);

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: textHtml,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`[MailTracker:Telegram] API returned status ${res.status}: ${errText}`);
      return { success: false, status: res.status, error: errText };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn(`[MailTracker:Telegram] Alert dispatch timed out or failed: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * High-level alert dispatcher assembling parameters and transmitting via Telegram.
 *
 * @param {Object} params Notification parameters
 * @returns {Promise<{success: boolean, data?: any, error?: string, skipped?: boolean}>}
 */
export async function dispatchTelegramAlert(params) {
  try {
    const html = buildAlertMessage(params);
    return await sendTelegramAlert(html);
  } catch (err) {
    return { success: false, error: err.message };
  }
}
