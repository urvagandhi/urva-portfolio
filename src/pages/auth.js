import AnimatedText from "@/components/shared/AnimatedText.js";
import Layout from "@/components/layout/Layout.js";
import TransitionEffect from "@/components/layout/TransitionEffect.js";
import Head from "next/head";
import Link from "next/link";
import SectionHeading from "@/components/shared/SectionHeading.js";
import { BorderBeam } from "@/vendor/magicui/border-beam";
import {
  ShieldCheck,
  Gauge,
  Globe,
  Lock,
  ArrowLeft,
  ExternalLink,
  FileCode,
  Cpu,
  FileText,
  Key,
  CheckCircle2,
} from "lucide-react";

export default function AuthDocsPage() {
  return (
    <>
      <Head>
        <title>Urva Gandhi API Auth &amp; Usage Documentation</title>
        <meta
          name="description"
          content="Authentication requirements, rate limits, CORS policies, and access guidelines for Urva Gandhi's Portfolio APIs and MCP server."
        />
      </Head>
      <TransitionEffect />
      <main className="flex w-full flex-col items-center justify-center text-dark dark:text-light pt-24 pb-16">
        <Layout className="pt-16">
          <div className="w-full flex justify-center mb-12 sm:mb-8">
            <SectionHeading
              title="API Security"
              subTitle="POLICIES &amp; LIMITS"
              theme="emerald"
            />
          </div>

          <AnimatedText
            text="API Security &amp; Auth Guidelines"
            className="mb-8 lg:!text-5xl sm:!text-4xl xs:!text-2xl text-center max-w-4xl mx-auto"
          />

          <div className="text-lg text-dark/75 dark:text-light/75 text-center mb-12 max-w-2xl mx-auto leading-relaxed">
            Complete authentication guidelines, rate limits, CORS policies, and
            security models for integrating with{" "}
            <strong>Urva Gandhi&apos;s API infrastructure</strong>.
          </div>

          <div className="space-y-8 w-full mb-16">
            {/* Card 1: Authentication Model */}
            <div className="relative p-8 sm:p-6 xs:p-4 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl overflow-hidden">
              <BorderBeam
                size={200}
                duration={12}
                delay={0}
                colorFrom="#58E6D9"
                colorTo="#8B5CF6"
              />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-dark dark:text-light">
                    1. Authentication Model
                  </h2>
                  <div className="text-xs text-dark/60 dark:text-light/60">
                    Open-access architecture for developers &amp; AI agents
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-dark/80 dark:text-light/80 leading-relaxed font-medium">
                <div>
                  All public REST endpoints (
                  <code className="font-mono bg-dark/10 dark:bg-light/10 px-2 py-1 rounded text-xs font-bold text-primary dark:text-primaryDark">
                    /api/leetcode
                  </code>
                  ,{" "}
                  <code className="font-mono bg-dark/10 dark:bg-light/10 px-2 py-1 rounded text-xs font-bold text-primary dark:text-primaryDark">
                    /api/codeforces
                  </code>
                  ,{" "}
                  <code className="font-mono bg-dark/10 dark:bg-light/10 px-2 py-1 rounded text-xs font-bold text-primary dark:text-primaryDark">
                    /api/codechef
                  </code>
                  ) and the MCP Server (
                  <code className="font-mono bg-dark/10 dark:bg-light/10 px-2 py-1 rounded text-xs font-bold text-primary dark:text-primaryDark">
                    /api/mcp
                  </code>
                  ) are open-access.
                </div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>
                    No API key or Bearer token is required for standard requests
                    or AI agent tool invocations.
                  </span>
                </div>
                <div className="flex items-center gap-2 text-dark/70 dark:text-light/70">
                  <Key className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Self-serve a free scoped key anytime at{" "}
                    <a
                      href="/api/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-primary dark:text-primaryDark"
                    >
                      /api/keys
                    </a>{" "}
                    (no signup, no sales contact).
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Rate Limiting */}
            <div className="relative p-8 sm:p-6 xs:p-4 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl overflow-hidden">
              <BorderBeam
                size={200}
                duration={12}
                delay={4}
                colorFrom="#8B5CF6"
                colorTo="#58E6D9"
              />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <Gauge className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-dark dark:text-light">
                    2. Rate Limiting &amp; Caching
                  </h2>
                  <div className="text-xs text-dark/60 dark:text-light/60">
                    Fair use quotas and server-side cache policy
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-dark/80 dark:text-light/80 font-medium">
                <div>
                  To preserve server availability and protect upstream APIs,
                  public endpoints enforce the following quotas:
                </div>
                <div className="grid grid-cols-3 xs:grid-cols-1 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10">
                    <div className="text-xs font-bold text-dark/60 dark:text-light/60 mb-1">
                      Standard IP Limit
                    </div>
                    <div className="text-lg font-bold text-dark dark:text-light">
                      100 req / min
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10">
                    <div className="text-xs font-bold text-dark/60 dark:text-light/60 mb-1">
                      MCP Tool Limit
                    </div>
                    <div className="text-lg font-bold text-dark dark:text-light">
                      60 calls / min
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10">
                    <div className="text-xs font-bold text-dark/60 dark:text-light/60 mb-1">
                      Response Cache
                    </div>
                    <div className="text-lg font-bold text-dark dark:text-light">
                      3600 sec TTL
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: CORS & Security Headers */}
            <div className="relative p-8 sm:p-6 xs:p-4 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl overflow-hidden">
              <BorderBeam
                size={200}
                duration={12}
                delay={8}
                colorFrom="#58E6D9"
                colorTo="#8B5CF6"
              />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-dark dark:text-light">
                    3. CORS &amp; Security Headers
                  </h2>
                  <div className="text-xs text-dark/60 dark:text-light/60">
                    Cross-origin resource sharing &amp; content negotiation
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-dark/80 dark:text-light/80 font-medium">
                <div>
                  All API responses include standard CORS headers allowing safe
                  cross-domain web &amp; agent queries:
                </div>
                <pre className="p-4 bg-dark text-emerald-400 rounded-2xl font-mono text-xs overflow-x-auto border border-dark/30 shadow-inner">
                  {`Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Accept
Vary: Accept, Accept-Encoding, Host`}
                </pre>
              </div>
            </div>

            {/* Card 4: Quick Navigation */}
            <div className="p-6 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/docs"
                className="px-5 py-2.5 rounded-xl bg-dark text-light dark:bg-light dark:text-dark font-bold text-xs flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Developer Portal</span>
              </Link>

              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href="/openapi.json"
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl bg-dark/10 dark:bg-light/10 text-dark dark:text-light font-bold text-xs flex items-center gap-1.5 hover:bg-primary hover:text-light dark:hover:bg-primaryDark dark:hover:text-dark transition-colors"
                >
                  <FileCode className="w-4 h-4" />
                  <span>OpenAPI Spec</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <Link
                  href="/.well-known/mcp"
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl bg-dark/10 dark:bg-light/10 text-dark dark:text-light font-bold text-xs flex items-center gap-1.5 hover:bg-primary hover:text-light dark:hover:bg-primaryDark dark:hover:text-dark transition-colors"
                >
                  <Cpu className="w-4 h-4" />
                  <span>MCP Manifest</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </Layout>
      </main>
    </>
  );
}
