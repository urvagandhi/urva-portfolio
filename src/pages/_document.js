import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" data-scroll-behavior="smooth">
      <Head>
        <meta charSet="utf-8" />

        {/* Google Fonts preconnect for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Theme color for browser chrome */}
        <meta
          name="theme-color"
          content="#ffffff"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#1b1b1b"
          media="(prefers-color-scheme: dark)"
        />

        {/* Brand Discoverability & Meta Tags */}
        <meta name="application-name" content="Urva Gandhi Portfolio" />
        <meta name="apple-mobile-web-app-title" content="Urva Gandhi Portfolio" />
        <meta name="author" content="Urva Yogeshkumar Gandhi" />
        <meta name="keywords" content="Urva Gandhi, Urva Gandhi Portfolio, Urva Yogeshkumar Gandhi, Nirma University, Java Spring Boot, AI Engineer, Full Stack Engineer, urvagandhi.tech, urvagandhi-portfolio.vercel.app" />
        
        {/* Machine Resource Links for AI Agents */}
        <link rel="llms-txt" type="text/plain" href="/llms.txt" />
        <link rel="mcp-server" type="application/json" href="/.well-known/mcp" />
        <link rel="openapi" type="application/json" href="/openapi.json" />
        <link rel="agent-instructions" type="text/markdown" href="/.well-known/agent-instructions" />

        {/* OpenGraph & Twitter default metadata */}
        <meta property="og:site_name" content="Urva Gandhi Portfolio" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@urvagandhi" />

        {/* Schema.org JSON-LD Structured Data for Brand Discoverability */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Person",
                  "@id": "https://urvagandhi.tech/#person",
                  "name": "Urva Gandhi",
                  "alternateName": [
                    "Urva Yogeshkumar Gandhi", 
                    "Urva Gandhi Portfolio", 
                    "Urva Gandhi Nirma University",
                    "Urva Gandhi Developer"
                  ],
                  "url": "https://urvagandhi.tech",
                  "image": "https://urvagandhi.tech/images/profile/urva.png",
                  "telephone": "+91-8866241204",
                  "email": "23bce078@nirmauni.ac.in",
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "S-308, Venus Parkland, Near Vejalpur Police Chowki, Vejalpur",
                    "addressLocality": "Ahmedabad",
                    "addressRegion": "Gujarat",
                    "postalCode": "380051",
                    "addressCountry": "IN"
                  },
                  "alumniOf": {
                    "@type": "EducationalOrganization",
                    "name": "Institute of Technology, Nirma University",
                    "url": "https://www.nirmauni.ac.in/"
                  },
                  "worksFor": {
                    "@type": "Organization",
                    "name": "Kautilyam",
                    "jobTitle": "Backend Developer Intern"
                  },
                  "jobTitle": "Software & AI Systems Engineer",
                  "sameAs": [
                    "https://urvagandhi-portfolio.vercel.app",
                    "https://github.com/urvagandhi",
                    "https://www.linkedin.com/in/urva-gandhi/",
                    "https://leetcode.com/u/Urva_Gandhi/",
                    "https://codeforces.com/profile/Urva_Gandhi",
                    "https://www.codechef.com/users/urva_gandhi"
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://urvagandhi.tech/#website",
                  "url": "https://urvagandhi.tech",
                  "name": "Urva Gandhi Portfolio",
                  "alternateName": [
                    "Urva Gandhi Developer Portfolio", 
                    "Urva Gandhi Personal Website",
                    "Urva Gandhi Tech Portfolio"
                  ],
                  "publisher": {
                    "@id": "https://urvagandhi.tech/#person"
                  }
                },
                {
                  "@type": "ProfilePage",
                  "@id": "https://urvagandhi.tech/#profilepage",
                  "url": "https://urvagandhi.tech",
                  "name": "Urva Gandhi Official Portfolio & Developer Profile",
                  "mainEntity": {
                    "@id": "https://urvagandhi.tech/#person"
                  }
                }
              ]
            })
          }}
        />
      </Head>
      <body>
        {/* Always-in-DOM semantic content for agent text extraction.
            Uses position:absolute + clip-rect to be invisible to sighted users
            but fully parseable by any HTTP agent doing text extraction on the HTML.
            Unlike <noscript>, this is ALWAYS in the DOM regardless of JS state. */}
        <article
          id="agent-readable-content"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            borderWidth: 0,
          }}
          aria-hidden="true"
        >
          <h1>Urva Yogeshkumar Gandhi — Backend &amp; AI Systems Engineer</h1>
          <p>
            Official developer portfolio, API platform, and MCP server for Urva Yogeshkumar Gandhi.
            Final-year Computer Science &amp; Engineering undergraduate at Nirma University (Minor: Adaptive AI, CGPA: 8.83/10).
            Production-level Java backend developer and 3x Hackathon Winner specializing in Spring Boot, Microservices, Hexagonal Architecture, and Multi-Agent AI systems.
          </p>
          <h2>What This Site Is</h2>
          <p>The official personal portfolio, developer documentation portal, public REST API, and Model Context Protocol (MCP) server for Urva Yogeshkumar Gandhi.</p>
          <h2>Who This Site Is For</h2>
          <p>Technical recruiters, engineering managers, hiring teams, CTOs, software developers, and autonomous AI agents seeking backend software engineers, Spring Boot developers, and AI systems consultants.</p>
          <h2>Contact Information</h2>
          <p>Academic Email: 23bce078@nirmauni.ac.in | Personal Email: urvagandhi24@gmail.com | Phone: +91-8866241204 / +91-7203030498 | GitHub: https://github.com/urvagandhi | LinkedIn: https://www.linkedin.com/in/urva-gandhi/ | Address: S-308, Venus Parkland, Near Vejalpur Police Chowki, Vejalpur, Ahmedabad, Gujarat, India — 380051</p>
          <h2>Pricing &amp; Availability</h2>
          <p>Public REST API &amp; MCP Server: Free ($0) open access (Rate limit: 100 requests/min). Hiring Availability: Open for Full-Time Backend/Software Engineering roles, Spring Boot contracts, AI Systems consulting, and internships. Direct recruitment with zero platform fees.</p>
          <h2>Featured Projects</h2>
          <p>1. CoinTrack — Multi-Broker Finance Platform: Java, Spring Boot, Spring Security, MongoDB, Docker, 45+ REST endpoints, Hexagonal Architecture, TOTP 2FA, OAuth 2.0, AES-256 encryption. Repository: https://github.com/urvagandhi/cointrack</p>
          <p>2. FleetFlow — Fleet &amp; Logistics Management System (Odoo Hackathon 2026, 2nd Runner-Up): ReactJS, TypeScript, ExpressJS, PostgreSQL, Prisma ORM, Socket.IO, Docker, 30+ APIs. Repository: https://github.com/urvagandhi/Odoo-Hackathon-26</p>
          <p>3. Agent Paperpal — Agentic AI Manuscript Formatter (HACKaMINeD 2026, Track Runner-Up): Python, CrewAI, ReactJS, Google Gemini, Office.js, multi-agent AI formatting.</p>
          <p>4. RWEsearch — Healthcare Analytics Platform (Health AI Hackathon 2025, 1st Place Winner): Python, Scikit-learn, XGBoost, TensorFlow, Streamlit. Repository: https://github.com/urvagandhi/RWEsearch-Hackathon</p>
          <h2>Hackathon Awards</h2>
          <p>1st Place Winner: Health AI Innovation Hackathon 2025 (140+ teams). Track Runner-Up: HACKaMINeD 2026 (400+ teams). 2nd Runner-Up: Odoo x Gujarat Vidyapith National Hackathon 2026.</p>
          <h2>Education</h2>
          <p>B.Tech Computer Science &amp; Engineering (Minor: Adaptive AI), Institute of Technology, Nirma University, CGPA: 8.83/10. Department of CSE: https://cse.nirmauni.ac.in | Institute: https://technology.nirmauni.ac.in</p>
          <h2>Technical Skills</h2>
          <p>Java, Spring Boot, Spring Security, REST APIs, Microservices, Hexagonal Architecture, PostgreSQL, MongoDB, MySQL, Docker, JWT, OAuth 2.0, ReactJS, Next.js, TypeScript, Socket.IO, Prisma ORM, Python, CrewAI, Scikit-learn, XGBoost, TensorFlow, Google Gemini API. Competitive Programming: 300+ LeetCode problems (Rating: 1637, Top 19.46%).</p>
          <h2>Experience</h2>
          <p>Backend Developer Intern — Kautilyam (04 May 2026 – 27 Jun 2026): Spring Boot, Java, ReactJS backend services and MongoDB integrations.</p>
          <h2>Navigation &amp; Agent Resources</h2>
          <p>LLM Index: /llms.txt | Full Context: /llms-full.txt | OpenAPI: /openapi.json | MCP: /.well-known/mcp | Sitemap: /sitemap.xml | Docs: /docs | About: /about | Contact: /contact | Privacy: /privacy</p>
          <h2>Key Differentiation</h2>
          <p>Nirma University CSE (Minor in Adaptive AI), CGPA 8.83/10. 3x Hackathon Winner across 700+ competing teams. Hexagonal Architecture, Spring Boot Microservices, JWT/OAuth 2.0, Multi-Agent Systems. 300+ LeetCode (Top 19.46%).</p>
        </article>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
