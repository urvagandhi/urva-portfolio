import AnimatedText from "@/components/shared/AnimatedText.js";
import Layout from "@/components/layout/Layout.js";
import TransitionEffect from "@/components/layout/TransitionEffect.js";
import Head from "next/head";
import Link from "next/link";
import SectionHeading from "@/components/shared/SectionHeading.js";
import { BorderBeam } from "@/vendor/magicui/border-beam";
import {
  FileCode,
  Cpu,
  FileText,
  Key,
  ExternalLink,
  Copy,
  Check,
  Server,
  Wrench,
  Play,
  ChevronDown,
  ChevronRight,
  Loader2,
  Zap,
  Terminal,
} from "lucide-react";
import { useState, useEffect } from "react";

const SwaggerEndpoint = ({
  method = "GET",
  path,
  title,
  description,
  defaultParamName = "username",
  defaultParamValue = "Urva_Gandhi",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [paramValue, setParamValue] = useState(defaultParamValue);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [responseStatus, setResponseStatus] = useState(null);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("https://urvagandhi.tech");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const fullUrl = `${origin}${path}?${defaultParamName}=${encodeURIComponent(paramValue)}`;

  const executeApi = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const url = `${path}?${defaultParamName}=${encodeURIComponent(paramValue)}`;
      const res = await fetch(url);
      const data = await res.json();
      setResponseStatus(res.status);
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setResponseStatus(500);
      setResponse(
        JSON.stringify(
          { error: "Failed to execute request", details: err.message },
          null,
          2,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isGet = method === "GET";

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-md ${
        isGet
          ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10"
          : "border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/10"
      }`}
    >
      {/* Swagger Accordion Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-dark/5 dark:hover:bg-light/5 transition-colors flex-nowrap sm:flex-wrap"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`px-3 py-1 rounded-md font-mono font-extrabold text-xs tracking-wider text-white shadow-sm flex-shrink-0 ${
              isGet
                ? "bg-emerald-600 dark:bg-emerald-500"
                : "bg-blue-600 dark:bg-blue-500"
            }`}
          >
            {method}
          </span>
          <code className="text-base font-bold font-mono text-dark dark:text-light truncate">
            {path}
          </code>
          <span className="text-xs text-dark/60 dark:text-light/60 hidden md:inline truncate">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            className="text-xs font-bold text-primary dark:text-primaryDark hover:underline flex items-center gap-1"
          >
            <span>{isOpen ? "Hide Swagger UI" : "Try it out"}</span>
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Swagger Body (Expanded) */}
      {isOpen && (
        <div className="p-6 border-t border-dark/10 dark:border-light/10 bg-light/90 dark:bg-dark/90 space-y-6 text-sm">
          <div className="text-dark/80 dark:text-light/80 leading-relaxed font-medium">
            {description}
          </div>

          {/* Parameters Table */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-dark/70 dark:text-light/70 mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-primary dark:text-primaryDark" />
              <span>Parameters</span>
            </h4>
            <div className="overflow-x-auto rounded-xl border border-dark/10 dark:border-light/10 bg-dark/5 dark:bg-light/5">
              {/* Desktop: full table incl. In/Type/Required columns.
                  Mobile/tablet (<=1023px, Tailwind max-width breakpoints): In/Type/Required are
                  removed from the table via `lg:hidden` (keeping only Name + Value so the "Value"
                  input is fully readable) and shown as a small info row BELOW the table instead.
                  Keep the <th>/<td> cells and the info row below in sync. */}
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-dark/10 dark:bg-light/10 text-dark/70 dark:text-light/70 uppercase">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3 lg:hidden">In</th>
                    <th className="p-3 lg:hidden">Type</th>
                    <th className="p-3 lg:hidden">Required</th>
                    <th className="p-3">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark/10 dark:divide-light/10">
                  <tr>
                    <td className="p-3 font-bold text-primary dark:text-primaryDark">
                      {defaultParamName}
                    </td>
                    <td className="p-3 text-dark/70 dark:text-light/70 lg:hidden">
                      query
                    </td>
                    <td className="p-3 text-dark/70 dark:text-light/70 lg:hidden">
                      string
                    </td>
                    <td className="p-3 lg:hidden">
                      <span className="text-red-500 font-bold">true</span>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={paramValue}
                        onChange={(e) => setParamValue(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-dark/20 dark:border-light/20 bg-light dark:bg-dark text-dark dark:text-light font-mono text-xs w-full max-w-xs focus:outline-none focus:border-primary"
                        placeholder="Enter username..."
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile/tablet only (<=1023px): In/Type/Required info shown below the table */}
            <div className="hidden lg:flex items-center flex-wrap gap-x-5 gap-y-1 mt-2.5 px-1">
              <span className="text-[11px] font-mono text-dark/70 dark:text-light/70">
                <span className="font-bold text-dark dark:text-light">In:</span>{" "}
                query
              </span>
              <span className="text-[11px] font-mono text-dark/70 dark:text-light/70">
                <span className="font-bold text-dark dark:text-light">
                  Type:
                </span>{" "}
                string
              </span>
              <span className="text-[11px] font-mono text-red-500">
                <span className="font-bold text-dark dark:text-light">
                  Required:
                </span>{" "}
                true
              </span>
            </div>
          </div>

          {/* Request URL Box */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-dark/70 dark:text-light/70 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-primary dark:text-primaryDark" />
              <span>Request URL</span>
            </div>
            <pre
              suppressHydrationWarning={true}
              className="p-3 bg-dark text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto border border-dark/20"
            >
              GET {fullUrl}
            </pre>
          </div>

          {/* Action Button: Execute */}
          <div className="flex items-center gap-3">
            <button
              onClick={executeApi}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              <span>Execute Request</span>
            </button>
            <Link
              href={`${path}?${defaultParamName}=${encodeURIComponent(paramValue)}`}
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-dark/10 dark:bg-light/10 hover:bg-dark/20 dark:hover:bg-light/20 text-dark dark:text-light font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <span>Open raw in tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Response Display Section */}
          {responseStatus && (
            <div className="space-y-3 pt-4 border-t border-dark/10 dark:border-light/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase text-dark/70 dark:text-light/70">
                    Server Response:
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-bold ${
                      responseStatus === 200
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-500/20 text-red-500"
                    }`}
                  >
                    {responseStatus} {responseStatus === 200 ? "OK" : "Error"}
                  </span>
                </div>
                {response && (
                  <button
                    onClick={copyResponse}
                    className="flex items-center gap-1 text-xs font-bold text-primary dark:text-primaryDark hover:underline"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {copied ? "Copied JSON!" : "Copy Response JSON"}
                    </span>
                  </button>
                )}
              </div>

              {response && (
                <pre className="p-4 rounded-xl bg-dark text-emerald-400 font-mono text-xs overflow-x-auto max-h-96 border border-dark/30 shadow-inner">
                  {response}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function DocsPage() {
  const [origin, setOrigin] = useState("https://urvagandhi.tech");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Urva Gandhi Developer Portal &amp; API Documentation</title>
        <meta
          name="description"
          content="Official developer documentation for Urva Gandhi's Portfolio APIs, OpenAPI specification, and Model Context Protocol (MCP) server integration."
        />
      </Head>
      <TransitionEffect />
      <main className="flex w-full flex-col items-center justify-center text-dark dark:text-light pt-24 pb-16">
        <Layout className="pt-16">
          <div className="w-full flex justify-center mb-12 sm:mb-8">
            <SectionHeading
              title="Developer Portal"
              subTitle="SWAGGER API EXPLORER"
              theme="blue"
            />
          </div>

          <AnimatedText
            text="Interactive Swagger API Docs"
            className="mb-8 lg:!text-5xl sm:!text-4xl xs:!text-2xl text-center max-w-4xl mx-auto"
          />

          <div className="max-w-4xl mx-auto w-full">
            <div className="text-lg text-dark/75 dark:text-light/75 text-center mb-12 max-w-2xl mx-auto leading-relaxed">
              Welcome to{" "}
              <strong>
                Urva Gandhi&apos;s Interactive Swagger API Explorer
              </strong>
              . Click any endpoint below to view schema parameters, execute live
              requests, and inspect real-time JSON responses directly in your
              browser.
            </div>

            {/* Top Quick-Access Cards */}
            <div className="grid grid-cols-4 lg:grid-cols-2 sm:grid-cols-1 gap-6 w-full mb-16">
              {/* Card 1: OpenAPI */}
              <Link
                href="/openapi.json"
                target="_blank"
                className="relative p-6 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl flex flex-col justify-between overflow-hidden cursor-pointer group hover:-translate-y-1 hover:border-primary/50 dark:hover:border-primaryDark/50 transition-all duration-300"
              >
                <BorderBeam
                  size={160}
                  duration={10}
                  delay={0}
                  colorFrom="#58E6D9"
                  colorTo="#8B5CF6"
                />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-primary/10 dark:bg-primaryDark/20 text-primary dark:text-primaryDark group-hover:scale-110 transition-transform">
                      <FileCode className="w-6 h-6" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-dark/40 dark:text-light/40 group-hover:text-primary dark:group-hover:text-primaryDark transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-dark dark:text-light group-hover:text-primary dark:group-hover:text-primaryDark transition-colors">
                    OpenAPI 3.0 Spec
                  </h3>
                  <div className="text-xs text-dark/70 dark:text-light/70 mb-4 leading-relaxed">
                    Standard OpenAPI specification describing all REST API
                    endpoints.
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary dark:text-primaryDark group-hover:underline">
                  <span>View openapi.json</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </Link>

              {/* Card 2: MCP Manifest */}
              <Link
                href="/.well-known/mcp"
                target="_blank"
                className="relative p-6 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl flex flex-col justify-between overflow-hidden cursor-pointer group hover:-translate-y-1 hover:border-primary/50 dark:hover:border-primaryDark/50 transition-all duration-300"
              >
                <BorderBeam
                  size={160}
                  duration={10}
                  delay={3}
                  colorFrom="#8B5CF6"
                  colorTo="#58E6D9"
                />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-primary/10 dark:bg-primaryDark/20 text-primary dark:text-primaryDark group-hover:scale-110 transition-transform">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-dark/40 dark:text-light/40 group-hover:text-primary dark:group-hover:text-primaryDark transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-dark dark:text-light group-hover:text-primary dark:group-hover:text-primaryDark transition-colors">
                    MCP Server
                  </h3>
                  <div className="text-xs text-dark/70 dark:text-light/70 mb-4 leading-relaxed">
                    First-party Model Context Protocol manifest &amp; tool
                    endpoints.
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary dark:text-primaryDark group-hover:underline">
                  <span>View /.well-known/mcp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </Link>

              {/* Card 3: LLM Index */}
              <Link
                href="/llms.txt"
                target="_blank"
                className="relative p-6 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl flex flex-col justify-between overflow-hidden cursor-pointer group hover:-translate-y-1 hover:border-primary/50 dark:hover:border-primaryDark/50 transition-all duration-300"
              >
                <BorderBeam
                  size={160}
                  duration={10}
                  delay={6}
                  colorFrom="#58E6D9"
                  colorTo="#8B5CF6"
                />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-primary/10 dark:bg-primaryDark/20 text-primary dark:text-primaryDark group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-dark/40 dark:text-light/40 group-hover:text-primary dark:group-hover:text-primaryDark transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-dark dark:text-light group-hover:text-primary dark:group-hover:text-primaryDark transition-colors">
                    LLM Agent Index
                  </h3>
                  <div className="text-xs text-dark/70 dark:text-light/70 mb-4 leading-relaxed">
                    llms.txt specification with explicit agent guidance.
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary dark:text-primaryDark group-hover:underline">
                  <span>View llms.txt</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </Link>

              {/* Card 4: API Auth */}
              <Link
                href="/auth"
                className="relative p-6 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl flex flex-col justify-between overflow-hidden cursor-pointer group hover:-translate-y-1 hover:border-primary/50 dark:hover:border-primaryDark/50 transition-all duration-300"
              >
                <BorderBeam
                  size={160}
                  duration={10}
                  delay={9}
                  colorFrom="#8B5CF6"
                  colorTo="#58E6D9"
                />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-primary/10 dark:bg-primaryDark/20 text-primary dark:text-primaryDark group-hover:scale-110 transition-transform">
                      <Key className="w-6 h-6" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-dark/40 dark:text-light/40 group-hover:text-primary dark:group-hover:text-primaryDark transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-dark dark:text-light group-hover:text-primary dark:group-hover:text-primaryDark transition-colors">
                    API Auth Docs
                  </h3>
                  <div className="text-xs text-dark/70 dark:text-light/70 mb-4 leading-relaxed">
                    Authentication models, rate limits, and CORS policies.
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary dark:text-primaryDark group-hover:underline">
                  <span>Open /auth Documentation</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>

            {/* Swagger REST API Endpoints Accordion */}
            <div className="w-full mb-16">
              <div className="flex items-center gap-3 mb-6 border-b border-dark/10 dark:border-light/10 pb-4">
                <Server className="w-7 h-7 text-primary dark:text-primaryDark" />
                <h2 className="text-3xl font-extrabold text-dark dark:text-light">
                  Public REST API Endpoints (Swagger UI)
                </h2>
              </div>

              <div className="space-y-4">
                {/* 1. LeetCode */}
                <SwaggerEndpoint
                  method="GET"
                  path="/api/leetcode"
                  title="LeetCode Statistics &amp; Problem Metrics"
                  description="Fetches verified LeetCode problem-solving metrics, contest rating (1637, Top 19.46%), total solved count, and difficulty breakdown for Urva Gandhi."
                  defaultParamName="username"
                  defaultParamValue="Urva_Gandhi"
                />

                {/* 2. Codeforces */}
                <SwaggerEndpoint
                  method="GET"
                  path="/api/codeforces"
                  title="Codeforces Contest Rating &amp; Metrics"
                  description="Fetches Codeforces contest rating, max rating, rank status, and submission metrics for Urva Gandhi."
                  defaultParamName="username"
                  defaultParamValue="Urva_Gandhi"
                />

                {/* 3. CodeChef */}
                <SwaggerEndpoint
                  method="GET"
                  path="/api/codechef"
                  title="CodeChef Contest Rating &amp; Star Rank"
                  description="Fetches CodeChef rating, star ranking, global rank, and contest participation statistics."
                  defaultParamName="username"
                  defaultParamValue="urva_gandhi"
                />
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 font-medium flex items-center gap-2">
                <span className="font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-[10px]">
                  Data Pipeline Note
                </span>
                <span>
                  Statistics for platforms like GeeksforGeeks and HackerRank are
                  extracted directly through web scraping.
                </span>
              </div>
            </div>

            {/* Model Context Protocol (MCP) Section */}
            <div className="w-full mb-16">
              <div className="flex items-center gap-3 mb-6 border-b border-dark/10 dark:border-light/10 pb-4">
                <Wrench className="w-7 h-7 text-primary dark:text-primaryDark" />
                <h2 className="text-3xl font-extrabold text-dark dark:text-light">
                  Model Context Protocol (MCP) Integration
                </h2>
              </div>

              <div className="p-8 sm:p-6 xs:p-4 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl">
                <div className="text-base text-dark/80 dark:text-light/80 mb-6 leading-relaxed">
                  Urva Gandhi&apos;s Portfolio features a native, first-party{" "}
                  <strong>Model Context Protocol (MCP)</strong> server
                  implementation supporting JSON-RPC 2.0 and Streamable HTTP.
                  This enables Claude, ChatGPT, and AI agents to invoke tools
                  natively.
                </div>

                <div className="grid grid-cols-2 md:grid-cols-1 gap-6 mb-6">
                  <Link
                    href="/.well-known/mcp"
                    target="_blank"
                    className="p-5 rounded-2xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10 hover:border-primary/40 transition-colors group block"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm text-dark dark:text-light group-hover:text-primary dark:group-hover:text-primaryDark">
                        MCP Manifest Endpoint
                      </h4>
                      <ExternalLink className="w-3.5 h-3.5 text-dark/40 dark:text-light/40 group-hover:text-primary dark:group-hover:text-primaryDark" />
                    </div>
                    <code
                      suppressHydrationWarning={true}
                      className="text-xs font-mono font-bold text-primary dark:text-primaryDark"
                    >
                      GET {origin}/.well-known/mcp
                    </code>
                  </Link>

                  <Link
                    href="/api/mcp"
                    target="_blank"
                    className="p-5 rounded-2xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10 hover:border-primary/40 transition-colors group block"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm text-dark dark:text-light group-hover:text-primary dark:group-hover:text-primaryDark">
                        MCP Tool Calling Endpoint
                      </h4>
                      <ExternalLink className="w-3.5 h-3.5 text-dark/40 dark:text-light/40 group-hover:text-primary dark:group-hover:text-primaryDark" />
                    </div>
                    <code
                      suppressHydrationWarning={true}
                      className="text-xs font-mono font-bold text-primary dark:text-primaryDark"
                    >
                      POST {origin}/api/mcp
                    </code>
                  </Link>
                </div>

                <h4 className="font-bold text-base mb-3 text-dark dark:text-light">
                  Exposed MCP Tools:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10">
                    <strong className="text-primary dark:text-primaryDark block mb-1">
                      1. get_developer_profile
                    </strong>
                    <span className="text-dark/75 dark:text-light/75 font-sans">
                      Returns Nirma University credentials, Spring Boot &amp; AI
                      tech stack, hackathons.
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10">
                    <strong className="text-primary dark:text-primaryDark block mb-1">
                      2. get_coding_stats
                    </strong>
                    <span className="text-dark/75 dark:text-light/75 font-sans">
                      Fetches verified statistics across LeetCode, Codeforces,
                      CodeChef, GFG, HackerRank.
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10">
                    <strong className="text-primary dark:text-primaryDark block mb-1">
                      3. get_projects
                    </strong>
                    <span className="text-dark/75 dark:text-light/75 font-sans">
                      Fetches CoinTrack, FleetFlow, Agent Paperpal, RWEsearch
                      metadata and code links.
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10">
                    <strong className="text-primary dark:text-primaryDark block mb-1">
                      4. get_contact_info
                    </strong>
                    <span className="text-dark/75 dark:text-light/75 font-sans">
                      Returns verified email channels, LinkedIn, GitHub, phone
                      numbers, and address.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </main>
    </>
  );
}
