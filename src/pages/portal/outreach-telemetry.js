import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/Layout.js';
import TransitionEffect from '@/components/layout/TransitionEffect.js';
import SectionHeading from '@/components/shared/SectionHeading.js';
import AnimatedText from '@/components/shared/AnimatedText.js';
import { BorderBeam } from '@/vendor/magicui/border-beam';
import {
  Lock,
  RefreshCw,
  LogOut,
  Mail,
  Eye,
  EyeOff,
  MousePointer,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Download,
  Clock,
  Shield,
  Activity
} from 'lucide-react';

export { getServerSideProps } from '../../lib/mail/portal-gssp.js';

// Helper to compute mathematically authentic sparklines from real event timestamps
function computeRealSparkline(events, filterFn) {
  const filtered = (events || [])
    .filter(filterFn)
    .sort((a, b) => a.ts - b.ts);

  if (filtered.length === 0) {
    return {
      line: 'M0,18 L80,18',
      area: 'M0,18 L80,18 L80,24 L0,24 Z',
      hasData: false
    };
  }

  if (filtered.length === 1) {
    return {
      line: 'M0,18 L40,11 L80,5',
      area: 'M0,18 L40,11 L80,5 L80,24 L0,24 Z',
      hasData: true
    };
  }

  const minTs = filtered[0].ts;
  const maxTs = filtered[filtered.length - 1].ts;
  const tsRange = Math.max(maxTs - minTs, 1000);

  const pts = filtered.map((evt, idx) => {
    const x = Math.round(((evt.ts - minTs) / tsRange) * 70 + 5);
    const y = Math.round(19 - ((idx + 1) / filtered.length) * 14);
    return `${x},${y}`;
  });

  const line = `M0,19 L${pts.join(' L')}`;
  const lastY = pts[pts.length - 1].split(',')[1];
  const area = `M0,19 L${pts.join(' L')} L80,${lastY} L80,24 L0,24 Z`;

  return { line, area, hasData: true };
}

