import crypto from 'node:crypto';
import { k, get, hset } from '../../../lib/mail/redis.js';

/**
 * Validates the Authorization Bearer header using constant-time comparison.
 */
function verifyBearerAuth(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.slice(7).trim();
  const secret = process.env.MAIL_API_SECRET || '';
  if (!token || !secret) {
    return false;
  }
  const tokenBuf = Buffer.from(token, 'utf-8');
  const secretBuf = Buffer.from(secret, 'utf-8');
  if (tokenBuf.length !== secretBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(tokenBuf, secretBuf);
}

/**
 * Rollback Endpoint for Failed SMTP Outbound Transmissions.
 * Marks pre-registered message records as voided to exclude them from analytics.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/problem+json');
    return res.status(405).json({
      type: 'https://urvagandhi.tech/docs/errors/method-not-allowed',
      title: 'Method Not Allowed',
      status: 405,
      detail: 'Only POST method is permitted for voiding records.',
      instance: '/api/mail/void'
    });
  }

  // Verify Bearer authorization secret
  if (!verifyBearerAuth(req)) {
    res.setHeader('Content-Type', 'application/problem+json');
    return res.status(401).json({
      type: 'https://urvagandhi.tech/docs/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Missing or invalid Bearer authentication secret.',
      instance: '/api/mail/void'
    });
  }

  const { token, custom_msg_id } = req.body || {};

  let targetToken = token;

  // Resolve token from Message-ID index if token was not directly provided
  if (!targetToken && custom_msg_id) {
    targetToken = await get(k(`mail:map:msg_id:${custom_msg_id}`));
  }

  if (!targetToken) {
    res.setHeader('Content-Type', 'application/problem+json');
    return res.status(400).json({
      type: 'https://urvagandhi.tech/docs/errors/invalid-parameters',
      title: 'Bad Request',
      status: 400,
      detail: 'Either token or valid custom_msg_id is required.',
      instance: '/api/mail/void'
    });
  }

  try {
    await hset(k(`mail:m:${targetToken}`), {
      status: 'voided',
      voided_at: Date.now()
    });

    return res.status(200).json({
      success: true,
      message: 'Message registration voided successfully.'
    });
  } catch (err) {
    console.error(`[MailTracker:Void] Error voiding record: ${err.message}`);
    res.setHeader('Content-Type', 'application/problem+json');
    return res.status(500).json({
      type: 'https://urvagandhi.tech/docs/errors/internal-error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to void message registration.',
      instance: '/api/mail/void'
    });
  }
}
