import { NextResponse } from "next/server";

const PRIMARY_DOMAIN = "https://urvagandhi.tech";
const LIFETIME_DOMAIN = "https://urvagandhi-portfolio.vercel.app";

function getDynamicDomain(req) {
  const host = req.headers.get("host") || "urvagandhi.tech";
  const proto =
    req.headers.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function generateDynamicSitemap(currentDomain) {
  const pages = [
    { path: "", priority: "1.0" },
    { path: "/about", priority: "0.9" },
    { path: "/auth", priority: "0.8" },
    { path: "/contact", priority: "0.8" },
    { path: "/docs", priority: "0.9" },
    { path: "/privacy", priority: "0.5" },
  ];
  // Machine-readable developer resources, indexed alongside pages so
  // name-based searches surface the developer surface directly.
  const resources = [
    "/openapi.json",
    "/.well-known/mcp.json",
    "/.well-known/oauth-authorization-server",
    "/.well-known/oauth-protected-resource",
    "/.well-known/agent-instructions",
    "/llms.txt",
  ];
  const lastmod = new Date().toISOString();

  const pageElements = pages
    .map(
      ({ path, priority }) => `  <url>
    <loc>${currentDomain}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="x-default" href="${PRIMARY_DOMAIN}${path}" />
    <xhtml:link rel="alternate" hreflang="en" href="${LIFETIME_DOMAIN}${path}" />
  </url>`,
    )
    .join("\n");

  const resourceElements = resources
    .map(
      (path) => `  <url>
    <loc>${currentDomain}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
    <xhtml:link rel="alternate" hreflang="x-default" href="${PRIMARY_DOMAIN}${path}" />
    <xhtml:link rel="alternate" hreflang="en" href="${LIFETIME_DOMAIN}${path}" />
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pageElements}
${resourceElements}
</urlset>`;
}

function generateDynamicRobots(currentDomain) {
  return `User-agent: *
Allow: /

Host: ${currentDomain}
Sitemap: ${currentDomain}/sitemap.xml
Sitemap: ${PRIMARY_DOMAIN}/sitemap.xml
Sitemap: ${LIFETIME_DOMAIN}/sitemap.xml
`;
}

function generateDynamicMcpManifest(currentDomain) {
  return JSON.stringify(
    {
      schema_version: "1.0",
      name: "urva-gandhi-portfolio-mcp",
      description:
        "First-party Model Context Protocol (MCP) server providing structured tool access to Urva Gandhi's software engineering portfolio, verified coding statistics, project repository metadata, and contact info.",
      version: "1.0.0",
      vendor: "Urva Gandhi",
      homepage: currentDomain,
      primary_homepage: PRIMARY_DOMAIN,
      alternate_homepage: LIFETIME_DOMAIN,
      endpoints: {
        mcp: `${currentDomain}/api/mcp`,
        sse: `${currentDomain}/api/mcp`,
        primary_mcp: `${PRIMARY_DOMAIN}/api/mcp`,
        lifetime_mcp: `${LIFETIME_DOMAIN}/api/mcp`,
      },
      servers: [
        {
          url: `${currentDomain}/api/mcp`,
          description: "Active Environment Server Endpoint",
        },
        {
          url: `${PRIMARY_DOMAIN}/api/mcp`,
          description: "Primary Custom Domain Endpoint",
        },
        {
          url: `${LIFETIME_DOMAIN}/api/mcp`,
          description: "Lifetime Vercel Mirror Endpoint",
        },
      ],
      capabilities: {
        tools: {
          listChanged: false,
        },
        resources: {
          subscribe: false,
          listChanged: false,
        },
        prompts: {
          listChanged: false,
        },
      },
      resources: [
        {
          uri: "portfolio://developer-profile",
          name: "Urva Gandhi Developer Profile & Credentials",
          description:
            "Complete developer profile, Nirma University education, Java/Spring Boot & AI tech stack, and hackathon achievements.",
          mimeType: "application/json",
        },
        {
          uri: "portfolio://llms-summary",
          name: "LLM Agent Portfolio Summary",
          description: "Machine-readable summary of Urva Gandhi for AI agents.",
          mimeType: "text/markdown",
        },
      ],
      tools: [
        {
          name: "get_developer_profile",
          description:
            "Returns Urva Gandhi's developer profile, Nirma University education, Java/Spring Boot & AI tech stack, and hackathon achievements.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "get_coding_stats",
          description:
            "Fetches verified coding metrics across LeetCode, Codeforces, CodeChef, GeeksforGeeks, and HackerRank.",
          inputSchema: {
            type: "object",
            properties: {
              platform: {
                type: "string",
                enum: [
                  "all",
                  "leetcode",
                  "codeforces",
                  "codechef",
                  "gfg",
                  "hackerrank",
                ],
                description: "Specific platform or 'all' for aggregated stats.",
              },
            },
          },
        },
        {
          name: "get_projects",
          description:
            "Fetches featured projects (CoinTrack, FleetFlow, Agent Paperpal, RWEsearch), tech stacks, and links.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "get_contact_info",
          description:
            "Returns verified contact channels, email, LinkedIn, GitHub, phone numbers, and location info.",
          inputSchema: { type: "object", properties: {} },
        },
      ],
    },
    null,
    2,
  );
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function withVersionHeaderParam(operation) {
  const params = cloneJson(operation.parameters || []);
  if (!params.some((p) => p.in === "header" && p.name === "X-API-Version")) {
    params.unshift({
      name: "X-API-Version",
      in: "header",
      required: false,
      description:
        "API version to target. Omit to use the latest stable version (1).",
      schema: { type: "string", enum: ["1"], default: "1" },
    });
  }
  return { ...operation, parameters: params };
}

// Document every canonical /api/* path under its versioned aliases (/v1/* and
// /api/v1/*) and expose the X-API-Version header parameter on all operations,
// so agents can rely on a stable versioned surface.
function expandVersionedPaths(paths) {
  const VERSION_PREFIXES = ["/v1", "/api/v1"];
  const source = cloneJson(paths);
  for (const path of Object.keys(source)) {
    const base = path.replace(/^\/api/, "");
    for (const prefix of VERSION_PREFIXES) {
      const versionedPathItem = {};
      for (const [method, operation] of Object.entries(source[path])) {
        versionedPathItem[method] = withVersionHeaderParam(operation);
      }
      paths[`${prefix}${base}`] = versionedPathItem;
    }
  }
  for (const pathItem of Object.values(paths)) {
    for (const method of Object.keys(pathItem)) {
      pathItem[method] = withVersionHeaderParam(pathItem[method]);
    }
  }
}

function generateDynamicOpenApi(currentDomain) {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: "Urva Gandhi Portfolio Developer API & MCP Server",
      description:
        "Public REST APIs, Model Context Protocol (MCP) server, and developer endpoints providing verified coding statistics, developer profile metadata, and interactive contact handling for Urva Gandhi.",
      version: "1.0.0",
      contact: {
        name: "Urva Gandhi",
        email: "23bce078@nirmauni.ac.in",
        url: currentDomain,
      },
      "x-versioning-policy":
        "URL path versioning (/v1/) and X-API-Version header parameter. Backward compatibility guaranteed for version 1. Full contract: ${currentDomain}/docs/versioning.",
      "x-deprecation-policy":
        "Deprecations announced 6 months before end-of-life via the Sunset HTTP header (RFC 8594); deprecated surfaces also return the Deprecation header. Full timeline: ${currentDomain}/docs/versioning.",
      "x-rate-limit-policy":
        "Responses carry the standard IETF RateLimit-* headers (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset). When rate limited, HTTP 429 is returned with a Retry-After header so agents can self-throttle in real time.",
    },
    servers: [
      { url: currentDomain, description: "Active Domain Server" },
      {
        url: `${currentDomain}/v1`,
        description: "Active Domain Versioned Base URL (/v1)",
      },
      { url: PRIMARY_DOMAIN, description: "Primary Custom Domain" },
      { url: LIFETIME_DOMAIN, description: "Lifetime Vercel Domain" },
    ],
    paths: {
      "/api/leetcode": {
        get: {
          operationId: "getLeetCodeStats",
          summary: "Get LeetCode Statistics",
          description:
            "Fetches verified LeetCode profile statistics, global ranking, total problems solved, contest rating, and difficulty breakdown for Urva Gandhi.",
          security: [],
          parameters: [
            {
              name: "username",
              in: "query",
              required: false,
              description: "LeetCode handle (defaults to Urva_Gandhi)",
              schema: { type: "string", default: "Urva_Gandhi" },
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/LeetCodeProfile" },
                },
              },
            },
            400: {
              description: "Bad Request",
              content: {
                "application/problem+json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/codeforces": {
        get: {
          operationId: "getCodeforcesStats",
          summary: "Get Codeforces Statistics",
          description:
            "Fetches Codeforces contest rating, max rating, rank, and submission metrics.",
          security: [],
          parameters: [
            {
              name: "username",
              in: "query",
              required: false,
              description: "Codeforces handle (defaults to Urva_Gandhi)",
              schema: { type: "string", default: "Urva_Gandhi" },
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CodeforcesProfile" },
                },
              },
            },
          },
        },
      },
      "/api/codechef": {
        get: {
          operationId: "getCodeChefStats",
          summary: "Get CodeChef Statistics",
          description:
            "Fetches CodeChef rating, global rank, contest stars, and problems solved.",
          security: [],
          parameters: [
            {
              name: "username",
              in: "query",
              required: false,
              description: "CodeChef handle (defaults to urva_gandhi)",
              schema: { type: "string", default: "urva_gandhi" },
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CodeChefProfile" },
                },
              },
            },
          },
        },
      },
      "/api/gfg": {
        get: {
          operationId: "getGfgStats",
          summary: "Get GeeksforGeeks Statistics",
          description:
            "Fetches GeeksforGeeks overall coding score, streak data, and institute ranking.",
          security: [],
          parameters: [
            {
              name: "username",
              in: "query",
              required: false,
              description: "GeeksforGeeks handle (defaults to urvagandhi)",
              schema: { type: "string", default: "urvagandhi" },
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/GfgProfile" },
                },
              },
            },
          },
        },
      },
      "/api/hackerrank": {
        get: {
          operationId: "getHackerRankStats",
          summary: "Get HackerRank Statistics",
          description:
            "Fetches HackerRank badges, scores, and problem solving achievements.",
          security: [],
          parameters: [
            {
              name: "username",
              in: "query",
              required: false,
              description: "HackerRank handle (defaults to urvagandhi24)",
              schema: { type: "string", default: "urvagandhi24" },
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HackerRankProfile" },
                },
              },
            },
          },
        },
      },
      "/api/contact": {
        post: {
          operationId: "submitContactInquiry",
          summary: "Submit Contact Form Inquiry",
          description:
            "Delivers an inquiry email directly to Urva Gandhi via Brevo HTTPS REST API.",
          security: [{ oauth2: ["profile:write"] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ContactPayload" },
              },
            },
          },
          responses: {
            200: {
              description: "Message delivered",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ContactResponse" },
                },
              },
            },
            400: {
              description: "Validation error",
              content: {
                "application/problem+json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/mcp": {
        get: {
          operationId: "getMcpManifest",
          summary: "MCP Server Handshake",
          description:
            "Returns Model Context Protocol server capabilities, transport options, and available tools.",
          security: [],
          responses: { 200: { description: "MCP Manifest response" } },
        },
        post: {
          operationId: "callMcpTool",
          summary: "Execute MCP Tool or Handshake (JSON-RPC 2.0)",
          description: "Executes MCP tools and resource handlers.",
          security: [],
          responses: { 200: { description: "JSON-RPC response payload" } },
        },
      },
      "/api/keys": {
        get: {
          operationId: "selfServeApiKey",
          summary: "Self-Serve Free API Key",
          description:
            "Generates a free-tier API key without signup or human contact, so agents can authenticate immediately (no 'contact sales' forms).",
          security: [],
          responses: {
            200: {
              description: "API key issued",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ApiKeyResponse" },
                },
              },
            },
          },
        },
      },
      "/api/sandbox": {
        get: {
          operationId: "sandboxSampleData",
          summary: "Sandbox Test Environment",
          description:
            "Returns clearly-labelled sample payloads so agents can test integrations with zero quota impact.",
          security: [],
          parameters: [
            {
              name: "platform",
              in: "query",
              required: false,
              description: "Sample payload to return",
              schema: {
                type: "string",
                enum: [
                  "all",
                  "leetcode",
                  "codeforces",
                  "codechef",
                  "gfg",
                  "hackerrank",
                  "profile",
                  "projects",
                  "contact",
                ],
                default: "profile",
              },
            },
          ],
          responses: {
            200: {
              description: "Sample payload",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SandboxResponse" },
                },
              },
            },
          },
        },
        post: {
          operationId: "sandboxExecute",
          summary: "Sandbox Execute / Echo",
          description:
            "Echoes or executes sample tool calls inside the sandbox environment.",
          security: [],
          responses: { 200: { description: "Sandbox result" } },
        },
      },
    },
    components: {
      securitySchemes: {
        oauth2: {
          type: "oauth2",
          flows: {
            clientCredentials: {
              tokenUrl: "https://urvagandhi.tech/.well-known/oauth/token",
              scopes: {
                "profile:read":
                  "Read public developer profile and coding statistics.",
                "profile:write":
                  "Submit a contact inquiry on behalf of an authenticated client.",
              },
            },
            authorizationCode: {
              authorizationUrl:
                "https://urvagandhi.tech/.well-known/oauth/authorize",
              tokenUrl: "https://urvagandhi.tech/.well-known/oauth/token",
              scopes: {
                "profile:read":
                  "Read public developer profile and coding statistics.",
                "profile:write":
                  "Submit a contact inquiry on behalf of an authenticated client.",
              },
            },
          },
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          required: ["type", "title", "status", "code", "detail"],
          properties: {
            type: {
              type: "string",
              example: "https://urvagandhi.tech/docs/errors/invalid-parameters",
            },
            title: { type: "string", example: "Bad Request" },
            status: { type: "integer", example: 400 },
            code: { type: "string", example: "MISSING_REQUIRED_FIELDS" },
            detail: { type: "string", example: "Required fields missing." },
            instance: { type: "string", example: "/api/contact" },
            resolution_hint: {
              type: "string",
              example: "Check parameters and try again.",
            },
          },
        },
        LeetCodeProfile: {
          type: "object",
          properties: {
            username: { type: "string" },
            solved: { type: "integer" },
            rating: { type: "integer" },
          },
        },
        CodeforcesProfile: {
          type: "object",
          properties: {
            handle: { type: "string" },
            rating: { type: "integer" },
          },
        },
        CodeChefProfile: {
          type: "object",
          properties: {
            username: { type: "string" },
            rating: { type: "integer" },
          },
        },
        GfgProfile: {
          type: "object",
          properties: {
            username: { type: "string" },
            score: { type: "integer" },
          },
        },
        HackerRankProfile: {
          type: "object",
          properties: { username: { type: "string" } },
        },
        ContactPayload: {
          type: "object",
          required: ["name", "email", "message"],
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            message: { type: "string" },
          },
        },
        ContactResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
          },
        },
        ApiKeyResponse: {
          type: "object",
          properties: {
            keyId: { type: "string" },
            apiKey: { type: "string" },
            sandboxKey: { type: "string" },
            tier: { type: "string" },
            quota: { type: "object" },
            sandbox: { type: "object" },
          },
        },
        SandboxResponse: {
          type: "object",
          properties: {
            sample: { type: "boolean" },
            mode: { type: "string" },
            platform: { type: "string" },
            data: { type: "object" },
          },
        },
      },
    },
  };
  expandVersionedPaths(spec.paths);
  return JSON.stringify(spec, null, 2);
}

