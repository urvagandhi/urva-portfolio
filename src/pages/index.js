import AnimatedText from "@/components/AnimatedText";
import TypewriterText from "@/components/TypewriterText";
import AnimatedDownloadButton from "@/components/AnimatedDownloadButton";
import Education from "@/components/Education";
import Experience from "@/components/Experience";
import HireMe from "@/components/HireMe";
import { GithubIcon, LinkArrow } from "@/components/Icons";
import Layout from "@/components/Layout";
import Skills from "@/components/Skills";
import TransitionEffect from "@/components/TransitionEffect";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import profilePic from "../../public/images/profile/urva.png";
import profilePic2 from "../../public/images/profile/urva_2.jpeg";

const FramerImage = motion.create(Image);

const AnimatedNumbers = ({ value }) => {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 3000 });
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, value, isInView]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current && latest.toFixed(0) <= value) {
        ref.current.textContent = latest.toFixed(0);
      }
    });
  }, [springValue, value]);

  return <span ref={ref}></span>;
};

const FeaturedProject = ({ type, title, summary, img, link, github }) => {
  return (
    <article className="relative flex w-full items-center justify-between rounded-3xl rounded-br-2xl border border-solid border-dark bg-light p-12 shadow-2xl dark:border-primaryDark/30 dark:bg-dark dark:shadow-dark-glow lg:flex-col lg:p-8 xs:rounded-2xl xs:rounded-br-3xl xs:p-4">
      <div className="absolute -right-5 -bottom-5 -z-10 h-full w-full rounded-[2.5rem] rounded-br-3xl bg-dark dark:bg-primaryDark/20 md:-right-3 md:-bottom-3 xs:-right-2 xs:-bottom-2 xs:rounded-[1.5rem]" />
      <Link
        href={link}
        target="_blank"
        className="w-1/2 cursor-pointer overflow-hidden rounded-lg lg:w-full"
      >
        <FramerImage
          src={img}
          alt={title}
          className="h-auto w-full"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          width={1280}
          height={720}
          priority
        />
      </Link>
      <div className="flex w-1/2 flex-col items-start justify-between pl-6 lg:w-full lg:pl-0 lg:pt-6">
        <span className="text-xl font-medium text-primary dark:text-primaryDark xs:text-base">
          {type}
        </span>
        <Link href={link} target="_blank" className="underline-offset-2 hover:underline">
          <h2 className="my-2 w-full text-left text-4xl font-bold lg:text-3xl xs:text-2xl dark:text-light">
            {title}
          </h2>
        </Link>
        <p className="my-2 rounded-md font-medium text-dark dark:text-light sm:text-sm">
          {summary}
        </p>
        <div className="mt-2 flex items-center">
          <Link href={github} target="_blank" className="w-10" aria-label={`View ${title} on GitHub`}>
            <GithubIcon />
          </Link>
          <Link
            href={link}
            target="_blank"
            className="ml-4 rounded-lg bg-dark p-2 px-6 text-lg font-semibold text-light dark:bg-primaryDark dark:text-dark dark:hover:bg-primaryDark/80 transition-all duration-300 sm:px-4 sm:text-base"
          >
            Visit Project
          </Link>
        </div>
      </div>
    </article>
  );
};