export default function OutreachTelemetry({ initialAuth }) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);
  const [passkey, setPasskey] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [currentTimeIst, setCurrentTimeIst] = useState('');

  // Update IST clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istString = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'medium',
        hour12: false
      }).format(now);
      setCurrentTimeIst(`${istString} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch telemetry statistics (silent mode skips loading spinner for seamless background updates)
  const fetchStats = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoadingStats(true);
    setStatsError('');
    try {
      const res = await fetch('/api/mail/stats');
      if (res.status === 401 || res.status === 404) {
        setIsAuthenticated(false);
        setStats(null);
        return;
      }
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      setStats(data);
    } catch (err) {
      if (!isSilent) setStatsError(err.message || 'Failed to load telemetry metrics');
    } finally {
      if (!isSilent) setLoadingStats(false);
    }
  }, []);

  // Real-time automatic polling every 2.5 seconds from DB
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchStats(false);

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchStats(true);
    }, 2500);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchStats]);

  // Handle passkey login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!passkey.trim()) return;

    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/mail/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey })
      });

      const data = await res.json();
      if (res.ok && data.authenticated) {
        setIsAuthenticated(true);
        setPasskey('');
      } else {
        setAuthError(data.error || 'Invalid administrative passkey.');
      }
    } catch (err) {
      setAuthError('Connection failed. Please retry.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/mail/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      });
    } catch (_) { }
    setIsAuthenticated(false);
    setStats(null);
  };

  // View 1: Unauthenticated Telemetry Gateway (Full Light & Dark Mode)
  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Outreach Telemetry Gateway | Urva Gandhi Portfolio</title>
          <meta
            name="description"
            content="Administrative telemetry gateway for Urva Gandhi's outreach metrics."
          />
          <meta name="robots" content="noindex, nofollow, noarchive" />
        </Head>
        <TransitionEffect />
        <main className="flex min-h-screen w-full flex-col items-center justify-center text-dark dark:text-light pt-24 pb-16">
          <Layout className="flex flex-col items-center justify-center pt-8">
            <div className="w-full flex justify-center mb-8">
              <SectionHeading
                title="Telemetry Gateway"
                subTitle="ADMINISTRATIVE ACCESS"
                theme="blue"
              />
            </div>

            {/* <AnimatedText
              text="Outreach Telemetry Portal"
              className="mb-8 lg:!text-5xl sm:!text-4xl xs:!text-2xl text-center max-w-4xl mx-auto"
            /> */}

            <div className="relative w-full max-w-md p-8 sm:p-6 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-2xl overflow-hidden transition-all">
              <BorderBeam size={220} duration={12} delay={0} colorFrom="#58E6D9" colorTo="#8B5CF6" />

              <div className="flex items-center gap-4 mb-6">
                <div className="p-3.5 rounded-2xl bg-primary/10 dark:bg-primaryDark/20 text-primary dark:text-primaryDark border border-primary/20">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark dark:text-light">
                    Protected Console
                  </h3>
                  <p className="text-xs text-dark/60 dark:text-light/60">
                    Enter your administrative passkey to unlock telemetry.
                  </p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {authError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-dark/70 dark:text-light/70 mb-2">
                    Security Passkey
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={passkey}
                      onChange={(e) => setPasskey(e.target.value)}
                      placeholder="Enter passkey..."
                      className="w-full px-4 py-3 bg-dark/5 dark:bg-light/5 border border-dark/20 dark:border-light/20 rounded-xl text-dark dark:text-light placeholder-dark/30 dark:placeholder-light/30 text-sm focus:border-primary dark:focus:border-primaryDark focus:outline-none transition-colors pr-11"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark/40 dark:text-light/40 hover:text-dark dark:hover:text-light transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading || !passkey.trim()}
                  className="w-full py-3 bg-dark text-light dark:bg-light dark:text-dark hover:opacity-90 disabled:opacity-50 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {authLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Passkey...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Unlock Telemetry Dashboard</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </Layout>
        </main>
      </>
    );
  }

  // View 2: Outreach Telemetry Dashboard (Authenticated State)
  const summary = stats?.summary || {};
  const slugRankings = stats?.slug_rankings || [];
  const companyRollups = stats?.company_rollups || [];
  const recentEvents = stats?.recent_events || [];

  return (
    <>
      <Head>
        <title>Outreach Telemetry | Urva Gandhi Portfolio</title>
        <meta name="robots" content="noindex, nofollow, noarchive" />
      </Head>
      <TransitionEffect />
      <main className="flex w-full flex-col items-center justify-center text-dark dark:text-light pt-24 pb-16">
        <Layout className="pt-16">
          {/* Header Bar */}
          <div className="w-full flex justify-center mb-8">
            <SectionHeading
              title="Outreach Telemetry"
              subTitle="Analytics"
              theme="blue"
            />
          </div>

          {/* <AnimatedText
            text="Recruiter Telemetry Portal"
            className="mb-6 lg:!text-5xl sm:!text-4xl xs:!text-2xl text-center max-w-4xl mx-auto"
          /> */}

          {/* Controls Bar */}
          <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-8 p-4 rounded-2xl border border-dark/10 dark:border-light/10 bg-light/80 dark:bg-dark/80 backdrop-blur-md shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-dark/70 dark:text-light/70">
                Live Interaction Stream
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10 text-dark/70 dark:text-light/70 font-mono">
                <Clock className="w-3.5 h-3.5 text-primary dark:text-primaryDark" />
                <span>{currentTimeIst || 'Syncing clock...'}</span>
              </div>

              <button
                onClick={fetchStats}
                disabled={loadingStats}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark/5 dark:bg-light/5 hover:bg-dark/10 dark:hover:bg-light/10 text-dark dark:text-light border border-dark/10 dark:border-light/10 transition-colors font-medium cursor-pointer"
                title="Refresh Metrics"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors font-medium cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {statsError && (
            <div className="w-full mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statsError}</span>
            </div>
          )}

          {/* 4 Top KPI Cards — Seamless Horizontal Row (No overflow scrollbars, no dark shadow) */}
          {(() => {
            const sparkOutreach = computeRealSparkline(recentEvents, () => true);
            const sparkOpens = computeRealSparkline(recentEvents, (e) => e.event === 'open');
            const sparkResumes = computeRealSparkline(
              recentEvents,
              (e) => e.event === 'resume_view' || e.event === 'beacon_dwell'
            );
            const sparkClicks = computeRealSparkline(recentEvents, (e) => e.event === 'click');

            return (
              <div className="grid grid-cols-4 gap-4 w-full mb-8">
                {/* Card 1: Total Outreach */}
                <div className="relative p-5 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-md shadow-black/5 dark:shadow-black/20 overflow-hidden flex flex-col justify-between">
                  <BorderBeam size={140} duration={12} delay={0} colorFrom="#58E6D9" colorTo="#8B5CF6" />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-dark/60 dark:text-light/60">
                        Total Outreach
                      </span>
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <Mail className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-extrabold text-dark dark:text-light">
                        {summary.total_sent ?? 0}
                      </span>
                      {/* Real Sparkline 1 */}
                      <svg viewBox="0 0 80 24" className="w-16 h-6" fill="none">
                        <defs>
                          <linearGradient id="grad-outreach-real" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={sparkOutreach.area} fill="url(#grad-outreach-real)" />
                        <path d={sparkOutreach.line} stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-dark/60 dark:text-light/60 flex items-center gap-1 font-medium">
                    <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>Active Registered Transmissions</span>
                  </p>
                </div>

                {/* Card 2: Recruiter Opens */}
                <div className="relative p-5 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-md shadow-black/5 dark:shadow-black/20 overflow-hidden flex flex-col justify-between">
                  <BorderBeam size={140} duration={12} delay={3} colorFrom="#8B5CF6" colorTo="#58E6D9" />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-dark/60 dark:text-light/60">
                        Recruiter Opens
                      </span>
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-dark dark:text-light">
                          {summary.verified_opens ?? 0}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                          {summary.open_rate_percent ?? 0}%
                        </span>
                      </div>
                      {/* Real Sparkline 2 */}
                      <svg viewBox="0 0 80 24" className="w-16 h-6" fill="none">
                        <defs>
                          <linearGradient id="grad-opens-real" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={sparkOpens.area} fill="url(#grad-opens-real)" />
                        <path d={sparkOpens.line} stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-dark/60 dark:text-light/60 font-medium">
                    Verified In-Box Reads
                  </p>
                </div>

                {/* Card 3: Resume Views */}
                <div className="relative p-5 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-md shadow-black/5 dark:shadow-black/20 overflow-hidden flex flex-col justify-between">
                  <BorderBeam size={140} duration={12} delay={6} colorFrom="#EC4899" colorTo="#8B5CF6" />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-dark/60 dark:text-light/60">
                        Resume Views
                      </span>
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        <FileText className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-dark dark:text-light">
                          {summary.total_resume_views ?? 0}
                        </span>
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                          {summary.avg_dwell_seconds ?? 0}s avg
                        </span>
                      </div>
                      {/* Real Sparkline 3 */}
                      <svg viewBox="0 0 80 24" className="w-16 h-6" fill="none">
                        <defs>
                          <linearGradient id="grad-resume-real" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={sparkResumes.area} fill="url(#grad-resume-real)" />
                        <path d={sparkResumes.line} stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-dark/60 dark:text-light/60 flex items-center gap-1 font-medium">
                    <Download className="w-3 h-3 text-dark/50 dark:text-light/50" />
                    <span>{summary.total_downloads ?? 0} Direct Downloads</span>
                  </p>
                </div>

                {/* Card 4: Project Clicks */}
                <div className="relative p-5 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-md shadow-black/5 dark:shadow-black/20 overflow-hidden flex flex-col justify-between">
                  <BorderBeam size={140} duration={12} delay={9} colorFrom="#F59E0B" colorTo="#EC4899" />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-dark/60 dark:text-light/60">
                        Project Clicks
                      </span>
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <MousePointer className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-extrabold text-dark dark:text-light">
                        {summary.total_clicks ?? 0}
                      </span>
                      {/* Real Sparkline 4 */}
                      <svg viewBox="0 0 80 24" className="w-16 h-6" fill="none">
                        <defs>
                          <linearGradient id="grad-clicks-real" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={sparkClicks.area} fill="url(#grad-clicks-real)" />
                        <path d={sparkClicks.line} stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-dark/60 dark:text-light/60 font-medium">
                    Showcase &amp; Demo Hops
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Middle 2-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mb-8">
            {/* Column 1: Showcase Leaderboard */}
            <div className="p-8 sm:p-6 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-dark dark:text-light flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary dark:text-primaryDark" />
                  <span>Showcase Link Leaderboard</span>
                </h3>
                <span className="text-xs text-dark/60 dark:text-light/60 font-mono">10 Slugs</span>
              </div>

              {slugRankings.length === 0 ? (
                <div className="text-center py-10 text-xs text-dark/50 dark:text-light/50 font-medium">
                  No project clicks recorded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {slugRankings.map((item) => {
                    const maxClicks = Math.max(...slugRankings.map((s) => s.clicks), 1);
                    const pct = Math.round((item.clicks / maxClicks) * 100);
                    return (
                      <div key={item.slug} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-semibold text-dark/90 dark:text-light/90">
                            {item.slug}
                          </span>
                          <span className="font-bold text-primary dark:text-primaryDark">
                            {item.clicks} click{item.clicks === 1 ? '' : 's'}
                          </span>
                        </div>
                        <div className="w-full bg-dark/5 dark:bg-light/10 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary dark:bg-primaryDark h-2 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Column 2: Company Rollup */}
            <div className="p-8 sm:p-6 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-dark dark:text-light flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  <span>Company-Level Rollup</span>
                </h3>
                <span className="text-xs text-dark/60 dark:text-light/60 font-mono">
                  {companyRollups.length} Organisation{companyRollups.length === 1 ? '' : 's'}
                </span>
              </div>

              {companyRollups.length === 0 ? (
                <div className="text-center py-10 text-xs text-dark/50 dark:text-light/50 font-medium my-auto">
                  No company outreach registered yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-dark/10 dark:border-light/10 text-dark/60 dark:text-light/60 font-mono">
                        <th className="pb-3 font-semibold">Company</th>
                        <th className="pb-3 font-semibold">Sent</th>
                        <th className="pb-3 font-semibold">Opened</th>
                        <th className="pb-3 font-semibold">Resume</th>
                        <th className="pb-3 font-semibold">Clicks</th>
                        <th className="pb-3 font-semibold">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark/5 dark:divide-light/5">
                      {companyRollups.map((c) => (
                        <tr key={c.company} className="hover:bg-dark/5 dark:hover:bg-light/5 transition-colors">
                          <td className="py-3 font-bold text-dark dark:text-light">{c.company}</td>
                          <td className="py-3 text-dark/70 dark:text-light/70">{c.sent}</td>
                          <td className="py-3 text-emerald-600 dark:text-emerald-400 font-bold">{c.opened}</td>
                          <td className="py-3 text-purple-600 dark:text-purple-400 font-bold">{c.resume_viewed}</td>
                          <td className="py-3 text-amber-600 dark:text-amber-400 font-bold">{c.clicks}</td>
                          <td className="py-3 text-dark/60 dark:text-light/60 font-mono text-[11px]">{c.last_active_formatted}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Feed */}
          <div className="p-8 sm:p-6 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-dark dark:text-light flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-primary dark:text-primaryDark" />
                <span>Real-Time Recruiter Engagement Feed</span>
              </h3>
              <span className="text-xs text-dark/60 dark:text-light/60 font-mono">
                {recentEvents.length} interaction{recentEvents.length === 1 ? '' : 's'}
              </span>
            </div>

            {recentEvents.length === 0 ? (
              <div className="text-center py-12 text-xs text-dark/50 dark:text-light/50 font-medium">
                No recruiter interactions recorded yet. Telemetry will stream in real time.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-dark/10 dark:border-light/10 text-dark/60 dark:text-light/60 font-mono">
                      <th className="pb-3 font-semibold">Recruiter &amp; Company</th>
                      <th className="pb-3 font-semibold">Event &amp; Class</th>
                      <th className="pb-3 font-semibold">Detail</th>
                      <th className="pb-3 font-semibold">Location &amp; IP</th>
                      <th className="pb-3 font-semibold">Time (IST)</th>
                      <th className="pb-3 font-semibold text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark/5 dark:divide-light/5">
                    {recentEvents.map((evt, idx) => {
                      let badgeStyle =
                        'bg-dark/5 dark:bg-light/10 text-dark/70 dark:text-light/70 border-dark/10 dark:border-light/10';
                      let scoreStyle = 'bg-dark/5 dark:bg-light/10 text-dark/60 dark:text-light/60';

                      if (evt.engagement_score >= 8) {
                        scoreStyle =
                          'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400';
                      } else if (evt.engagement_score >= 3) {
                        scoreStyle =
                          'bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400';
                      } else if (evt.engagement_score >= 1) {
                        scoreStyle =
                          'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400';
                      }

                      if (evt.event === 'open') {
                        badgeStyle =
                          evt.client_class === 'apple_mpp'
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400';
                      } else if (evt.event === 'click') {
                        badgeStyle =
                          'bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400';
                      } else if (evt.event === 'resume_view') {
                        badgeStyle =
                          'bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400';
                      } else if (evt.event === 'download' || evt.event === 'resume_download') {
                        badgeStyle =
                          'bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400';
                      }

                      return (
                        <tr
                          key={`${evt.token}-${evt.ts}-${idx}`}
                          className="hover:bg-dark/5 dark:hover:bg-light/5 transition-colors"
                        >
                          <td className="py-3.5">
                            <div className="font-bold text-dark dark:text-light">
                              {evt.company || 'Unknown Org'}
                            </div>
                            <div className="text-[11px] text-dark/60 dark:text-light/60">
                              {evt.recipient || 'No email'}
                            </div>
                            {evt.track && (
                              <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 bg-dark/5 dark:bg-light/10 text-dark/70 dark:text-light/70 rounded-full font-medium">
                                {evt.track}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${badgeStyle}`}
                            >
                              {evt.event === 'open' && `Open (${evt.client_class || 'direct'})`}
                              {evt.event === 'click' && 'Showcase Click'}
                              {evt.event === 'resume_view' && 'Resume View'}
                              {evt.event === 'beacon_dwell' && 'Active Dwell'}
                              {(evt.event === 'download' || evt.event === 'resume_download') &&
                                'Resume Download'}
                            </span>
                          </td>

                          <td className="py-3.5 text-dark/80 dark:text-light/80 font-medium">
                            {evt.slug && (
                              <span className="font-mono text-primary dark:text-primaryDark">
                                /{evt.slug}
                              </span>
                            )}
                            {evt.dwell_ms && <span>{Math.round(evt.dwell_ms / 1000)}s visible</span>}
                            {!evt.slug && !evt.dwell_ms && (
                              <span className="text-dark/40 dark:text-light/40">—</span>
                            )}
                          </td>

                          <td className="py-3.5">
                            <div className="text-dark/80 dark:text-light/80 font-medium">
                              {[evt.city, evt.country].filter(Boolean).join(', ') || 'Unknown'}
                            </div>
                            <div className="text-[11px] font-mono text-dark/50 dark:text-light/50">
                              {evt.ip_trunc || 'IP redacted'}
                            </div>
                          </td>

                          <td className="py-3.5 font-mono text-dark/60 dark:text-light/60 text-[11px]">
                            {evt.ist_time || evt.ts}
                          </td>

                          <td className="py-3.5 text-right">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${scoreStyle}`}
                            >
                              +{evt.engagement_score}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Layout>
      </main>
    </>
  );
}
