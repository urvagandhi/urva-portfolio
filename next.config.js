const os = require("os");
try {
  require("./scripts/setup-cache.js");
} catch (e) {}

const getLocalDevOrigins = () => {
  const origins = ["localhost", "127.0.0.1"];
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (!iface.internal && iface.family === "IPv4") {
          origins.push(iface.address);
        }
      }
    }
  } catch (e) {}
  return [...new Set(origins)];
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: getLocalDevOrigins(),

  // Target modern browsers to reduce polyfills and bundle size
  compiler: {
    // Enable styled-components hydration to prevent SSR mismatches
    styledComponents: true,
    // Remove console logs in production for cleaner output
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // Optimize images with modern formats
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security & Content Negotiation headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Vary", value: "Accept, Accept-Encoding, Host" },
          {
            key: "X-Robots-Tag",
            value: "index, follow, max-snippet:-1, max-image-preview:large",
          },
        ],
      },
    ];
  },

  // Rewrites for predictable machine resource paths
  async rewrites() {
    return [
      {
        source: "/v1/:path*",
        destination: "/api/:path*",
      },
      {
        source: "/api/v1/:path*",
        destination: "/api/:path*",
      },
      {
        source: "/api/openapi.json",
        destination: "/openapi.json",
      },
      {
        source: "/.well-known/mcp.json",
        destination: "/.well-known/mcp",
      },
      {
        source: "/mcp",
        destination: "/.well-known/mcp",
      },
      {
        source: "/api-docs",
        destination: "/docs",
      },
      {
        source: "/agent-instructions",
        destination: "/.well-known/agent-instructions",
      },
    ];
  },
};

module.exports = nextConfig;
