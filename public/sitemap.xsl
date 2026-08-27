<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>XML Sitemap | Urva Gandhi Portfolio</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          :root {
            --bg-color: #0d1117;
            --card-bg: #161b22;
            --text-color: #f0f6fc;
            --text-muted: #8b949e;
            --primary: #58E6D9;
            --border-color: #30363d;
            --hover-bg: #21262d;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
          }
          .container {
            max-width: 960px;
            width: 100%;
          }
          .header {
            margin-bottom: 30px;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 20px;
          }
          h1 {
            font-size: 28px;
            font-weight: 800;
            color: var(--primary);
            margin: 0 0 10px 0;
          }
          p {
            color: var(--text-muted);
            font-size: 15px;
            margin: 0;
            line-height: 1.5;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background-color: var(--card-bg);
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid var(--border-color);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          }
          th, td {
            padding: 16px 20px;
            text-align: left;
          }
          th {
            background-color: #161b22;
            color: var(--text-muted);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid var(--border-color);
          }
          tr:not(:last-child) td {
            border-bottom: 1px solid var(--border-color);
          }
          tr:hover td {
            background-color: var(--hover-bg);
          }
          a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
            word-break: break-all;
          }
          a:hover {
            text-decoration: underline;
          }
          .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
            background: rgba(88, 230, 217, 0.15);
            color: var(--primary);
            border: 1px solid rgba(88, 230, 217, 0.3);
          }
          .date {
            font-family: monospace;
            font-size: 13px;
            color: var(--text-muted);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Urva Gandhi Portfolio XML Sitemap</h1>
            <p>This is a machine-readable XML sitemap formatted with an XSLT 1.0 stylesheet. It lists indexable pages and machine resources on <strong>urvagandhi.tech</strong> and <strong>urvagandhi-portfolio.vercel.app</strong>.</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>URL Target</th>
                <th>Priority</th>
                <th>Change Frequency</th>
                <th>Last Modified</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <a href="{sitemap:loc}" target="_blank">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td>
                    <span class="badge"><xsl:value-of select="sitemap:priority"/></span>
                  </td>
                  <td>
                    <span class="badge"><xsl:value-of select="sitemap:changefreq"/></span>
                  </td>
                  <td class="date">
                    <xsl:value-of select="sitemap:lastmod"/>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
