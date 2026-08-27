import AnimatedText from "@/components/AnimatedText";
import Layout from "@/components/Layout";
import TransitionEffect from "@/components/TransitionEffect";
import Head from "next/head";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import { BorderBeam } from "@/components/magicui/border-beam";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Github, 
  Linkedin, 
  ExternalLink,
  Copy,
  Check,
  UserCheck
} from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [copiedPersonal, setCopiedPersonal] = useState(false);
  const [copiedCollege, setCopiedCollege] = useState(false);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'personal') {
      setCopiedPersonal(true);
      setTimeout(() => setCopiedPersonal(false), 2000);
    } else {
      setCopiedCollege(true);
      setTimeout(() => setCopiedCollege(false), 2000);
    }
  };

  return (
    <>
      <Head>
        <title>Contact Urva Yogeshkumar Gandhi | Software &amp; AI Engineer</title>
        <meta 
          name="description" 
          content="Contact details for Urva Yogeshkumar Gandhi (B.Tech Computer Science & Engineering, Nirma University). Personal Email: urvagandhi24@gmail.com, College Email: 23bce078@nirmauni.ac.in. Phone: +91-8866241204." 
        />
      </Head>
      <TransitionEffect />
      <main className="flex w-full flex-col items-center justify-center text-dark dark:text-light pt-24 pb-16">
        <Layout className="pt-16">
          <div className="w-full flex justify-center mb-12 sm:mb-8">
            <SectionHeading title="Contact Me" subTitle="GET IN TOUCH" theme="emerald" />
          </div>

          <AnimatedText 
            text="Let's Connect &amp; Build Something Great!" 
            className="mb-8 lg:!text-5xl sm:!text-4xl xs:!text-2xl text-center max-w-4xl mx-auto" 
          />

          <div className="max-w-4xl mx-auto w-full">
            <p className="text-lg text-dark/75 dark:text-light/75 text-center mb-12 max-w-2xl mx-auto leading-relaxed">
              If you are a recruiter, engineering manager, or collaborator looking for strong <strong>Java / Spring Boot backend development</strong>, microservices, or <strong>AI systems engineering</strong> skills, reach out directly below.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Card 1: Direct Email Addresses */}
              <div className="relative p-8 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/40 dark:hover:border-primaryDark/40">
                <BorderBeam size={220} duration={12} delay={0} colorFrom="#58E6D9" colorTo="#8B5CF6" />
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-primary/10 dark:bg-primaryDark/20 text-primary dark:text-primaryDark border border-primary/20">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark dark:text-light">Email Channels</h2>
                      <p className="text-xs text-dark/60 dark:text-light/60">Primary channels for recruitment &amp; proposals</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    {/* 1. Personal Email (FIRST) */}
                    <div className="p-4 rounded-2xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10 flex items-center justify-between gap-3 group hover:border-primary/40 transition-colors">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                            Personal Email (Preferred)
                          </span>
                        </div>
                        <span className="font-mono text-sm font-bold text-dark dark:text-light truncate">
                          urvagandhi24@gmail.com
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => copyToClipboard('urvagandhi24@gmail.com', 'personal')}
                          className="p-2 rounded-xl bg-dark/10 dark:bg-light/10 text-dark dark:text-light hover:bg-primary hover:text-light dark:hover:bg-primaryDark dark:hover:text-dark transition-colors"
                          title="Copy Email"
                          aria-label="Copy Personal Email"
                        >
                          {copiedPersonal ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <Link 
                          href="mailto:urvagandhi24@gmail.com" 
                          className="p-2 rounded-xl bg-dark text-light dark:bg-light dark:text-dark hover:opacity-90 transition-opacity"
                          title="Send Email"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    {/* 2. College Email (SECOND) */}
                    <div className="p-4 rounded-2xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10 flex items-center justify-between gap-3 group hover:border-primary/40 transition-colors">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 inline" /> Nirma University Email
                          </span>
                        </div>
                        <span className="font-mono text-sm font-bold text-dark dark:text-light truncate">
                          23bce078@nirmauni.ac.in
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => copyToClipboard('23bce078@nirmauni.ac.in', 'college')}
                          className="p-2 rounded-xl bg-dark/10 dark:bg-light/10 text-dark dark:text-light hover:bg-primary hover:text-light dark:hover:bg-primaryDark dark:hover:text-dark transition-colors"
                          title="Copy Email"
                          aria-label="Copy College Email"
                        >
                          {copiedCollege ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <Link 
                          href="mailto:23bce078@nirmauni.ac.in" 
                          className="p-2 rounded-xl bg-dark text-light dark:bg-light dark:text-dark hover:opacity-90 transition-opacity"
                          title="Send Email"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <Link 
                  href="mailto:urvagandhi24@gmail.com" 
                  className="w-full text-center py-3.5 rounded-2xl bg-dark text-light dark:bg-light dark:text-dark font-bold hover:opacity-90 transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Direct Email</span>
                </Link>
              </div>

              {/* Card 2: Phone & Social Networks */}
              <div className="relative p-8 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/40 dark:hover:border-primaryDark/40">
                <BorderBeam size={220} duration={12} delay={6} colorFrom="#8B5CF6" colorTo="#58E6D9" />
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-primary/10 dark:bg-primaryDark/20 text-primary dark:text-primaryDark border border-primary/20">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark dark:text-light">Phone &amp; Networks</h2>
                      <p className="text-xs text-dark/60 dark:text-light/60">Phone numbers &amp; developer profiles</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {/* Phone Number */}
                    <div className="p-4 rounded-2xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-primary dark:text-primaryDark flex-shrink-0" />
                        <span className="font-mono text-sm font-bold text-dark dark:text-light">
                          +91-8866241204 / +91-7203030498
                        </span>
                      </div>
                    </div>

                    {/* GitHub Link */}
                    <Link 
                      href="https://github.com/urvagandhi" 
                      target="_blank" 
                      className="p-4 rounded-2xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10 flex items-center justify-between hover:border-primary/40 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Github className="w-5 h-5 text-dark dark:text-light group-hover:text-primary dark:group-hover:text-primaryDark transition-colors flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-dark/60 dark:text-light/60">GitHub Profile</span>
                          <span className="font-mono text-sm font-bold text-dark dark:text-light">github.com/urvagandhi</span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-dark/50 dark:text-light/50 group-hover:text-primary dark:group-hover:text-primaryDark transition-colors" />
                    </Link>

                    {/* LinkedIn Link */}
                    <Link 
                      href="https://www.linkedin.com/in/urva-gandhi/" 
                      target="_blank" 
                      className="p-4 rounded-2xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10 flex items-center justify-between hover:border-primary/40 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Linkedin className="w-5 h-5 text-[#0A66C2] flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-dark/60 dark:text-light/60">LinkedIn Profile</span>
                          <span className="font-mono text-sm font-bold text-dark dark:text-light">linkedin.com/in/urva-gandhi</span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-dark/50 dark:text-light/50 group-hover:text-primary dark:group-hover:text-primaryDark transition-colors" />
                    </Link>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="p-3 rounded-2xl bg-primary/10 dark:bg-primaryDark/10 text-xs text-center font-medium text-dark/80 dark:text-light/80 border border-primary/20">
                    ⚡ Available for Full-Time Backend / Software Engineering Roles &amp; Internships
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Address & Location Info */}
            <div className="relative p-8 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-primary/10 dark:bg-primaryDark/20 text-primary dark:text-primaryDark border border-primary/20 flex-shrink-0 mt-1">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-dark dark:text-light mb-1">Current Address</h3>
                    <p className="text-sm text-dark/75 dark:text-light/75 leading-relaxed">
                      S-308, Venus Parkland, Near Vejalpur Police Chowki, Vejalpur, Ahmedabad, Gujarat, India - 380051
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-primary/10 dark:bg-primaryDark/20 text-primary dark:text-primaryDark border border-primary/20 flex-shrink-0 mt-1">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-dark dark:text-light mb-1">Preferred Roles</h3>
                    <p className="text-sm text-dark/75 dark:text-light/75 leading-relaxed">
                      Java Backend Engineer, Spring Boot Developer, Full-Stack Engineer, AI/ML Systems Engineer
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Layout>
      </main>
    </>
  );
}
