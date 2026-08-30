import Link from "next/link";
import SiteSearch from "./SiteSearch";

const CTALink = ({ href, children, solid = false }) => (
  <Link
    href={href}
    className={
      solid
        ? "rounded-lg bg-dark px-6 py-3 text-base font-semibold text-light hover:bg-transparent hover:text-dark border-2 border-dark dark:bg-light dark:text-dark dark:hover:bg-dark dark:hover:text-light dark:border-light transition-all duration-300"
        : "rounded-lg bg-transparent px-6 py-3 text-base font-semibold text-dark hover:bg-dark hover:text-light border-2 border-dark dark:text-light dark:border-light dark:hover:bg-light dark:hover:text-dark transition-all duration-300"
    }
  >
    {children}
  </Link>
);

export default function NotFoundShared({ showSearch = false }) {
  return (
    <>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <CTALink href="/" solid>
          Go Home
        </CTALink>
        <CTALink href="/about">About Urva</CTALink>
        <CTALink href="/docs">Developer Portal</CTALink>
        <CTALink href="/contact">Contact</CTALink>
      </div>

      {showSearch && <SiteSearch />}

      <div className="mt-10 w-full max-w-lg rounded-xl border border-dark/10 bg-dark/5 p-6 text-left text-sm dark:border-light/10 dark:bg-light/5 sm:p-4 xs:p-3">
        <h3 className="font-bold text-dark dark:text-light mb-2">
          Agent & Machine Resources
        </h3>
        <ul className="space-y-1 text-dark/80 dark:text-light/80">
          <li>
            •{" "}
            <Link
              href="/llms.txt"
              className="underline hover:text-primary dark:hover:text-primaryDark"
            >
              llms.txt Index
            </Link>
          </li>
          <li>
            •{" "}
            <Link
              href="/openapi.json"
              className="underline hover:text-primary dark:hover:text-primaryDark"
            >
              OpenAPI 3.0 Specification
            </Link>
          </li>
          <li>
            •{" "}
            <Link
              href="/.well-known/mcp"
              className="underline hover:text-primary dark:hover:text-primaryDark"
            >
              MCP Server Manifest
            </Link>
          </li>
          <li>
            •{" "}
            <Link
              href="/sitemap.xml"
              className="underline hover:text-primary dark:hover:text-primaryDark"
            >
              XML Sitemap
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