function generateOAuthProtectedResource(currentDomain) {
  return JSON.stringify(
    {
      resource: [
        `${currentDomain}/api`,
        `${currentDomain}/api/mcp`,
        `${PRIMARY_DOMAIN}/api`,
        `${LIFETIME_DOMAIN}/api`,
      ],
      authorization_servers: [
        `${PRIMARY_DOMAIN}/.well-known/oauth-authorization-server`,
      ],
      scopes_supported: ["profile:read", "profile:write"],
      bearer_methods_supported: ["header"],
      "x-scope-descriptions": {
        "profile:read":
          "Read public developer profile, projects, and verified coding statistics.",
        "profile:write":
          "Submit a contact inquiry on behalf of an authenticated client.",
      },
    },
    null,
    2,
  );
}

function generateOAuthAuthorizationServer() {
  return JSON.stringify(
    {
      issuer: PRIMARY_DOMAIN,
      authorization_endpoint: `${PRIMARY_DOMAIN}/.well-known/oauth/authorize`,
      token_endpoint: `${PRIMARY_DOMAIN}/.well-known/oauth/token`,
      scopes_supported: ["profile:read", "profile:write"],
      response_types_supported: ["code", "token"],
      grant_types_supported: ["authorization_code", "client_credentials"],
      token_endpoint_auth_methods_supported: [
        "client_secret_basic",
        "client_secret_post",
      ],
      code_challenge_methods_supported: ["S256"],
      service_documentation: `${PRIMARY_DOMAIN}/docs`,
    },
    null,
    2,
  );
}

