import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BorderBeam } from "@/components/magicui/border-beam";
import { GithubIcon } from "@/components/Icons";
import { X } from "lucide-react";

const FramerImage = motion.create(Image);

const PROJECTS = [
  {
    id: "cointrack",
    title: "CoinTrack",
    subtitle: "Enterprise Multi-Broker & Alternative Asset Investment Platform",
    type: "Flagship Production Platform",
    category: "Full-Stack & Web",
    badge: "⭐ Flagship Project | Live",
    stats: [
      { label: "Broker Sync", val: "Zerodha / Angel / Upstox" },
      { label: "Architecture", val: "45+ REST APIs / 8 Modules" },
      { label: "Security Stack", val: "Google OAuth 2.0 & TOTP 2FA" }
    ],
    summary: "Production-level investment aggregation platform integrating Zerodha, Angel One, and Upstox broker accounts with complete alternative asset management (Mutual Funds, SIP, Lumpsum, Redemptions, Gold/Silver, Fixed Deposits with Premature Withdrawals, PPF, EPF) into a single real-time P&L analytics dashboard.",
    description: "Architected using Hexagonal Architecture & Clean Microservices principles with Spring Boot 3 & Java 21. Features 45+ REST endpoints across 8 modular domain engines, 15-minute background sync, market-holiday web scraping for accurate live NAV calculations, Google OAuth 2.0 SSO, mandatory TOTP 2FA, AES-256-GCM encryption, JWT refresh-token rotation, Caffeine-based token blacklisting, and Bucket4j rate limiting.",
    tech: [
      "Spring Boot 3 (Java 21)",
      "Zerodha / Angel / Upstox APIs",
      "Mutual Funds (SIP & Lumpsum)",
      "FD (Premature Withdrawal)",
      "PPF & EPF Engine",
      "Gold & Silver Live NAV",
      "MongoDB",
      "Hexagonal Architecture",
      "Next.js 14",
      "Google OAuth 2.0 & TOTP 2FA",
      "AES-256-GCM",
      "Caffeine & Bucket4j",
      "Docker"
    ],
    img: "/images/projects/coinTrack.png",
    link: "https://cointrack-finance.vercel.app/",
    github: "https://github.com/urvagandhi/cointrack",
    featured: true,
    gradient: "from-emerald-500/20 via-cyan-500/10 to-transparent"
  },
  {
    id: "agent-paperpal",
    title: "Agent Paperpal",
    subtitle: "Agentic AI Manuscript Formatter",
    type: "AI & Multi-Agent Workflow",
    category: "AI / ML & Security",
    badge: "🥈 Track Runner-Up",
    stats: [
      { label: "Hackathon", val: "HACKaMINeD '26" },
      { label: "Multi-Agent", val: "CrewAI & Gemini 2.5" },
      { label: "Integration", val: "Word Add-in & Web" }
    ],
    summary: "Built an agentic AI manuscript formatting platform using CrewAI, React 19, Python, and Microsoft Office.js automating compliance checks across APA, IEEE, and Springer standards.",
    description: "Developed a 4-agent AI workflow with a 7-dimensional compliance scoring system to streamline academic manuscript submission readiness for researchers.",
    tech: ["CrewAI", "Google Gemini 2.5", "React 19", "Python", "Office.js"],
    img: "/images/projects/agentPaperpal.png",
    link: "https://paper-pal-gules.vercel.app/",
    github: "https://github.com/urvagandhi/Agent-Paperpal",
    featured: false,
    gradient: "from-purple-500/20 via-blue-500/10 to-transparent"
  },
  {
    id: "fleetflow",
    title: "FleetFlow",
    subtitle: "Fleet & Logistics Management System",
    type: "Full-Stack & Logistics",
    category: "Full-Stack & Web",
    badge: "🥉 2nd Runner-Up",
    stats: [
      { label: "Hackathon", val: "Odoo x GV '26" },
      { label: "Architecture", val: "TypeScript & Prisma" },
      { label: "Real-Time", val: "Socket.IO & Audit Logs" }
    ],
    summary: "Full-stack fleet management platform with 9 modules, 30+ APIs, 4-role RBAC, immutable audit logs, real-time Socket.IO updates, and Docker Compose deployment.",
    description: "Engineered scalable backend services with Express.js, TypeScript, PostgreSQL, and Prisma ORM alongside a dynamic React 19 operational dashboard.",
    tech: ["TypeScript", "Express.js", "React 19", "PostgreSQL", "Prisma", "Socket.IO", "Docker"],
    img: "/images/projects/fleetFlow.png",
    link: "https://github.com/urvagandhi/Odoo-Hackathon-26",
    github: "https://github.com/urvagandhi/Odoo-Hackathon-26",
    featured: false,
    gradient: "from-cyan-500/20 via-teal-500/10 to-transparent"
  },
  {
    id: "rwesearch",
    title: "RWEsearch",
    subtitle: "Healthcare Readmission Analytics Engine",
    type: "Full-Stack & ML",
    category: "AI / ML & Security",
    badge: "🏆 1st Place Winner",
    stats: [
      { label: "Hackathon", val: "1st / 500+ Teams" },
      { label: "Models", val: "XGBoost & Scikit" },
      { label: "Deployment", val: "Docker Container" }
    ],
    summary: "Built a high-performance clinical analytics platform predicting hospital readmissions (30/60/90 days) with Smart Model Loader for instant evaluation.",
    description: "Award-winning solution featuring interactive clinical risk visualization dashboards and automated ML model execution.",
    tech: ["Python", "Streamlit", "Scikit-learn", "XGBoost", "Docker"],
    img: "/images/projects/RWEsearch.png",
    link: "https://github.com/urvagandhi/RWEsearch-Hackathon",
    github: "https://github.com/urvagandhi/RWEsearch-Hackathon",
    featured: true,
    gradient: "from-amber-500/20 via-purple-500/10 to-transparent"
  },
  {
    id: "adobe-pdf",
    title: "Connecting the Dots",
    subtitle: "Adobe PDF Intelligence Engine",
    type: "AI & Document Intelligence",
    category: "AI / ML & Security",
    badge: "Adobe Hackathon",
    stats: [
      { label: "Processing", val: "100% Offline" },
      { label: "Parser", val: "PyMuPDF NLP" },
      { label: "Feature", val: "Persona Adapt" }
    ],
    summary: "Offline PDF analysis engine featuring hierarchical outline extraction and persona-driven document intelligence.",
    description: "Parses complex PDF structures locally without external APIs, adapting document insights based on technical vs non-technical user personas.",
    tech: ["Python", "PyMuPDF", "Docker", "NLP Engine"],
    img: "/images/projects/Adobe_PDF.png",
    link: "https://github.com/urvagandhi/CTRL_ALT_Adobe-PS_1A",
    github: "https://github.com/urvagandhi/CTRL_ALT_Adobe-PS_1B",
    featured: false,
    gradient: "from-purple-500/20 via-pink-500/10 to-transparent"
  },
  {
    id: "codeguardian",
    title: "CodeGuardian",
    subtitle: "AI Vulnerability Detection Engine",
    type: "AI Security & Static Analysis",
    category: "AI / ML & Security",
    badge: "AI Security System",
    stats: [
      { label: "AI Model", val: "Graph Transformers" },
      { label: "Mapping", val: "CWE / CVE DB" },
      { label: "Tuning", val: "LoRA / QLoRA" }
    ],
    summary: "AI-driven multi-language vulnerability detection engine using graph-aware transformers to auto-scan code, map flaws to CWE/CVE, and generate explainable security fixes.",
    description: "Combines abstract syntax trees with fine-tuned LLMs to deliver deep vulnerability detection and automated remediation.",
    tech: ["Python", "PyTorch", "Transformers", "LoRA/QLoRA", "Graph AI"],
    img: "/images/projects/codeGuardian.jpeg",
    link: "https://github.com/Harsh204k/codeGuardian",
    github: "https://github.com/Harsh204k/codeGuardian",
    featured: false,
    gradient: "from-cyan-500/20 via-indigo-500/10 to-transparent"
  }
];

