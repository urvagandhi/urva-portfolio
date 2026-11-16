/**
 * Classifies inbound HTTP telemetry requests into distinct telemetry categories.
 * Evaluates User-Agent, Autonomous System Number (ASN from Vercel edge), and Via headers dynamically.
 *
 * @param {string} userAgent Inbound User-Agent header string
 * @param {string|number} [asNumber] BGP Autonomous System Number (e.g. 15169 for Google, 13335 for Apple Relay)
 * @param {string} [via] Inbound Via proxy header string
 * @returns {'apple_mpp'|'gmail_proxy'|'direct_unclassified'} Classified client category
 */
export function classifyClient(userAgent, asNumber = '', via = '') {
  const trimmed = typeof userAgent === 'string' ? userAgent.trim() : '';
  const asn = String(asNumber || '').trim();
  const viaHeader = typeof via === 'string' ? via.toLowerCase() : '';

  // Google image proxy / Google Cloud Autonomous System (AS15169 Google LLC, AS36492 Google Cloud)
  if (
    trimmed.includes('GoogleImageProxy') ||
    asn === '15169' ||
    asn === '36492' ||
    viaHeader.includes('google')
  ) {
    return 'gmail_proxy';
  }

  // Bare Mozilla/5.0 or Apple/Cloudflare Private Relay Autonomous System (AS13335 Cloudflare, AS714 Apple Inc.)
  if (
    trimmed === 'Mozilla/5.0' ||
    asn === '13335' ||
    asn === '714'
  ) {
    return 'apple_mpp';
  }

  return 'direct_unclassified';
}

/**
 * Detects whether an inbound request or event originated from a known privacy relay or image proxy.
 * Checks dynamically using client category, BGP routing metadata (ASN), User-Agent, or proxy headers.
 *
 * @param {string} userAgent Inbound User-Agent header
 * @param {string} [ip] Inbound IP address (legacy fallback for historical records)
 * @param {string|number} [asNumber] Autonomous System Number from BGP network routing
 * @param {string} [via] Inbound Via proxy header
 * @returns {boolean} True if privacy proxy
 */
export function isPrivacyProxy(userAgent, ip = '', asNumber = '', via = '') {
  const cls = classifyClient(userAgent, asNumber, via);
  if (cls === 'gmail_proxy' || cls === 'apple_mpp') return true;

  const asn = String(asNumber || '').trim();
  if (asn === '15169' || asn === '36492' || asn === '13335' || asn === '714') {
    return true;
  }

  if (via && typeof via === 'string' && via.toLowerCase().includes('google')) {
    return true;
  }

  if (userAgent && typeof userAgent === 'string') {
    const ua = userAgent.toLowerCase();
    if (ua.includes('googleimageproxy') || ua.includes('apple-mpp')) {
      return true;
    }
  }

  // Historical fallback for older records in datastore prior to ASN header logging
  if (!ip || typeof ip !== 'string') return false;
  const cleaned = ip.trim();
  return (
    cleaned.startsWith('66.249.') ||
    cleaned.startsWith('209.85.') ||
    cleaned.startsWith('66.102.') ||
    cleaned.startsWith('108.177.') ||
    cleaned.startsWith('17.') ||
    cleaned.startsWith('104.28.')
  );
}

/**
 * Detects whether an inbound request or event originated from an automated security scanner or crawler.
 * Identifies legacy browser engines, security proxy subnets, and headless crawlers.
 *
 * @param {string} userAgent Inbound User-Agent header
 * @param {string} [ip] Inbound IP address
 * @param {string|number} [asNumber] Autonomous System Number
 * @param {string} [via] Inbound Via proxy header
 * @returns {boolean} True if automated security scanner
 */
