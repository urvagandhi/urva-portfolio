import crypto from 'node:crypto';
import { createAdminSessionToken } from '../../../lib/mail/token.js';
import { k, incr, expire, get } from '../../../lib/mail/redis.js';

/**
 * Administrative Authentication Endpoint.
 * Validates passkey against DASHBOARD_SECRET_KEY using constant-time comparison
 * and issues an HttpOnly, Secure, SameSite=Strict session cookie.
 */
export default async function handler(req, res) {
  if (req.method === 'DELETE' || req.body?.action === 'logout') {
    res.setHeader(
      'Set-Cookie',
      'outreach_admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
    );
    return res.status(200).json({ authenticated: false, message: 'Logged out successfully.' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/problem+json');
    return res.status(405).json({
      type: 'https://urvagandhi.tech/docs/errors/method-not-allowed',
      title: 'Method Not Allowed',
      status: 405,
      detail: 'Only POST and DELETE methods are permitted for authentication.',
      instance: '/api/mail/auth'
    });
  }

  // Rate limiting: 5 attempts per 15 minutes per IP
  const forwardedFor = req.headers['x-forwarded-for'];
  const rawIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (req.socket?.remoteAddress || '127.0.0.1');
  const rateLimitKey = k(`mail:ratelimit:auth:${rawIp}`);

  try {
    const attempts = await get(rateLimitKey);
    if (attempts && Number(attempts) >= 5) {
      res.setHeader('Retry-After', '900');
      return res.status(429).json({
        type: 'https://urvagandhi.tech/docs/errors/rate-limited',
        title: 'Too Many Requests',
        status: 429,
        detail: 'Too many authentication attempts. Please retry in 15 minutes.',
        instance: '/api/mail/auth'
      });
    }
  } catch (err) {
    console.warn(`[MailTracker:Auth] Rate limit lookup failed: ${err.message}`);
  }

  const { passkey } = req.body || {};
  const expectedSecret = process.env.DASHBOARD_SECRET_KEY || '';

  if (!passkey || typeof passkey !== 'string') {
    return res.status(401).json({
      authenticated: false,
      error: 'Passkey is required.'
    });
  }

  const passkeyBuf = Buffer.from(passkey, 'utf-8');
  const expectedBuf = Buffer.from(expectedSecret, 'utf-8');

  const isValid = (
    expectedSecret.length > 0 &&
    passkeyBuf.length === expectedBuf.length &&
    crypto.timingSafeEqual(passkeyBuf, expectedBuf)
  );

  if (!isValid) {
    // Record failed attempt for rate limiting
    try {
      const nextCount = await incr(rateLimitKey);
      if (nextCount === 1) {
        await expire(rateLimitKey, 900); // 15 minutes TTL
      }
    } catch (_) {}

    return res.status(401).json({
      authenticated: false,
      error: 'Invalid administrative passkey.'
    });
  }

  // Issue signed session cookie
  const sessionToken = createAdminSessionToken();
  const isProd = process.env.NODE_ENV === 'production';
  const cookieHeader = `outreach_admin_session=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${isProd ? '; Secure' : ''}`;

  res.setHeader('Set-Cookie', cookieHeader);
  return res.status(200).json({
    authenticated: true
  });
}
