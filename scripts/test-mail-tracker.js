#!/usr/bin/env node

/**
 * Zero-dependency native Node.js test harness for Mail Tracker.
 * Covers Unit Tests (UT-01..10), Integration Tests (IT-01..18) and Regression Checks.
 */

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { generateToken, verifyToken } from '../src/lib/mail/token.js';
import { ALLOWED_SLUGS, resolveDestination } from '../src/lib/mail/allowlist.js';
import { classifyClient, truncateIp, escapeHtml } from '../src/lib/mail/classifier.js';
import {
  k,
  clearMockStore,
  del,
  get,
  set,
  hset,
  hget,
  hgetall,
  hincrby,
  lpush,
  lrange,
  zincrby,
  zrevrange,
  exists,
  sadd
} from '../src/lib/mail/redis.js';
import {
  formatIstTimestamp,
  buildAlertMessage
} from '../src/lib/mail/telegram.js';

// API Handlers for Integration Testing
import registerHandler from '../src/pages/api/mail/register.js';
import voidHandler from '../src/pages/api/mail/void.js';
import statusHandler from '../src/pages/api/mail/status.js';
import pixelHandler from '../src/pages/api/mail/pixel.js';
import linkHandler from '../src/pages/api/mail/link.js';
import docHandler from '../src/pages/api/mail/doc.js';
import pdfHandler from '../src/pages/api/mail/pdf.js';
import beaconHandler from '../src/pages/api/mail/beacon.js';
import authHandler from '../src/pages/api/mail/auth.js';
import statsHandler from '../src/pages/api/mail/stats.js';
import contactHandler from '../src/pages/api/contact.js';
import { getServerSideProps as portalGSSP } from '../src/lib/mail/portal-gssp.js';

// ANSI colour tokens
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';

let passedCount = 0;
let failedCount = 0;
const failures = [];

/**
 * Creates mock req and res objects for in-memory testing of Pages Router API handlers.
 */
function createMockReqRes({ method = 'GET', query = {}, headers = {}, body = null } = {}) {
  const req = {
    method,
    query,
    headers: { ...headers },
    body,
    socket: { remoteAddress: '127.0.0.1' }
  };

  const res = {
    statusCode: 200,
    headers: {},
    ended: false,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(key, val) {
      this.headers[key.toLowerCase()] = String(val);
      return this;
    },
    getHeader(key) {
      return this.headers[key.toLowerCase()];
    },
    json(data) {
      this.body = data;
      this.ended = true;
      return this;
    },
    send(data) {
      this.body = data;
      this.ended = true;
      return this;
    },
    end(data) {
      if (data) this.body = data;
      this.ended = true;
      return this;
    }
  };

  return { req, res };
}

/**
 * Runs a named test case, capturing errors and printing results.
 */
async function testCase(id, description, fn) {
  try {
    await fn();
    passedCount++;
    console.log(`  ${GREEN}✓${RESET} ${BOLD}${id}${RESET}: ${description}`);
  } catch (err) {
    failedCount++;
    failures.push({ id, description, error: err });
    console.log(`  ${RED}✗${RESET} ${BOLD}${id}${RESET}: ${description}`);
    console.log(`    ${RED}${err.message}${RESET}`);
  }
}

/**
 * Unit Test Suite (UT-01 through UT-10)
 */
