import React from "react";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import Loader from "@/components/Loader";
import ContactModal from "@/components/ContactModal";
import { ContactModalProvider } from "@/context/ContactModalContext";
import "@/styles/globals.css";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { Montserrat } from "next/font/google";
import Head from "next/head";
import { useRouter } from "next/router";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import dynamic from "next/dynamic";

const Particles = dynamic(() => import("@/components/ui/particles").then(mod => mod.Particles), {
  ssr: false,
});
const CustomCursor = dynamic(() => import("@/components/CustomCursor"), {
  ssr: false,
});

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

    const isDark = document.documentElement.classList.contains("dark");
    setParticleColor(isDark ? "#ffffff" : "#000000");

    const handleThemeChange = (e) => {
      setParticleColor(e.detail === "dark" ? "#ffffff" : "#000000");
    };
    window.addEventListener("themeChange", handleThemeChange);

    const dismiss = () => setLoading(false);
    if (document.readyState === "complete") {
      setTimeout(dismiss, 1500);
    } else {
      window.addEventListener("load", () => setTimeout(dismiss, 1500), { once: true });
    }

    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  return (
    <ContactModalProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Main Tab Favicon */}
        <link rel="icon" type="image/png" href="/images/profile/urva-circular.png" />

        <title>Urva Gandhi | Software Developer Portfolio</title>
        <meta name="description" content="Urva Gandhi — Full-stack developer, ML enthusiast, and hackathon winner. Explore projects, skills, and experience." />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Person",
                  "@id": "https://urvagandhi.tech/#person",
                  "name": "Urva Yogeshkumar Gandhi",
                  "alternateName": "Urva Gandhi",
                  "jobTitle": "Software & AI Systems Engineer",
                  "worksFor": {
                    "@type": "Organization",
                    "name": "Kautilyam",
                    "url": "https://kautilyam.com"
                  },
                  "alumniOf": [
                    {
                      "@type": "EducationalOrganization",
                      "name": "Department of Computer Science & Engineering, Nirma University",
                      "url": "https://cse.nirmauni.ac.in"
                    },
                    {
                      "@type": "EducationalOrganization",
                      "name": "Institute of Technology, Nirma University",
                      "url": "https://technology.nirmauni.ac.in"
                    }
                  ],
                  "url": "https://urvagandhi.tech",
                  "email": "23bce078@nirmauni.ac.in",
                  "telephone": "+91-8866241204",
                  "sameAs": [
                    "https://github.com/urvagandhi",
                    "https://www.linkedin.com/in/urva-gandhi/",
                    "https://leetcode.com/u/Urva_Gandhi/",
                    "https://codeforces.com/profile/Urva_Gandhi",
                    "https://www.codechef.com/users/urva_gandhi"
                  ],
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "S-308, Venus Parkland, Near Vejalpur Police Chowki, Vejalpur",
                    "addressLocality": "Ahmedabad",
                    "addressRegion": "Gujarat",
                    "postalCode": "380051",
                    "addressCountry": "IN"
                  }
                },
                {
                  "@type": "Organization",
                  "@id": "https://urvagandhi.tech/#organization",
                  "name": "Urva Gandhi Portfolio & Developer Platform",
                  "url": "https://urvagandhi.tech",
                  "logo": "https://urvagandhi.tech/images/profile/urva-circular.png",
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+91-8866241204",
                    "email": "urvagandhi24@gmail.com",
                    "contactType": "developer inquiry",
                    "availableLanguage": ["English", "Gujarati", "Hindi"]
                  },
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "S-308, Venus Parkland, Near Vejalpur Police Chowki, Vejalpur",
                    "addressLocality": "Ahmedabad",
                    "addressRegion": "Gujarat",
                    "postalCode": "380051",
                    "addressCountry": "IN"
                  }
                }
              ]
            })
          }}
        />
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
        {/* Global Interactive Particles Background */}
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
        {/* Global custom cursor */}
        {mounted && !loading && (
          <CustomCursor />
        )}

        <NavBar />
        <AnimatePresence initial={false} mode="wait">
          <Component key={router.asPath} {...pageProps} />
        </AnimatePresence>
        <Footer />
        <ContactModal />
      </main>
      <Analytics />
      <SpeedInsights />
    </ContactModalProvider>
  );
}
