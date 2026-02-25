import Layout from "@/components/Layout";
import Head from "next/head";
import Link from "next/link";
import TransitionEffect from "@/components/TransitionEffect";

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Page Not Found | Urva Gandhi</title>
        <meta name="description" content="The page you are looking for does not exist." />
      </Head>
      <TransitionEffect />
      <main className="flex min-h-screen items-center text-dark dark:text-light pt-24">
        <Layout className="flex flex-col items-center justify-center">
          <h1 className="text-8xl font-bold text-primary dark:text-primaryDark sm:text-6xl">
            404
          </h1>
          <h2 className="mt-4 text-2xl font-semibold sm:text-xl">
            Page Not Found
          </h2>
          <p className="mt-2 text-lg text-dark/75 dark:text-light/75 text-center sm:text-base">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            href="/"
            className="mt-8 rounded-lg bg-dark px-6 py-3 text-lg font-semibold text-light hover:bg-transparent hover:text-dark border-2 border-dark dark:bg-light dark:text-dark dark:hover:bg-dark dark:hover:text-light dark:border-light transition-all duration-300"
          >
            Go Home
          </Link>
        </Layout>
      </main>
    </>
  );
}
