import React from "react";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import "@/styles/globals.css";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { Montserrat } from "next/font/google";
import Head from "next/head";
import { useRouter } from "next/router";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Particles } from "@/components/ui/particles";
import useThemeSwitcher from "@/components/hooks/useThemeSwitcher";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-mont",
});

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const [mode] = useThemeSwitcher();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/profile/urva-circular.png" />
      </Head>
      <main
        className={`${montserrat.variable} font-mont bg-light dark:bg-dark w-full min-h-screen h-full relative overflow-clip`}
      >
        {/* Global Interactive Particles Background - Client Side Only to fix hydration */}
        {mounted && (
          <Particles
            key={mode}
            className="fixed inset-0 z-0 opacity-60 dark:opacity-80 pointer-events-none"
            quantity={100}
            size={1.5}
            ease={70}
            color={mode === "dark" ? "#ffffff" : "#000000"}
            refresh
          />
        )}

        {/* Global Scroll Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-purple-500 to-cyan-500 dark:from-primaryDark dark:via-cyan-400 dark:to-primaryDark origin-left z-[100]"
          style={{ scaleX: scrollYProgress }}
        />
        <NavBar />
        <AnimatePresence initial={false} mode="wait">
          <Component key={router.asPath} {...pageProps} />
        </AnimatePresence>
        <Footer />
      </main>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