const Project = ({ type, title, summary, img, link, github }) => {
  return (
    <article className="relative flex w-full flex-col items-center justify-center rounded-2xl rounded-br-2xl border border-solid border-dark bg-light p-6 shadow-2xl dark:border-primaryDark/30 dark:bg-dark dark:shadow-dark-glow xs:p-4">
      <div className="absolute -right-5 -bottom-5 -z-10 h-full w-full rounded-[2rem] rounded-br-3xl bg-dark dark:bg-primaryDark/20 md:-right-3 md:-bottom-3 xs:-right-2 xs:-bottom-2 xs:rounded-[1.5rem]" />
      <Link
        href={link}
        target="_blank"
        className="w-full cursor-pointer overflow-hidden rounded-lg"
      >
        <FramerImage
          src={img}
          alt={title}
          className="h-auto w-full"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          width={1280}
          height={720}
        />
      </Link>
      <div className="mt-4 flex w-full flex-col items-start justify-between">
        <span className="text-xl font-medium text-primary dark:text-primaryDark lg:text-lg md:text-base">
          {type}
        </span>
        <Link href={link} target="_blank" className="underline-offset-2 hover:underline">
          <h2 className="my-2 w-full text-left text-3xl font-bold lg:text-2xl dark:text-light">
            {title}
          </h2>
        </Link>
        {summary && (
          <p className="my-2 rounded-md font-medium text-dark dark:text-light sm:text-sm text-sm">
            {summary}
          </p>
        )}
        <div className="flex w-full items-center justify-between mt-2">
          <Link
            href={link}
            target="_blank"
            className="rounded text-lg font-medium underline md:text-base dark:text-light"
          >
            Visit
          </Link>
          <Link href={github} target="_blank" className="w-8 md:w-6" aria-label={`View ${title} on GitHub`}>
            <GithubIcon />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default function Home() {
  return (
    <>
      <Head>
        <title>Urva Gandhi | Full-Stack Developer Portfolio</title>
        <meta
          name="description"
          content="Urva Gandhi - Computer Science undergraduate at Nirma University. Full-stack developer with expertise in React.js, Spring Boot, and Machine Learning. 1st Place Winner at RWEsearch Health AI Hackathon 2025."
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
                  sizes="(max-width: 768px) 100vw, 400px"
                  priority
                  fetchPriority="high"
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
                <AnimatedDownloadButton href="/resume.pdf" />
                <Link
                  href="mailto:urvagandhi24@gmail.com"
                  className="ml-4 text-lg font-medium capitalize text-dark underline dark:text-light md:text-base"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </Layout>
        <HireMe />
      </section>

      {/* About Section */}
      <section id="about" className="w-full dark:text-light border-t-2 border-solid border-dark dark:border-light">
        <Layout className="pt-16">
          <AnimatedText
            text="About Me"
            className="mb-16 !text-8xl !leading-tight lg:!text-7xl sm:!text-6xl xs:!text-4xl sm:mb-8"
          />
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
                and turning Hackathon prototypes into Production systems. I&apos;ve solved {" "}
                <Link href="https://leetcode.com/Urva_Gandhi/" target="_blank" className="underline underline-offset-2 text-primary dark:text-primaryDark">
                  150+ LeetCode problems
                </Link>{" "}
                and completed 4+ major projects.
              </p>
            </div>

            <div className="relative col-span-3 h-max rounded-2xl border-2 border-solid border-dark bg-light p-8 shadow-2xl dark:border-primaryDark/30 dark:bg-dark dark:shadow-dark-glow xl:col-span-4 md:col-span-8 md:order-1">
              <div className="absolute -right-5 -bottom-5 -z-10 h-full w-full rounded-[2rem] rounded-br-3xl bg-dark dark:bg-primaryDark/20 md:-right-3 md:-bottom-3" />
              <Image
                src={profilePic2}
                alt="Urva Gandhi"
                className="h-auto w-full rounded-2xl"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            <div className="col-span-2 flex flex-col items-end justify-between xl:col-span-8 xl:flex-row xl:items-center md:order-3">
              <Link href="https://leetcode.com/Urva_Gandhi/" target="_blank" className="flex flex-col items-end justify-center xl:items-center group">
                <span className="inline-block text-7xl font-bold md:text-6xl sm:text-5xl xs:text-4xl group-hover:text-primary dark:group-hover:text-primaryDark transition-colors duration-300">
                  <AnimatedNumbers value={150} />+
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
                  <AnimatedNumbers value={1} />+
                </span>
                <h2 className="mb-4 text-xl font-medium capitalize text-dark/75 dark:text-light/75 xl:text-center md:text-lg sm:text-base xs:text-sm">
                  Hackathons Won
                </h2>
              </div>
            </div>
          </div>

          <Skills />
          <Experience />
          <Education />
        </Layout>
      </section>

      {/* Projects Section */}
      <section id="projects" className="w-full mb-16 dark:text-light border-t-2 border-solid border-dark dark:border-light">
        <Layout className="pt-16">
          <AnimatedText
            text="My Projects"
            className="mb-16 !text-8xl !leading-tight lg:!text-7xl sm:mb-8 sm:!text-6xl xs:!text-4xl"
          />
          <div className="grid grid-cols-12 gap-24 gap-y-32 xl:gap-x-16 lg:gap-x-8 md:gap-y-24 sm:gap-x-0">
            <div className="col-span-12">
              <FeaturedProject
                type="Featured Project - Finance | Ongoing"
                title="CoinTrack"
                summary="Unified finance dashboard aggregating portfolio data from multiple stock broker APIs (Zerodha, Angel One, etc.) into a single view. Features P&L tracking, live market data, watchlist, and exportable reports. Tech: Spring Boot (Java 21), JWT, MongoDB, Next.js."
                img="/images/projects/coinTrack.png"
                link="https://github.com/urvagandhi/cointrack"
                github="https://github.com/urvagandhi/cointrack"
              />
            </div>
            <div className="col-span-6 sm:col-span-12">
              <Project
                type="Full-Stack & ML | 🏆 1st Place Winner"
                title="RWEsearch - Healthcare Analytics"
                summary="Built a platform predicting hospital readmissions (30/60/90 days) with Smart Model Loader for instant ML evaluation. Features interactive Streamlit dashboard with visualizations. Tech: Python, Streamlit, Scikit-learn, XGBoost, Docker."
                img="/images/projects/RWEsearch.png"
                link="https://github.com/urvagandhi/RWEsearch-Hackathon"
                github="https://github.com/urvagandhi/RWEsearch-Hackathon"
              />
            </div>
            <div className="col-span-6 sm:col-span-12">
              <Project
                type="AI & Document Intelligence | Adobe Hackathon"
                title="Connecting the Dots: PDF Intelligence"
                summary="Offline PDF analysis engine built for Adobe Hackathon. Features structured outline extraction with hierarchy detection, and persona-driven document intelligence that adapts content for different user roles. Tech: Python, PyMuPDF, Docker."
                img="/images/projects/Adobe_PDF.png"
                link="https://github.com/urvagandhi/CTRL_ALT_Adobe-PS_1A"
                github="https://github.com/urvagandhi/CTRL_ALT_Adobe-PS_1B"
              />
            </div>
            <div className="col-span-12">
              <FeaturedProject
                type="Featured Project - AI Security"
                title="CodeGuardian"
                summary="AI-driven multi-language vulnerability detection engine using graph-aware transformers and static analysis. Auto-scans code to identify security flaws, maps to CWE/CVE, and generates explainable remediation suggestions. Tech: Python, PyTorch, Transformers, LoRA/QLoRA."
                img="/images/projects/codeGuardian.jpeg"
                link="https://github.com/Harsh204k/codeGuardian"
                github="https://github.com/Harsh204k/codeGuardian"
              />
            </div>
          </div>
        </Layout>
      </section>
    </>
  );
}
