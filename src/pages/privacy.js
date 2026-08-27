import AnimatedText from "@/components/AnimatedText";
import Layout from "@/components/Layout";
import TransitionEffect from "@/components/TransitionEffect";
import Head from "next/head";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import { BorderBeam } from "@/components/magicui/border-beam";
import { 
  Lock, 
  ShieldCheck, 
  EyeOff, 
  Database, 
  Mail, 
  FileText, 
  CheckCircle2,
  Cookie,
  Server
} from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Urva Gandhi Portfolio</title>
        <meta 
          name="description" 
          content="Privacy policy and data protection guidelines for Urva Gandhi's developer portfolio website and public API services." 
        />
      </Head>
      <TransitionEffect />
      <main className="flex w-full flex-col items-center justify-center text-dark dark:text-light pt-24 pb-16">
        <Layout className="pt-16">
          <div className="w-full flex justify-center mb-12 sm:mb-8">
            <SectionHeading title="Privacy Policy" subTitle="DATA &amp; COMPLIANCE" theme="blue" />
          </div>

          <AnimatedText 
            text="Privacy &amp; Data Guidelines" 
            className="mb-8 lg:!text-5xl sm:!text-4xl xs:!text-2xl text-center max-w-4xl mx-auto" 
          />

          <div className="max-w-4xl mx-auto w-full">
            <div className="text-lg text-dark/75 dark:text-light/75 text-center mb-4 max-w-2xl mx-auto leading-relaxed">
              Privacy and data protection guidelines for <strong>Urva Gandhi&apos;s Developer Portfolio &amp; API Infrastructure</strong>.
            </div>

            <div className="text-xs text-dark/60 dark:text-light/60 text-center mb-12 font-mono">
              Last Updated: August 27, 2026
            </div>

            <div className="space-y-8 w-full mb-16">
              {/* Section 1: Introduction */}
              <div className="relative p-8 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl overflow-hidden">
                <BorderBeam size={200} duration={12} delay={0} colorFrom="#58E6D9" colorTo="#8B5CF6" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-primary/10 dark:bg-primaryDark/20 text-primary dark:text-primaryDark border border-primary/20">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">1. Introduction</h2>
                    <div className="text-xs text-dark/60 dark:text-light/60">Platform ownership &amp; privacy commitment</div>
                  </div>
                </div>

                <div className="text-sm text-dark/80 dark:text-light/80 leading-relaxed font-medium">
                  Urva Gandhi (&quot;I&quot;, &quot;my&quot;, or &quot;the owner&quot;) operates the developer portfolio hosted at <code className="font-mono bg-dark/10 dark:bg-light/10 px-2 py-0.5 rounded text-xs font-bold text-primary dark:text-primaryDark">https://urvagandhi.tech</code> (and its permanent mirror <code className="font-mono bg-dark/10 dark:bg-light/10 px-2 py-0.5 rounded text-xs font-bold">https://urvagandhi-portfolio.vercel.app</code>). I am committed to respecting your privacy and protecting any information processed while visiting this site or using its API endpoints.
                </div>
              </div>

              {/* Section 2: Data Collection */}
              <div className="relative p-8 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl overflow-hidden">
                <BorderBeam size={200} duration={12} delay={4} colorFrom="#8B5CF6" colorTo="#58E6D9" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <EyeOff className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">2. Telemetry &amp; Analytics</h2>
                    <div className="text-xs text-dark/60 dark:text-light/60">Privacy-first aggregate performance monitoring</div>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-dark/80 dark:text-light/80 leading-relaxed font-medium">
                  <div>
                    This portfolio website uses <strong>Vercel Analytics</strong> and <strong>Vercel Speed Insights</strong> to collect aggregated, privacy-friendly performance telemetry (such as page load times, Core Web Vitals, and generalized geographic metrics).
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-dark dark:text-light">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>No Personally Identifiable Information (PII) is captured or stored.</span>
                    </div>
                    <div className="flex items-center gap-2 text-dark dark:text-light">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>No cross-site tracking, advertising pixels, or invasive session recorders are utilized.</span>
                    </div>
                    <div className="flex items-center gap-2 text-dark dark:text-light">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>IP addresses are anonymized before telemetry processing by Vercel.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Cookies */}
              <div className="relative p-8 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl overflow-hidden">
                <BorderBeam size={200} duration={12} delay={8} colorFrom="#58E6D9" colorTo="#8B5CF6" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Cookie className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">3. Cookies &amp; Local Storage</h2>
                    <div className="text-xs text-dark/60 dark:text-light/60">Zero persistent tracking cookies</div>
                  </div>
                </div>

                <div className="text-sm text-dark/80 dark:text-light/80 leading-relaxed font-medium">
                  This site does NOT use persistent tracking cookies. Local storage is only utilized locally within your browser to remember your visual theme preference (Dark Mode vs Light Mode).
                </div>
              </div>

              {/* Section 4: API & MCP */}
              <div className="relative p-8 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl overflow-hidden">
                <BorderBeam size={200} duration={12} delay={10} colorFrom="#8B5CF6" colorTo="#58E6D9" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-dark dark:text-light">4. API &amp; MCP Tool Processing</h2>
                    <div className="text-xs text-dark/60 dark:text-light/60">Data processing transparency for developer endpoints</div>
                  </div>
                </div>

                <div className="text-sm text-dark/80 dark:text-light/80 leading-relaxed font-medium">
                  Programmatic requests to public REST endpoints (<code className="font-mono bg-dark/10 dark:bg-light/10 px-2 py-0.5 rounded text-xs font-bold text-primary dark:text-primaryDark">/api/*</code>) and the Model Context Protocol endpoint (<code className="font-mono bg-dark/10 dark:bg-light/10 px-2 py-0.5 rounded text-xs font-bold text-primary dark:text-primaryDark">/api/mcp</code>) process request metadata solely to fulfill response payloads and enforce standard rate limits. No request payloads are sold, shared, or repurposed.
                </div>
              </div>

              {/* Section 5: Contact */}
              <div className="p-8 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-primary/10 dark:bg-primaryDark/20 text-primary dark:text-primaryDark border border-primary/20 flex-shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-dark dark:text-light">Contact Information</h3>
                    <div className="text-xs text-dark/70 dark:text-light/70">For privacy inquiries or data requests</div>
                  </div>
                </div>

                <Link
                  href="mailto:urvagandhi24@gmail.com"
                  className="px-5 py-3 rounded-2xl bg-dark text-light dark:bg-light dark:text-dark font-mono text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>urvagandhi24@gmail.com</span>
                </Link>
              </div>
            </div>
          </div>
        </Layout>
      </main>
    </>
  );
}