async function runUnitTests() {
  console.log(`\n${CYAN}${BOLD}=== Executing Mail Tracker Unit Tests (UT-01..10) ===${RESET}\n`);

  await testCase(
    'UT-01',
    'token.js | generateToken() generates valid 65-character token with HMAC signature',
    async () => {
      const token = generateToken();
      assert.equal(typeof token, 'string', 'Token should be a string');
      assert.equal(token.length, 65, 'Token length must be exactly 65 characters');
      assert.match(token, /^[0-9a-f]{32}\.[0-9a-f]{32}$/, 'Token format must match <32hex>.<32hex>');
      assert.equal(verifyToken(token), true, 'Newly generated token must pass HMAC verification');
    }
  );

  await testCase(
    'UT-02',
    'token.js | verifyToken() rejects tampered, truncated and malformed tokens',
    async () => {
      const validToken = generateToken();
      const [entropy, sig] = validToken.split('.');

      // Tampered signature
      const tamperedSig = sig.slice(0, 31) + (sig[31] === '0' ? '1' : '0');
      assert.equal(verifyToken(`${entropy}.${tamperedSig}`), false, 'Tampered signature must be rejected');

      // Tampered entropy
      const tamperedEntropy = (entropy[0] === '0' ? '1' : '0') + entropy.slice(1);
      assert.equal(verifyToken(`${tamperedEntropy}.${sig}`), false, 'Tampered entropy must be rejected');

      // Truncated tokens
      assert.equal(verifyToken(validToken.slice(0, 32)), false, 'Single segment token must be rejected');
      assert.equal(verifyToken(`${entropy}.${sig.slice(0, 30)}`), false, 'Truncated signature must be rejected');
      assert.equal(verifyToken(`${entropy.slice(0, 30)}.${sig}`), false, 'Truncated entropy must be rejected');

      // Invalid and non-string inputs
      assert.equal(verifyToken(''), false, 'Empty string must be rejected');
      assert.equal(verifyToken(null), false, 'Null token must be rejected');
      assert.equal(verifyToken(undefined), false, 'Undefined token must be rejected');
      assert.equal(verifyToken(12345), false, 'Number type token must be rejected');
      assert.equal(verifyToken('invalid.format.token'), false, 'Multi-dot token must be rejected');
    }
  );

  await testCase(
    'UT-03',
    'allowlist.js | resolveDestination() resolves all 10 allowlisted showcase slugs',
    async () => {
      assert.equal(Object.keys(ALLOWED_SLUGS).length, 10, 'Allowlist must contain exactly 10 locked slugs');

      assert.equal(resolveDestination('cointrack'), 'https://cointrack-finance.vercel.app/');
      assert.equal(resolveDestination('cointrack-github'), 'https://github.com/urvagandhi/cointrack');
      assert.equal(resolveDestination('fleetflow'), 'https://fleet-flow-jade.vercel.app/');
      assert.equal(resolveDestination('paperpal'), 'https://paper-pal-gules.vercel.app/');
      assert.equal(resolveDestination('odoo-github'), 'https://github.com/urvagandhi/Odoo-Hackathon-26');
      assert.equal(resolveDestination('tbd-github'), 'https://github.com/urvagandhi/TBD');
      assert.equal(resolveDestination('rwesearch-github'), 'https://github.com/urvagandhi/RWEsearch-Hackathon');
      assert.equal(resolveDestination('portfolio'), 'https://urvagandhi.tech/');
      assert.equal(resolveDestination('github'), 'https://github.com/urvagandhi');
      assert.equal(resolveDestination('linkedin'), 'https://linkedin.com/in/urva-gandhi');

      // Compatibility aliases
      assert.equal(resolveDestination('cointrack_gh'), 'https://github.com/urvagandhi/cointrack');
      assert.equal(resolveDestination('fleetflow_gh'), 'https://github.com/urvagandhi/Odoo-Hackathon-26');
      assert.equal(resolveDestination('paperpal_gh'), 'https://github.com/urvagandhi/TBD');
      assert.equal(resolveDestination('rwesearch_gh'), 'https://github.com/urvagandhi/RWEsearch-Hackathon');
    }
  );

  await testCase(
    'UT-04',
    'allowlist.js | resolveDestination() rejects arbitrary open redirect targets and unknown slugs',
    async () => {
      assert.equal(resolveDestination('http://evil.com'), null, 'Arbitrary URLs must return null');
      assert.equal(resolveDestination('https://malicious.org'), null, 'Arbitrary HTTPS URLs must return null');
      assert.equal(resolveDestination('unknown_app'), null, 'Unknown slug must return null');
      assert.equal(resolveDestination('malicious'), null, 'Malicious slug must return null');
      assert.equal(resolveDestination(''), null, 'Empty slug must return null');
      assert.equal(resolveDestination(null), null, 'Null slug must return null');
      assert.equal(resolveDestination(undefined), null, 'Undefined slug must return null');
    }
  );

  await testCase(
    'UT-05',
    'classifier.js | classifyClient() classifies bare Mozilla/5.0 as apple_mpp',
    async () => {
      assert.equal(classifyClient('Mozilla/5.0'), 'apple_mpp');
      assert.equal(classifyClient('  Mozilla/5.0  '), 'apple_mpp');
    }
  );

  await testCase(
    'UT-06',
    'classifier.js | classifyClient() classifies GoogleImageProxy User-Agents as gmail_proxy',
    async () => {
      const gmailUa = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 GoogleImageProxy';
      assert.equal(classifyClient(gmailUa), 'gmail_proxy');
      assert.equal(classifyClient('GoogleImageProxy'), 'gmail_proxy');
    }
  );

  await testCase(
    'UT-07',
    'classifier.js | classifyClient() classifies standard browsers as direct_unclassified',
    async () => {
      const chromeUa = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      const safariUa = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15';
      const firefoxUa = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0';

      assert.equal(classifyClient(chromeUa), 'direct_unclassified');
      assert.equal(classifyClient(safariUa), 'direct_unclassified');
      assert.equal(classifyClient(firefoxUa), 'direct_unclassified');
      assert.equal(classifyClient(''), 'direct_unclassified');
      assert.equal(classifyClient(null), 'direct_unclassified');
    }
  );

  await testCase(
    'UT-08',
    'classifier.js | truncateIp() truncates IPv4 to 3 octets and IPv6 to 3 segments',
    async () => {
      assert.equal(truncateIp('192.168.1.145'), '192.168.1.xxx');
      assert.equal(truncateIp('10.0.0.1'), '10.0.0.xxx');
      assert.equal(truncateIp('2001:db8:85a3::8a2e'), '2001:db8:85a3:xxxx');
      assert.equal(truncateIp('invalid-ip-format'), 'unknown');
      assert.equal(truncateIp(null), 'unknown');
      assert.equal(truncateIp(undefined), 'unknown');
    }
  );

  await testCase(
    'UT-09',
    'redis.js | k() prefixes keys with preview: in non-production environments',
    async () => {
      const origEnv = process.env.VERCEL_ENV;
      try {
        process.env.VERCEL_ENV = 'preview';
        assert.equal(k('mail:m:abc'), 'preview:mail:m:abc', 'Preview environment must prefix key');
        assert.equal(k('preview:mail:m:abc'), 'preview:mail:m:abc', 'Preview prefix should not be duplicated');

        process.env.VERCEL_ENV = 'production';
        assert.equal(k('mail:m:abc'), 'mail:m:abc', 'Production environment must preserve key as is');
      } finally {
        process.env.VERCEL_ENV = origEnv;
      }
    }
  );

  await testCase(
    'UT-10',
    'classifier.js | escapeHtml() sanitises HTML characters to prevent email template injection',
    async () => {
      const payload = '<script>alert(1)</script>&"message\'';
      const expected = '&lt;script&gt;alert(1)&lt;/script&gt;&amp;&quot;message&#39;';
      assert.equal(escapeHtml(payload), expected, 'HTML characters must be properly escaped');
      assert.equal(escapeHtml(null), '', 'Null input should return empty string');
      assert.equal(escapeHtml(undefined), '', 'Undefined input should return empty string');
      assert.equal(escapeHtml(12345), '', 'Non-string input should return empty string');
    }
  );

  // Supplementary Unit Assertions
  await testCase(
    'UT-SUPP-01',
    'telegram.js | formatIstTimestamp() formats date into Indian Standard Time (IST)',
    async () => {
      const formatted = formatIstTimestamp(new Date('2026-11-15T09:30:00Z'));
      assert.match(formatted, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} IST$/, 'Must match IST timestamp pattern');
      assert.equal(formatted.includes('15:00:00 IST'), true, 'UTC 09:30 must translate to 15:00 IST');
    }
  );

  await testCase(
    'UT-SUPP-02',
    'telegram.js | buildAlertMessage() produces compliant HTML with debounce and preview tags',
    async () => {
      const origEnv = process.env.VERCEL_ENV;
      try {
        process.env.VERCEL_ENV = 'preview';
        const msg = buildAlertMessage({
          eventType: 'open',
          clientClass: 'gmail_proxy',
          track: 'AI/ML Track',
          recipientName: 'Sarah Jenkins',
          recipientEmail: 'sjenkins@akamai.com',
          company: 'Akamai',
          detail: 'Open #1',
          ua: 'GoogleImageProxy',
          country: 'US',
          region: 'CA',
          city: 'San Jose',
          ipTrunc: '66.249.88.xxx',
          debounceCount: 2
        });

        assert.equal(msg.includes('<b>[PREVIEW]</b>'), true, 'Must include [PREVIEW] prefix');
        assert.equal(msg.includes('[Gmail Proxy Open]'), true, 'Must include header tag');
        assert.equal(msg.includes('(+2 repeated opens in last 5m)'), true, 'Must include debounce counter');
        assert.equal(msg.includes('Akamai'), true, 'Must include company name');
        assert.equal(msg.includes('Urva Gandhi | AI/ML Track'), true, 'Must include candidate and track');
      } finally {
        process.env.VERCEL_ENV = origEnv;
      }
    }
  );

  await testCase(
    'UT-SUPP-03',
    'redis.js | Mock datastore handles string, hash, list and sorted set commands',
    async () => {
      clearMockStore();
      await del('test:str');
      await del('test:hash');
      await del('test:list');
      await del('test:zset');

      try {
        await set('test:str', 'hello_world', { ex: 60 });
        assert.equal(await get('test:str'), 'hello_world');

        await hset('test:hash', { recipient: 'urva@example.com', opens: 1 });
        assert.equal(await hget('test:hash', 'recipient'), 'urva@example.com');
        const updatedOpens = await hincrby('test:hash', 'opens', 2);
        assert.equal(updatedOpens, 3);
        const hashData = await hgetall('test:hash');
        assert.equal(hashData.opens, '3');

        await lpush('test:list', 'event1', 'event2');
        const listData = await lrange('test:list', 0, -1);
        assert.equal(listData.length, 2);

        await zincrby('test:zset', 5, 'cointrack');
        await zincrby('test:zset', 10, 'fleetflow');
        const topSlugs = await zrevrange('test:zset', 0, -1);
        assert.equal(topSlugs[0], 'fleetflow');
        assert.equal(topSlugs[1], 'cointrack');
      } finally {
        await del('test:str');
        await del('test:hash');
        await del('test:list');
        await del('test:zset');
      }
    }
  );
}

