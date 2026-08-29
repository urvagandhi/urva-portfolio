import AnimatedText from "@/components/AnimatedText";
import TypewriterText from "@/components/TypewriterText";
import AnimatedDownloadButton from "@/components/AnimatedDownloadButton";
import Education from "@/components/Education";
import Experience from "@/components/Experience";
import Internship from "@/components/Internship";
import HireMe from "@/components/HireMe";
import { GithubIcon, LinkArrow } from "@/components/Icons";
import Layout from "@/components/Layout";
import Skills from "@/components/Skills";
import TransitionEffect from "@/components/TransitionEffect";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import { BorderBeam } from "@/components/magicui/border-beam";
import useThemeSwitcher from "@/components/hooks/useThemeSwitcher";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useContactModal } from "@/context/ContactModalContext";

// Dynamically import heavy chart components that render below the fold
const GithubGraph = dynamic(() => import("@/components/GithubGraph"), { 
  ssr: false, 
  loading: () => <div className="h-[200px] w-full animate-pulse rounded-xl bg-dark/5 dark:bg-light/10" /> 
});
const LeetcodeGraph = dynamic(() => import("@/components/LeetcodeGraph"), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full animate-pulse rounded-xl bg-dark/5 dark:bg-light/10" /> 
});
import CodingProfiles from "@/components/CodingProfiles";
import profilePic from "../../public/images/profile/urva.png";
import profilePic2 from "../../public/images/profile/urva_2.jpeg";

const FramerImage = motion.create(Image);

const AnimatedNumbers = ({ value }) => {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 2000 });
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, value, isInView]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current && latest.toFixed(0) <= value) {
        ref.current.textContent = latest.toFixed(0);
      }
    });
    
    return () => unsubscribe();
  }, [springValue, value]);

  return <span ref={ref}></span>;
};

