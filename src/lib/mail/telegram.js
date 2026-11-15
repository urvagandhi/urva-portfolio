/**
 * Telegram Bot API push alert notification service for Mail Tracker.
 * Dispatches real-time alerts formatted in Indian Standard Time (Asia/Kolkata).
 */

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
 * Builds the HTML alert message payload following the formal specification.
 *
 * @param {Object} params Interaction and candidate parameters
 * @returns {string} HTML-formatted Telegram message
 */
export function buildAlertMessage(params = {}) {
  const isPreview = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production';
  const previewPrefix = isPreview ? '<b>[PREVIEW]</b> ' : '';

  let headerTag = '[Outreach Interaction]';
  if (params.eventType === 'open') {
    if (params.clientClass === 'apple_mpp') {
      headerTag = '[⚠️ Probable Apple MPP Prefetch]';
    } else if (params.clientClass === 'gmail_proxy') {
      headerTag = '[Gmail Proxy Open]';
    } else {
      headerTag = '[Direct Open (Unclassified)]';
    }
  } else if (params.eventType === 'link_click') {
    headerTag = '[Link Clicked]';
  } else if (params.eventType === 'resume_view') {
    headerTag = '[Resume Viewed]';
  } else if (params.eventType === 'resume_download') {
    headerTag = '[Resume Downloaded]';
  }

  const debounceSuffix = params.debounceCount && Number(params.debounceCount) > 0
    ? ` <i>(+${params.debounceCount} repeated opens in last 5m)</i>`
    : '';

  const timestamp = formatIstTimestamp(params.timestamp || Date.now());
  const candidateTrack = params.track ? `Urva Gandhi | ${params.track}` : 'Urva Gandhi';
  const recipient = params.recipientName
    ? `${params.recipientName} (${params.recipientEmail || 'No email'})`
    : (params.recipientEmail || 'Unknown recipient');
  const company = params.company || 'Unknown organisation';
  const detail = params.detail || 'None';
  const location = [params.city, params.region, params.country].filter(Boolean).join(', ') || 'Unknown location';
  const ip = params.ipTrunc || 'Unknown IP';
  const ua = params.ua || 'Unknown client';

  return `${previewPrefix}<b>${headerTag}</b>${debounceSuffix}

<b>Candidate & Track:</b> ${candidateTrack}
<b>Recipient:</b> ${recipient}
<b>Company:</b> ${company}
<b>Detail:</b> ${detail}
<b>Location:</b> ${location} (IP: ${ip})
<b>Client:</b> <code>${ua}</code>
<b>Timestamp:</b> ${timestamp}`;
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
