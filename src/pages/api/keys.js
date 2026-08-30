import { randomUUID, randomBytes } from "crypto";

const ISSUER = "https://urvagandhi.tech";

function setRateLimitHeaders(res) {
  res.setHeader("RateLimit-Limit", "100");
  res.setHeader("RateLimit-Remaining", "100");
  res.setHeader("RateLimit-Reset", "60");
  res.setHeader("X-RateLimit-Limit", "100");
  res.setHeader("X-RateLimit-Remaining", "100");
  res.setHeader("X-RateLimit-Reset", "60");
  res.setHeader("X-API-Version", "1.0.0");
}

export default async function handler(req, res) {
  setRateLimitHeaders(res);

  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Content-Type", "application/problem+json");
    return res.status(405).json({
      type: `${ISSUER}/docs/errors/method-not-allowed`,
      title: "Method Not Allowed",
      status: 405,
      code: "METHOD_NOT_ALLOWED",
      detail: "Only HTTP GET and POST methods are allowed.",
      instance: "/api/keys",
      resolution_hint:
        "Use HTTP POST (or GET) to self-serve a free, no-signup API key.",
    });
  }

  const keyId = `key_${randomUUID()}`;
  const apiKey = `ug_live_${randomBytes(24).toString("hex")}`;
  const sandboxKey = `ug_test_${randomBytes(16).toString("hex")}`;

  return res.status(200).json({
    keyId,
    apiKey,
    sandboxKey,
    tier: "free",
    status: "active",
    createdAt: new Date().toISOString(),
    quota: {
      requestsPerMinute: 100,
      mcpCallsPerMinute: 60,
    },
    usage: {
      documentation: `${ISSUER}/auth`,
      authentication: "Authorization: Bearer <apiKey>  or  X-API-Key: <apiKey>",
    },
    sandbox: {
      baseUrl: `${ISSUER}/api/sandbox`,
      note: "Free sandbox. Returns clearly-labelled sample data so agents can test integrations with zero quota impact.",
    },
    sampleRequest: {
      curl: `curl -H "Authorization: Bearer ${apiKey}" "${ISSUER}/api/leetcode?username=Urva_Gandhi"`,
    },
  });
}
