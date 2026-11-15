/**
 * Immutable allowlist of permissible project and repository destination URLs.
 * Strictly prevents open redirect vulnerabilities (CWE-601).
 */
export const ALLOWED_SLUGS = Object.freeze({
  'cointrack': 'https://cointrack-finance.vercel.app/',
  'cointrack-github': 'https://github.com/urvagandhi/cointrack',
  'fleetflow': 'https://fleet-flow-jade.vercel.app/',
  'paperpal': 'https://paper-pal-gules.vercel.app/',
  'odoo-github': 'https://github.com/urvagandhi/Odoo-Hackathon-26',
  'tbd-github': 'https://github.com/urvagandhi/TBD',
  'rwesearch-github': 'https://github.com/urvagandhi/RWEsearch-Hackathon',
  'portfolio': 'https://urvagandhi.tech/',
  'github': 'https://github.com/urvagandhi',
  'linkedin': 'https://linkedin.com/in/urva-gandhi'
});

const SLUG_ALIASES = Object.freeze({
  'cointrack_gh': 'cointrack-github',
  'fleetflow_gh': 'odoo-github',
  'paperpal_gh': 'tbd-github',
  'rwesearch_gh': 'rwesearch-github'
});

/**
 * Resolves a requested slug against the immutable allowlist.
 * Returns the destination URL if permitted, or null if unknown or invalid.
 *
 * @param {string} slug Target slug identifier
 * @returns {string|null} Resolved destination URL or null
 */
export function resolveDestination(slug) {
  if (!slug || typeof slug !== 'string') {
    return null;
  }
  const normalised = slug.trim();
  const canonical = SLUG_ALIASES[normalised] || normalised;
  if (Object.prototype.hasOwnProperty.call(ALLOWED_SLUGS, canonical)) {
    return ALLOWED_SLUGS[canonical];
  }
  return null;
}
