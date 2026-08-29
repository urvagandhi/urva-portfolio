import AnimatedText from "@/components/AnimatedText";
import Layout from "@/components/Layout";
import TransitionEffect from "@/components/TransitionEffect";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import profilePic from "../../public/images/profile/urva.png";
import Education from "@/components/Education";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import SectionHeading from "@/components/SectionHeading";
import { BorderBeam } from "@/components/magicui/border-beam";
import { 
  GraduationCap, 
  Award, 
  MapPin, 
  Mail, 
  Phone, 
  Code2, 
  Briefcase, 
  Trophy, 
  CheckCircle2, 
  Sparkles 
} from "lucide-react";

export default function About() {
  return (
    <>
      <Head>
        <title>About Urva Yogeshkumar Gandhi | Software &amp; AI Systems Engineer</title>
        <meta 
          name="description" 
          content="Official portfolio about page of Urva Yogeshkumar Gandhi, final year Computer Science undergraduate at Nirma University (Minor in Adaptive AI, CGPA: 8.83/10). Java, Spring Boot, Microservices, AI/ML, NLP specialist." 
        />
      </Head>
      <TransitionEffect />
      <main className="flex w-full flex-col items-center justify-center text-dark dark:text-light pt-24 pb-16">
        <Layout className="pt-16">
          <div className="w-full flex justify-center mb-12 sm:mb-8">
            <SectionHeading title="About Me" subTitle="BIOGRAPHY &amp; EXPERTISE" theme="emerald" />
          </div>

          <AnimatedText 
            text="Engineering Solutions with Purpose!" 
            className="mb-16 lg:!text-6xl sm:!text-5xl xs:!text-3xl text-center" 
          />

          <div className="grid w-full grid-cols-8 gap-16 lg:gap-10 sm:gap-8 md:grid-cols-1">
            {/* Biography Column */}
            <div className="col-span-5 flex flex-col items-start justify-start md:col-span-8">
              <h1 className="text-3xl font-extrabold uppercase text-dark/85 dark:text-light/85 mb-4 flex items-center gap-2">
                <span>About Urva Yogeshkumar Gandhi</span>
              </h1>
              
              <p className="font-medium leading-relaxed mb-4 text-dark/80 dark:text-light/80 text-base">
                Hi, I&apos;m <strong>Urva Yogeshkumar Gandhi</strong>, a final-year Computer Science &amp; Engineering undergraduate at <strong>Institute of Technology, Nirma University</strong> (Minor: Adaptive AI, CGPA: 8.83/10). I specialize in production-level Java backend development, Spring Boot microservices, enterprise security architectures, and hands-on AI/ML engineering (multi-agent systems, NLP, predictive ML). I am a 3x national hackathon winner.
              </p>

              <p className="font-medium leading-relaxed mb-6 text-dark/80 dark:text-light/80 text-base">
                My core passion lies in the <strong>Java ecosystem (Spring Boot, Spring Security, Microservices, REST APIs, PostgreSQL, MongoDB, Docker, Hexagonal Architecture)</strong> as well as <strong>AI Systems (Multi-Agent Workflows with CrewAI, Google Gemini API, Scikit-learn, TensorFlow)</strong>.
              </p>

              <h2 className="text-xl font-bold text-primary dark:text-primaryDark mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                <span>Work Experience &amp; Internships</span>
              </h2>
              <div className="p-4 rounded-2xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10 mb-6 w-full">
                <p className="font-medium leading-relaxed text-dark/80 dark:text-light/80 text-sm">
                  Worked as a <strong>Backend Developer Intern at Kautilyam</strong> (04 May 2026 – 27 Jun 2026), contributing to scalable web applications, business logic, data workflows, and MongoDB integrations using Core Java, Spring Boot, and ReactJS.
                </p>
              </div>

              <h2 className="text-xl font-bold text-primary dark:text-primaryDark mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <span>Major Projects &amp; Hackathon Victories</span>
              </h2>
              <ul className="space-y-3 font-medium text-dark/80 dark:text-light/80 mb-6 w-full text-sm">
                <li className="p-4 rounded-2xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10">
                  <strong className="text-dark dark:text-light text-base block mb-1">CoinTrack (Multi-Broker Finance Platform):</strong> 
                  Shipped a 45+ REST endpoint platform in Java &amp; Spring Boot with hexagonal architecture, aggregating Zerodha, Angel One, and Upstox portfolios into a real-time dashboard with Google OAuth 2.0, mandatory TOTP 2FA, AES-256-GCM encryption, JWT refresh rotation, and Caffeine caching.
                </li>
                <li className="p-4 rounded-2xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10">
                  <strong className="text-dark dark:text-light text-base block mb-1">FleetFlow (Fleet &amp; Logistics System):</strong> 
                  Built a fleet management platform with 30+ APIs, Socket.IO, PostgreSQL, Prisma ORM, and Docker. Secured <span className="text-primary dark:text-primaryDark font-bold">2nd Runner-Up at Odoo x Gujarat Vidyapith Hackathon 2026</span>.
                </li>
                <li className="p-4 rounded-2xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10">
                  <strong className="text-dark dark:text-light text-base block mb-1">Agent Paperpal (Agentic AI Formatter):</strong> 
                  Built a multi-agent manuscript compliance system (CrewAI, Google Gemini API, ReactJS). Won <span className="text-primary dark:text-primaryDark font-bold">Track Runner-Up at HACKaMINeD 2026</span> (400+ teams, 2300+ registrations).
                </li>
                <li className="p-4 rounded-2xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10">
                  <strong className="text-dark dark:text-light text-base block mb-1">RWEsearch (Healthcare Analytics):</strong> 
                  Built ML hospital readmission prediction pipelines (XGBoost, Deep Learning) and Streamlit UI. Won <span className="text-primary dark:text-primaryDark font-bold">1st Place at Health AI Innovation Hackathon 2025</span> (140+ teams).
                </li>
              </ul>

              <p className="font-medium leading-relaxed text-dark/80 dark:text-light/80 text-sm">
                I have solved <strong>300+ DSA problems on LeetCode</strong> (Contest Rating 1637, Top 19.46%) and actively participate on Codeforces and CodeChef.
              </p>
            </div>

            {/* Profile Image & Verified Quick Facts */}
            <div className="col-span-3 flex flex-col items-center justify-start md:col-span-8">
              <div className="relative h-max rounded-3xl border border-dark/10 bg-light/80 p-6 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-2xl w-full max-w-sm overflow-hidden">
                <BorderBeam size={220} duration={10} delay={0} colorFrom="#58E6D9" colorTo="#8B5CF6" />
                <Image 
                  src={profilePic} 
                  alt="Urva Yogeshkumar Gandhi" 
                  className="h-auto w-full rounded-2xl object-cover" 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 384px"
                  priority 
                />
              </div>

              <div className="mt-8 w-full rounded-3xl border border-dark/10 bg-light/80 p-6 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md text-sm space-y-3 shadow-xl">
                <div className="flex items-center gap-2 pb-2 border-b border-dark/10 dark:border-light/10">
                  <Sparkles className="w-5 h-5 text-primary dark:text-primaryDark" />
                  <h3 className="font-bold text-base text-dark dark:text-light">Verified Academic Details</h3>
                </div>

                <div className="flex items-start gap-3">
                  <GraduationCap className="w-4 h-4 text-primary dark:text-primaryDark flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-dark dark:text-light">Institute:</span> Nirma University (2023 - 2027)
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Award className="w-4 h-4 text-primary dark:text-primaryDark flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-dark dark:text-light">Degree &amp; CGPA:</span> B.Tech CSE (Minor: Adaptive AI) • <strong>8.83 / 10</strong>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary dark:text-primaryDark flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-dark dark:text-light">Location:</span> Ahmedabad, Gujarat, India - 380051
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-dark/10 dark:border-light/10">
                  <Mail className="w-4 h-4 text-primary dark:text-primaryDark flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 font-mono text-xs min-w-0">
                    <div>
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Personal Email</span>
                      <strong className="text-dark dark:text-light break-all">urvagandhi24@gmail.com</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">University Email</span>
                      <span className="text-dark/80 dark:text-light/80 break-all">23bce078@nirmauni.ac.in</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-dark/10 dark:border-light/10">
                  <Phone className="w-4 h-4 text-primary dark:text-primaryDark flex-shrink-0 mt-0.5" />
                  <div className="font-mono text-xs text-dark dark:text-light font-bold">
                    +91-8866241204
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 w-full">
            <Skills />
          </div>

          <div className="mt-20 w-full">
            <Experience />
          </div>

          <div className="mt-20 w-full">
            <Education />
          </div>
        </Layout>
      </main>
    </>
  );
}