const FeaturedProject = ({ type, title, summary, img, link, github, tech }) => {
  return (
    <article className="relative flex w-full items-center justify-between rounded-3xl border border-dark/10 bg-light/80 p-8 shadow-xl dark:border-light/10 dark:bg-dark/80 backdrop-blur-md lg:flex-col lg:p-6 xs:p-4 transition-all duration-300 hover:shadow-2xl hover:border-primary/30 dark:hover:border-primaryDark/40 group">
      <BorderBeam size={280} duration={12} delay={9} colorFrom="#58E6D9" colorTo="#8B5CF6" />
      <Link
        href={link}
        target="_blank"
        className="w-1/2 cursor-pointer overflow-hidden rounded-2xl lg:w-full border border-dark/10 dark:border-light/10 shadow-md relative block group/img"
      >
        <FramerImage
          src={img}
          alt={title}
          className="h-auto w-full object-cover transition-transform duration-500 group-hover/img:scale-105"
          width={1280}
          height={720}
          priority
        />
        <div className="absolute inset-0 bg-dark/30 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="px-4 py-2 text-xs font-bold text-light bg-dark/80 rounded-full border border-light/20 backdrop-blur-sm shadow-lg">
            View Live Demo ↗
          </span>
        </div>
      </Link>

      <div className="flex w-1/2 flex-col items-start justify-between pl-8 lg:w-full lg:pl-0 lg:pt-6">
        <div className="flex items-center gap-2">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary dark:bg-primaryDark/20 dark:text-primaryDark border border-primary/20 dark:border-primaryDark/30">
            {type}
          </span>
        </div>
        <Link href={link} target="_blank" className="hover:text-primary dark:hover:text-primaryDark transition-colors">
          <h2 className="my-3 text-left text-3xl font-extrabold lg:text-2xl xs:text-xl text-dark dark:text-light">
            {title}
          </h2>
        </Link>
        <p className="my-2 text-sm leading-relaxed font-medium text-dark/70 dark:text-light/70 sm:text-xs">
          {summary}
        </p>
        {tech && (
          <div className="my-3 flex flex-wrap gap-2">
            {tech.split(',').map((item, index) => (
              <span key={index} className="rounded-lg bg-dark/5 dark:bg-light/10 px-3 py-1 text-xs font-semibold text-dark/80 dark:text-light/80 border border-dark/5 dark:border-light/5 shadow-sm">
                {item.trim()}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center gap-4">
          <Link href={github} target="_blank" className="w-8 text-dark dark:text-light hover:scale-110 transition-transform" aria-label={`View ${title} on GitHub`}>
            <GithubIcon />
          </Link>
          <Link
            href={link}
            target="_blank"
            className="rounded-xl bg-dark px-5 py-2.5 text-sm font-bold text-light dark:bg-primaryDark dark:text-dark hover:opacity-90 transition-all duration-300 shadow-md flex items-center gap-1.5"
          >
            <span>Visit Project</span>
            <span>↗</span>
          </Link>
        </div>
      </div>
    </article>
  );
};

const Project = ({ type, title, summary, img, link, github, tech }) => {
  return (
    <article className="relative flex w-full h-full flex-col justify-between rounded-3xl border border-dark/10 bg-light/80 p-6 shadow-xl dark:border-light/10 dark:bg-dark/80 backdrop-blur-md xs:p-4 transition-all duration-300 hover:shadow-2xl hover:border-primary/30 dark:hover:border-primaryDark/40 group">
      <BorderBeam size={180} duration={10} delay={5} colorFrom="#58E6D9" colorTo="#8B5CF6" />
      <div>
        <Link
          href={link}
          target="_blank"
          className="w-full cursor-pointer overflow-hidden rounded-2xl block border border-dark/10 dark:border-light/10 shadow-md relative group/img"
        >
          <FramerImage
            src={img}
            alt={title}
            className="h-auto w-full object-cover transition-transform duration-500 group-hover/img:scale-105"
            width={1280}
            height={720}
          />
          <div className="absolute inset-0 bg-dark/30 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="px-3.5 py-1.5 text-xs font-bold text-light bg-dark/80 rounded-full border border-light/20 backdrop-blur-sm shadow-lg">
              View Live Demo ↗
            </span>
          </div>
        </Link>
        <div className="mt-4 flex w-full flex-col items-start">
          <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary dark:bg-primaryDark/20 dark:text-primaryDark border border-primary/20 dark:border-primaryDark/30">
            {type}
          </span>
          <Link href={link} target="_blank" className="hover:text-primary dark:hover:text-primaryDark transition-colors">
            <h2 className="my-2 text-left text-xl font-bold lg:text-lg text-dark dark:text-light">
              {title}
            </h2>
          </Link>
          {summary && (
            <p className="my-1.5 text-xs leading-relaxed font-medium text-dark/70 dark:text-light/70">
              {summary}
            </p>
          )}
        </div>
      </div>
      <div>
        {tech && (
          <div className="my-3 flex flex-wrap gap-1.5">
            {tech.split(',').map((item, index) => (
              <span key={index} className="rounded-lg bg-dark/5 dark:bg-light/10 px-2.5 py-1 text-[11px] font-semibold text-dark/80 dark:text-light/80 border border-dark/5 dark:border-light/5 shadow-sm">
                {item.trim()}
              </span>
            ))}
          </div>
        )}
        <div className="flex w-full items-center justify-between mt-3 pt-3 border-t border-dark/10 dark:border-light/10">
          <Link
            href={link}
            target="_blank"
            className="rounded-lg text-xs font-bold text-primary dark:text-primaryDark hover:underline flex items-center gap-1"
          >
            <span>Visit Project</span>
            <span>↗</span>
          </Link>
          <Link href={github} target="_blank" className="w-6 text-dark dark:text-light hover:scale-110 transition-transform" aria-label={`View ${title} on GitHub`}>
            <GithubIcon />
          </Link>
        </div>
      </div>
    </article>
  );
};

import ProjectsShowcase from "@/components/ProjectsShowcase";

export default function Home() {
  const [mode] = useThemeSwitcher();
  const [leetcodeSolvedCount, setLeetcodeSolvedCount] = useState(270);
  const [topLanguage, setTopLanguage] = useState("Java");
  const router = useRouter();
  const { openContactModal } = useContactModal();

  useEffect(() => {
    fetch("/api/leetcode?username=urva_gandhi")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          const totalSolved = data.submitStats?.acSubmissionNum?.find(q => q.difficulty === "All")?.count
            || data.submitStats?.acSubmissionNum?.[0]?.count;
          if (totalSolved) {
            setLeetcodeSolvedCount(totalSolved);
          }
          const topLang = data.languages?.length > 0
            ? [...data.languages].sort((a, b) => b.problemsSolved - a.problemsSolved)[0]?.languageName
            : null;
          if (topLang) {
            setTopLanguage(topLang);
          }
        }
      })
      .catch((err) => console.error("Failed to fetch Leetcode count for index page", err));
  }, []);

  // Handle smooth auto-scrolling when navigating to a hash target from another page (e.g. /docs -> /#projects)
  useEffect(() => {
    if (router.isReady) {
      const hash = window.location.hash;
      if (hash) {
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 400);
      }
    }
  }, [router.isReady, router.asPath]);

  return (
    <>
      <Head>
        <title>Urva Gandhi | Full-Stack Developer Portfolio</title>
        <meta
          name="description"
          content="Urva Gandhi — Computer Science undergraduate at Nirma University. Full-stack developer specializing in React.js, Spring Boot, and Machine Learning. 3x Hackathon Winner across 500+ teams. Explore projects, skills, and experience."
        />

        {/* SEO meta tags */}
        <meta name="keywords" content="Urva Gandhi, Urva Gandhi portfolio, full-stack developer, software engineer, Nirma University, React developer, Spring Boot developer, machine learning engineer, hackathon winner, Java developer, Python developer, web developer portfolio, computer science student" />
        <meta name="author" content="Urva Gandhi" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href="https://urvagandhi-portfolio.vercel.app/" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://urvagandhi-portfolio.vercel.app/" />
        <meta property="og:site_name" content="Urva Gandhi Portfolio" />
        <meta property="og:title" content="Urva Gandhi | Full-Stack Developer Portfolio" />
        <meta property="og:description" content="Full-stack developer specializing in React.js, Spring Boot, and Machine Learning. 3x Hackathon Winner across 500+ teams. View projects, skills, and experience." />
        <meta property="og:image" content="https://urvagandhi-portfolio.vercel.app/images/profile/urva.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Urva Gandhi — Full-Stack Developer" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Urva Gandhi | Full-Stack Developer Portfolio" />
        <meta name="twitter:description" content="Full-stack developer specializing in React.js, Spring Boot, and Machine Learning. Explore projects and experience." />
        <meta name="twitter:image" content="https://urvagandhi-portfolio.vercel.app/images/profile/urva.png" />
        <meta name="twitter:image:alt" content="Urva Gandhi — Full-Stack Developer" />

        {/* JSON-LD Structured Data for Google Knowledge Graph */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://urvagandhi-portfolio.vercel.app/#website",
                  "name": "Urva Gandhi Portfolio",
                  "url": "https://urvagandhi-portfolio.vercel.app",
                  "description": "Portfolio of Urva Gandhi — Full-Stack Developer & ML Engineer",
                  "inLanguage": "en-US"
                },
                {
                  "@type": "WebPage",
                  "@id": "https://urvagandhi-portfolio.vercel.app/#webpage",
                  "url": "https://urvagandhi-portfolio.vercel.app/",
                  "name": "Urva Gandhi | Full-Stack Developer Portfolio",
                  "isPartOf": { "@id": "https://urvagandhi-portfolio.vercel.app/#website" },
                  "about": { "@id": "https://urvagandhi-portfolio.vercel.app/#person" },
                  "description": "Portfolio showcasing projects, skills, and experience of Urva Gandhi — a full-stack developer and ML engineer.",
                  "inLanguage": "en-US"
                },
                {
                  "@type": "Person",
                  "@id": "https://urvagandhi-portfolio.vercel.app/#person",
                  "name": "Urva Gandhi",
                  "url": "https://urvagandhi-portfolio.vercel.app",
                  "image": "https://urvagandhi-portfolio.vercel.app/images/profile/urva.png",
                  "jobTitle": "Full-Stack Developer",
                  "description": "Computer Science undergraduate at Nirma University. Full-stack developer with expertise in React.js, Spring Boot, and Machine Learning.",
                  "alumniOf": {
                    "@type": "CollegeOrUniversity",
                    "name": "Nirma University",
                    "url": "https://www.nirmauni.ac.in/"
                  },
                  "knowsAbout": [
                    "Full-Stack Development",
                    "React.js",
                    "Next.js",
                    "Spring Boot",
                    "Java",
                    "Python",
                    "Machine Learning",
                    "Artificial Intelligence",
                    "Data Structures and Algorithms",
                    "System Design"
                  ],
                  "sameAs": [
                    "https://github.com/urvagandhi",
                    "https://leetcode.com/u/urva_gandhi"
                  ]
                }
              ]
            })
          }}
        />
      </Head>
      <TransitionEffect />

      {/* Hero Section */}
      <section id="home" className="flex min-h-screen items-center text-dark dark:text-light pt-24">
        <Layout className="!pt-0 md:!pt-16 sm:!pt-8">
          <div className="flex w-full items-center justify-between lg:flex-col">
            <div className="w-1/2 flex items-center justify-center lg:w-full lg:inline-block lg:mb-10 md:mb-8">
              <div className="w-[80%] max-w-[400px] lg:w-full lg:max-w-full lg:flex lg:justify-center">
                <Image
                  src={profilePic}
                  alt="Urva Gandhi"
                  className="h-auto w-full rounded-2xl"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                  priority
                />
              </div>
            </div>
            <div className="flex w-1/2 flex-col items-center self-center lg:w-full lg:text-center">
              <TypewriterText
                text="Building Intelligent Systems & Transforming Ideas into Production Code."
                className="!text-left !text-6xl xl:!text-5xl lg:!text-center lg:!text-6xl md:!text-5xl sm:!text-3xl"
              />
              <p className="my-4 text-base font-medium md:text-sm sm:!text-xs">
                I don&apos;t just write code — I architect solutions. Full-stack developer × ML enthusiast × 
                Hackathon winner. Obsessed with building systems that actually matter.
              </p>
              <div className="mt-2 flex items-center self-start lg:self-center">
                <AnimatedDownloadButton href="/urva-gandhi_resume.pdf" />
                <button
                  onClick={openContactModal}
                  className="ml-4 text-lg font-medium capitalize text-dark underline dark:text-light md:text-base cursor-pointer hover:text-primary dark:hover:text-primaryDark transition-colors"
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
        </Layout>
        <HireMe />
      </section>

      {/* About Section */}
      <section id="about" className="relative w-full dark:text-light border-t-2 border-solid border-dark dark:border-light overflow-hidden">
        {/* About Section Content */}
        <Layout className="relative pt-16 z-10">
          <div className="w-full flex justify-center mb-16 sm:mb-8">
            <SectionHeading title="About Me" subTitle="GET TO KNOW" theme="emerald" />
          </div>
          <div className="grid w-full grid-cols-8 gap-16 sm:gap-8">
            <div className="col-span-3 flex flex-col items-start justify-start xl:col-span-4 md:order-2 md:col-span-8">
              <h2 className="mb-4 text-lg font-bold uppercase text-dark/75 dark:text-light/75">
                Biography
              </h2>
              <p className="font-medium">
                Hi, I&apos;m <strong>Urva Gandhi</strong>, a Computer Science undergraduate at Nirma University.
                I&apos;m a <strong>passionate software engineer</strong> who thrives at the intersection of
                <strong> backend architecture</strong> and <strong>artificial intelligence</strong>. My journey involves
                transforming complex ideas into elegant, production-ready solutions.
              </p>
              <p className="my-4 font-medium">
                Currently, I&apos;m building <strong>CoinTrack</strong> (Unified financial analytics) and
                <strong> CodeGuardian</strong> (AI-powered secure code analysis). I&apos;m deep diving into
                Data Structures & Algorithms mastery, LLM Application Development & RAG systems, and
                High-Performance Backend & System Design.
              </p>
              <p className="font-medium">
                Open to collaborating on real-time financial data pipelines, ML deployment workflows & MLOps,
                and turning Hackathon prototypes into Production systems. I&apos;ve solved{" "}
                <Link href="https://leetcode.com/u/urva_gandhi" target="_blank" className="underline underline-offset-2 text-primary dark:text-primaryDark">
                  {leetcodeSolvedCount}+ DSA problems in {topLanguage}
                </Link>{" "}
                and completed 4+ major projects.
              </p>
            </div>

            <div className="relative col-span-3 h-max rounded-2xl border-2 border-solid border-dark bg-light p-8 shadow-2xl dark:border-primaryDark/30 dark:bg-dark dark:shadow-dark-glow xl:col-span-4 md:col-span-8 md:order-1">
              <div className="absolute -right-5 -bottom-5 -z-10 h-full w-full rounded-[2rem] rounded-br-3xl bg-dark dark:bg-primaryDark/20 md:-right-3 md:-bottom-3" />
              <BorderBeam size={200} duration={10} delay={5} colorFrom="#58E6D9" colorTo="#8B5CF6" />
              <Image
                src={profilePic2}
                alt="Urva Gandhi"
                className="h-auto w-full rounded-2xl"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            <div className="col-span-2 flex flex-col items-end justify-between xl:col-span-8 xl:flex-row xl:items-center md:order-3">
              <Link href="https://leetcode.com/u/urva_gandhi" target="_blank" className="flex flex-col items-end justify-center xl:items-center group">
                <span className="inline-block text-7xl font-bold md:text-6xl sm:text-5xl xs:text-4xl group-hover:text-primary dark:group-hover:text-primaryDark transition-colors duration-300">
                  <AnimatedNumbers value={leetcodeSolvedCount} />+
                </span>
                <h2 className="mb-4 text-xl font-medium capitalize text-dark/75 dark:text-light/75 xl:text-center md:text-lg sm:text-base xs:text-sm group-hover:text-primary dark:group-hover:text-primaryDark transition-colors duration-300">
                  LeetCode Problems
                </h2>
              </Link>

              <div className="flex flex-col items-end justify-center xl:items-center">
                <span className="inline-block text-7xl font-bold md:text-6xl sm:text-5xl xs:text-4xl">
                  <AnimatedNumbers value={4} />+
                </span>
                <h2 className="mb-4 text-xl font-medium capitalize text-dark/75 dark:text-light/75 xl:text-center md:text-lg sm:text-base xs:text-sm">
                  projects completed
                </h2>
              </div>

              <div className="flex flex-col items-end justify-center xl:items-center">
                <span className="inline-block text-7xl font-bold md:text-6xl sm:text-5xl xs:text-4xl">
                  <AnimatedNumbers value={3} />x
                </span>
                <h2 className="mb-4 text-xl font-medium capitalize text-dark/75 dark:text-light/75 xl:text-center md:text-lg sm:text-base xs:text-sm">
                  Hackathon Winner
                </h2>
              </div>
            </div>
          </div>

          <Skills />
          <Internship />
          <Experience />
          <Education />
        </Layout>
      </section>

      {/* Contributions Section */}
      <section id="contributions" className="w-full mb-16 dark:text-light border-t-2 border-solid border-dark dark:border-light">
        <Layout className="pt-16">
          <div className="w-full flex justify-center mb-16 sm:mb-8">
            <SectionHeading title="Contributions" subTitle="MY ACTIVITY" theme="emerald" />
          </div>
          <div className="w-full grid grid-cols-2 gap-8 xl:grid-cols-1">
            <GithubGraph username="urvagandhi" themeMode={mode} />
            <LeetcodeGraph username="urva_gandhi" themeMode={mode} />
          </div>
          <CodingProfiles />
        </Layout>
      </section>

      {/* Projects Section */}
      <section id="projects" className="w-full mb-16 dark:text-light border-t-2 border-solid border-dark dark:border-light">
        <Layout className="pt-16">
          <div className="w-full flex justify-center mb-16 sm:mb-8">
            <SectionHeading title="Projects" subTitle="MY WORK" theme="blue" />
          </div>
          <ProjectsShowcase />
        </Layout>
      </section>

      {/* Semantic HTML Fallback Container for Non-JS Crawlers & AI Agent Discovery */}
      <section className="sr-only" aria-label="Urva Gandhi Developer & Agent Summary">
        <h1>Urva Yogeshkumar Gandhi - Backend &amp; AI Systems Engineer</h1>
        <p>
          Urva Gandhi is a final-year Computer Science &amp; Engineering undergraduate at Nirma University (Minor in Adaptive AI, CGPA: 8.83/10).
          He is a production-level Java backend developer and 3x Hackathon Winner specializing in Spring Boot, Microservices, Hexagonal Architecture, and Multi-Agent AI systems.
        </p>

        <h2>Who This Site Is For</h2>
        <p>Technical recruiters, software engineering leads, hiring managers, and autonomous AI agents seeking backend software engineers, Spring Boot developers, and AI systems consultants.</p>

        <h2>Pricing, Rates &amp; Availability</h2>
        <ul>
          <li>Open for Full-Time Software / Backend Engineer roles.</li>
          <li>Open for Spring Boot &amp; Microservices contract development.</li>
          <li>Open for AI Systems consulting &amp; software internships.</li>
          <li>Public REST API &amp; MCP Server endpoints: Free ($0) open access with standard 100 req/min rate limit. Zero recruitment platform fee.</li>
        </ul>

        <h2>Key Differentiation</h2>
        <ul>
          <li>Academic Record: CGPA 8.83 / 10 in B.Tech CSE (Minor: Adaptive AI) at Institute of Technology, Nirma University.</li>
          <li>3x Hackathon Winner: 1st Place Health AI Hackathon 2025 (140+ teams), Track Runner-Up HACKaMINeD 2026 (400+ teams), 2nd Runner-Up Odoo Hackathon 2026.</li>
          <li>Verified DSA Stats: Solved 300+ LeetCode problems (Rating 1637, Top 19.46%). Active on Codeforces and CodeChef.</li>
          <li>Featured Projects: CoinTrack (Java Spring Boot Hexagonal Architecture), FleetFlow (Prisma/PostgreSQL), Agent Paperpal (CrewAI multi-agent formatter), RWEsearch (Healthcare analytics).</li>
        </ul>

        <h2>Contact Information</h2>
        <p>Email: 23bce078@nirmauni.ac.in | urvagandhi24@gmail.com | Phone: +91-8866241204</p>
      </section>
    </>
  );
}
