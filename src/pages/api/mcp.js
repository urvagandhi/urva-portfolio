import mcpManifest from '../../../public/.well-known/mcp.json';

const PRIMARY_DOMAIN = 'https://urvagandhi.tech';
const LIFETIME_DOMAIN = 'https://urvagandhi-portfolio.vercel.app';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Mcp-Version');
  res.setHeader('Mcp-Version', '1.0');
  res.setHeader('Link', `<${activeDomain}/api/mcp>; rel="mcp-server"`);
  res.setHeader('Vary', 'Accept, Accept-Encoding, Host');

  const host = req.headers.host || 'urvagandhi.tech';
  const proto = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
  const activeDomain = `${proto}://${host}`;

  const dynamicManifest = {
    ...mcpManifest,
    homepage: activeDomain,
    primary_homepage: PRIMARY_DOMAIN,
    alternate_homepage: LIFETIME_DOMAIN,
    endpoints: {
      mcp: `${activeDomain}/api/mcp`,
      sse: `${activeDomain}/api/mcp`,
      primary_mcp: `${PRIMARY_DOMAIN}/api/mcp`,
      lifetime_mcp: `${LIFETIME_DOMAIN}/api/mcp`
    },
    servers: [
      { url: `${activeDomain}/api/mcp`, description: "Active Environment Server Endpoint" },
      { url: `${PRIMARY_DOMAIN}/api/mcp`, description: "Primary Custom Domain Endpoint" },
      { url: `${LIFETIME_DOMAIN}/api/mcp`, description: "Lifetime Vercel Mirror Endpoint" }
    ]
  };

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json(dynamicManifest);
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const { jsonrpc, id, method, params } = body;

    // Handle MCP JSON-RPC 2.0 requests
    if (jsonrpc === '2.0' || method) {
      if (method === 'initialize') {
        return res.status(200).json({
          jsonrpc: '2.0',
          id: id || 1,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: { listChanged: false }
            },
            serverInfo: {
              name: 'urva-gandhi-portfolio-mcp',
              version: '1.0.0'
            }
          }
        });
      }

      if (method === 'ping') {
        return res.status(200).json({
          jsonrpc: '2.0',
          id: id || 1,
          result: {}
        });
      }

      if (method === 'tools/list') {
        return res.status(200).json({
          jsonrpc: '2.0',
          id: id || 1,
          result: {
            tools: mcpManifest.tools
          }
        });
      }

      if (method === 'tools/call') {
        const name = params?.name;
        const args = params?.arguments || {};

        let toolResult = null;

        if (name === 'get_developer_profile') {
          toolResult = {
            name: "Urva Yogeshkumar Gandhi",
            title: "Software & AI Systems Engineer",
            domains: {
              active: activeDomain,
              primary: PRIMARY_DOMAIN,
              lifetime: LIFETIME_DOMAIN
            },
            university: "Institute of Technology, Nirma University",
            degree: "B.Tech Computer Science & Engineering (Minor: Adaptive AI)",
            cgpa: "8.83 / 10",
            primarySkills: [
              "Java", "Spring Boot", "Spring Security", "REST APIs", "ReactJS", "Next.js",
              "JavaScript", "TypeScript", "Python", "C++", "PostgreSQL", "MongoDB", "MySQL",
              "Docker", "Git", "Data Structures & Algorithms", "Full Stack Development",
              "Backend Development", "Software Engineering", "Machine Learning",
              "Artificial Intelligence", "NLP", "Microservices", "OOP", "JWT", "OAuth 2.0"
            ],
            hackathons: [
              "1st Place – Health AI Innovation Hackathon 2025 (140+ teams)",
              "Track Runner-Up – HACKaMINeD 2026 (400+ teams)",
              "2nd Runner-Up – Odoo x Gujarat Vidyapith Hackathon 2026"
            ],
            location: "Ahmedabad, Gujarat, India - 380051",
            emails: ["23bce078@nirmauni.ac.in", "urvagandhi24@gmail.com"],
            phone: "+91-8866241204",
            github: "https://github.com/urvagandhi",
            linkedin: "https://www.linkedin.com/in/urva-gandhi/"
          };
        } else if (name === 'get_coding_stats') {
          toolResult = {
            platform: args.platform || 'all',
            platforms: {
              leetcode: { username: "Urva_Gandhi", solved: "300+ DSA Problems", rating: 1637, topPercentile: "Top 19.46%", profile: "https://leetcode.com/u/Urva_Gandhi/" },
              codeforces: { username: "Urva_Gandhi", profile: "https://codeforces.com/profile/Urva_Gandhi" },
              codechef: { username: "urva_gandhi", profile: "https://www.codechef.com/users/urva_gandhi" },
              gfg: { username: "urvagandhi", profile: "https://geeksforgeeks.org/user/urvagandhi" },
              hackerrank: { username: "urvagandhi", profile: "https://hackerrank.com/urvagandhi" }
            }
          };
        } else if (name === 'get_projects') {
          toolResult = [
            {
              title: "CoinTrack – Multi-Broker Finance Platform",
              role: "Self Project (Team Size: 1)",
              techStack: ["Java", "Spring Boot", "Spring Security", "MongoDB", "Docker", "REST API", "JWT", "AES-256 Encryption", "Caffeine", "Bucket4j"],
              description: "Designed & shipped a multi-broker investment platform with 45+ REST endpoints using hexagonal architecture. Aggregated Zerodha, Angel One, Upstox into real-time P&L dashboard. TOTP 2FA, OAuth 2.0, AES encryption.",
              github: "https://github.com/urvagandhi/cointrack"
            },
            {
              title: "FleetFlow – Fleet & Logistics Management System",
              role: "Odoo Hackathon 2026 (2nd Runner-Up)",
              techStack: ["ReactJS", "TypeScript", "ExpressJS", "PostgreSQL", "Prisma ORM", "Socket.IO", "Docker", "REST API"],
              description: "Developed a full-stack logistics management system with 30+ APIs, RBAC, audit logging, and real-time updates via Socket.IO.",
              github: "https://github.com/urvagandhi/Odoo-Hackathon-26"
            },
            {
              title: "Agent Paperpal – Agentic AI Manuscript Formatter",
              role: "HACKaMINeD 2026 (Track Runner-Up)",
              techStack: ["Python", "CrewAI", "ReactJS", "Google Gemini", "Office.js", "AI Agents", "NLP"],
              description: "Multi-agent AI platform automating manuscript formatting & compliance checking (APA, IEEE, Springer, Vancouver, Chicago).",
              github: "https://github.com/urvagandhi/TBD"
            },
            {
              title: "RWEsearch – Healthcare Analytics Platform",
              role: "Health AI Innovation Hackathon 2025 (1st Place Winner)",
              techStack: ["Python", "Scikit-learn", "XGBoost", "TensorFlow", "Machine Learning", "Data Analytics", "Streamlit"],
              description: "Healthcare analytics platform predicting hospital readmissions using XGBoost & Deep Learning models with an interactive Streamlit UI.",
              github: "https://github.com/urvagandhi/RWEsearch-Hackathon"
            }
          ];
        } else if (name === 'get_contact_info') {
          toolResult = {
            domains: {
              active: activeDomain,
              primary: PRIMARY_DOMAIN,
              lifetime: LIFETIME_DOMAIN
            },
            emails: ["23bce078@nirmauni.ac.in", "urvagandhi24@gmail.com"],
            phoneNumbers: ["+91-8866241204", "+91-7203030498", "+91-9723839757"],
            github: "https://github.com/urvagandhi",
            linkedin: "https://www.linkedin.com/in/urva-gandhi/",
            website: activeDomain,
            location: "S-308, Venus Parkland, Near Vejalpur Police Chowki, Vejalpur, Ahmedabad, Gujarat, India - 380051"
          };
        } else {
          return res.status(200).json({
            jsonrpc: '2.0',
            id: id || 1,
            error: {
              code: -32601,
              message: `Unknown tool: ${name}`
            }
          });
        }

        return res.status(200).json({
          jsonrpc: '2.0',
          id: id || 1,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(toolResult, null, 2)
              }
            ]
          }
        });
      }
    }

    // Default fallback response for non-JSONRPC POST
    return res.status(200).json(dynamicManifest);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

