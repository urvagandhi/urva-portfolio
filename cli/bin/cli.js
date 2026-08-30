#!/usr/bin/env node
"use strict";

const https = require("https");

const PRIMARY_DOMAIN = "https://urvagandhi.tech";
const VERSION = "1.0.2";

let jsonOnly = false;

const STATS_ENDPOINTS = {
  leetcode: "leetcode",
  codeforces: "codeforces",
  codechef: "codechef",
  gfg: "gfg",
  hackerrank: "hackerrank",
};

const STATS_USERNAMES = {
  leetcode: "Urva_Gandhi",
  codeforces: "Urva_Gandhi",
  codechef: "urva_gandhi",
  gfg: "urva_gandhi",
  hackerrank: "urvagandhi24",
};

function request(url, { method = "GET", body } = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method,
        headers: {
          "User-Agent": `urvagandhi-cli/${VERSION}`,
          Accept: "application/json",
          ...(payload
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload),
              }
            : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let parsedData;
          try {
            parsedData = JSON.parse(data);
          } catch {
            parsedData = data;
          }
          resolve({ status: res.statusCode, data: parsedData });
        });
      },
    );
    req.on("error", (err) => reject(new Error(err.message)));
    if (payload) req.write(payload);
    req.end();
  });
}

async function mcpCall(method, params = {}) {
  const { status, data } = await request(`${PRIMARY_DOMAIN}/api/mcp`, {
    method: "POST",
    body: {
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    },
  });
  if (status !== 200 || !data || data.error) {
    const detail = data && data.error ? data.error.message : data;
    throw new Error(`MCP ${method} failed: ${detail}`);
  }
  return data.result;
}

async function callTool(name) {
  const result = await mcpCall("tools/call", { name, arguments: {} });
  return JSON.parse(result.content[0].text);
}

async function fetchStats(platform) {
  const buildUrl = (endpoint) =>
    `${PRIMARY_DOMAIN}/api/${endpoint}?username=${encodeURIComponent(
      STATS_USERNAMES[endpoint],
    )}`;

  if (platform === "all") {
    const entries = await Promise.all(
      Object.values(STATS_ENDPOINTS).map(async (endpoint) => {
        const { status, data } = await request(buildUrl(endpoint));
        return { [endpoint]: status === 200 ? data : { error: data } };
      }),
    );
    return Object.assign({}, ...entries);
  }
  const key = STATS_ENDPOINTS[platform];
  if (!key) {
    throw new Error(
      `Unknown platform '${platform}'. Use one of: all, ${Object.keys(
        STATS_ENDPOINTS,
      ).join(", ")}`,
    );
  }
  const { status, data } = await request(buildUrl(key));
  if (status !== 200) {
    throw new Error(`Failed to fetch ${key} stats: ${status}`);
  }
  return data;
}

function out(value) {
  if (jsonOnly && typeof value !== "string") {
    console.log(JSON.stringify(value));
    return;
  }
  console.log(
    typeof value === "string" ? value : JSON.stringify(value, null, 2),
  );
}

function help() {
  return `Urva Gandhi - Developer & AI Systems CLI v${VERSION}

Usage:
  urvagandhi <command> [args] [--json]

Commands:
  profile                 Developer profile, education & skills (via MCP)
  stats [platform]        Verified coding stats (all | leetcode | codeforces |
                          codechef | gfg | hackerrank)
  projects                Featured projects (via MCP)
  contact                 Contact channels & links (via MCP)
  mcp                     Show Model Context Protocol endpoints
  discover                Print machine-readable endpoint discovery manifest
  openapi                 Show the OpenAPI spec URL + API version
  version                 Print CLI version
  help                    Show this help

Flags:
  --json                  Emit machine-readable JSON only

Examples:
  urvagandhi stats leetcode --json
  urvagandhi contact
`;
}

async function main() {
  const args = process.argv.slice(2);
  jsonOnly = args.includes("--json");
  const command = args.find((a) => !a.startsWith("--")) || "help";
  const positionals = args.filter((a) => !a.startsWith("--"));

  switch (command) {
    case "version":
    case "-v":
    case "--version":
      out(VERSION);
      break;

    case "profile":
      out(await callTool("get_developer_profile"));
      break;

    case "stats": {
      const platform = positionals[1] || "leetcode";
      out(await fetchStats(platform));
      break;
    }

    case "projects":
      out(await callTool("get_projects"));
      break;

    case "contact":
      out(await callTool("get_contact_info"));
      break;

    case "mcp": {
      const manifest = await request(`${PRIMARY_DOMAIN}/.well-known/mcp`);
      out({
        endpoint: `${PRIMARY_DOMAIN}/api/mcp`,
        manifest: `${PRIMARY_DOMAIN}/.well-known/mcp`,
        tools: manifest.data.tools.map((t) => t.name),
        resources: (manifest.data.resources || []).map((r) => r.uri),
      });
      break;
    }

    case "discover": {
      const manifest = await request(`${PRIMARY_DOMAIN}/.well-known/mcp`);
      out(manifest.data);
      break;
    }

    case "openapi": {
      const spec = await request(`${PRIMARY_DOMAIN}/openapi.json`);
      out({
        url: `${PRIMARY_DOMAIN}/openapi.json`,
        openapi: spec.data.openapi,
        version: spec.data.info.version,
        paths: Object.keys(spec.data.paths).length,
        versioningPolicy: spec.data.info["x-versioning-policy"],
      });
      break;
    }

    default:
      out(help());
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
