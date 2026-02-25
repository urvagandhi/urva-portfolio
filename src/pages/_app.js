import React from "react";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import Loader from "@/components/Loader";
import "@/styles/globals.css";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { Montserrat } from "next/font/google";
import Head from "next/head";
import { useRouter } from "next/router";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Particles } from "@/components/ui/particles";
import {
  CursorProvider,
  Cursor,
  CursorFollow,
} from "@/components/animate-ui/components/animate/cursor";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-mont",
});

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const [particleColor, setParticleColor] = React.useState("#000000");
  const [mounted, setMounted] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);

    // Read initial theme from DOM
    const isDark = document.documentElement.classList.contains("dark");
    setParticleColor(isDark ? "#ffffff" : "#000000");

    // Listen for theme changes from ThemeSwitcher without using useThemeSwitcher
    // (avoids cascading re-renders during view transitions)
    const handleThemeChange = (e) => {
      setParticleColor(e.detail === "dark" ? "#ffffff" : "#000000");
    };
    window.addEventListener("themeChange", handleThemeChange);

    // Dismiss loader after page resources are ready
    const dismiss = () => setLoading(false);
    if (document.readyState === "complete") {
      setTimeout(dismiss, 1500);
    } else {
      window.addEventListener("load", () => setTimeout(dismiss, 1500), { once: true });
    }

    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/profile/urva-circular.png" />
      </Head>

      {/* Intro loader overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            className="fixed inset-0 z-[200] flex items-center justify-center bg-light dark:bg-dark"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>

      <main
        className={`${montserrat.variable} font-mont bg-light dark:bg-dark w-full min-h-screen h-full relative overflow-clip`}
      >
        {/* Global Interactive Particles Background - Client Side Only to fix hydration */}
        {mounted && (
          <Particles
            className="fixed inset-0 z-0 opacity-60 dark:opacity-80 pointer-events-none"
            quantity={100}
            size={1.5}
            ease={70}
            color={particleColor}
          />
        )}

        {/* Global Scroll Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-purple-500 to-cyan-500 dark:from-primaryDark dark:via-cyan-400 dark:to-primaryDark origin-left z-[100]"
          style={{ scaleX: scrollYProgress }}
        />
        {/* Global custom cursor - client-side only, hidden during loader */}
        {mounted && !loading && (
          <CursorProvider global>
            <Cursor className="text-primary dark:text-primaryDark" />
            <CursorFollow side="bottom" sideOffset={15} align="end" alignOffset={5}>
              Developer
            </CursorFollow>
          </CursorProvider>
        )}

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