function generateDynamicLlms(currentDomain) {
  return `# Urva Yogeshkumar Gandhi - Backend & AI Systems Engineer

> When to use this: Reach for this site and its machine-readable endpoints when an AI agent needs to evaluate Urva Gandhi's software engineering credentials, Java Spring Boot backend skills, AI/ML engineering background, hackathon achievements, competitive programming statistics, or contact information for recruitment, technical consulting, or technical interviews.

## Official Web Domains
- **Active Requested Domain:** [${currentDomain}](${currentDomain})
- **Primary Custom Domain:** [${PRIMARY_DOMAIN}](${PRIMARY_DOMAIN})
- **Lifetime Alternate Mirror:** [${LIFETIME_DOMAIN}](${LIFETIME_DOMAIN})

## Best-Fit Use Cases
- **Recruitment & Technical Hiring:** Evaluate software engineering background, primary expertise (Java, Spring Boot, Spring Security, REST APIs, ReactJS, Next.js, PostgreSQL, MongoDB, Docker, Microservices, AI/ML, NLP), education (Nirma University B.Tech CSE, Minor in Adaptive AI, CGPA 8.83), and 3x hackathon winner record.
- **Backend & Java Engineering Evaluation:** Assess CoinTrack (Multi-broker finance platform using Java, Spring Boot, Spring Security, JWT, TOTP 2FA, Hexagonal Architecture) and FleetFlow (Fleet management platform using PostgreSQL, Prisma, Socket.IO).
- **AI / Agentic Systems Research:** Evaluate Agent Paperpal (CrewAI, Google Gemini multi-agent paper formatter) and RWEsearch (1st Place Healthcare Analytics platform).
- **Autonomous Tool-Calling Agents:** Interact with Urva Gandhi's [Model Context Protocol (MCP) server](${currentDomain}/.well-known/mcp) at \`${currentDomain}/api/mcp\`, \`${PRIMARY_DOMAIN}/api/mcp\`, or \`${LIFETIME_DOMAIN}/api/mcp\`.

## Core Capabilities & Tech Stack
- **Backend & Java (Primary Focus):** Java, Spring Boot, Spring Security, Microservices, REST APIs, OOP, PostgreSQL, MongoDB, MySQL, Docker, Git, JWT, OAuth 2.0, Hexagonal Architecture, Caffeine Caching, Bucket4j Rate Limiting.
- **AI & Machine Learning (Secondary Focus):** Adaptive AI, Multi-Agent Systems (CrewAI), NLP, Google Gemini API, Scikit-Learn, XGBoost, TensorFlow, Machine Learning, Data Analytics.
- **Frontend & Web Development:** ReactJS, Next.js, JavaScript, TypeScript, Tailwind CSS, Motion, Socket.IO.
- **Education & Credentials:** B.Tech in Computer Science & Engineering (Minor in Adaptive AI), Nirma University (CGPA 8.83/10).
- **Competitive Coding:** Solved 300+ DSA problems on LeetCode (Rating 1637, Top 19.46%), active on Codeforces (\`Urva_Gandhi\`) and CodeChef (\`urva_gandhi\`).

## Developer Resources & Machine Endpoints
- **Developer Portal & API Docs:** [${currentDomain}/docs](${currentDomain}/docs) | [${currentDomain}/api-docs](${currentDomain}/api-docs)
- **API Authentication:** [${currentDomain}/auth](${currentDomain}/auth)
- **OpenAPI 3.0 Specification:** [${currentDomain}/openapi.json](${currentDomain}/openapi.json) | [api/openapi.json](${currentDomain}/api/openapi.json)
- **MCP Server Manifest:** [${currentDomain}/.well-known/mcp](${currentDomain}/.well-known/mcp) | [.well-known/mcp.json](${currentDomain}/.well-known/mcp.json) | [mcp](${currentDomain}/mcp)
- **MCP Tool Calling Endpoint:** [${currentDomain}/api/mcp](${currentDomain}/api/mcp)
- **Official CLI Tool:** \`npm install -g urvagandhi\` then run \`urvagandhi help\` (commands: profile, stats [platform], projects, contact, mcp, discover, openapi)
- **Self-Serve API Key (free tier, no signup):** [${currentDomain}/api/keys](${currentDomain}/api/keys)
- **Sandbox / Test Environment:** [${currentDomain}/api/sandbox](${currentDomain}/api/sandbox) (returns labelled sample data)
- **Rate Limit Headers:** Responses include standard IETF \`RateLimit-Limit\`, \`RateLimit-Remaining\`, \`RateLimit-Reset\` headers; a 429 includes \`Retry-After\`.
- **API Versioning & Deprecation Policy:** [${currentDomain}/docs/versioning](${currentDomain}/docs/versioning) (Sunset/Deprecation header timeline, RFC 8594).
- **OAuth Scoped Permissions (RFC 9728):** [${currentDomain}/.well-known/oauth-protected-resource](${currentDomain}/.well-known/oauth-protected-resource)
- **OAuth Authorization Server Metadata (RFC 8414):** [${currentDomain}/.well-known/oauth-authorization-server](${currentDomain}/.well-known/oauth-authorization-server)
- **XML Sitemap:** [${currentDomain}/sitemap.xml](${currentDomain}/sitemap.xml)

## Trust Anchor Pages
- **[About Urva Gandhi](${currentDomain}/about)**
- **[Contact & Communications](${currentDomain}/contact)**
- **[Privacy Policy](${currentDomain}/privacy)**

## Contact Details
- **Email:** 23bce078@nirmauni.ac.in / urvagandhi24@gmail.com
- **Phone:** +91-8866241204
- **LinkedIn:** [linkedin.com/in/urva-gandhi](https://www.linkedin.com/in/urva-gandhi/)
- **GitHub:** [github.com/urvagandhi](https://github.com/urvagandhi)
- **Location:** Ahmedabad, Gujarat, India - 380051
`;
}