const CATEGORIES = ["All", "Full-Stack & Web", "AI / ML & Security"];

export default function InnovativeProjectsShowcase() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("bento");
  const [selectedId, setSelectedId] = useState(PROJECTS[0].id);
  const [slideDir, setSlideDir] = useState(1);

  const handleSelectProject = (id) => {
    const currentIdx = filteredProjects.findIndex((p) => p.id === selectedId);
    const nextIdx = filteredProjects.findIndex((p) => p.id === id);
    setSlideDir(nextIdx >= currentIdx ? 1 : -1);
    setSelectedId(id);
  };

  const filteredProjects = useMemo(() => {
    return PROJECTS.filter((proj) => {
      const matchesCategory =
        activeCategory === "All" || proj.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        proj.title.toLowerCase().includes(q) ||
        (proj.subtitle && proj.subtitle.toLowerCase().includes(q)) ||
        proj.type.toLowerCase().includes(q) ||
        proj.summary.toLowerCase().includes(q) ||
        proj.tech.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const activeShowcaseProj =
    filteredProjects.find((p) => p.id === selectedId) ||
    filteredProjects[0] ||
    PROJECTS[0];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Ultra-Clean Single-Line Floating Control Bar */}
      <div className="w-full mb-10">
        <div className="w-full flex flex-nowrap lg:flex-wrap items-center justify-between gap-4 lg:gap-3 p-2.5 rounded-2xl border border-dark/10 dark:border-light/10 bg-light/80 dark:bg-dark/80 backdrop-blur-xl shadow-xl">
          {/* Category Tabs (Left) */}
          <div className="flex flex-nowrap lg:flex-wrap lg:w-full items-center gap-1.5 shrink-0">
            {CATEGORIES.map((cat) => {
              const count =
                cat === "All"
                  ? PROJECTS.length
                  : PROJECTS.filter((p) => p.category === cat).length;
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`relative px-3.5 py-1.5 lg:justify-center text-xs font-bold rounded-xl transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap ${
                    cat === "All"
                      ? "lg:w-full lg:py-2.5"
                      : "lg:flex-1 lg:py-1.5"
                  } ${
                    isActive
                      ? "text-light dark:text-dark"
                      : "text-dark/70 dark:text-light/70 hover:text-dark dark:hover:text-light"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="catTabActive"
                      className="absolute inset-0 bg-dark dark:bg-primaryDark rounded-xl -z-10 shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span>{cat}</span>
                  <span
                    className={`px-1.5 py-0.5 text-[10px] rounded-full font-extrabold ${
                      isActive
                        ? "bg-light/20 text-light dark:bg-dark/20 dark:text-dark"
                        : "bg-dark/10 text-dark/60 dark:bg-light/10 dark:text-light/60"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Centered Bento Grid / Focus Spotlight Switcher (Center) */}
          <div className="flex items-center p-1 rounded-xl bg-dark/5 dark:bg-light/10 border border-dark/10 dark:border-light/10 shrink-0 lg:w-full lg:justify-center">
            <button
              onClick={() => setViewMode("bento")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === "bento"
                  ? "bg-dark text-light dark:bg-primaryDark dark:text-dark shadow-sm"
                  : "text-dark/70 dark:text-light/70 hover:text-dark dark:hover:text-light"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Bento Grid</span>
            </button>
            <button
              onClick={() => setViewMode("showcase")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === "showcase"
                  ? "bg-dark text-light dark:bg-primaryDark dark:text-dark shadow-sm"
                  : "text-dark/70 dark:text-light/70 hover:text-dark dark:hover:text-light"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
              </svg>
              <span>Focus Spotlight</span>
            </button>
          </div>

          {/* Prominent Search Bar (Right) */}
          <div className="relative shrink-0 w-80 lg:w-full">
            <input
              type="text"
              placeholder="Search tech (Spring Boot, Python, Docker, ML...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-1.5 pl-8 text-xs font-semibold rounded-xl border border-dark/15 dark:border-light/15 bg-light dark:bg-dark text-dark dark:text-light placeholder-dark/40 dark:placeholder-light/40 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primaryDark transition-all shadow-inner"
            />
            <svg
              className="absolute left-2.5 top-2 h-3.5 w-3.5 text-primary dark:text-primaryDark pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1.5 p-0.5 text-dark/40 hover:text-dark dark:text-light/40 dark:hover:text-light"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fallback Empty Search State */}
      {filteredProjects.length === 0 ? (
        <div className="w-full py-16 text-center rounded-3xl border border-dashed border-dark/20 dark:border-light/20 bg-dark/5 dark:bg-light/5">
          <p className="text-base font-medium text-dark/60 dark:text-light/60">
            No projects found matching &quot;{searchQuery}&quot;
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("All");
            }}
            className="mt-3 px-4 py-2 text-xs font-bold text-primary dark:text-primaryDark underline hover:no-underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* VIEW 1: INNOVATIVE BENTO GRID */}
          {viewMode === "bento" && (
            <motion.div
              layout
              className="w-full grid grid-cols-12 gap-8 lg:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35 }}
                    className={
                      project.featured
                        ? "col-span-12"
                        : "col-span-6 lg:col-span-12"
                    }
                  >
                    <article className={`relative flex w-full flex-col justify-between rounded-3xl border border-dark/15 bg-gradient-to-br ${project.gradient} bg-light/95 dark:border-light/15 dark:bg-dark/95 backdrop-blur-xl p-8 lg:p-6 shadow-xl hover:shadow-2xl hover:border-primary/50 dark:hover:border-primaryDark/50 transition-all duration-500 group overflow-hidden`}>
                      <BorderBeam
                        size={250}
                        duration={12}
                        delay={5}
                        colorFrom="#58E6D9"
                        colorTo="#8B5CF6"
                      />
                      <div
                        className={`flex w-full ${
                          project.featured
                            ? "flex-row lg:flex-col gap-8"
                            : "flex-col gap-6"
                        }`}
                      >
                        {/* Image Canvas Container */}
                        <Link
                          href={project.link}
                          target="_blank"
                          className={`${
                            project.featured ? "w-1/2 lg:w-full" : "w-full"
                          } relative block overflow-hidden rounded-2xl border border-dark/10 dark:border-light/10 shadow-lg group/img max-h-60 sm:max-h-48`}
                        >
                          <FramerImage
                            src={project.img}
                            alt={project.title}
                            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover/img:scale-105"
                            width={1280}
                            height={720}
                          />
                          <div className="absolute inset-0 bg-dark/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                            <span className="px-5 py-2.5 text-xs font-extrabold text-light bg-dark/90 rounded-full border border-light/20 backdrop-blur-md shadow-2xl tracking-wide flex items-center gap-1.5">
                              <span>Explore Live Project</span>
                              <span>↗</span>
                            </span>
                          </div>
                        </Link>

                        {/* Content & Specs */}
                        <div
                          className={`flex flex-col justify-between ${
                            project.featured ? "w-1/2 lg:w-full" : "w-full"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary dark:bg-primaryDark/20 dark:text-primaryDark border border-primary/20 dark:border-primaryDark/30">
                                {project.badge}
                              </span>
                            </div>

                            <Link
                              href={project.link}
                              target="_blank"
                              className="hover:text-primary dark:hover:text-primaryDark transition-colors group/title"
                            >
                              <h3 className="text-2xl font-extrabold text-dark dark:text-light mb-1 group-hover/title:translate-x-0.5 transition-transform">
                                {project.title}
                              </h3>
                              {project.subtitle && (
                                <p className="text-xs font-semibold text-primary dark:text-primaryDark mb-3">
                                  {project.subtitle}
                                </p>
                              )}
                            </Link>

                            <p className="text-xs leading-relaxed font-medium text-dark/75 dark:text-light/75 mb-4">
                              {project.summary}
                            </p>

                            {/* Key Quick Stats */}
                            {project.stats && (
                              <div className="grid grid-cols-3 gap-2 mb-4 p-2.5 rounded-2xl bg-dark/5 dark:bg-light/5 border border-dark/5 dark:border-light/5">
                                {project.stats.map((s, idx) => (
                                  <div key={idx} className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider font-semibold text-dark/50 dark:text-light/50">
                                      {s.label}
                                    </span>
                                    <span className="text-xs font-extrabold text-dark dark:text-light truncate">
                                      {s.val}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Tech Stack Pills */}
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {project.tech.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-lg bg-dark/5 dark:bg-light/10 px-2.5 py-1 text-[11px] font-semibold text-dark/80 dark:text-light/80 border border-dark/5 dark:border-light/5 shadow-sm"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Footer Action Links */}
                          <div className="flex items-center justify-between pt-3 border-t border-dark/10 dark:border-light/10">
                            <Link
                              href={project.github}
                              target="_blank"
                              className="w-7 text-dark dark:text-light hover:scale-110 transition-transform"
                              aria-label="GitHub Repository"
                            >
                              <GithubIcon />
                            </Link>
                            <Link
                              href={project.link}
                              target="_blank"
                              className="px-4 py-2 text-xs font-bold rounded-xl bg-dark text-light dark:bg-primaryDark dark:text-dark hover:opacity-90 transition-all shadow-md flex items-center gap-1.5"
                            >
                              <span>Visit Project</span>
                              <span>↗</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* VIEW 2: INNOVATIVE FOCUS SPOTLIGHT */}
          {viewMode === "showcase" && (
            <div className={`relative w-full flex flex-col gap-6 rounded-3xl border border-dark/15 bg-gradient-to-br ${activeShowcaseProj.gradient} bg-light/95 dark:border-light/15 dark:bg-dark/95 backdrop-blur-xl p-8 lg:p-5 shadow-2xl overflow-hidden max-w-full`}>
              <BorderBeam
                size={300}
                duration={12}
                delay={5}
                colorFrom="#58E6D9"
                colorTo="#8B5CF6"
              />

              {/* Project Selection Tabs */}
              <div className="flex flex-wrap items-center gap-2.5 border-b border-dark/10 dark:border-light/10 pb-6 relative z-20">
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProject(p.id)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${
                      activeShowcaseProj.id === p.id
                        ? "bg-dark text-light dark:bg-primaryDark dark:text-dark shadow-lg scale-105"
                        : "bg-dark/5 dark:bg-light/5 text-dark/70 dark:text-light/70 hover:bg-dark/10 dark:hover:bg-light/10"
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>

              {/* Spotlight Frame */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeShowcaseProj.id}
                  initial={{ opacity: 0, x: slideDir * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -slideDir * 60 }}
                  transition={{ type: "spring", stiffness: 260, damping: 30 }}
                  className="grid grid-cols-12 gap-8 lg:gap-4 items-center pt-2 relative z-20 lg:min-w-0"
                >
                  <div className="col-span-7 lg:col-span-12 relative overflow-hidden rounded-2xl border border-dark/10 dark:border-light/10 shadow-xl group max-h-[380px] lg:max-h-[200px]">
                    <Image
                      src={activeShowcaseProj.img}
                      alt={activeShowcaseProj.title}
                      width={1280}
                      height={720}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="col-span-5 lg:col-span-12 flex flex-col justify-between">
                  <div>
                    <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary dark:bg-primaryDark/20 dark:text-primaryDark border border-primary/20 dark:border-primaryDark/30 mb-3">
                      {activeShowcaseProj.badge}
                    </span>
                    <h3 className="text-3xl lg:text-2xl font-extrabold text-dark dark:text-light mb-1">
                      {activeShowcaseProj.title}
                    </h3>
                    {activeShowcaseProj.subtitle && (
                      <p className="text-xs font-bold text-primary dark:text-primaryDark mb-3">
                        {activeShowcaseProj.subtitle}
                      </p>
                    )}
                    <p className="text-xs font-medium text-dark/80 dark:text-light/80 leading-relaxed mb-4">
                      {activeShowcaseProj.description || activeShowcaseProj.summary}
                    </p>

                    {/* Stats Strip */}
                    {activeShowcaseProj.stats && (
                      <div className="grid grid-cols-3 gap-2 mb-5 p-3 rounded-2xl bg-dark/5 dark:bg-light/5 border border-dark/5 dark:border-light/5">
                        {activeShowcaseProj.stats.map((s, idx) => (
                          <div key={idx} className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-dark/50 dark:text-light/50">
                              {s.label}
                            </span>
                            <span className="text-xs font-extrabold text-dark dark:text-light truncate">
                              {s.val}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-6">
                      {activeShowcaseProj.tech.map((t, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-dark/5 dark:bg-light/10 px-3 py-1 text-xs font-semibold text-dark/90 dark:text-light/90 border border-dark/10 dark:border-light/10 shadow-sm"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t border-dark/10 dark:border-light/10">
                    <Link
                      href={activeShowcaseProj.github}
                      target="_blank"
                      className="w-8 text-dark dark:text-light hover:scale-110 transition-transform"
                      aria-label="GitHub Repository"
                    >
                      <GithubIcon />
                    </Link>
                    <Link
                      href={activeShowcaseProj.link}
                      target="_blank"
                      className="px-6 py-2.5 text-sm font-bold rounded-xl bg-dark text-light dark:bg-primaryDark dark:text-dark hover:opacity-90 transition-all shadow-md flex items-center gap-1.5"
                    >
                      <span>Visit Live Project</span>
                      <span>↗</span>
                    </Link>
                  </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Prev / Next Arrows */}
              <div className="flex items-center justify-center gap-3 pt-1 relative z-20">
                <button
                  onClick={() => {
                    const idx = filteredProjects.findIndex((p) => p.id === activeShowcaseProj.id);
                    const prev = filteredProjects[(idx - 1 + filteredProjects.length) % filteredProjects.length];
                    setSlideDir(-1);
                    setSelectedId(prev.id);
                  }}
                  disabled={filteredProjects.length <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-dark/5 dark:bg-light/5 text-dark dark:text-light border border-dark/10 dark:border-light/10 hover:bg-dark/10 dark:hover:bg-light/10 transition-all disabled:opacity-30"
                  aria-label="Previous project"
                >
                  ←
                </button>
                <button
                  onClick={() => {
                    const idx = filteredProjects.findIndex((p) => p.id === activeShowcaseProj.id);
                    const next = filteredProjects[(idx + 1) % filteredProjects.length];
                    setSlideDir(1);
                    setSelectedId(next.id);
                  }}
                  disabled={filteredProjects.length <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-dark/5 dark:bg-light/5 text-dark dark:text-light border border-dark/10 dark:border-light/10 hover:bg-dark/10 dark:hover:bg-light/10 transition-all disabled:opacity-30"
                  aria-label="Next project"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
