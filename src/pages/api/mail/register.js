import crypto from 'node:crypto';
import { generateToken } from '../../../lib/mail/token.js';
import { ALLOWED_SLUGS } from '../../../lib/mail/allowlist.js';
import { k, set, exists, expire, pipeline } from '../../../lib/mail/redis.js';

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
 * Outreach Message Pre-Registration Endpoint.
 * Generates tracking tokens, stores tailored resume binaries and returns signed tracking URLs.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/problem+json');
    return res.status(405).json({
      type: 'https://urvagandhi.tech/docs/errors/method-not-allowed',
      title: 'Method Not Allowed',
      status: 405,
      detail: 'Only POST method is permitted for registration.',
      instance: '/api/mail/register'
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
      instance: '/api/mail/register'
    });
  }

  const {
    recipient_email,
    recipient,
    email,
    recipient_name,
    name,
    company,
    track,
    custom_msg_id,
    msg_id,
    resume_type,
    pdf_base64
  } = req.body || {};

  const targetEmail = recipient_email || recipient || email;
  const targetName = recipient_name || name || '';
  const targetCompany = company;
  const targetTrack = track;
  const targetMsgId = custom_msg_id || msg_id;

  // Validate required metadata fields
  if (!targetEmail || !targetCompany || !targetTrack || !targetMsgId) {
    res.setHeader('Content-Type', 'application/problem+json');
    return res.status(400).json({
      type: 'https://urvagandhi.tech/docs/errors/invalid-parameters',
      title: 'Bad Request',
      status: 400,
      detail: 'Mandatory fields: recipient_email, company, track, and custom_msg_id.',
      instance: '/api/mail/register'
    });
  }

  try {
    let pdfKey = '';
    let resolvedResumeType = resume_type || 'standard';

    // Store deduplicated Base64 PDF binary in Redis (180-day TTL)
    if (pdf_base64 && typeof pdf_base64 === 'string') {
      const sha256 = crypto.createHash('sha256').update(pdf_base64).digest('hex');
      pdfKey = `mail:pdf:${sha256}`;
      resolvedResumeType = 'tailored';

      const keyExists = await exists(k(pdfKey));
      if (!keyExists) {
        await set(k(pdfKey), pdf_base64, { ex: 15552000 }); // 180 days TTL
      } else {
        await expire(k(pdfKey), 15552000);
      }
    }

    // Generate cryptographic tracking token
    const token = generateToken();
    const now = Date.now();

    // Initialise message record hash (60-day TTL)
    const messageRecord = {
      token,
      recipient_email: targetEmail,
      recipient_name: targetName,
      company: targetCompany,
      track: targetTrack,
      custom_msg_id: targetMsgId,
      resume_type: resolvedResumeType,
      pdf_key: pdfKey,
      created_at: now,
      status: 'registered',
      opens: 0,
      clicks: 0,
      resume_views: 0,
      total_dwell_ms: 0,
      downloads: 0,
      last_event_at: 0
    };

    const pairs = [];
    for (const [f, v] of Object.entries(messageRecord)) {
      pairs.push(f, typeof v === 'object' ? JSON.stringify(v) : String(v));
    }

    await pipeline([
      ['HSET', k(`mail:m:${token}`), ...pairs],
      ['EXPIRE', k(`mail:m:${token}`), 5184000],
      ['SADD', k('mail:index:messages'), token],
      ['SET', k(`mail:map:msg_id:${targetMsgId}`), token, 'EX', 5184000]
    ]);

    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || (host && host.includes('localhost') ? 'http' : 'https');
    const defaultBase = host ? `${proto}://${host}` : 'https://urvagandhi.tech';
    const baseUrl = (process.env.SITE_URL || defaultBase).replace(/\/+$/, '');
    const encodedToken = encodeURIComponent(token);
    const pixelUrl = `${baseUrl}/api/mail/pixel?t=${encodedToken}`;
    const docUrl = `${baseUrl}/api/mail/doc?t=${encodedToken}`;
    const pixelHtml = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;" />`;

    // Construct showcase redirection links for all 10 allowlisted destinations
    const wrappedLinks = {};
    for (const slug of Object.keys(ALLOWED_SLUGS)) {
      wrappedLinks[slug] = `${baseUrl}/api/mail/link?t=${encodedToken}&slug=${slug}`;
    }

    return res.status(201).json({
      id: token,
      token,
      pixel_url: pixelUrl,
      doc_url: docUrl,
      pixel_html: pixelHtml,
      urls: {
        pixel: pixelUrl,
        doc: docUrl,
        pixel_html: pixelHtml,
        links: wrappedLinks
      },
      wrapped_urls: wrappedLinks
    });
  } catch (err) {
    console.error(`[MailTracker:Register] Internal registration error: ${err.message}`);
    res.setHeader('Content-Type', 'application/problem+json');
    return res.status(500).json({
      type: 'https://urvagandhi.tech/docs/errors/internal-error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Failed to complete message pre-registration.',
      instance: '/api/mail/register'
    });
  }
}
