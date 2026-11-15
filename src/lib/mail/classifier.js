/**
 * Classifies inbound HTTP User-Agent headers into distinct telemetry categories.
 *
 * @param {string} userAgent Inbound User-Agent header string
 * @returns {'apple_mpp'|'gmail_proxy'|'direct_unclassified'} Classified client category
 */
export function classifyClient(userAgent) {
  if (!userAgent || typeof userAgent !== 'string') {
    return 'direct_unclassified';
  }

  const trimmed = userAgent.trim();

  // Bare Mozilla/5.0 indicates Apple Mail Privacy Protection (MPP) prefetch
  if (trimmed === 'Mozilla/5.0') {
    return 'apple_mpp';
  }

  // Google image proxy caching indicates Gmail web or mobile client
  if (trimmed.includes('GoogleImageProxy')) {
    return 'gmail_proxy';
  }

  return 'direct_unclassified';
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