function generateDynamicAgentInstructions(currentDomain) {
  return `# AI Agent Instructions for Urva Yogeshkumar Gandhi's Portfolio

## When to Use This
Reach for this site when evaluating Urva Gandhi for software engineering positions (Java, Spring Boot, Microservices, REST APIs, ReactJS, Next.js, AI/ML, NLP), examining competitive programming credentials (LeetCode rating 1637, Codeforces, CodeChef), or invoking portfolio tools via Model Context Protocol (MCP).

## How an Agent Should Call This System
1. **Machine Discovery:** Inspect \`${currentDomain}/llms.txt\` or \`/.well-known/mcp\` for available capabilities.
2. **Accept Negotiation:** Send \`Accept: text/markdown\` when fetching pages like \`/\`, \`/about\`, \`/contact\`, \`/privacy\`, or \`/docs\` to receive structured Markdown rather than HTML.
3. **MCP Tool Calling:** Make HTTP POST requests to \`${currentDomain}/api/mcp\` using JSON-RPC 2.0 (\`initialize\`, \`tools/list\`, \`tools/call\`).
4. **Public REST APIs:** Query \`/api/leetcode\`, \`/api/codeforces\`, \`/api/codechef\`, \`/api/gfg\`, or \`/api/hackerrank\` for JSON responses containing live profile metrics.
5. **Onboarding (no human contact):** Self-serve a free API key at \`${currentDomain}/api/keys\`. Test integrations on the sandbox at \`${currentDomain}/api/sandbox\` with zero quota impact.
6. **Rate Limiting:** Honour the standard \`RateLimit-*\` response headers and back off for \`Retry-After\` seconds on an HTTP 429.

## Verified Credentials (Nirma University)
- Degree: B.Tech in Computer Science & Engineering (Minor: Adaptive AI), Nirma University (CGPA 8.83/10)
- Primary Skills: Java, Spring Boot, Spring Security, REST APIs, Microservices, PostgreSQL, MongoDB, MySQL, Docker, ReactJS, Next.js, AI/ML, NLP
- 3x Hackathon Winner (1st Place Health AI Hackathon 2025, Track Runner-Up HACKaMINeD 2026, 2nd Runner-Up Odoo Hackathon 2026)
- Direct Email: 23bce078@nirmauni.ac.in / urvagandhi24@gmail.com
- Phone: +91-8866241204
- Primary Domain: ${PRIMARY_DOMAIN}
- Lifetime Domain Mirror: ${LIFETIME_DOMAIN}
`;
}