export function isSecurityScanner(userAgent, ip = '', asNumber = '', via = '') {
  if (userAgent && typeof userAgent === 'string') {
    const ua = userAgent.trim();
    // Legacy Edge 12 / Chrome 42 pattern (Google Workspace incoming security crawler)
    if (ua.includes('Edge/12.') || (ua.includes('Chrome/42.') && ua.includes('Edge/'))) {
      return true;
    }
    // Legacy MSIE 8.0 / Trident 4.0 (Enterprise corporate email security gateway)
    if (ua.includes('MSIE 8.0') || ua.includes('Trident/4.0')) {
      return true;
    }
    // Headless / crawler identifiers
    if (ua.includes('HeadlessChrome') || ua.includes('PhantomJS') || ua.includes('Cobrowsing/')) {
      return true;
    }
  }

  // Known scanner proxy IP subnets
  if (ip && typeof ip === 'string') {
    const cleaned = ip.trim();
    if (cleaned.startsWith('209.85.238.') || cleaned.startsWith('209.222.82.')) {
      return true;
    }
  }

  return false;
}

/**
 * Classifies telemetry engagement into discrete confidence tiers:
 * - 'high': Confirmed Human (portfolio link click, resume view, resume download)
 * - 'medium': Probable Human (email open >= 60s post-send)
 * - 'low': Machine Prefetch (inbound proxy prefetch < 60s, automated security scanner)
 * - 'unopened': No engagement recorded
 *
 * @param {Object} params Classification parameters
 * @param {string} params.event Event name ('open' | 'click' | 'resume_view' | etc.)
 * @param {string} [params.clientClass] Classified client category ('gmail_proxy' | 'apple_mpp' | 'direct_unclassified')
 * @param {number} [params.deltaSec] Seconds elapsed between send time and event trigger
 * @param {string} [params.userAgent] Raw User-Agent string
 * @param {string} [params.ip] Raw or truncated IP address
 * @returns {'high'|'medium'|'low'|'unopened'} Engagement tier
 */
export function classifyEngagementTier({ event, clientClass = '', deltaSec = 0, userAgent = '', ip = '' }) {
  if (event === 'click' || event === 'resume_view' || event === 'download' || event === 'resume_download') {
    return 'high';
  }

  if (event === 'prefetch') {
    return 'low';
  }

  if (event === 'open') {
    const isScanner = isSecurityScanner(userAgent, ip);
    const isProxy = clientClass === 'gmail_proxy' || clientClass === 'apple_mpp';

    if (isScanner || (isProxy && deltaSec < 60) || deltaSec < 15) {
      return 'low';
    }

    return 'medium';
  }

  return 'unopened';
}

/**
 * Truncates IP addresses for data minimisation under DPDP Act 2023 and GDPR guidelines.
 * IPv4: 192.168.1.145 -> 192.168.1.xxx
 * IPv6: 2001:db8:85a3::8a2e -> 2001:db8:85a3:xxxx
 *
 * @param {string} ip Raw IP address
 * @returns {string} Truncated IP address
 */
export function truncateIp(ip) {
  if (!ip || typeof ip !== 'string') {
    return 'unknown';
  }

  const cleaned = ip.trim();

  // IPv4 truncation: preserve first three octets
  if (cleaned.includes('.')) {
    const parts = cleaned.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
  }

  // IPv6 truncation: preserve leading segments
  if (cleaned.includes(':')) {
    const parts = cleaned.split(':');
    return `${parts.slice(0, 3).join(':')}:xxxx`;
  }

  return 'unknown';
}

/**
 * Decodes URL-encoded location headers (e.g. Vercel's x-vercel-ip-city).
 * Resolves percent-encoded characters (e.g. "J%C5%ABn%C4%81gadh" -> "Jūnāgadh", "The%20Dalles" -> "The Dalles").
 *
 * @param {string} city Raw header value
 * @returns {string} Clean, decoded city string
 */
export function decodeCity(city) {
  if (!city || typeof city !== 'string') {
    return '';
  }
  try {
    return decodeURIComponent(city.trim());
  } catch (_) {
    return city.trim();
  }
}

/**
 * Sanitises input strings to neutralise HTML injection before template interpolation.
 *
 * @param {string} str Raw user string
 * @returns {string} Sanitised HTML-escaped string
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') {
    return '';
  }
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
