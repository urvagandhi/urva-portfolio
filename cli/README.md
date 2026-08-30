# urvagandhi

Official CLI for **Urva Gandhi** — developer portfolio, verified coding statistics, projects, contact channels, and Model Context Protocol (MCP) endpoints.

Query live, verified developer data of Urva Gandhi from your terminal or pipe it as JSON into your own tools.

## Install

```bash
# global install
npm install -g urvagandhi

# or run ad-hoc without installing
npx urvagandhi help
```

The package exposes three equivalent commands: `urva`, `urvagandhi`, and `urvagandhi-cli`.

## Quick Start

```bash
urva profile          # Developer profile, education & skills (via MCP)
urva stats all        # Aggregated verified coding stats across all platforms
urva stats leetcode   # Single-platform verified stats
urva projects         # Featured projects
urva contact          # Contact channels & links
```

## Commands

| Command            | Description                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------- |
| `profile`          | Developer profile, education & skills (via MCP)                                          |
| `stats [platform]` | Verified coding stats (`all`, `leetcode`, `codeforces`, `codechef`, `gfg`, `hackerrank`) |
| `projects`         | Featured projects (via MCP)                                                              |
| `contact`          | Contact channels & links (via MCP)                                                       |
| `mcp`              | Show Model Context Protocol endpoints & tools                                            |
| `discover`         | Print the machine-readable endpoint discovery manifest                                   |
| `openapi`          | Show the OpenAPI spec URL + API version                                                  |
| `version`          | Print CLI version                                                                        |
| `help`             | Show this help                                                                           |

## Machine-Readable Output

Pass `--json` to any command to emit pure JSON (no banners), ideal for piping into other tools:

```bash
urva stats all --json
urva profile --json
```

## API & MCP Endpoints (under the hood)

- **Public REST APIs:** `/api/leetcode`, `/api/codeforces`, `/api/codechef`, `/api/gfg`, `/api/hackerrank` — free, no API key required.
- **MCP Server:** JSON-RPC 2.0 over HTTP at `/api/mcp` (tools: `get_developer_profile`, `get_coding_stats`, `get_projects`, `get_contact_info`).
- **OpenAPI 3.0 Specification:** `/openapi.json`
- **llms.txt Agent Index:** `/llms.txt`

All — including an OpenAPI spec, rate-limit headers, and versioned paths (`/v1/*`) — are served from <https://urvagandhi.tech>.

## Troubleshooting

If a stats endpoint returns an error, the upstream platform may be temporarily unavailable. Retry in a moment, or check the official OpenAPI spec with `urva openapi`.

## License

MIT