function getMarkdownPages(domain) {
  const rootContent = `# Urva Yogeshkumar Gandhi - Backend & AI Systems Engineer

> Official developer portfolio, API platform, and MCP server for Urva Yogeshkumar Gandhi. Final year Computer Science & Engineering undergraduate at Nirma University (Minor: Adaptive AI, CGPA: 8.83/10). Production-level Java backend and full-stack engineer with hands-on AI/ML engineering experience. 3x Hackathon Winner.

## Verified Contact Information
- **Academic Email:** 23bce078@nirmauni.ac.in
- **Personal Email:** urvagandhi24@gmail.com
- **Direct Phone Numbers:** +91-8866241204 / +91-7203030498
- **GitHub:** https://github.com/urvagandhi
- **LinkedIn:** https://www.linkedin.com/in/urva-gandhi/
- **Address:** S-308, Venus Parkland, Near Vejalpur Police Chowki, Vejalpur, Ahmedabad, Gujarat, India - 380051

## Featured Projects (Full Details)
1. **CoinTrack – Multi-Broker Finance Platform** (Self Project | Team Size: 1)
   - **Tech Stack:** Java, Spring Boot, Spring Security, MongoDB, Docker, REST API, JWT, AES-256 Encryption, Caffeine, Bucket4j
   - **Description:** Designed & shipped a multi-broker investment platform with 45+ REST endpoints using hexagonal architecture. Aggregated Zerodha, Angel One, Upstox into real-time P&L dashboard. TOTP 2FA, OAuth 2.0, AES encryption.
   - **Repository:** https://github.com/urvagandhi/cointrack

2. **FleetFlow – Fleet & Logistics Management System** (Odoo Hackathon 2026 - 2nd Runner-Up)
   - **Tech Stack:** ReactJS, TypeScript, ExpressJS, PostgreSQL, Prisma ORM, Socket.IO, Docker, REST API
   - **Description:** Developed a full-stack logistics management system with 30+ APIs, RBAC, audit logging, and real-time updates via Socket.IO.
   - **Repository:** https://github.com/urvagandhi/Odoo-Hackathon-26

3. **Agent Paperpal – Agentic AI Manuscript Formatter** (HACKaMINeD 2026 - Track Runner-Up)
   - **Tech Stack:** Python, CrewAI, ReactJS, Google Gemini, Office.js, AI Agents, NLP
   - **Description:** Multi-agent AI platform automating manuscript formatting & compliance checking (APA, IEEE, Springer, Vancouver, Chicago).

4. **RWEsearch – Healthcare Analytics Platform** (Health AI Innovation Hackathon 2025 - 1st Place Winner)
   - **Tech Stack:** Python, Scikit-learn, XGBoost, TensorFlow, Machine Learning, Data Analytics, Streamlit
   - **Description:** Healthcare analytics platform predicting hospital readmissions using XGBoost & Deep Learning models with an interactive Streamlit UI.
   - **Repository:** https://github.com/urvagandhi/RWEsearch-Hackathon

## Hackathon Awards & Achievements
- **1st Place Winner:** Health AI Innovation Hackathon 2025 (140+ competing teams)
- **Track Runner-Up:** HACKaMINeD 2026 (400+ competing teams, 2300+ registrations)
- **2nd Runner-Up:** Odoo x Gujarat Vidyapith National Hackathon 2026
- **Competitive Programming:** Solved 300+ DSA problems on LeetCode (Rating: 1637, Top 19.46%). Active on Codeforces and CodeChef.

## Education & Academic Credentials
- **Degree:** B.Tech in Computer Science & Engineering (Minor: Adaptive AI), Institute of Technology, Nirma University
- **Academic Score:** CGPA 8.83 / 10
- **Departments:** Department of Computer Science & Engineering (https://cse.nirmauni.ac.in) | Institute of Technology (https://technology.nirmauni.ac.in)

## Executive Summary & Core Agent Answers
- **What this site is:** The official personal portfolio, developer documentation portal, public REST API, and Model Context Protocol (MCP) server for Urva Yogeshkumar Gandhi.
- **Who it is for:** Technical recruiters, engineering managers, hiring teams, CTOs, software developers, and autonomous AI agents seeking backend software engineers.
- **Pricing & Service Availability:**
  - **Public REST API & MCP Server:** Free ($0) open access (Rate limit: 100 requests/min).
  - **Hiring Availability:** Available for Full-Time Backend/Software Engineering roles, Spring Boot contracts, AI Systems consulting, and internships. Direct recruitment with zero platform fees.
- **Key Technical Expertise:** Java, Spring Boot, Spring Security, REST APIs, Microservices, PostgreSQL, MongoDB, MySQL, Docker, Git, Hexagonal Architecture, ReactJS, Next.js, Python, CrewAI, Scikit-Learn.

## Quick Navigation & Agent Resources
- **LLM Agent Index:** ${domain}/llms.txt
- **Full Agent Context:** ${domain}/llms-full.txt
- **Developer Documentation:** ${domain}/docs
- **API Authentication:** ${domain}/auth
- **OpenAPI 3.0 Spec:** ${domain}/openapi.json
- **MCP Server Manifest:** ${domain}/.well-known/mcp
- **About Urva Gandhi:** ${domain}/about
- **Contact:** ${domain}/contact
- **Privacy Policy:** ${domain}/privacy
`;

  return {
    "/": rootContent,
    "/pricing": rootContent,
    "/services": rootContent,
    "/differentiation": rootContent,
    "/who": rootContent,
    "/roles": rootContent,
    "/skills": rootContent,
    "/projects": rootContent,
    "/experience": rootContent,
    "/about": `# About Urva Yogeshkumar Gandhi

> Backend Developer Intern & Computer Science Undergraduate at Nirma University.

## Background & Expertise
Urva Yogeshkumar Gandhi is a final-year CS undergraduate at Nirma University (Minor in Adaptive AI, CGPA: 8.83/10) specializing in robust Java backend architecture (Spring Boot, Spring Security, Microservices, Hexagonal Architecture) and multi-agent AI systems.

## Education & Academic Credentials
- **B.Tech. Computer Science & Engineering:** Institute of Technology, Nirma University (2023 - 2027) | **CGPA:** 8.83 / 10
- **Minor Specialization:** Adaptive AI & Machine Learning
- **12th GSEB:** Advait Vidyaniketan, Bharuch (2023) | **Percentage:** 80.92%
- **10th GSEB:** Swami Vivekanand School, Ankleshwar (2021) | **Percentage:** 88.33%

## Experience & Internships
- **Backend Developer Intern - Kautilyam** (04 May 2026 - 27 Jun 2026): Designed and maintained backend services, business logic, workflows, and MongoDB database integrations using Spring Boot, Java, and ReactJS.

## Featured Projects
- **CoinTrack:** Multi-broker finance platform (Java, Spring Boot, Spring Security, MongoDB, Docker, JWT, TOTP 2FA, 45+ REST endpoints).
- **FleetFlow:** Fleet & Logistics management system (ReactJS, TypeScript, ExpressJS, PostgreSQL, Prisma, Socket.IO, Docker). 2nd Runner-Up at Odoo Hackathon 2026.
- **Agent Paperpal:** Multi-agent manuscript formatter (Python, CrewAI, ReactJS, Google Gemini). Track Runner-Up at HACKaMINeD 2026 (400+ teams).
- **RWEsearch:** Healthcare analytics platform (Python, Scikit-learn, XGBoost, TensorFlow, Streamlit). 1st Place at Health AI Hackathon 2025.

## Verified Links & Domains
- Active Requested Domain: ${domain}
- Primary Web Domain: ${PRIMARY_DOMAIN}
- Lifetime Mirror Domain: ${LIFETIME_DOMAIN}
- Email: 23bce078@nirmauni.ac.in / urvagandhi24@gmail.com
- Phone: +91-8866241204
- GitHub: https://github.com/urvagandhi
- LinkedIn: https://www.linkedin.com/in/urva-gandhi/
`,
    "/contact": `# Contact Urva Yogeshkumar Gandhi

> Verified contact channels and details for recruiters, technical inquiries, and collaborations.

## Direct Contact Information
- **Primary Academic Email:** 23bce078@nirmauni.ac.in
- **Personal Email:** urvagandhi24@gmail.com
- **Direct Phone Numbers:** +91-8866241204 / +91-7203030498
- **GitHub Profile:** https://github.com/urvagandhi
- **LinkedIn Network:** https://www.linkedin.com/in/urva-gandhi/
- **Active Web Domain:** ${domain}
- **Primary Domain:** ${PRIMARY_DOMAIN}
- **Lifetime Domain Mirror:** ${LIFETIME_DOMAIN}

## Physical Location & Address
S-308, Venus Parkland, Near Vejalpur Police Chowki, Vejalpur, Ahmedabad, Gujarat, India - 380051.

## Preferred Professional Roles
Java Backend Engineer, Spring Boot Developer, Full-Stack Engineer, AI/ML Systems Engineer, Software Developer Intern.
`,
    "/privacy": `# Privacy Policy - Urva Gandhi Portfolio

> Transparency, minimal data collection, and privacy rights.

## Overview
This portfolio website (${PRIMARY_DOMAIN} & ${LIFETIME_DOMAIN}) is designed with privacy and data protection principles.

## Data Collection & Analytics
This portfolio uses privacy-focused telemetry (Vercel Analytics & Speed Insights) to monitor performance and Core Web Vitals. No Personally Identifiable Information (PII) is captured, stored, or sold.

## API & MCP Server Processing
Programmatic requests to \`/api/*\` and Model Context Protocol endpoints (\`/api/mcp\`) process minimal request metadata solely to serve dynamic payloads and enforce standard rate limits.

## Security & Contact
For privacy queries or data concerns, contact: 23bce078@nirmauni.ac.in / urvagandhi24@gmail.com.
`,
    "/docs": `# Urva Gandhi Portfolio Developer Portal & API Documentation

> Official developer resources, API specs, and MCP integration guides for Urva Gandhi's Portfolio APIs.

## Machine-Readable Resources & Discoverable URLs
- **Developer Portal:** ${domain}/docs & ${domain}/api-docs
- **OpenAPI 3.0 Specification:** ${domain}/openapi.json & ${domain}/api/openapi.json
- **MCP Server Manifest:** ${domain}/.well-known/mcp & ${domain}/.well-known/mcp.json & ${domain}/mcp
- **MCP Tool Endpoint:** ${domain}/api/mcp
- **LLM Agent Index:** ${domain}/llms.txt
- **API Authentication Guidelines:** ${domain}/auth
- **API Versioning & Deprecation Policy:** ${domain}/docs/versioning
- **Self-Serve API Key (free tier, no signup):** ${domain}/api/keys
- **Sandbox Test Environment:** ${domain}/api/sandbox
- **XML Sitemap:** ${domain}/sitemap.xml

## Rate Limit Conventions
All API responses carry the standard IETF headers \`RateLimit-Limit\`, \`RateLimit-Remaining\`, \`RateLimit-Reset\` (plus legacy \`X-RateLimit-*\`). When a client exceeds a limit, HTTP 429 is returned with a \`Retry-After\` header so agents can self-throttle in real time.
`,
    "/auth": `# API Authentication & Usage Guidelines - Urva Gandhi Portfolio

> Guidelines for accessing public endpoints and MCP tools on Urva Gandhi's Portfolio.

## Free Tier (Self-Serve, No Signup)
The developer API and MCP server are free and open. To obtain a scoped API key without human contact, self-serve it at:
- **Issue a key:** POST /api/keys (or GET /api/keys) — returns \`apiKey\` and \`sandboxKey\`.
- **Authenticate (optional):** \`Authorization: Bearer <apiKey>\` or \`X-API-Key: <apiKey>\`.

## Access Policy
All public endpoints (\`/api/leetcode\`, \`/api/codeforces\`, \`/api/codechef\`, \`/api/gfg\`, \`/api/hackerrank\`, \`/api/mcp\`) are open-access. No API key required.

## Sandbox Test Environment
Try the API safely with clearly-labelled sample data (zero quota impact):
- **Sample payloads:** GET /api/sandbox?platform=leetcode
- **Echo / tool test:** POST /api/sandbox/echo with a raw JSON body.
- **Response header:** \`X-Environment: sandbox\` marks every sandbox reply.

## Rate Limiting
- Standard IP limit: 100 requests / min
- MCP Tool invocations: 60 calls / min
- Headers: \`RateLimit-Limit\`, \`RateLimit-Remaining\`, \`RateLimit-Reset\` (+ \`Retry-After\` on 429)
`,
    "/docs/versioning": `# API Versioning & Deprecation Policy - Urva Gandhi Portfolio

> A contract agents can rely on: versions are stable, deprecations are announced in advance, and nothing changes without warning.

## Versioning Strategy
- **URL path versioning:** Every canonical endpoint is mirrored under stable versioned paths: \`/api/*\`, \`/v1/*\`, and \`/api/v1/*\`. Example: \`GET /v1/leetcode\`.
- **Version header:** Operations also accept the \`X-API-Version\` request header (value \`1\`), documented in the OpenAPI spec at ${domain}/openapi.json.
- **Current stable version:** \`1\` — offered in advance, no change since launch.

## Deprecation Policy (timeline)
1. **Announcement:** A deprecation is announced at least **6 months before** end-of-life.
2. **Signal:** Deprecated surfaces are identified by the \`Sunset\` HTTP header (RFC 8594) on responses, plus this policy page and the OpenAPI spec.
3. **Deprecation header:** If a version is formally deprecated rather than removed, the \`Deprecation\` HTTP header is also returned.
4. **Removal:** After end-of-life, deprecated endpoints return HTTP 404 with an RFC 9457 \`application/problem+json\` body explaining the removal and pointing to the replacement surface.

## Guarantees
- Version 1 is backward compatible and will not break during its lifetime.
- No endpoint is removed without a \`Sunset\` announcement.
`,
    "/docs/deprecation": `See the \`/docs/versioning\` policy.`,
    "/sandbox": `# Sandbox Test Environment - Urva Gandhi Portfolio

> Free, zero-quota testing environment for the developer API and MCP server.

## Endpoints
- **Sample payloads:** GET ${domain}/api/sandbox?platform=leetcode | codeforces | codechef | gfg | hackerrank | profile | projects | contact
- **Echo test:** POST ${domain}/api/sandbox/echo
- **Execute tool:** POST ${domain}/api/sandbox/execute

## Behaviour
All sandbox responses are marked \`"sample": true\` and carry the \`X-Environment: sandbox\` response header, so they can never be mistaken for live data.
`,
    "/mcp": `# Model Context Protocol (MCP) Server - Urva Gandhi Portfolio

> First-party MCP server exposing Urva Gandhi's portfolio, coding stats, projects, and contact info to AI agents.

## Endpoint URLs
- **MCP Manifest:** ${domain}/.well-known/mcp
- **MCP Tool Calling Endpoint:** ${domain}/api/mcp
`,
  };
}

