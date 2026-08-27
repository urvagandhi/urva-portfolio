#!/usr/bin/env node

const https = require('https');

const PRIMARY_DOMAIN = 'https://urvagandhi.tech';

console.log(`
================================================================
  URVA YOGESH KUMAR GANDHI - DEVELOPER & AI SYSTEMS CLI
================================================================
  Degree:      B.Tech Computer Science & Engineering (Minor: Adaptive AI)
  University:  Institute of Technology, Nirma University (CGPA: 8.83/10)
  Primary:     Java, Spring Boot, Spring Security, Microservices, REST APIs
  Hackathons:  3x Winner (Health AI Hackathon '25, HACKaMINeD '26, Odoo '26)
  Location:    Ahmedabad, Gujarat, India - 380051
  Website:     ${PRIMARY_DOMAIN}
  GitHub:      https://github.com/urvagandhi
  LinkedIn:    https://www.linkedin.com/in/urva-gandhi/
================================================================
`);

const command = process.argv[2] || 'help';

if (command === 'stats') {
  console.log('Fetching coding statistics...');
  https.get(`${PRIMARY_DOMAIN}/api/leetcode?username=Urva_Gandhi`, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log('\nLeetCode Verified Stats:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Raw output:', data);
      }
    });
  }).on('error', (err) => {
    console.error('Error fetching stats:', err.message);
  });
} else if (command === 'mcp') {
  console.log(`MCP Server Endpoint: ${PRIMARY_DOMAIN}/api/mcp`);
  console.log(`MCP Manifest:        ${PRIMARY_DOMAIN}/.well-known/mcp`);
} else {
  console.log(`Usage:
  npx urva stats   - Display verified competitive coding metrics
  npx urva mcp     - Show Model Context Protocol server info
  npx urva help    - Show this help menu
`);
}
