import Layout from "@/components/layout/Layout.js";
import Head from "next/head";
import TransitionEffect from "@/components/layout/TransitionEffect.js";
import Meteors404 from "@/components/feedback/404/Meteors404";

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Page Not Found | Urva Gandhi Portfolio</title>
        <meta
          name="description"
          content="The page you requested does not exist on Urva Gandhi's Portfolio. Use our sitemap, developer portal, or homepage to find what you are looking for."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <TransitionEffect />
      <main className="flex min-h-screen items-center text-dark dark:text-light pt-24 pb-16 sm:pt-16 sm:pb-10 xs:pt-12 xs:pb-6">
        <Layout className="flex flex-col items-center justify-center text-center">
          <Meteors404 />
        </Layout>
      </main>
    </>
  );
}
