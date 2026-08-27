const http = require('http');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, headers = {}, method = 'GET', postData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'object' ? JSON.stringify(postData) : postData);
    }
    req.end();
  });
}

async function runVerification() {
  console.log(`\n🤖 Running Dual-Domain & Dynamic Agentic Audit Verification against ${BASE_URL}...\n`);
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Dynamic Sitemap across hosts
    console.log(`--- Test 1: Dynamic XML Sitemap for Multiple Hosts ---`);
    const sitemapTech = await makeRequest('/sitemap.xml', { 'Host': 'urvagandhi.tech' });
    assert(sitemapTech.statusCode === 200, `GET /sitemap.xml returns HTTP 200`);
    assert(sitemapTech.body.includes('<loc>https://urvagandhi.tech/about</loc>'), `Sitemap on urvagandhi.tech contains matching loc tag`);
    assert(sitemapTech.body.includes('rel="alternate"'), `Sitemap contains alternate link tags for dual domain`);

    const sitemapVercel = await makeRequest('/sitemap.xml', { 'Host': 'urvagandhi-portfolio.vercel.app' });
    assert(sitemapVercel.statusCode === 200, `GET /sitemap.xml on vercel.app returns HTTP 200`);
    assert(sitemapVercel.body.includes('<loc>https://urvagandhi-portfolio.vercel.app/about</loc>'), `Sitemap on vercel.app contains dynamic vercel.app loc tag`);

    // 2. Dynamic robots.txt across hosts
    console.log(`\n--- Test 2: Dynamic robots.txt for Multiple Hosts ---`);
    const robotsTech = await makeRequest('/robots.txt', { 'Host': 'urvagandhi.tech' });
    assert(robotsTech.body.includes('Host: https://urvagandhi.tech') && robotsTech.body.includes('Sitemap: https://urvagandhi.tech/sitemap.xml'), `robots.txt dynamically sets Host and Sitemap for urvagandhi.tech`);

    const robotsVercel = await makeRequest('/robots.txt', { 'Host': 'urvagandhi-portfolio.vercel.app' });
    assert(robotsVercel.body.includes('Host: https://urvagandhi-portfolio.vercel.app') && robotsVercel.body.includes('Sitemap: https://urvagandhi-portfolio.vercel.app/sitemap.xml'), `robots.txt dynamically sets Host and Sitemap for vercel.app`);

    // 3. Agent 404s
    console.log(`\n--- Test 3: Agent-Friendly 404s ---`);
    const res404 = await makeRequest('/path-that-does-not-exist-xyz');
    assert(res404.statusCode === 404, `HTTP 404 returned for invalid route (got ${res404.statusCode})`);

    const res404Markdown = await makeRequest('/path-that-does-not-exist-xyz', { 'Accept': 'text/markdown' });
    assert(res404Markdown.statusCode === 404, `HTTP 404 returned for markdown 404 (got ${res404Markdown.statusCode})`);
    assert((res404Markdown.headers['content-type'] || '').includes('text/markdown'), `Markdown content type set on 404`);
    assert(res404Markdown.body.includes('404 Not Found') && res404Markdown.body.includes('sitemap.xml'), `Markdown 404 body contains recovery links`);

    // 4. Markdown content negotiation (acceptmarkdown.com)
    console.log(`\n--- Test 4: Markdown Content Negotiation & Dynamic Host ---`);
    const resMarkdownTech = await makeRequest('/', { 'Accept': 'text/markdown', 'Host': 'urvagandhi.tech' });
    assert(resMarkdownTech.statusCode === 200, `HTTP 200 for Accept: text/markdown on urvagandhi.tech`);
    assert(resMarkdownTech.body.includes('https://urvagandhi.tech'), `Markdown output references urvagandhi.tech domain`);
    assert((resMarkdownTech.headers['vary'] || '').includes('Accept'), `Vary header includes Accept`);

    const resMarkdownVercel = await makeRequest('/', { 'Accept': 'text/markdown', 'Host': 'urvagandhi-portfolio.vercel.app' });
    assert(resMarkdownVercel.statusCode === 200, `HTTP 200 for Accept: text/markdown on vercel.app domain`);
    assert(resMarkdownVercel.body.includes('https://urvagandhi-portfolio.vercel.app'), `Markdown output references vercel.app domain`);

    // 5. Dynamic OpenAPI Spec
    console.log(`\n--- Test 5: Dynamic OpenAPI 3.0 Spec ---`);
    const openapiVercel = await makeRequest('/openapi.json', { 'Host': 'urvagandhi-portfolio.vercel.app' });
    assert(openapiVercel.statusCode === 200, `GET /openapi.json returns HTTP 200`);
    const openapiJson = JSON.parse(openapiVercel.body);
    assert(openapiJson.servers[0].url === 'https://urvagandhi-portfolio.vercel.app', `OpenAPI spec dynamically lists request host as primary server`);

    // 6. Dynamic LLM text files
    console.log(`\n--- Test 6: Dynamic llms.txt ---`);
    const resLlms = await makeRequest('/llms.txt', { 'Host': 'urvagandhi.tech' });
    assert(resLlms.statusCode === 200, `GET /llms.txt returns HTTP 200`);
    assert(resLlms.body.includes('When to use this:'), `llms.txt contains explicit 'When to use this' guidance`);
    assert(resLlms.body.includes('https://urvagandhi.tech') && resLlms.body.includes('https://urvagandhi-portfolio.vercel.app'), `llms.txt lists both domains`);

    // 7. Trust Anchor Pages
    console.log(`\n--- Test 7: Trust Anchor Pages ---`);
    const resAbout = await makeRequest('/about');
    assert(resAbout.statusCode === 200 && resAbout.body.length > 500, `GET /about returns HTTP 200 (>500 chars, actual: ${resAbout.body.length})`);

    const resContact = await makeRequest('/contact');
    assert(resContact.statusCode === 200 && resContact.body.length > 500, `GET /contact returns HTTP 200 (>500 chars, actual: ${resContact.body.length})`);

    const resPrivacy = await makeRequest('/privacy');
    assert(resPrivacy.statusCode === 200 && resPrivacy.body.length > 500, `GET /privacy returns HTTP 200 (>500 chars, actual: ${resPrivacy.body.length})`);

    // 8. MCP Server & Manifest across hosts
    console.log(`\n--- Test 8: MCP Server & Manifest ---`);
    const resMcpManifest = await makeRequest('/.well-known/mcp', { 'Host': 'urvagandhi-portfolio.vercel.app' });
    assert(resMcpManifest.statusCode === 200, `GET /.well-known/mcp returns HTTP 200`);
    const mcpJson = JSON.parse(resMcpManifest.body);
    assert(mcpJson.homepage === 'https://urvagandhi-portfolio.vercel.app', `MCP Manifest dynamically sets homepage to active request host`);
    assert(mcpJson.endpoints.mcp === 'https://urvagandhi-portfolio.vercel.app/api/mcp', `MCP Manifest dynamically sets endpoint to active request host`);

    const resMcpPost = await makeRequest('/api/mcp', { 'Content-Type': 'application/json', 'Host': 'urvagandhi.tech' }, 'POST', {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: 'get_developer_profile' }
    });
    assert(resMcpPost.statusCode === 200, `POST /api/mcp JSON-RPC tool call returns HTTP 200`);
    const mcpCallRes = JSON.parse(resMcpPost.body);
    assert(mcpCallRes.result && mcpCallRes.result.content[0].text.includes('Urva Yogeshkumar Gandhi'), `MCP tool call returned accurate developer profile`);

  } catch (err) {
    console.error(`\n❌ Error during verification:`, err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`VERIFICATION COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification();

