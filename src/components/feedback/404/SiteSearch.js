import { useState, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const INDEX = [
  // Pages
  { cat: "Page", label: "Home", href: "/", keywords: "home hero landing" },
  { cat: "Page", label: "About", href: "/about", keywords: "about bio education experience skills" },
  { cat: "Page", label: "Contact", href: "/contact", keywords: "contact email get in touch" },
  { cat: "Page", label: "Developer Portal", href: "/docs", keywords: "docs developer api agents" },
  { cat: "Page", label: "Privacy Policy", href: "/privacy", keywords: "privacy policy" },
  { cat: "Page", label: "Agent Auth", href: "/auth", keywords: "auth agent login" },

  // Projects
  { cat: "Project", label: "CoinTrack", href: "/#projects", keywords: "cotrack broker asset investment" },
  { cat: "Project", label: "Agent Paperpal", href: "/#projects", keywords: "paperpal ai manuscript agentic" },
  { cat: "Project", label: "FleetFlow", href: "/#projects", keywords: "fleet logistics management" },
  { cat: "Project", label: "RWEsearch", href: "/#projects", keywords: "rweni healthcare readmission analytics" },
  { cat: "Project", label: "Connecting the Dots", href: "/#projects", keywords: "adobe pdf intelligence" },
  { cat: "Project", label: "CodeGuardian", href: "/#projects", keywords: "ai vulnerability detection security" },

  // Skills
  { cat: "Skill", label: "Java", href: "/#skills", keywords: "java" },
  { cat: "Skill", label: "Python", href: "/#skills", keywords: "python" },
  { cat: "Skill", label: "JavaScript", href: "/#skills", keywords: "javascript js" },
  { cat: "Skill", label: "SQL", href: "/#skills", keywords: "sql database" },
  { cat: "Skill", label: "Spring Boot", href: "/#skills", keywords: "spring boot java" },
  { cat: "Skill", label: "Node.js", href: "/#skills", keywords: "node nodejs backend" },
  { cat: "Skill", label: "React.js", href: "/#skills", keywords: "react frontend" },
  { cat: "Skill", label: "Next.js", href: "/#skills", keywords: "next framework" },
  { cat: "Skill", label: "Tailwind CSS", href: "/#skills", keywords: "tailwind css styling" },
  { cat: "Skill", label: "PostgreSQL", href: "/#skills", keywords: "postgres sql database" },
  { cat: "Skill", label: "MongoDB", href: "/#skills", keywords: "mongo database nosql" },
  { cat: "Skill", label: "TensorFlow", href: "/#skills", keywords: "tensorflow ml ai" },
  { cat: "Skill", label: "Docker", href: "/#skills", keywords: "docker container devops" },
  { cat: "Skill", label: "Git", href: "/#skills", keywords: "git version control github" },
  { cat: "Skill", label: "ML & AI", href: "/#skills", keywords: "machine learning ai" },

  // Agent / machine resources
  { cat: "Resource", label: "llms.txt Index", href: "/llms.txt", keywords: "llms index ai" },
  { cat: "Resource", label: "OpenAPI 3.0 Specification", href: "/openapi.json", keywords: "openapi spec api" },
  { cat: "Resource", label: "MCP Server Manifest", href: "/.well-known/mcp", keywords: "mcp manifest" },
  { cat: "Resource", label: "XML Sitemap", href: "/sitemap.xml", keywords: "sitemap xml" },
];

const normalize = (s) => s.toLowerCase().trim();

export default function SiteSearch({ autoFocus = false }) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return INDEX.filter((item) =>
      normalize(`${item.label} ${item.keywords}`).includes(q),
    ).slice(0, 8);
  }, [query]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIdx];
    el?.scrollIntoView?.({ block: "nearest" });
  }, [activeIdx]);

  const onKeyDown = (e) => {
    if (!open && e.key !== "Enter") return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[activeIdx] || results[0];
      if (target) window.location.href = target.href;
    }
  };

  return (
    <div className="mx-auto mt-8 w-full max-w-md text-left">
      <div className="relative">
        <div
          className="flex items-center gap-2 rounded-lg border border-dark/20 bg-light/60 px-3 dark:border-light/20 dark:bg-dark/60"
        >
          <span
            className="shrink-0 text-dark/40 dark:text-light/40"
            aria-hidden="true"
          >
            ⌕
          </span>
          <input
            ref={inputRef}
            name="query"
            type="text"
            value={query}
            placeholder="Search projects, skills, pages…"
            aria-label="Search this site"
            role="combobox"
            aria-expanded={open}
            aria-controls="search-results"
            autoComplete="off"
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="w-full bg-transparent py-2.5 text-sm text-dark placeholder:text-dark/40 outline-none dark:text-light dark:placeholder:text-light/40"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setOpen(true);
                inputRef.current?.focus();
              }}
              className="shrink-0 text-sm text-dark/40 hover:text-dark dark:text-light/40 dark:hover:text-light"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <AnimatePresence>
          {open && query.trim() && (
            <motion.ul
              id="search-results"
              role="listbox"
              ref={listRef}
              initial={{ opacity: 0, y: reduce ? 0 : -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -6 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-lg border border-dark/15 bg-light shadow-2xl dark:border-light/15 dark:bg-dark"
            >
              {results.length === 0 ? (
                <li className="px-4 py-3 text-sm text-dark/60 dark:text-light/60">
                  No matches for{" "}
                  <span className="font-semibold text-dark dark:text-light">
                    “{query}”
                  </span>
                </li>
              ) : (
                results.map((r, i) => (
                  <li key={`${r.cat}-${r.label}`}>
                    <Link
                      href={r.href}
                      onMouseEnter={() => setActiveIdx(i)}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors ${
                        i === activeIdx
                          ? "bg-dark text-light dark:bg-light dark:text-dark"
                          : "text-dark hover:bg-dark/5 dark:text-light dark:hover:bg-light/10"
                      }`}
                    >
                      <span className="font-medium">{r.label}</span>
                      <span
                        className={`flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${
                          i === activeIdx
                            ? "text-light/70 dark:text-dark/70"
                            : "text-dark/40 dark:text-light/40"
                        }`}
                      >
                        {r.cat}
                        <span aria-hidden="true">→</span>
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      <p className="mt-2 text-center text-xs text-dark/40 dark:text-light/40">
        Tip: press <kbd className="rounded border border-dark/20 px-1 dark:border-light/20">Enter</kbd> to open,{" "}
        <kbd className="rounded border border-dark/20 px-1 dark:border-light/20">↑↓</kbd> to navigate,{" "}
        <kbd className="rounded border border-dark/20 px-1 dark:border-light/20">Esc</kbd> to close
      </p>
    </div>
  );
}
