import crypto from 'node:crypto';
import { k, smembers, hgetall } from '../../../lib/mail/redis.js';

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
 * Outreach Status Sync Endpoint.
 * Returns active message engagement metrics indexed by RFC 822 Message-ID for IMAP label synchronisation.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Content-Type', 'application/problem+json');
    return res.status(405).json({
      type: 'https://urvagandhi.tech/docs/errors/method-not-allowed',
      title: 'Method Not Allowed',
      status: 405,
      detail: 'Only GET method is permitted for status querying.',
      instance: '/api/mail/status'
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
      instance: '/api/mail/status'
    });
  }

  try {
    const tokens = await smembers(k('mail:index:messages'));
    const mapping = {};
    const messages = [];

    for (const token of tokens) {
      const msg = await hgetall(k(`mail:m:${token}`));
      if (!msg || Object.keys(msg).length === 0 || msg.status === 'voided') {
        continue;
      }

      const entry = {
        custom_msg_id: msg.custom_msg_id,
        recipient: msg.recipient_email || msg.recipient || '',
        company: msg.company || '',
        status: msg.status || 'registered',
        opens: Number(msg.opens || 0),
        resume_views: Number(msg.resume_views || 0),
        clicks: Number(msg.clicks || 0),
        downloads: Number(msg.downloads || 0),
        last_event_at: Number(msg.last_event_at || 0)
      };

      if (msg.custom_msg_id) {
        mapping[msg.custom_msg_id] = entry;
      }
      messages.push(entry);
    }

    return res.status(200).json({
      ...mapping,
      messages
    });
  } catch (err) {
    console.error(`[MailTracker:Status] Error aggregating outreach status: ${err.message}`);
    res.setHeader('Content-Type', 'application/problem+json');
    return res.status(500).json({
      type: 'https://urvagandhi.tech/docs/errors/internal-error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to aggregate outreach status.',
      instance: '/api/mail/status'
    });
  }
}