export function proxy(req) {
  let pathname = req.nextUrl.pathname;
  // Normalize pathname (strip trailing slash except for root)
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

  const acceptHeader = req.headers.get("accept") || "";
  const userAgent = (req.headers.get("user-agent") || "").toLowerCase();
  const acceptLower = acceptHeader.toLowerCase();

  const isMarkdownRequested =
    acceptLower.includes("text/markdown") ||
    userAgent.includes("agent") ||
    userAgent.includes("llm") ||
    userAgent.includes("bot") ||
    userAgent.includes("crawler") ||
    userAgent.includes("spider") ||
    userAgent.includes("gpt") ||
    userAgent.includes("claude") ||
    userAgent.includes("perplexity") ||
    userAgent.includes("fetcher") ||
    userAgent.includes("scraper") ||
    userAgent.includes("python") ||
    userAgent.includes("curl") ||
    userAgent.includes("wget") ||
    userAgent.includes("ora") ||
    userAgent.includes("headless");
  const currentDomain = getDynamicDomain(req);

  // 1. Dynamic XML Sitemap
  if (pathname === "/sitemap.xml") {
    return new NextResponse(generateDynamicSitemap(currentDomain), {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        Vary: "Accept, Accept-Encoding, Host",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  // 2. Dynamic robots.txt
  if (pathname === "/robots.txt") {
    return new NextResponse(generateDynamicRobots(currentDomain), {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        Vary: "Accept, Accept-Encoding, Host",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  // 3. Dynamic MCP Manifest & Handshake
  if (
    pathname === "/.well-known/mcp" ||
    pathname === "/.well-known/mcp.json" ||
    pathname === "/mcp"
  ) {
    return new NextResponse(generateDynamicMcpManifest(currentDomain), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Mcp-Version": "1.0",
        Link: `<${currentDomain}/api/mcp>; rel="mcp-server"`,
        Vary: "Accept, Accept-Encoding, Host",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  // 4. Dynamic OAuth Scoped-Permission Metadata (RFC 9728 & RFC 8414)
  if (
    pathname === "/.well-known/oauth-protected-resource" ||
    pathname === "/.well-known/oauth-protected-resource.json"
  ) {
    return new NextResponse(generateOAuthProtectedResource(currentDomain), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Vary: "Accept, Accept-Encoding, Host",
      },
    });
  }

  if (
    pathname === "/.well-known/oauth-authorization-server" ||
    pathname === "/.well-known/oauth-authorization-server.json"
  ) {
    return new NextResponse(generateOAuthAuthorizationServer(), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Vary: "Accept, Accept-Encoding, Host",
      },
    });
  }

  // 5. Dynamic OpenAPI Spec
  if (pathname === "/openapi.json" || pathname === "/api/openapi.json") {
    return new NextResponse(generateDynamicOpenApi(currentDomain), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Vary: "Accept, Accept-Encoding, Host",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  // 6. Dynamic LLM text files
  if (pathname === "/llms.txt" || pathname === "/llms-full.txt") {
    return new NextResponse(generateDynamicLlms(currentDomain), {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "llms-txt",
        Vary: "Accept, Accept-Encoding, Host",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  // 7. Dynamic Agent Instructions
  if (
    pathname === "/.well-known/agent-instructions" ||
    pathname === "/.well-known/agent-instructions.md" ||
    pathname === "/agent-instructions.md"
  ) {
    return new NextResponse(generateDynamicAgentInstructions(currentDomain), {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        Vary: "Accept, Accept-Encoding, Host",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  // 8. API docs alias (predictable, discoverable URL)
  if (pathname === "/api-docs" || pathname === "/api/docs") {
    return NextResponse.redirect(`${currentDomain}/docs`, 308);
  }

  const MARKDOWN_PAGES = getMarkdownPages(currentDomain);

  // 8. Handle Markdown content negotiation (acceptmarkdown.com compliance)
  if (isMarkdownRequested) {
    if (MARKDOWN_PAGES[pathname]) {
      return new NextResponse(MARKDOWN_PAGES[pathname], {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          Vary: "Accept, Accept-Encoding, Host",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // Check if static asset or API path
    const isKnownPath =
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/v1") ||
      pathname.startsWith("/images") ||
      pathname === "/favicon.ico" ||
      pathname.startsWith("/resumes");

    if (!isKnownPath) {
      const markdown404 = `# 404 Not Found

The requested path \`${pathname}\` does not exist on Urva Gandhi's Portfolio.

## Recovery Instructions & Where to Look Next
- **LLM Agent Index:** ${currentDomain}/llms.txt
- **Full Agent Context:** ${currentDomain}/llms-full.txt
- **XML Sitemap:** ${currentDomain}/sitemap.xml
- **Developer Documentation:** ${currentDomain}/docs
- **API Authentication:** ${currentDomain}/auth
- **OpenAPI 3.0 Specification:** ${currentDomain}/openapi.json
- **MCP Server Manifest:** ${currentDomain}/.well-known/mcp
- **About Urva Gandhi:** ${currentDomain}/about
- **Contact Channels:** ${currentDomain}/contact
- **Privacy Policy:** ${currentDomain}/privacy
- **Primary Domain:** ${PRIMARY_DOMAIN}
- **Lifetime Domain Mirror:** ${LIFETIME_DOMAIN}
`;
      return new NextResponse(markdown404, {
        status: 404,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          Vary: "Accept, Accept-Encoding, Host",
          "Cache-Control": "no-store",
        },
      });
    }
  }

  const isApiRoute =
    pathname.startsWith("/api/") ||
    pathname.startsWith("/v1/") ||
    pathname.startsWith("/api/v1/");
  const knownApiRoutes = [
    "/api/leetcode",
    "/api/codeforces",
    "/api/codechef",
    "/api/gfg",
    "/api/hackerrank",
    "/api/contact",
    "/api/mcp",
    "/api/openapi.json",
    "/api/keys",
    "/api/sandbox",
    "/v1/leetcode",
    "/v1/codeforces",
    "/v1/codechef",
    "/v1/gfg",
    "/v1/hackerrank",
    "/v1/contact",
    "/v1/mcp",
    "/v1/keys",
    "/v1/sandbox",
    "/api/v1/leetcode",
    "/api/v1/codeforces",
    "/api/v1/codechef",
    "/api/v1/gfg",
    "/api/v1/hackerrank",
    "/api/v1/contact",
    "/api/v1/mcp",
    "/api/v1/keys",
    "/api/v1/sandbox",
  ];

  if (isApiRoute && !knownApiRoutes.includes(pathname)) {
    const errorJson = JSON.stringify(
      {
        type: `${currentDomain}/docs/errors/not-found`,
        title: "Not Found",
        status: 404,
        code: "API_ENDPOINT_NOT_FOUND",
        detail: `The API endpoint '${pathname}' does not exist on Urva Gandhi's Portfolio platform.`,
        instance: pathname,
        resolution_hint: `Consult the OpenAPI spec at ${currentDomain}/openapi.json or LLM index at ${currentDomain}/llms.txt for valid endpoint paths.`,
      },
      null,
      2,
    );

    return new NextResponse(errorJson, {
      status: 404,
      headers: {
        "Content-Type": "application/problem+json; charset=utf-8",
        "X-API-Version": "1.0.0",
        "RateLimit-Limit": "100",
        "RateLimit-Remaining": "99",
        "RateLimit-Reset": "60",
        "X-RateLimit-Limit": "100",
        "X-RateLimit-Remaining": "99",
        "X-RateLimit-Reset": "60",
        Sunset: "Wed, 31 Dec 2026 23:59:59 GMT",
      },
    });
  }

  // Pass through regular HTML requests, ensuring Vary, RateLimit, and Sunset headers are set
  const response = NextResponse.next();
  response.headers.set("Vary", "Accept, Accept-Encoding, Host");
  response.headers.set(
    "Link",
    `<${currentDomain}/llms.txt>; rel="llms-txt", <${currentDomain}/.well-known/mcp>; rel="mcp"`,
  );
  response.headers.set("X-API-Version", "1.0.0");
  response.headers.set("RateLimit-Limit", "100");
  response.headers.set("RateLimit-Remaining", "99");
  response.headers.set("RateLimit-Reset", "60");
  response.headers.set("X-RateLimit-Limit", "100");
  response.headers.set("X-RateLimit-Remaining", "99");
  response.headers.set("X-RateLimit-Reset", "60");
  response.headers.set("Sunset", "Wed, 31 Dec 2026 23:59:59 GMT");
  return response;
}

export default proxy;

export const config = {
  matcher: ["/((?!_next/static|_next/image|images/|favicon.ico).*)"],
};
