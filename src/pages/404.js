import Layout from "@/components/Layout";
import Head from "next/head";
import Link from "next/link";
import TransitionEffect from "@/components/TransitionEffect";

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Page Not Found | Urva Gandhi Portfolio</title>
        <meta name="description" content="The page you requested does not exist on Urva Gandhi's Portfolio. Use our sitemap, developer portal, or homepage to find what you are looking for." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <TransitionEffect />
      <main className="flex min-h-screen items-center text-dark dark:text-light pt-24 pb-16">
        <Layout className="flex flex-col items-center justify-center text-center">
          <h1 className="text-8xl font-bold text-primary dark:text-primaryDark sm:text-6xl">
            404
          </h1>
          <h2 className="mt-4 text-3xl font-semibold sm:text-2xl">
            Page Not Found
          </h2>
          <p className="mt-2 max-w-xl text-lg text-dark/75 dark:text-light/75 sm:text-base">
            The page or resource you requested doesn&apos;t exist or may have been moved.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="rounded-lg bg-dark px-6 py-3 text-base font-semibold text-light hover:bg-transparent hover:text-dark border-2 border-dark dark:bg-light dark:text-dark dark:hover:bg-dark dark:hover:text-light dark:border-light transition-all duration-300"
            >
              Go Home
            </Link>
            <Link
              href="/about"
              className="rounded-lg bg-transparent px-6 py-3 text-base font-semibold text-dark hover:bg-dark hover:text-light border-2 border-dark dark:text-light dark:border-light dark:hover:bg-light dark:hover:text-dark transition-all duration-300"
            >
              About Urva
            </Link>
            <Link
              href="/docs"
              className="rounded-lg bg-transparent px-6 py-3 text-base font-semibold text-dark hover:bg-dark hover:text-light border-2 border-dark dark:text-light dark:border-light dark:hover:bg-light dark:hover:text-dark transition-all duration-300"
            >
              Developer Portal
            </Link>
            <Link
              href="/contact"
              className="rounded-lg bg-transparent px-6 py-3 text-base font-semibold text-dark hover:bg-dark hover:text-light border-2 border-dark dark:text-light dark:border-light dark:hover:bg-light dark:hover:text-dark transition-all duration-300"
            >
              Contact
            </Link>
          </div>

          <div className="mt-10 rounded-xl border border-dark/10 bg-dark/5 p-6 dark:border-light/10 dark:bg-light/5 max-w-lg text-left text-sm">
            <h3 className="font-bold text-dark dark:text-light mb-2">Agent & Machine Resources</h3>
            <ul className="space-y-1 text-dark/80 dark:text-light/80">
              <li>• <Link href="/llms.txt" className="underline hover:text-primary dark:hover:text-primaryDark">llms.txt Index</Link></li>
              <li>• <Link href="/openapi.json" className="underline hover:text-primary dark:hover:text-primaryDark">OpenAPI 3.0 Specification</Link></li>
              <li>• <Link href="/.well-known/mcp" className="underline hover:text-primary dark:hover:text-primaryDark">MCP Server Manifest</Link></li>
              <li>• <Link href="/sitemap.xml" className="underline hover:text-primary dark:hover:text-primaryDark">XML Sitemap</Link></li>
            </ul>
          </div>
        </Layout>
      </main>
    </>
  );
}