/**
 * Integration Test Suite
 */
async function runIntegrationTests() {
  console.log(`\n${CYAN}${BOLD}=== Executing Mail Tracker Integration Tests (IT-01..14) ===${RESET}\n`);

  const secret = process.env.MAIL_API_SECRET || 'mail-test-secret-value-12345';
  process.env.MAIL_API_SECRET = secret;

  let registeredToken = null;
  const customMsgId = `<test-outreach-${Date.now()}@portfolio.urvagandhi.tech>`;

  // IT-01: /api/mail/register with Bearer authentication
  await testCase(
    'IT-01',
    '/api/mail/register | POST with Bearer auth and metadata returns 201 Created and signed URLs',
    async () => {
      const { req, res } = createMockReqRes({
        method: 'POST',
        headers: {
          authorization: `Bearer ${secret}`,
          'content-type': 'application/json'
        },
        body: {
          recipient_email: 'recruiter@akamai.com',
          name: 'Sarah Jenkins',
          company: 'Akamai',
          track: 'java',
          custom_msg_id: customMsgId
        }
      });

      await registerHandler(req, res);

      assert.equal(res.statusCode, 201, 'Should respond with 201 Created');
      assert.equal(typeof res.body.token, 'string');
      assert.equal(res.body.token.length, 65);
      assert.equal(typeof res.body.pixel_url, 'string');
      assert.equal(typeof res.body.doc_url, 'string');
      assert.equal(typeof res.body.wrapped_urls, 'object');
      assert.equal(Object.keys(res.body.wrapped_urls).length, 10);

      registeredToken = res.body.token;

      // Verify Redis hash initialized
      const msg = await hgetall(k(`mail:m:${registeredToken}`));
      assert.equal(msg.recipient_email, 'recruiter@akamai.com');
      assert.equal(msg.company, 'Akamai');
      assert.equal(msg.status, 'registered');
    }
  );

  // IT-02: /api/mail/register with tailored Base64 PDF payload
  await testCase(
    'IT-02',
    '/api/mail/register | POST with tailored Base64 PDF stores binary in Redis under mail:pdf:{sha256}',
    async () => {
      const samplePdfBase64 = 'JVBERi0xLjUKJVRlc3QgVGFpbG9yZWQgUERGCg==';
      const expectedSha256 = crypto.createHash('sha256').update(samplePdfBase64).digest('hex');

      const { req, res } = createMockReqRes({
        method: 'POST',
        headers: {
          authorization: `Bearer ${secret}`,
          'content-type': 'application/json'
        },
        body: {
          recipient_email: 'recruiter@barclays.com',
          company: 'Barclays',
          track: 'java',
          custom_msg_id: `<barclays-${Date.now()}@urvagandhi.tech>`,
          pdf_base64: samplePdfBase64
        }
      });

      await registerHandler(req, res);

      assert.equal(res.statusCode, 201);
      const pdfKey = `mail:pdf:${expectedSha256}`;
      const storedPdf = await get(k(pdfKey));
      assert.equal(storedPdf, samplePdfBase64, 'Redis must store raw Base64 PDF indexed by SHA-256');

      const msg = await hgetall(k(`mail:m:${res.body.token}`));
      assert.equal(msg.pdf_key, pdfKey, 'Message record must reference tailored pdf_key');
      assert.equal(msg.resume_type, 'tailored');
    }
  );

  // IT-03: /api/mail/register with missing or invalid Bearer secret
  await testCase(
    'IT-03',
    '/api/mail/register | POST with invalid Bearer secret returns 401 Unauthorized',
    async () => {
      const { req, res } = createMockReqRes({
        method: 'POST',
        headers: {
          authorization: 'Bearer wrong-unauthorized-secret'
        },
        body: {
          recipient_email: 'test@example.com',
          company: 'Company',
          track: 'swe',
          custom_msg_id: '<test@example.com>'
        }
      });

      await registerHandler(req, res);

      assert.equal(res.statusCode, 401, 'Invalid secret must return 401 Unauthorized');
      assert.equal(res.getHeader('content-type'), 'application/problem+json');
      assert.equal(res.body?.title, 'Unauthorized');
    }
  );

  // IT-04: /api/mail/void marks registered message as voided
  await testCase(
    'IT-04',
    '/api/mail/void | POST with valid token marks message record status as voided',
    async () => {
      const { req, res } = createMockReqRes({
        method: 'POST',
        headers: {
          authorization: `Bearer ${secret}`,
          'content-type': 'application/json'
        },
        body: {
          token: registeredToken
        }
      });

      await voidHandler(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body?.success, true);

      const msg = await hgetall(k(`mail:m:${registeredToken}`));
      assert.equal(msg.status, 'voided', 'Message status must be updated to voided');
    }
  );

  // Setup active test outreach message in Redis for public tracking assertions
  const activeTestToken = generateToken();
  const activeCustomMsgId = `<active-${Date.now()}@portfolio.urvagandhi.tech>`;
  await sadd(k('mail:index:messages'), activeTestToken);
  await hset(k(`mail:m:${activeTestToken}`), {
    token: activeTestToken,
    recipient_name: 'Test Recruiter',
    recipient_email: 'study.urva@gmail.com',
    company: 'Test Org',
    track: 'AI/ML',
    custom_msg_id: activeCustomMsgId,
    status: 'registered',
    opens: 0,
    clicks: 0,
    resume_views: 0,
    total_dwell_ms: 0,
    downloads: 0,
    created_at: Date.now()
  });

  // IT-05: /api/mail/pixel with valid token
  await testCase(
    'IT-05',
    '/api/mail/pixel | GET with valid token returns 42-byte GIF and increments opens in Redis',
    async () => {
      const { req, res } = createMockReqRes({
        method: 'GET',
        query: { t: activeTestToken },
        headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
      });

      await pixelHandler(req, res);

      assert.equal(res.statusCode, 200, 'Pixel must return 200 OK');
      assert.equal(res.getHeader('content-type'), 'image/gif');
      assert.equal(res.getHeader('content-length'), '42');
      assert.equal(res.getHeader('cache-control')?.includes('no-store'), true);
      assert.equal(Buffer.isBuffer(res.body), true);
      assert.equal(res.body.length, 42);

      const msg = await hgetall(k(`mail:m:${activeTestToken}`));
      assert.equal(Number(msg.opens), 1, 'Opens counter in Redis must increment to 1');
      assert.equal(msg.status, 'opened', 'Status must transition to opened');
    }
  );

  // IT-06: /api/mail/pixel duplicate opens debounced
  await testCase(
    'IT-06',
    '/api/mail/pixel | GET rapid duplicate opens (<5m, same client) updates events and debounces alerts',
    async () => {
      const { req, res } = createMockReqRes({
        method: 'GET',
        query: { t: activeTestToken },
        headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
      });

      await pixelHandler(req, res);

      assert.equal(res.statusCode, 200);
      const msg = await hgetall(k(`mail:m:${activeTestToken}`));
      assert.equal(Number(msg.opens), 2, 'Cumulative opens must increment');

      const counterKey = k(`mail:debounce:count:${activeTestToken}:direct_unclassified`);
      const debounceCount = await get(counterKey);
      assert.equal(Number(debounceCount), 1, 'Debounce counter must record suppressed open');
    }
  );

  // IT-07: /api/mail/pixel with invalid token fails open
  await testCase(
    'IT-07',
    '/api/mail/pixel | GET with missing or invalid token fails open with 200 OK and 42-byte GIF',
    async () => {
      const { req, res } = createMockReqRes({
        method: 'GET',
        query: { t: 'invalid-tampered-token.12345' }
      });

      await pixelHandler(req, res);

      assert.equal(res.statusCode, 200, 'Invalid token must fail open with 200 OK');
      assert.equal(res.getHeader('content-type'), 'image/gif');
      assert.equal(res.body.length, 42);
    }
  );

  // IT-08: /api/mail/link click tracking and redirect
  await testCase(
    'IT-08',
    '/api/mail/link | GET with valid token and slug returns 302 redirect and increments clicks',
    async () => {
      const { req, res } = createMockReqRes({
        method: 'GET',
        query: { t: activeTestToken, slug: 'cointrack' },
        headers: { 'user-agent': 'Mozilla/5.0 Chrome/120.0' }
      });

      await linkHandler(req, res);

      assert.equal(res.statusCode, 302, 'Link wrapper must respond with 302 Found');
      assert.equal(res.getHeader('location'), 'https://cointrack-finance.vercel.app/');

      const msg = await hgetall(k(`mail:m:${activeTestToken}`));
      assert.equal(Number(msg.clicks), 1, 'Clicks counter in Redis must increment to 1');
    }
  );

  // IT-09: /api/mail/link with unknown slug
  await testCase(
    'IT-09',
    '/api/mail/link | GET with unlisted or malicious slug returns 404 Problem Details',
    async () => {
      const { req, res } = createMockReqRes({
        method: 'GET',
        query: { t: activeTestToken, slug: 'malicious-phishing-link' }
      });

      await linkHandler(req, res);

      assert.equal(res.statusCode, 404, 'Unknown slug must return 404');
      assert.equal(res.getHeader('content-type'), 'application/problem+json');
      assert.equal(res.body?.title, 'Invalid Destination Slug');
    }
  );

  // IT-10: /api/mail/doc HTML container
  await testCase(
    'IT-10',
    '/api/mail/doc | GET with valid token renders HTML container embedding object and Open PDF link',
    async () => {
      const { req, res } = createMockReqRes({
        method: 'GET',
        query: { t: activeTestToken }
      });

      await docHandler(req, res);

      assert.equal(res.statusCode, 200, 'Doc viewer must return 200 OK');
      assert.equal(res.getHeader('content-type')?.includes('text/html'), true);
      assert.equal(typeof res.body, 'string');
      assert.equal(res.body.includes('<object data="/api/mail/pdf?t='), true, 'Must contain <object> embed');
      assert.equal(res.body.includes('Open PDF'), true, 'Must contain visible Open PDF fallback link');
      assert.equal(res.body.includes('/api/mail/beacon'), true, 'Must include dwell beacon script');
    }
  );

  // IT-11: /api/mail/pdf tailored resume stream
  await testCase(
    'IT-11',
    '/api/mail/pdf | GET streams tailored PDF from Redis when pdf_key is present',
    async () => {
      const tailoredToken = generateToken();
      const fakePdfPayload = 'JVBERi0xLjUKJVRlc3QgUERGIENvbnRlbnQgZm9yIFVydmEgR2FuZGhpCg==';
      const pdfKey = 'mail:pdf:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

      await set(k(pdfKey), fakePdfPayload);
      await hset(k(`mail:m:${tailoredToken}`), {
        token: tailoredToken,
        pdf_key: pdfKey,
        recipient_email: 'recruiter@company.com'
      });

      const { req, res } = createMockReqRes({
        method: 'GET',
        query: { t: tailoredToken }
      });

      await pdfHandler(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.getHeader('content-type'), 'application/pdf');
      assert.equal(res.getHeader('x-frame-options'), 'SAMEORIGIN');
      assert.equal(res.getHeader('content-security-policy'), "default-src 'self'; frame-ancestors 'self'");
      assert.equal(Buffer.isBuffer(res.body), true);
      assert.equal(res.body.toString('base64'), fakePdfPayload);
    }
  );

  // IT-12: /api/mail/pdf fallback to static resume
  await testCase(
    'IT-12',
    '/api/mail/pdf | GET falls back to static Urva_Gandhi.pdf if tailored Redis key is missing',
    async () => {
      const { req, res } = createMockReqRes({
        method: 'GET',
        query: { t: activeTestToken }
      });

      await pdfHandler(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.getHeader('content-type'), 'application/pdf');
      assert.equal(res.getHeader('x-frame-options'), 'SAMEORIGIN');
      assert.equal(Buffer.isBuffer(res.body), true);
      assert.equal(res.body.length > 50000, true, 'Fallback PDF buffer should match physical static resume');
    }
  );

  // IT-13: /api/mail/beacon dwell and download ingestion
  await testCase(
    'IT-13',
    '/api/mail/beacon | POST ingests resume view, dwell duration and download events',
    async () => {
      // 1. Ingest resume_view
      const { req: req1, res: res1 } = createMockReqRes({
        method: 'POST',
        body: JSON.stringify({ t: activeTestToken, event: 'resume_view' })
      });
      await beaconHandler(req1, res1);
      assert.equal(res1.statusCode, 204);

      // 2. Ingest beacon_dwell
      const { req: req2, res: res2 } = createMockReqRes({
        method: 'POST',
        body: JSON.stringify({ t: activeTestToken, event: 'beacon_dwell', dwell_ms: 32000 })
      });
      await beaconHandler(req2, res2);
      assert.equal(res2.statusCode, 204);

      // 3. Ingest resume_download
      const { req: req3, res: res3 } = createMockReqRes({
        method: 'POST',
        body: JSON.stringify({ t: activeTestToken, event: 'resume_download' })
      });
      await beaconHandler(req3, res3);
      assert.equal(res3.statusCode, 204);

      const msg = await hgetall(k(`mail:m:${activeTestToken}`));
      assert.equal(Number(msg.resume_views), 1, 'Resume views must increment to 1');
      assert.equal(Number(msg.total_dwell_ms), 32000, 'Dwell ms must accumulate 32000');
      assert.equal(Number(msg.downloads), 1, 'Downloads must increment to 1');
    }
  );

  // IT-14: /api/mail/status sync endpoint returns RFC 822 Message-ID mapping
  await testCase(
    'IT-14',
    '/api/mail/status | GET with Bearer auth returns thread engagement map for IMAP label sync',
    async () => {
      const { req, res } = createMockReqRes({
        method: 'GET',
        headers: {
          authorization: `Bearer ${secret}`
        }
      });

      await statusHandler(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(Array.isArray(res.body.messages), true);

      // Voided record from IT-04 should NOT be in active status mapping
      assert.equal(res.body[customMsgId], undefined, 'Voided message must be excluded from sync');

      // Active message should be present
      const entry = res.body[activeCustomMsgId];
      assert.equal(typeof entry, 'object', 'Active message must be present in map');
      assert.equal(entry.recipient, 'study.urva@gmail.com');
      assert.equal(entry.company, 'Test Org');
      assert.equal(entry.opens, 2);
      assert.equal(entry.clicks, 1);
      assert.equal(entry.resume_views, 1);
      assert.equal(entry.downloads, 1);
    }
  );

  // IT-15: /api/mail/auth passkey login success
  let sessionCookie = null;
  const dashboardKey = process.env.DASHBOARD_SECRET_KEY || 'test-dashboard-secret-passkey-value';
  process.env.DASHBOARD_SECRET_KEY = dashboardKey;

  await testCase(
    'IT-15',
    '/api/mail/auth | POST with valid passkey sets outreach_admin_session HttpOnly cookie',
    async () => {
      const { req, res } = createMockReqRes({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: { passkey: dashboardKey }
      });

      await authHandler(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body?.authenticated, true);
      const setCookie = res.getHeader('set-cookie');
      assert.equal(typeof setCookie, 'string');
      assert.equal(setCookie.includes('outreach_admin_session='), true);
      assert.equal(setCookie.includes('HttpOnly'), true);
      assert.equal(setCookie.includes('SameSite=Strict'), true);

      const match = setCookie.match(/outreach_admin_session=([^;]+)/);
      sessionCookie = match ? match[1] : null;
      assert.equal(typeof sessionCookie, 'string');
    }
  );

  // IT-16: /api/mail/auth passkey login failure
  await testCase(
    'IT-16',
    '/api/mail/auth | POST with invalid passkey returns 401 Unauthorized',
    async () => {
      const { req, res } = createMockReqRes({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: { passkey: 'wrong-passkey-attempt' }
      });

      await authHandler(req, res);

      assert.equal(res.statusCode, 401);
      assert.equal(res.body?.authenticated, false);
      assert.equal(res.getHeader('set-cookie'), undefined);
    }
  );

  // IT-17: /api/mail/stats authenticated aggregate metrics
  await testCase(
    'IT-17',
    '/api/mail/stats | GET with valid session cookie returns aggregate analytics and event feed',
    async () => {
      const { req, res } = createMockReqRes({
        method: 'GET',
        headers: {
          cookie: `outreach_admin_session=${sessionCookie}`
        }
      });

      await statsHandler(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(typeof res.body.summary, 'object');
      assert.equal(res.body.summary.total_sent >= 1, true);
      assert.equal(res.body.summary.verified_opens >= 1, true);
      assert.equal(Array.isArray(res.body.slug_rankings), true);
      assert.equal(Array.isArray(res.body.company_rollups), true);
      assert.equal(Array.isArray(res.body.recent_events), true);

      // Unauthenticated request to /api/mail/stats returns 401
      const { req: unauthReq, res: unauthRes } = createMockReqRes({ method: 'GET' });
      await statsHandler(unauthReq, unauthRes);
      assert.equal(unauthRes.statusCode, 401);
    }
  );

  // IT-18: /portal/outreach-telemetry unauthenticated 404 cloaking
  await testCase(
    'IT-18',
    '/portal/outreach-telemetry | GET without session cookie returns 404 Not Found response',
    async () => {
      const { req, res } = createMockReqRes({ method: 'GET' });
      const gsspResult = await portalGSSP({ req, res });

      assert.equal(res.statusCode, 404, 'HTTP status code must be 404 for unauthenticated callers');
      assert.equal(gsspResult?.props?.initialAuth, false);

      const { req: authReq, res: authRes } = createMockReqRes({
        method: 'GET',
        headers: { cookie: `outreach_admin_session=${sessionCookie}` }
      });
      const authGsspResult = await portalGSSP({ req: authReq, res: authRes });
      assert.equal(authGsspResult?.props?.initialAuth, true);
    }
  );

  await testCase(
    'IT-19',
    '/api/contact | POST sanitises HTML inputs before email template interpolation (D11)',
    async () => {
      let interceptedPayload = null;
      const originalFetch = globalThis.fetch;
      const originalBrevoKey = process.env.BREVO_API_KEY;
      process.env.BREVO_API_KEY = 'test-brevo-key';

      globalThis.fetch = async (url, options) => {
        if (typeof url === 'string' && url.includes('api.brevo.com')) {
          interceptedPayload = JSON.parse(options.body);
          return {
            ok: true,
            status: 200,
            json: async () => ({ messageId: 'test-msg-123' })
          };
        }
        return originalFetch(url, options);
      };

      try {
        const { req, res } = createMockReqRes({
          method: 'POST',
          body: {
            name: '<script>alert("xss")</script>Recruiter',
            email: 'recruiter@example.com',
            subject: '<b>Offer</b> & Role',
            company: '<img src=x onerror=alert(1)> Corp',
            message: 'Hello <script>console.log("pwned")</script> & welcome!'
          }
        });

        await contactHandler(req, res);

        assert.equal(res.statusCode, 200);
        assert.ok(interceptedPayload, 'Brevo payload must be intercepted');
        assert.ok(!interceptedPayload.htmlContent.includes('<script>'), 'Script tag must not be present unescaped');
        assert.ok(
          interceptedPayload.htmlContent.includes('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;Recruiter'),
          'Name must be HTML escaped'
        );
        assert.ok(
          interceptedPayload.htmlContent.includes('&lt;b&gt;Offer&lt;/b&gt; &amp; Role'),
          'Subject must be HTML escaped'
        );
        assert.ok(
          interceptedPayload.htmlContent.includes('&lt;img src=x onerror=alert(1)&gt; Corp'),
          'Company must be HTML escaped'
        );
        assert.ok(
          interceptedPayload.htmlContent.includes('&lt;script&gt;console.log(&quot;pwned&quot;)&lt;/script&gt; &amp; welcome!'),
          'Message must be HTML escaped'
        );
      } finally {
        globalThis.fetch = originalFetch;
        process.env.BREVO_API_KEY = originalBrevoKey;
      }
    }
  );
}

/**
 * Main execution harness.
 */
async function main() {
  const args = process.argv.slice(2);
  const isUnitOnly = args.includes('--unit');
  const isIntegrationOnly = args.includes('--integration');

  console.log(`${BOLD}====================================================${RESET}`);
  console.log(`${BOLD}    Urva Gandhi Portfolio — Mail Tracker Test Suite  ${RESET}`);
  console.log(`${BOLD}====================================================${RESET}`);

  const startTime = Date.now();

  if (isUnitOnly || (!isUnitOnly && !isIntegrationOnly)) {
    await runUnitTests();
  }

  if (isIntegrationOnly || (!isUnitOnly && !isIntegrationOnly)) {
    await runIntegrationTests();
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(3);

  console.log(`\n${BOLD}====================================================${RESET}`);
  console.log(`${BOLD}Test Summary: ${GREEN}${passedCount} Passed${RESET}, ${failedCount > 0 ? RED : GREEN}${failedCount} Failed${RESET} (${duration}s)`);
  console.log(`${BOLD}====================================================${RESET}\n`);

  if (failedCount > 0) {
    console.error(`${RED}Test suite failed with ${failedCount} failure(s).${RESET}`);
    process.exit(1);
  } else {
    console.log(`${GREEN}All tests passed successfully.${RESET}\n`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error(`${RED}Fatal harness execution error:${RESET}`, err);
  process.exit(1);
});
