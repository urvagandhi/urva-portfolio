import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
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
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
