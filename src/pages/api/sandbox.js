import { randomUUID } from "crypto";

const ISSUER = "https://urvagandhi.tech";

const SAMPLE_DATA = {
  leetcode: {
    platform: "leetcode",
    totalActiveDays: 138,
    streak: 0,
    solved: 300,
    rating: 1637,
    topPercentage: "19.46%",
  },
  codeforces: {
    platform: "codeforces",
    handle: "Urva_Gandhi",
    rating: 1189,
    maxRating: 1243,
    rank: "pupil",
  },
  codechef: {
    platform: "codechef",
    username: "urva_gandhi",
    rating: 1180,
    globalRank: 33561,
    stars: 2,
  },
  gfg: {
    platform: "gfg",
    username: "urvagandhi",
    score: 120,
    instituteRank: 42,
  },
  hackerrank: {
    platform: "hackerrank",
    username: "urvagandhi24",
    badges: 5,
    skills: ["Problem Solving", "Java"],
  },
  profile: {
    platform: "profile",
    name: "Urva Gandhi",
    degree: "B.Tech CSE (Minor: Adaptive AI), Nirma University",
    cgpa: "8.83/10",
    primaryStack: [
      "Java",
      "Spring Boot",
      "Microservices",
      "REST APIs",
      "AI/ML",
    ],
  },
  projects: {
    platform: "projects",
    projects: ["CoinTrack", "FleetFlow", "Agent Paperpal", "RWEsearch"],
  },
  contact: {
    platform: "contact",
    email: ["23bce078@nirmauni.ac.in", "urvagandhi24@gmail.com"],
    github: "https://github.com/urvagandhi",
    linkedin: "https://www.linkedin.com/in/urva-gandhi/",
  },
};

const SAMPLE_TOOLS = Object.keys(SAMPLE_DATA);

function sendJson(res, status, body) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Environment", "sandbox");
  res.setHeader("RateLimit-Limit", "100");
  res.setHeader("RateLimit-Remaining", "100");
  res.setHeader("RateLimit-Reset", "60");
  res.setHeader("X-RateLimit-Limit", "100");
  res.setHeader("X-RateLimit-Remaining", "100");
  res.setHeader("X-RateLimit-Reset", "60");
  res.setHeader("X-API-Version", "1.0.0");
  res.status(status).json(body);
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const platform = (req.query.platform || "profile").toLowerCase();
    if (!SAMPLE_DATA[platform]) {
      return sendJson(res, 400, {
        sample: true,
        error: `Unknown platform '${platform}'. Use one of: ${SAMPLE_TOOLS.join(", ")}`,
      });
    }
    return sendJson(res, 200, {
      sample: true,
      mode: "sandbox",
      note: "Fictitious sample payload for integration testing. Never shown to clients.",
      platform,
      data: SAMPLE_DATA[platform],
      liveEquivalent: `${ISSUER}/api/${platform === "profile" ? "mcp" : platform}`,
    });
  }

  if (req.method === "POST") {
    const body = req.body || {};
    if (
      body._echo === true ||
      body.tool === "echo" ||
      body.gateway === "echo"
    ) {
      return sendJson(res, 200, {
        sample: true,
        mode: "sandbox",
        echo: body,
      });
    }
    const tool = body.tool || body.name;
    if (tool && SAMPLE_TOOLS.includes(tool)) {
      return sendJson(res, 200, {
        sample: true,
        mode: "sandbox",
        tool,
        data: SAMPLE_DATA[tool],
      });
    }
    return sendJson(res, 200, {
      sample: true,
      mode: "sandbox",
      requestId: randomUUID(),
      tools: SAMPLE_TOOLS,
      endpoints: {
        catalog: `${ISSUER}/api/sandbox`,
        echo: `${ISSUER}/api/sandbox/echo`,
        execute: `${ISSUER}/api/sandbox/execute`,
      },
    });
  }

  res.setHeader("Content-Type", "application/problem+json");
  return res.status(405).json({
    type: `${ISSUER}/docs/errors/method-not-allowed`,
    title: "Method Not Allowed",
    status: 405,
    code: "METHOD_NOT_ALLOWED",
    detail: "Only HTTP GET and POST methods are allowed on the sandbox.",
    instance: "/api/sandbox",
    resolution_hint:
      "GET /api/sandbox?platform=leetcode for a sample payload, or POST raw JSON to /api/sandbox/echo to test request handling.",
  });
}
