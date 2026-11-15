import dns from 'dns/promises';
import { k, get, set } from './redis.js';

/**
 * Checks whether a recipient's domain routes mail through Google Workspace / Gmail.
 * Caches results in Redis for 7 days to eliminate repeated DNS roundtrips.
 *
 * @param {string} email Recipient email address
 * @returns {Promise<boolean>} True if recipient uses Google mail servers
 */
export async function isGoogleWorkspaceDomain(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return true; // Fail-open
  }

  const domain = email.split('@')[1].toLowerCase().trim();
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    return true;
  }

  const cacheKey = k(`mail:mx:is_google:${domain}`);
  try {
    const cached = await get(cacheKey);
    if (cached !== null && cached !== undefined) {
      return cached === '1';
    }
  } catch (_) {}

  try {
    const records = await dns.resolveMx(domain);
    const isGoogle = Array.isArray(records) && records.some((r) => {
      const ex = (r.exchange || '').toLowerCase();
      return ex.includes('google') || ex.includes('googlemail') || ex.includes('aspmx');
    });

    try {
      await set(cacheKey, isGoogle ? '1' : '0', { ex: 604800 }); // 7 days TTL
    } catch (_) {}

    return isGoogle;
  } catch (err) {
    // If DNS resolution fails, fail-open to avoid suppressing valid events
    return true;
  }
}
