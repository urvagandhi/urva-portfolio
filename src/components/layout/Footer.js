import Link from "next/link";
import Layout from "./Layout";
import { useContactModal } from "@/context/ContactModalContext";

const Footer = () => {
  const { openContactModal } = useContactModal();

  return (
    <footer className="w-full border-t border-solid border-dark/10 dark:border-light/10 bg-light/90 dark:bg-dark/90 backdrop-blur-md font-medium text-sm text-dark dark:text-light transition-colors">
      <Layout className="py-6 flex flex-col items-center justify-center gap-4 text-center">
        {/* Line 1: Minimal Horizontal Navigation Bar (single row on desktop, tidy centered grid on mobile) */}
        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 text-sm lg:text-xs font-semibold text-dark/80 dark:text-light/80 lg:grid lg:grid-cols-2 lg:justify-items-center lg:gap-x-5 lg:gap-y-2 w-full">
          <Link
            href="/about"
            className="hover:text-primary dark:hover:text-primaryDark transition-colors"
          >
            About
          </Link>
          <span className="text-dark/20 dark:text-light/20 lg:hidden">•</span>
          <Link
            href="/contact"
            className="hover:text-primary dark:hover:text-primaryDark transition-colors"
          >
            Contact &amp; Hire
          </Link>
          <span className="text-dark/20 dark:text-light/20 lg:hidden">•</span>
          <Link
            href="/privacy"
            className="hover:text-primary dark:hover:text-primaryDark transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-dark/20 dark:text-light/20 lg:hidden">•</span>
          <Link
            href="/docs"
            className="hover:text-primary dark:hover:text-primaryDark transition-colors"
          >
            Developer Portal
          </Link>
          <span className="text-dark/20 dark:text-light/20 lg:hidden">•</span>
          <Link
            href="/auth"
            className="hover:text-primary dark:hover:text-primaryDark transition-colors"
          >
            API Auth
          </Link>
          <span className="text-dark/20 dark:text-light/20 lg:hidden">•</span>
          <Link
            href="/llms.txt"
            target="_blank"
            className="hover:text-primary dark:hover:text-primaryDark transition-colors"
          >
            llms.txt ↗
          </Link>
          <span className="text-dark/20 dark:text-light/20 lg:hidden">•</span>
          <Link
            href="/openapi.json"
            target="_blank"
            className="hover:text-primary dark:hover:text-primaryDark transition-colors"
          >
            OpenAPI Spec ↗
          </Link>
          <span className="text-dark/20 dark:text-light/20 lg:hidden">•</span>
          <Link
            href="/.well-known/mcp"
            target="_blank"
            className="hover:text-primary dark:hover:text-primaryDark transition-colors"
          >
            MCP Manifest ↗
          </Link>
        </div>

        {/* Line 2: Copyright & Status */}
        <div className="flex flex-wrap items-center justify-between w-full pt-4 border-t border-dark/10 dark:border-light/10 text-sm lg:text-xs text-dark/60 dark:text-light/60 gap-3 lg:flex-col lg:items-center">
          <span>
            &copy; {new Date().getFullYear()} Urva Yogeshkumar Gandhi. All
            Rights Reserved.
          </span>

          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              MCP Server &amp; APIs Online
            </span>
          </div>

          <div>
            Built with{" "}
            <span className="text-primary dark:text-primaryDark px-0.5">♡</span>{" "}
            by{" "}
            <Link
              href="https://linkedin.com/in/urva-gandhi"
              target="_blank"
              className="underline underline-offset-2 hover:text-primary dark:hover:text-primaryDark"
            >
              Urva Gandhi
            </Link>
          </div>
        </div>
      </Layout>
    </footer>
  );
};

export default Footer;
