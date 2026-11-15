import crypto from 'node:crypto';

/**
 * Retrieves the signing secret from the environment with a secure fallback for testing.
 *
 * @returns {string} Signing secret string
 */
function getSigningSecret() {
  return process.env.MAIL_SIGNING_SECRET || process.env.MAIL_API_SECRET || 'mail-tracker-signing-secret-default';
}

/**
 * Generates an unguessable 65-character tamper-evident tracking token.
 * Format: <32-hex-entropy>.<32-hex-hmac-signature>
 *
 * @returns {string} Signed token
 */
export function generateToken() {
  const entropy = crypto.randomBytes(16).toString('hex');
  const signature = crypto
    .createHmac('sha256', getSigningSecret())
    .update(entropy)
    .digest('hex')
    .slice(0, 32);
  return `${entropy}.${signature}`;
}

/**
 * Verifies the cryptographic integrity of a token using constant-time comparison.
 *
 * @param {string} token Tracking token string to verify
 * @returns {boolean} True if token signature is valid, false otherwise
 */
export function verifyToken(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 2 || parts[0].length !== 32 || parts[1].length !== 32) {
    return false;
  }

  const [entropy, providedSig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(entropy)
    .digest('hex')
    .slice(0, 32);

  const providedBuf = Buffer.from(providedSig, 'utf-8');
  const expectedBuf = Buffer.from(expectedSig, 'utf-8');

  if (providedBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

/**
 * Creates an HMAC-signed admin session cookie token.
 * Format: <epoch_ms>.<hmac_signature>
 *
 * @returns {string} Signed session cookie token
 */
export function createAdminSessionToken() {
  const ts = Date.now().toString();
  const secret = process.env.DASHBOARD_SECRET_KEY || process.env.MAIL_SIGNING_SECRET || 'mail-admin-session-secret';
  const sig = crypto.createHmac('sha256', secret).update(ts).digest('hex');
  return `${ts}.${sig}`;
}

/**
 * Verifies the validity and expiration of an admin session cookie token.
 *
 * @param {string} cookieVal Cookie value
 * @returns {boolean} True if valid and under 24 hours old
 */
export function verifyAdminSessionToken(cookieVal) {
  if (!cookieVal || typeof cookieVal !== 'string') {
    return false;
  }
  const parts = cookieVal.split('.');
  if (parts.length !== 2) {
    return false;
  }
  const [ts, providedSig] = parts;
  const age = Date.now() - Number(ts);
  if (Number.isNaN(age) || age < 0 || age > 86400 * 1000) {
    return false;
  }

  const secret = process.env.DASHBOARD_SECRET_KEY || process.env.MAIL_SIGNING_SECRET || 'mail-admin-session-secret';
  const expectedSig = crypto.createHmac('sha256', secret).update(ts).digest('hex');

  const providedBuf = Buffer.from(providedSig, 'utf-8');
  const expectedBuf = Buffer.from(expectedSig, 'utf-8');

  if (providedBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

/**
 * Extracts and verifies the outreach_admin_session cookie from an HTTP request.
 *
 * @param {Object} req Inbound HTTP request
 * @returns {boolean} True if session cookie is present and valid
 */
export function verifyAdminSession(req) {
  const cookieHeader = req?.headers?.cookie || '';
  const match = cookieHeader.match(/outreach_admin_session=([^;]+)/);
  if (!match) {
    return false;
  }
  return verifyAdminSessionToken(match[1]);
}

/**
 * Sender / owner email addresses that must NEVER be registered or recorded in tracking telemetry.
 */
export const SENDER_EMAILS = Object.freeze([
  'urvagandhi24@gmail.com',
  'study.urva@gmail.com',
  '23bce078@nirmauni.ac.in'
]);

/**
 * Checks whether an email matches any sender/owner email address.
 *
 * @param {string} email Email address to check
 * @returns {boolean} True if email belongs to the sender/owner
 */
export function isSenderEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const normalised = email.trim().toLowerCase();
  if (SENDER_EMAILS.some((s) => s.toLowerCase() === normalised)) {
    return true;
  }
  const contactReceiver = (process.env.CONTACT_RECEIVER_EMAIL || '').trim().toLowerCase();
  if (contactReceiver && normalised === contactReceiver) {
    return true;
  }
  const brevoSender = (process.env.BREVO_SENDER_EMAIL || '').trim().toLowerCase();
  if (brevoSender && normalised === brevoSender) {
    return true;
  }
  return false;
}

