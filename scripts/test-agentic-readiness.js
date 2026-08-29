const http = require("http");
const { spawn } = require("child_process");

function makeRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: parsedUrl.pathname + parsedUrl.search,
      method: "GET",
      headers: {
        "User-Agent": "AgenticReadinessAuditor/1.0",
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on("error", (err) => reject(err));
    req.end();
  });
}

async function runAudit(baseUrl) {
  console.log(
    `\n🔍 Running Agentic Readiness Verification against ${baseUrl}...\n`,
  );
  let passed = 0;
  let failed = 0;

  function assertTest(name, condition, details = "") {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${details}`);
      failed++;
    }
  }

  try {
    // 1. Agent-friendly 404 with Accept: text/markdown
    const res404Md = await makeRequest(
      `${baseUrl}/nonexistent-path-test-12345`,
      { Accept: "text/markdown" },
    );
    assertTest(
      "Agent-friendly 404 status code (must be 404)",
      res404Md.statusCode === 404,
      `(Got status ${res404Md.statusCode})`,
    );
    assertTest(
      "Agent-friendly 404 content type (text/markdown)",
      (res404Md.headers["content-type"] || "").includes("text/markdown"),
      `(Got content-type ${res404Md.headers["content-type"]})`,
    );
    assertTest(
      "Agent-friendly 404 markdown body contains sitemap/llms recovery links",
      res404Md.body.includes("llms.txt") &&
        res404Md.body.includes("sitemap.xml"),
      `(Body snippet: ${res404Md.body.slice(0, 100)})`,
    );

    // 2. Content Negotiation & Vary header compliance (acceptmarkdown.com)
    const resAboutMd = await makeRequest(`${baseUrl}/about`, {
      Accept: "text/markdown",
    });
    assertTest(
      "Markdown Content Negotiation served markdown for Accept: text/markdown",
      resAboutMd.statusCode === 200 &&
        (resAboutMd.headers["content-type"] || "").includes("text/markdown"),
      `(Status: ${resAboutMd.statusCode}, Content-Type: ${resAboutMd.headers["content-type"]})`,
    );
    const varyHeaderMd = resAboutMd.headers["vary"] || "";
    assertTest(
      "Vary header includes Accept for markdown responses",
      varyHeaderMd.toLowerCase().includes("accept"),
      `(Got Vary: "${varyHeaderMd}")`,
    );

    const resAboutHtml = await makeRequest(`${baseUrl}/about`, {
      Accept: "text/html",
    });
    const varyHeaderHtml = resAboutHtml.headers["vary"] || "";
    assertTest(
      "Vary header includes Accept for HTML responses",
      varyHeaderHtml.toLowerCase().includes("accept"),
      `(Got Vary: "${varyHeaderHtml}")`,
    );

    // 3. MCP Manifest & Handshake
    const resMcp = await makeRequest(`${baseUrl}/.well-known/mcp`);
    assertTest(
      "/.well-known/mcp returns 200 OK",
      resMcp.statusCode === 200,
      `(Got status ${resMcp.statusCode})`,
    );
    assertTest(
      "/.well-known/mcp has Mcp-Version header",
      resMcp.headers["mcp-version"] === "1.0" ||
        (resMcp.body && resMcp.body.includes("schema_version")),
      `(Got Mcp-Version: ${resMcp.headers["mcp-version"]})`,
    );

    // 4. Developer Resources Discoverability
    const resLlms = await makeRequest(`${baseUrl}/llms.txt`);
    assertTest(
      "/llms.txt exists with when-to-use section",
      resLlms.statusCode === 200 && resLlms.body.includes("When to use this"),
      `(Status: ${resLlms.statusCode})`,
    );

    const resDocs = await makeRequest(`${baseUrl}/docs`);
    assertTest(
      "/docs developer portal exists",
      resDocs.statusCode === 200 && resDocs.body.includes("Urva Gandhi"),
      `(Status: ${resDocs.statusCode})`,
    );

    const resOpenApi = await makeRequest(`${baseUrl}/openapi.json`);
    assertTest(
      "/openapi.json specification exists",
      resOpenApi.statusCode === 200 && resOpenApi.body.includes("openapi"),
      `(Status: ${resOpenApi.statusCode})`,
    );

    const resAgentInstructions = await makeRequest(
      `${baseUrl}/.well-known/agent-instructions`,
    );
    assertTest(
      "/.well-known/agent-instructions exists",
      resAgentInstructions.statusCode === 200 &&
        resAgentInstructions.body.includes("When to Use This"),
      `(Status: ${resAgentInstructions.statusCode})`,
    );

    // 5. Trust Anchor Pages
    const resContact = await makeRequest(`${baseUrl}/contact`);
    assertTest(
      "/contact trust anchor page has >500 chars content",
      resContact.statusCode === 200 && resContact.body.length > 500,
      `(Status: ${resContact.statusCode}, Body Length: ${resContact.body.length})`,
    );

    const resPrivacy = await makeRequest(`${baseUrl}/privacy`);
    assertTest(
      "/privacy trust anchor page has >500 chars content",
      resPrivacy.statusCode === 200 && resPrivacy.body.length > 500,
      `(Status: ${resPrivacy.statusCode}, Body Length: ${resPrivacy.body.length})`,
    );

    console.log(`\n-----------------------------------`);
    console.log(`Audit Summary: ${passed} PASSED, ${failed} FAILED`);
    console.log(`-----------------------------------\n`);
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Audit Error:", err);
    process.exit(1);
  }
}

const targetUrl = process.argv[2] || "http://localhost:3000";
runAudit(targetUrl);
