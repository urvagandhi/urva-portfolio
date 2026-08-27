import { NextResponse } from 'next/server';

const PRIMARY_DOMAIN = 'https://urvagandhi.tech';
const LIFETIME_DOMAIN = 'https://urvagandhi-portfolio.vercel.app';

function getDynamicDomain(req) {
  const host = req.headers.get('host') || 'urvagandhi.tech';
  const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function generateDynamicSitemap(currentDomain) {
  const pages = ['', '/about', '/auth', '/contact', '/docs', '/privacy'];
  const lastmod = new Date().toISOString();

  const urlElements = pages.map(path => `  <url>
    <loc>${currentDomain}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="x-default" href="${PRIMARY_DOMAIN}${path}" />
    <xhtml:link rel="alternate" hreflang="en" href="${LIFETIME_DOMAIN}${path}" />
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlElements}
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
  return JSON.stringify({
    schema_version: "1.0",
    name: "urva-gandhi-portfolio-mcp",
    description: "First-party Model Context Protocol (MCP) server providing structured tool access to Urva Gandhi's software engineering portfolio, verified coding statistics, project repository metadata, and contact info.",
    version: "1.0.0",
    vendor: "Urva Gandhi",
    homepage: currentDomain,
    primary_homepage: PRIMARY_DOMAIN,
    alternate_homepage: LIFETIME_DOMAIN,
    endpoints: {
      mcp: `${currentDomain}/api/mcp`,
      sse: `${currentDomain}/api/mcp`,
      primary_mcp: `${PRIMARY_DOMAIN}/api/mcp`,
      lifetime_mcp: `${LIFETIME_DOMAIN}/api/mcp`
    },
    servers: [
      {
        url: `${currentDomain}/api/mcp`,
        description: "Active Environment Server Endpoint"
      },
      {
        url: `${PRIMARY_DOMAIN}/api/mcp`,
        description: "Primary Custom Domain Endpoint"
      },
      {
        url: `${LIFETIME_DOMAIN}/api/mcp`,
        description: "Lifetime Vercel Mirror Endpoint"
      }
    ],
    capabilities: {
      tools: {
        listChanged: false
      }
    },
    tools: [
      {
        name: "get_developer_profile",
        description: "Returns Urva Gandhi's developer profile, Nirma University education, Java/Spring Boot & AI tech stack, and hackathon achievements.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "get_coding_stats",
        description: "Fetches verified coding metrics across LeetCode, Codeforces, CodeChef, GeeksforGeeks, and HackerRank.",
        inputSchema: {
          type: "object",
          properties: {
            platform: {
              type: "string",
              enum: ["all", "leetcode", "codeforces", "codechef", "gfg", "hackerrank"],
              description: "Specific platform or 'all' for aggregated stats."
            }
          }
        }
      },
      {
        name: "get_projects",
        description: "Fetches featured projects (CoinTrack, FleetFlow, Agent Paperpal, RWEsearch), tech stacks, and links.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "get_contact_info",
        description: "Returns verified contact channels, email, LinkedIn, GitHub, phone numbers, and location info.",
        inputSchema: { type: "object", properties: {} }
      }
    ]
  }, null, 2);
}

function generateDynamicOpenApi(currentDomain) {
  return JSON.stringify({
    openapi: "3.0.3",
    info: {
      title: "Urva Gandhi Portfolio Developer API & MCP Server",
      description: "Public REST APIs, Model Context Protocol (MCP) server, and developer endpoints providing verified coding statistics, developer profile metadata, and interactive contact handling for Urva Gandhi.",
      version: "1.0.0",
      contact: {
        name: "Urva Gandhi",
        email: "23bce078@nirmauni.ac.in",
        url: currentDomain
      },
      "x-versioning-policy": "URL path versioning (/v1/) and X-API-Version header parameter. Backward compatibility guaranteed for version 1.",
      "x-deprecation-policy": "Deprecation notices served via Sunset HTTP header 6 months prior to end-of-life."
    },
    servers: [
      { url: currentDomain, description: "Active Domain Server" },
      { url: PRIMARY_DOMAIN, description: "Primary Custom Domain" },
      { url: LIFETIME_DOMAIN, description: "Lifetime Vercel Domain" }
    ],
    paths: {
      "/api/leetcode": {
        get: {
          operationId: "getLeetCodeStats",
          summary: "Get LeetCode Statistics",
          description: "Fetches verified LeetCode profile statistics, global ranking, total problems solved, contest rating, and difficulty breakdown for Urva Gandhi.",
          parameters: [
            {
              name: "username",
              in: "query",
              required: false,
              description: "LeetCode handle (defaults to Urva_Gandhi)",
              schema: { type: "string", default: "Urva_Gandhi" }
            }
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: { "application/json": { schema: { $ref: "#/components/schemas/LeetCodeProfile" } } }
            },
            "400": {
              description: "Bad Request",
              content: { "application/problem+json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
            }
          }
        }
      },
      "/api/codeforces": {
        get: {
          operationId: "getCodeforcesStats",
          summary: "Get Codeforces Statistics",
          description: "Fetches Codeforces contest rating, max rating, rank, and submission metrics.",
          parameters: [
            {
              name: "username",
              in: "query",
              required: false,
              description: "Codeforces handle (defaults to Urva_Gandhi)",
              schema: { type: "string", default: "Urva_Gandhi" }
            }
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: { "application/json": { schema: { $ref: "#/components/schemas/CodeforcesProfile" } } }
            }
          }
        }
      },
      "/api/codechef": {
        get: {
          operationId: "getCodeChefStats",
          summary: "Get CodeChef Statistics",
          description: "Fetches CodeChef rating, global rank, contest stars, and problems solved.",
          parameters: [
            {
              name: "username",
              in: "query",
              required: false,
              description: "CodeChef handle (defaults to urva_gandhi)",
              schema: { type: "string", default: "urva_gandhi" }
            }
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: { "application/json": { schema: { $ref: "#/components/schemas/CodeChefProfile" } } }
            }
          }
        }
      },
      "/api/gfg": {
        get: {
          operationId: "getGfgStats",
          summary: "Get GeeksforGeeks Statistics",
          description: "Fetches GeeksforGeeks overall coding score, streak data, and institute ranking.",
          parameters: [
            {
              name: "username",
              in: "query",
              required: false,
              description: "GeeksforGeeks handle (defaults to urvagandhi)",
              schema: { type: "string", default: "urvagandhi" }
            }
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: { "application/json": { schema: { $ref: "#/components/schemas/GfgProfile" } } }
            }
          }
        }
      },
      "/api/hackerrank": {
        get: {
          operationId: "getHackerRankStats",
          summary: "Get HackerRank Statistics",
          description: "Fetches HackerRank badges, scores, and problem solving achievements.",
          parameters: [
            {
              name: "username",
              in: "query",
              required: false,
              description: "HackerRank handle (defaults to urvagandhi24)",
              schema: { type: "string", default: "urvagandhi24" }
            }
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: { "application/json": { schema: { $ref: "#/components/schemas/HackerRankProfile" } } }
            }
          }
        }
      },
      "/api/contact": {
        post: {
          operationId: "submitContactInquiry",
          summary: "Submit Contact Form Inquiry",
          description: "Delivers an inquiry email directly to Urva Gandhi via Brevo HTTPS REST API.",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/ContactPayload" } } }
          },
          responses: {
            "200": {
              description: "Message delivered",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ContactResponse" } } }
            },
            "400": {
              description: "Validation error",
              content: { "application/problem+json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
            }
          }
        }
      },
      "/api/mcp": {
        get: {
          operationId: "getMcpManifest",
          summary: "MCP Server Handshake",
          description: "Returns Model Context Protocol server capabilities, transport options, and available tools.",
          responses: { "200": { description: "MCP Manifest response" } }
        },
        post: {
          operationId: "callMcpTool",
          summary: "Execute MCP Tool or Handshake (JSON-RPC 2.0)",
          description: "Executes MCP tools and resource handlers.",
          responses: { "200": { description: "JSON-RPC response payload" } }
        }
      }
    },
    components: {
      schemas: {
        ErrorResponse: {
          type: "object",
          required: ["type", "title", "status", "code", "detail"],
          properties: {
            type: { type: "string", example: "https://urvagandhi.tech/docs/errors/invalid-parameters" },
            title: { type: "string", example: "Bad Request" },
            status: { type: "integer", example: 400 },
            code: { type: "string", example: "MISSING_REQUIRED_FIELDS" },
            detail: { type: "string", example: "Required fields missing." },
            instance: { type: "string", example: "/api/contact" },
            resolution_hint: { type: "string", example: "Check parameters and try again." }
          }
        },
        LeetCodeProfile: { type: "object", properties: { username: { type: "string" }, solved: { type: "integer" }, rating: { type: "integer" } } },
        CodeforcesProfile: { type: "object", properties: { handle: { type: "string" }, rating: { type: "integer" } } },
        CodeChefProfile: { type: "object", properties: { username: { type: "string" }, rating: { type: "integer" } } },
        GfgProfile: { type: "object", properties: { username: { type: "string" }, score: { type: "integer" } } },
        HackerRankProfile: { type: "object", properties: { username: { type: "string" } } },
        ContactPayload: { type: "object", required: ["name", "email", "message"], properties: { name: { type: "string" }, email: { type: "string" }, message: { type: "string" } } },
        ContactResponse: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" } } }
      }
    }
  }, null, 2);
}

function generateDynamicLlms(currentDomain) {
  return `# Urva Yogeshkumar Gandhi - Backend & AI Systems Engineer

> When to use this: Reach for this site and its machine-readable endpoints when an AI agent needs to evaluate Urva Gandhi's software engineering credentials, Java Spring Boot backend skills, AI/ML engineering background, hackathon achievements, competitive programming statistics, or contact information for recruitment, technical consulting, or technical interviews.

## Official Web Domains
- **Active Requested Domain:** ${currentDomain}
- **Primary Custom Domain:** ${PRIMARY_DOMAIN}
- **Lifetime Alternate Mirror:** ${LIFETIME_DOMAIN}

## Best-Fit Use Cases
- **Recruitment & Technical Hiring:** Evaluate software engineering background, primary expertise (Java, Spring Boot, Spring Security, REST APIs, ReactJS, Next.js, PostgreSQL, MongoDB, Docker, Microservices, AI/ML, NLP), education (Nirma University B.Tech CSE, Minor in Adaptive AI, CGPA 8.83), and 3x hackathon winner record.
- **Backend & Java Engineering Evaluation:** Assess CoinTrack (Multi-broker finance platform using Java, Spring Boot, Spring Security, JWT, TOTP 2FA, Hexagonal Architecture) and FleetFlow (Fleet management platform using PostgreSQL, Prisma, Socket.IO).
- **AI / Agentic Systems Research:** Evaluate Agent Paperpal (CrewAI, Google Gemini multi-agent paper formatter) and RWEsearch (1st Place Healthcare Analytics platform).
- **Autonomous Tool-Calling Agents:** Interact with Urva Gandhi's Model Context Protocol (MCP) server at \`${currentDomain}/api/mcp\`, \`${PRIMARY_DOMAIN}/api/mcp\`, or \`${LIFETIME_DOMAIN}/api/mcp\`.

## Core Capabilities & Tech Stack
- **Backend & Java (Primary Focus):** Java, Spring Boot, Spring Security, Microservices, REST APIs, OOP, PostgreSQL, MongoDB, MySQL, Docker, Git, JWT, OAuth 2.0, Hexagonal Architecture, Caffeine Caching, Bucket4j Rate Limiting.
- **AI & Machine Learning (Secondary Focus):** Adaptive AI, Multi-Agent Systems (CrewAI), NLP, Google Gemini API, Scikit-Learn, XGBoost, TensorFlow, Machine Learning, Data Analytics.
- **Frontend & Web Development:** ReactJS, Next.js, JavaScript, TypeScript, Tailwind CSS, Motion, Socket.IO.
- **Education & Credentials:** B.Tech in Computer Science & Engineering (Minor in Adaptive AI), Nirma University (CGPA 8.83/10).
- **Competitive Coding:** Solved 300+ DSA problems on LeetCode (Rating 1637, Top 19.46%), active on Codeforces (\`Urva_Gandhi\`) and CodeChef (\`urva_gandhi\`).

## Developer Resources & Machine Endpoints
- **Developer Portal:** ${currentDomain}/docs | ${currentDomain}/api-docs
- **API Authentication:** ${currentDomain}/auth
- **OpenAPI 3.0 Specification:** ${currentDomain}/openapi.json | ${currentDomain}/api/openapi.json
- **MCP Server Manifest:** ${currentDomain}/.well-known/mcp | ${currentDomain}/.well-known/mcp.json | ${currentDomain}/mcp
- **MCP Tool Calling Endpoint:** ${currentDomain}/api/mcp
- **XML Sitemap:** ${currentDomain}/sitemap.xml

## Trust Anchor Pages
- **About Urva Gandhi:** ${currentDomain}/about
- **Contact & Communications:** ${currentDomain}/contact
- **Privacy Policy:** ${currentDomain}/privacy

## Contact Details
- **Email:** 23bce078@nirmauni.ac.in / urvagandhi24@gmail.com
- **Phone:** +91-8866241204
- **LinkedIn:** https://www.linkedin.com/in/urva-gandhi/
- **GitHub:** https://github.com/urvagandhi
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
  return {
    '/': `# Urva Yogeshkumar Gandhi - Backend & AI Systems Engineer

> Final year Computer Science & Engineering undergraduate at Nirma University (Minor: Adaptive AI, CGPA: 8.83/10). Production-level Java backend and full-stack engineer with hands-on AI/ML engineering experience. 3x Hackathon Winner.

## Profile Summary
- **Name:** Urva Yogeshkumar Gandhi
- **Location:** Ahmedabad, Gujarat, India - 380051
- **Education:** B.Tech in Computer Science & Engineering (Minor: Adaptive AI), Institute of Technology, Nirma University (CGPA: 8.83/10)
- **Role:** Backend Developer Intern (Kautilyam) | Software & AI Systems Engineer

## Domain Endpoints
- **Active Request Domain:** ${domain}
- **Primary Domain:** ${PRIMARY_DOMAIN}
- **Lifetime Mirror Domain:** ${LIFETIME_DOMAIN}

## Key Technical Expertise
- **Java & Backend (Primary):** Java, Spring Boot, Spring Security, REST APIs, Microservices, OOP, PostgreSQL, MongoDB, MySQL, Docker, Git, JWT, OAuth 2.0, Hexagonal Architecture
- **AI & Machine Learning:** Adaptive AI, Multi-Agent Systems (CrewAI), NLP, Google Gemini API, Scikit-learn, XGBoost, TensorFlow, Data Analytics
- **Frontend & Web:** ReactJS, Next.js, JavaScript, TypeScript, Socket.IO, Prisma ORM, Tailwind CSS

## Highlights & Achievements
- **1st Place:** RWEsearch & Health AI Innovation Hackathon 2025 (140+ teams)
- **Track Runner-Up:** HACKaMINeD 2026 (400+ teams, 2300+ registrations)
- **2nd Runner-Up:** Odoo x Gujarat Vidyapith Hackathon 2026
- **Competitive Coding:** 300+ DSA problems solved on LeetCode (Rating 1637, Top 19.46%)

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
`,
    '/about': `# About Urva Yogeshkumar Gandhi

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
    '/contact': `# Contact Urva Yogeshkumar Gandhi

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
    '/privacy': `# Privacy Policy - Urva Gandhi Portfolio

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
    '/docs': `# Urva Gandhi Portfolio Developer Portal & API Documentation

> Official developer resources, API specs, and MCP integration guides for Urva Gandhi's Portfolio APIs.

## Machine-Readable Resources & Discoverable URLs
- **Developer Portal:** ${domain}/docs & ${domain}/api-docs
- **OpenAPI 3.0 Specification:** ${domain}/openapi.json & ${domain}/api/openapi.json
- **MCP Server Manifest:** ${domain}/.well-known/mcp & ${domain}/.well-known/mcp.json & ${domain}/mcp
- **MCP Tool Endpoint:** ${domain}/api/mcp
- **LLM Agent Index:** ${domain}/llms.txt
- **API Authentication Guidelines:** ${domain}/auth
- **XML Sitemap:** ${domain}/sitemap.xml
`,
    '/auth': `# API Authentication & Usage Guidelines - Urva Gandhi Portfolio

> Guidelines for accessing public endpoints and MCP tools on Urva Gandhi's Portfolio.

## Access Policy
All public endpoints (\`/api/leetcode\`, \`/api/codeforces\`, \`/api/codechef\`, \`/api/gfg\`, \`/api/hackerrank\`, \`/api/mcp\`) are open-access. No API key required.

## Rate Limiting
- Standard IP limit: 100 requests / min
- MCP Tool invocations: 60 calls / min
`,
    '/mcp': `# Model Context Protocol (MCP) Server - Urva Gandhi Portfolio

> First-party MCP server exposing Urva Gandhi's portfolio, coding stats, projects, and contact info to AI agents.

## Endpoint URLs
- **MCP Manifest:** ${domain}/.well-known/mcp
- **MCP Tool Calling Endpoint:** ${domain}/api/mcp
`
  };
}

export function proxy(req) {
  let pathname = req.nextUrl.pathname;
  // Normalize pathname (strip trailing slash except for root)
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  const acceptHeader = req.headers.get('accept') || '';
  const userAgent = req.headers.get('user-agent') || '';
  const isMarkdownRequested = acceptHeader.toLowerCase().includes('text/markdown') || 
                              userAgent.toLowerCase().includes('agent') ||
                              userAgent.toLowerCase().includes('llm');
  const currentDomain = getDynamicDomain(req);

  // 1. Dynamic XML Sitemap
  if (pathname === '/sitemap.xml') {
    return new NextResponse(generateDynamicSitemap(currentDomain), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Vary': 'Accept, Accept-Encoding, Host',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // 2. Dynamic robots.txt
  if (pathname === '/robots.txt') {
    return new NextResponse(generateDynamicRobots(currentDomain), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Vary': 'Accept, Accept-Encoding, Host',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // 3. Dynamic MCP Manifest & Handshake
  if (pathname === '/.well-known/mcp' || pathname === '/.well-known/mcp.json' || pathname === '/mcp') {
    return new NextResponse(generateDynamicMcpManifest(currentDomain), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Mcp-Version': '1.0',
        'Link': `<${currentDomain}/api/mcp>; rel="mcp-server"`,
        'Vary': 'Accept, Accept-Encoding, Host',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // 4. Dynamic OpenAPI Spec
  if (pathname === '/openapi.json' || pathname === '/api/openapi.json') {
    return new NextResponse(generateDynamicOpenApi(currentDomain), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Vary': 'Accept, Accept-Encoding, Host',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // 5. Dynamic LLM text files
  if (pathname === '/llms.txt' || pathname === '/llms-full.txt') {
    return new NextResponse(generateDynamicLlms(currentDomain), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Vary': 'Accept, Accept-Encoding, Host',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // 6. Dynamic Agent Instructions
  if (pathname === '/.well-known/agent-instructions' || pathname === '/.well-known/agent-instructions.md' || pathname === '/agent-instructions.md') {
    return new NextResponse(generateDynamicAgentInstructions(currentDomain), {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Vary': 'Accept, Accept-Encoding, Host',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  const MARKDOWN_PAGES = getMarkdownPages(currentDomain);

  // 7. Handle Markdown content negotiation (acceptmarkdown.com compliance)
  if (isMarkdownRequested) {
    if (MARKDOWN_PAGES[pathname]) {
      return new NextResponse(MARKDOWN_PAGES[pathname], {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept, Accept-Encoding, Host',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Check if static asset or API path
    const isKnownPath = 
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/images') ||
      pathname === '/favicon.ico' ||
      pathname.startsWith('/resumes');

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
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept, Accept-Encoding, Host',
          'Cache-Control': 'no-store',
        },
      });
    }
  }

  // Pass through regular HTML requests, ensuring Vary: Accept, Accept-Encoding, Host is set
  const response = NextResponse.next();
  response.headers.set('Vary', 'Accept, Accept-Encoding, Host');
  response.headers.set('Link', `<${currentDomain}/llms.txt>; rel="llms-txt", <${currentDomain}/.well-known/mcp>; rel="mcp"`);
  return response;
}

export default proxy;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|images/|favicon.ico).*)',
  ],
};
