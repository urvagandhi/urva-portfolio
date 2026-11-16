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
  ShieldAlert,
  Activity,
  ChevronDown,
  ChevronRight,
  Building2,
  Layers
} from 'lucide-react';

export { getServerSideProps } from '../../lib/mail/portal-gssp.js';

// Helper to format and decode geographic locations gracefully, masking privacy proxies
function formatLocation(city, country, clientClass, ip = '') {
  const isGoogleProxy =
    clientClass === 'gmail_proxy' ||
    (ip && (ip.startsWith('66.249.') || ip.startsWith('209.85.') || ip.startsWith('66.102.') || ip.startsWith('108.177.')));
  const isAppleRelay = clientClass === 'apple_mpp';

  if (isGoogleProxy) {
    return {
      text: 'Google Proxy (IP Masked)',
      isProxy: true,
      tooltip: 'GoogleImageProxy routed image fetch through Google Cloud data center to protect recipient privacy. Real IP is masked.'
    };
  }

  if (isAppleRelay) {
    return {
      text: 'Apple Relay (IP Masked)',
      isProxy: true,
      tooltip: 'Apple Mail Privacy Protection (MPP) pre-fetched image via Apple Privacy Relay network. Real IP is masked.'
    };
  }

  let cleanCity = city || '';
  try {
    cleanCity = decodeURIComponent(cleanCity);
  } catch (_) {}
  const text = [cleanCity, country].filter(Boolean).join(', ') || 'Unknown';
  return {
    text,
    isProxy: false,
    tooltip: null
  };
}

// Helper to compute relative elapsed time from timestamp (e.g. 'Just now', '2m ago')
function formatRelativeTime(ts) {
  if (!ts) return '';
  const num = typeof ts === 'number' ? ts : Number(ts);
  if (Number.isNaN(num) || num <= 0) return '';
  const now = Date.now();
  const diffSec = Math.floor((now - num) / 1000);
  if (diffSec < 15) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Helper to determine styling badge and label for interaction events
function getEventBadge(evt) {
  let badgeStyle = 'bg-dark/5 dark:bg-light/10 text-dark/70 dark:text-light/70 border-dark/10 dark:border-light/10';
  let label = evt.event;

  if (evt.event === 'open') {
    badgeStyle =
      evt.client_class === 'apple_mpp'
        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400'
        : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400';
    label = `Open (${evt.client_class || 'direct'})`;
  } else if (evt.event === 'click') {
    badgeStyle = 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400';
    label = 'Showcase Click';
  } else if (evt.event === 'resume_view') {
    badgeStyle = 'bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400';
    label = 'Resume View';
  } else if (evt.event === 'download' || evt.event === 'resume_download') {
    badgeStyle = 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400';
    label = 'Resume Download';
  } else if (evt.event === 'beacon_dwell') {
    label = 'Active Dwell';
  }

  return { badgeStyle, label };
}

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
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [currentTimeIst, setCurrentTimeIst] = useState('');

  // Company accordion toggle state (default: all expanded) and view mode switch
  const [collapsedCompanies, setCollapsedCompanies] = useState({});
  const [feedViewMode, setFeedViewMode] = useState('company'); // 'company' | 'flat' | 'blocked'
  const [companyFilter, setCompanyFilter] = useState('all'); // 'all' | 'opened' | 'unopened'

  const toggleCompany = (companyName) => {
    setCollapsedCompanies((prev) => ({
      ...prev,
      [companyName]: !prev[companyName]
    }));
  };

  const expandAll = () => {
    setCollapsedCompanies({});
  };

  const collapseAll = (companies) => {
    const next = {};
    (companies || []).forEach((c) => {
      next[c.company] = true;
    });
    setCollapsedCompanies(next);
  };

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

  // Fetch telemetry statistics (silent mode skips loading spinner; force bypasses server memory cache)
  const fetchStats = useCallback(async (isSilent = false, isForce = false) => {
    const silent = typeof isSilent === 'boolean' ? isSilent : false;
    const force = typeof isForce === 'boolean' ? isForce : false;
    if (!silent) setLoadingStats(true);
    setStatsError('');
    try {
      const url = force ? '/api/mail/stats?force=true' : '/api/mail/stats';
      const res = await fetch(url);
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
      if (!silent) setStatsError(err.message || 'Failed to load telemetry metrics');
    } finally {
      if (!silent) setLoadingStats(false);
    }
  }, []);

  // Explicit user-triggered refresh with guaranteed visual spin feedback and cache bypass
  const handleManualRefresh = async () => {
    if (isManualRefreshing || loadingStats) return;
    setIsManualRefreshing(true);
    const start = Date.now();
    try {
      await fetchStats(false, true);
    } finally {
      const elapsed = Date.now() - start;
      const minSpinMs = 600;
      if (elapsed < minSpinMs) {
        await new Promise((resolve) => setTimeout(resolve, minSpinMs - elapsed));
      }
      setIsManualRefreshing(false);
    }
  };

  // Initial load only; automatic interval polling disabled to preserve Upstash Redis quota
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchStats(false);
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
  const blockedCompaniesList = stats?.blocked_companies || [];
  const recentEvents = stats?.recent_events || [];

  const openedCompanies = companyRollups.filter(
    (c) => (c.opened > 0 || c.resume_viewed > 0 || c.clicks > 0 || c.last_active > 0)
  );
  const unopenedCompanies = companyRollups.filter(
    (c) => !(c.opened > 0 || c.resume_viewed > 0 || c.clicks > 0 || c.last_active > 0)
  );

  const displayedCompanies = companyFilter === 'opened'
    ? openedCompanies
    : companyFilter === 'unopened'
    ? unopenedCompanies
    : companyRollups;

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
                onClick={handleManualRefresh}
                disabled={isManualRefreshing || loadingStats}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark/5 dark:bg-light/5 hover:bg-dark/10 dark:hover:bg-light/10 text-dark dark:text-light border border-dark/10 dark:border-light/10 transition-colors font-medium cursor-pointer disabled:opacity-70"
                title="Refresh Metrics"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 transition-transform ${
                    isManualRefreshing || loadingStats ? 'animate-spin text-primary dark:text-primaryDark' : ''
                  }`}
                />
                <span>{isManualRefreshing ? 'Refreshing...' : 'Refresh'}</span>
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
                  <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-dark/60 dark:text-light/60">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{summary.total_sent ?? 0} Active</span>
                    </span>
                    {(summary.total_inactive ?? 0) > 0 && (
                      <button
                        type="button"
                        onClick={() => setFeedViewMode('blocked')}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 font-bold transition-all cursor-pointer"
                        title="Click to view blocked and bounced transmissions"
                      >
                        {summary.total_inactive} Filtered
                      </button>
                    )}
                  </div>
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

          {/* Showcase Link Leaderboard */}
          <div className="p-8 sm:p-6 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl w-full mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-dark dark:text-light flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary dark:text-primaryDark" />
                <span>Showcase Link Leaderboard</span>
              </h3>
              <span className="text-xs text-dark/60 dark:text-light/60 font-mono">
                {slugRankings.length} Slugs Tracked
              </span>
            </div>

            {slugRankings.length === 0 ? (
              <div className="text-center py-6 text-xs text-dark/50 dark:text-light/50 font-medium">
                No project clicks recorded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
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

          {/* Unified Company-Wise Outreach & Recruiter Engagement Hub */}
          <div className="p-8 sm:p-6 rounded-3xl border border-dark/10 bg-light/80 dark:border-light/10 dark:bg-dark/80 backdrop-blur-md shadow-xl w-full">
            {/* Header: Title + Primary View Segmented Control */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-dark dark:text-light flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary dark:text-primaryDark" />
                  <span>Company-Wise Recruiter Engagement</span>
                </h3>
                <p className="text-xs text-dark/60 dark:text-light/60 font-mono mt-0.5">
                  {feedViewMode === 'company'
                    ? `${displayedCompanies.length} of ${companyRollups.length} Organisation${companyRollups.length === 1 ? '' : 's'} · ${recentEvents.length} Total Interaction${recentEvents.length === 1 ? '' : 's'}`
                    : feedViewMode === 'flat'
                    ? `${recentEvents.length} Total Interaction Event${recentEvents.length === 1 ? '' : 's'}`
                    : `${blockedCompaniesList.length} Filtered & Quarantined Record${blockedCompaniesList.length === 1 ? '' : 's'} (${summary.total_blocked || 0} Blocked · ${summary.total_bounced || 0} Bounced${summary.total_voided ? ` · ${summary.total_voided} Retried` : ''})`
                  }
                </p>
              </div>

              {/* Primary View Segmented Bar */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="inline-flex rounded-2xl p-1 bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10 text-xs font-medium shadow-inner">
                  <button
                    type="button"
                    onClick={() => setFeedViewMode('company')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      feedViewMode === 'company'
                        ? 'bg-primary text-light dark:bg-primaryDark dark:text-dark font-bold shadow-sm'
                        : 'text-dark/70 dark:text-light/70 hover:text-dark dark:hover:text-light'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Company View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedViewMode('flat')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      feedViewMode === 'flat'
                        ? 'bg-primary text-light dark:bg-primaryDark dark:text-dark font-bold shadow-sm'
                        : 'text-dark/70 dark:text-light/70 hover:text-dark dark:hover:text-light'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>All Events</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedViewMode('blocked')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      feedViewMode === 'blocked'
                        ? 'bg-rose-600 text-light dark:bg-rose-500 dark:text-dark font-bold shadow-sm'
                        : 'text-dark/70 dark:text-light/70 hover:text-dark dark:hover:text-light'
                    }`}
                    title="View blocked domains and bounced email addresses"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Filtered</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                      feedViewMode === 'blocked'
                        ? 'bg-light/20 text-light dark:bg-dark/20 dark:text-dark'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    }`}>
                      {blockedCompaniesList.length}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Secondary Controls Bar: Sub-filters (Company View) or Quick Stats (All Events / Filtered) */}
            {feedViewMode === 'company' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-dark/5 dark:border-light/5">
                {/* Status Sub-Filters */}
                <div className="inline-flex rounded-xl p-1 bg-dark/[0.03] dark:bg-light/[0.04] border border-dark/5 dark:border-light/5 text-xs">
                  <button
                    type="button"
                    onClick={() => setCompanyFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      companyFilter === 'all'
                        ? 'bg-dark/10 text-dark dark:bg-light/15 dark:text-light font-bold shadow-sm'
                        : 'text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light'
                    }`}
                  >
                    <span>ALL</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                      companyFilter === 'all'
                        ? 'bg-dark/15 dark:bg-light/20 text-dark dark:text-light'
                        : 'bg-dark/5 dark:bg-light/10 text-dark/60 dark:text-light/60'
                    }`}>
                      {companyRollups.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCompanyFilter('opened')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      companyFilter === 'opened'
                        ? 'bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-300 font-bold shadow-sm'
                        : 'text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light'
                    }`}
                    title="Sent and opened emails"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    <span>Sent &amp; Opened</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                      companyFilter === 'opened'
                        ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200'
                        : 'bg-dark/5 dark:bg-light/10 text-dark/60 dark:text-light/60'
                    }`}>
                      {openedCompanies.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCompanyFilter('unopened')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      companyFilter === 'unopened'
                        ? 'bg-amber-500/20 text-amber-800 dark:bg-amber-500/30 dark:text-amber-300 font-bold shadow-sm'
                        : 'text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light'
                    }`}
                    title="Sent but not yet opened"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                    <span>Sent but Not Open</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                      companyFilter === 'unopened'
                        ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200'
                        : 'bg-dark/5 dark:bg-light/10 text-dark/60 dark:text-light/60'
                    }`}>
                      {unopenedCompanies.length}
                    </span>
                  </button>
                </div>

                {/* Expand / Collapse All Accordion Controls */}
                {displayedCompanies.length > 0 && (
                  <div className="inline-flex rounded-xl border border-dark/10 dark:border-light/10 overflow-hidden text-xs self-start sm:self-auto shadow-sm">
                    <button
                      type="button"
                      onClick={() => expandAll()}
                      className="px-3 py-1.5 bg-dark/5 dark:bg-light/5 hover:bg-dark/10 dark:hover:bg-light/10 text-dark/70 dark:text-light/70 font-medium transition-colors cursor-pointer flex items-center gap-1"
                      title="Expand all companies"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>Expand All</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => collapseAll(displayedCompanies)}
                      className="px-3 py-1.5 bg-dark/5 dark:bg-light/5 hover:bg-dark/10 dark:hover:bg-light/10 text-dark/70 dark:text-light/70 font-medium transition-colors border-l border-dark/10 dark:border-light/10 cursor-pointer flex items-center gap-1"
                      title="Collapse all companies"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span>Collapse All</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {displayedCompanies.length === 0 ? (
              <div className="text-center py-12 text-xs text-dark/50 dark:text-light/50 font-medium">
                {companyFilter === 'opened'
                  ? 'No opened outreach recorded yet.'
                  : companyFilter === 'unopened'
                  ? 'All outreach emails have been opened!'
                  : 'No company outreach registered yet. Telemetry will stream in real time.'}
              </div>
            ) : feedViewMode === 'company' ? (
              /* Grouped Company Rollup Table with Expandable Accordion */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-dark/10 dark:border-light/10 text-dark/60 dark:text-light/60 font-mono">
                      <th className="pb-3 font-semibold">Company</th>
                      <th className="pb-3 font-semibold text-center">Sent</th>
                      <th className="pb-3 font-semibold text-center">Opened</th>
                      <th className="pb-3 font-semibold text-center">Resume</th>
                      <th className="pb-3 font-semibold text-center">Clicks</th>
                      <th className="pb-3 font-semibold">Last Active</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark/5 dark:divide-light/5">
                    {displayedCompanies.map((c) => {
                      const isExpanded = !collapsedCompanies[c.company];
                      const compEvents = (Array.isArray(c.events) && c.events.length > 0)
                        ? c.events
                        : recentEvents.filter(
                            (e) => (e.company || 'Unknown Organisation') === c.company
                          );

                      return (
                        <React.Fragment key={c.company}>
                          <tr
                            onClick={() => toggleCompany(c.company)}
                            className="hover:bg-dark/5 dark:hover:bg-light/5 transition-colors cursor-pointer group"
                          >
                            <td className="py-3.5 font-bold text-dark dark:text-light flex items-center gap-2 flex-wrap">
                              <span className="p-1 rounded-md bg-dark/5 dark:bg-light/5 group-hover:bg-primary/10 transition-colors">
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-primary dark:text-primaryDark" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-dark/50 dark:text-light/50" />
                                )}
                              </span>
                              <span className="text-sm">{c.company}</span>
                              {Array.isArray(c.recipients) && c.recipients.length > 0 && (
                                <span className="text-[11px] font-normal font-mono text-dark/60 dark:text-light/60">
                                  ({c.recipients.join(', ')})
                                </span>
                              )}
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-dark/5 dark:bg-light/10 text-dark/70 dark:text-light/70">
                                {compEvents.length} event{compEvents.length === 1 ? '' : 's'}
                              </span>
                              {c.prior_quarantined && c.prior_quarantined.length > 0 && (
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 inline-flex items-center gap-1"
                                  title={`Prior attempt ${c.prior_quarantined.map(pq => `${pq.recipient} (${pq.status})`).join(', ')} was retried`}
                                >
                                  <AlertCircle className="w-3 h-3 text-amber-500" />
                                  <span>{c.prior_quarantined.length} Retried</span>
                                </span>
                              )}
                              {c.is_security_scanner && (
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 inline-flex items-center gap-1"
                                  title={c.scanner_note || 'Automated Email Security Gateway'}
                                >
                                  <Shield className="w-3 h-3 text-blue-500" />
                                  <span>Scanner</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 text-center text-dark/70 dark:text-light/70 font-mono">{c.sent}</td>
                            <td className="py-3.5 text-center text-emerald-600 dark:text-emerald-400 font-bold font-mono">{c.opened}</td>
                            <td className="py-3.5 text-center text-purple-600 dark:text-purple-400 font-bold font-mono">{c.resume_viewed}</td>
                            <td className="py-3.5 text-center text-amber-600 dark:text-amber-400 font-bold font-mono">{c.clicks}</td>
                            <td className="py-3.5 font-mono text-left">
                              {c.last_active > 0 ? (
                                <div>
                                  <div className="font-semibold text-xs text-dark/90 dark:text-light/90">
                                    {formatRelativeTime(c.last_active)}
                                  </div>
                                  <div className="text-[10px] text-dark/50 dark:text-light/50">
                                    {c.last_active_formatted}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-dark/40 dark:text-light/40 text-xs">Pending</span>
                              )}
                            </td>
                            <td className="py-3.5 text-right font-medium">
                              <span className="text-xs text-primary dark:text-primaryDark hover:underline inline-flex items-center gap-1">
                                {isExpanded ? 'Hide' : 'View'} ({compEvents.length})
                              </span>
                            </td>
                          </tr>

                          {/* Nested Interaction Details Accordion */}
                          {isExpanded && (
                            <tr className="bg-transparent">
                              <td colSpan={7} className="p-0 border-none">
                                <div className="mx-2 mb-4 p-4 rounded-2xl bg-dark/[0.02] dark:bg-light/[0.02] border border-dark/10 dark:border-light/10">
                                  <div className="flex items-center justify-between mb-3 text-xs">
                                    <span className="font-semibold text-dark/70 dark:text-light/70 font-mono flex items-center gap-1.5">
                                      <Building2 className="w-3.5 h-3.5 text-primary dark:text-primaryDark" />
                                      <span>Interactions for {c.company}</span>
                                    </span>
                                    <span className="text-[11px] text-dark/50 dark:text-light/50 font-mono">
                                      {compEvents.length} recorded event{compEvents.length === 1 ? '' : 's'}
                                    </span>
                                  </div>

                                  {c.is_security_scanner && (
                                    <div className="mb-3.5 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-[11px] flex items-center gap-2">
                                      <Shield className="w-4 h-4 shrink-0 text-blue-500" />
                                      <span>
                                        <strong>Enterprise Email Security Gateway Detected:</strong> Links were automatically pre-screened in seconds across cloud scanner IPs (e.g. Proofpoint / SafeLinks) upon email arrival.
                                      </span>
                                    </div>
                                  )}

                                  {c.prior_quarantined && c.prior_quarantined.length > 0 && (
                                    <div className="mb-3.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                                      <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-200">
                                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                        <span>Prior Outreach Replaced &amp; Retried:</span>
                                      </div>
                                      <div className="mt-1 space-y-1 text-[11px] text-dark/70 dark:text-light/70 font-mono">
                                        {c.prior_quarantined.map((pq, pqIdx) => (
                                          <div key={pqIdx}>
                                            • <span className="line-through text-dark/50 dark:text-light/50">{pq.recipient}</span> ({pq.status === 'blocked' ? 'Domain Block' : 'Address Bounce: 550 5.1.1'}) was replaced by active recipient <span className="font-bold text-emerald-600 dark:text-emerald-400">{c.recipients?.join(', ') || 'current'}</span>.
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {compEvents.length === 0 ? (
                                    <div className="text-center py-4 text-xs text-dark/50 dark:text-light/50 font-medium">
                                      No interaction events recorded yet for this company.
                                    </div>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left text-xs">
                                        <thead>
                                          <tr className="border-b border-dark/10 dark:border-light/10 text-dark/60 dark:text-light/60 font-mono text-[11px]">
                                            <th className="pb-2.5 font-semibold">Recruiter &amp; Track</th>
                                            <th className="pb-2.5 font-semibold">Event &amp; Class</th>
                                            <th className="pb-2.5 font-semibold">Detail</th>
                                            <th className="pb-2.5 font-semibold">Location &amp; IP</th>
                                            <th className="pb-2.5 font-semibold text-right">Time (IST)</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-dark/5 dark:divide-light/5">
                                          {compEvents.map((evt, eIdx) => {
                                            const { badgeStyle, label } = getEventBadge(evt);
                                            return (
                                              <tr
                                                key={`${evt.token}-${evt.ts}-${eIdx}`}
                                                className="hover:bg-dark/5 dark:hover:bg-light/5 transition-colors"
                                              >
                                                <td className="py-2.5">
                                                  <div className="font-medium text-dark/90 dark:text-light/90">
                                                    {evt.recipient || 'No email'}
                                                  </div>
                                                  {evt.track && (
                                                    <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.5 bg-dark/5 dark:bg-light/10 text-dark/70 dark:text-light/70 rounded-full font-medium">
                                                      {evt.track}
                                                    </span>
                                                  )}
                                                </td>

                                                <td className="py-2.5">
                                                  <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyle}`}
                                                  >
                                                    {label}
                                                  </span>
                                                </td>

                                                <td className="py-2.5 font-medium text-dark/80 dark:text-light/80">
                                                  {evt.slug ? (
                                                    <span className="font-mono text-primary dark:text-primaryDark">
                                                      /{evt.slug}
                                                    </span>
                                                  ) : evt.dwell_ms ? (
                                                    <span>{Math.round(evt.dwell_ms / 1000)}s visible</span>
                                                  ) : evt.event === 'open' ? (
                                                    <span className="text-dark/70 dark:text-light/70 font-mono text-[11px]">
                                                      Email Opened
                                                    </span>
                                                  ) : evt.event === 'resume_view' ? (
                                                    <span className="text-dark/70 dark:text-light/70 font-mono text-[11px]">
                                                      {evt.session_num ? `Session #${evt.session_num}` : 'Web Resume'}
                                                    </span>
                                                  ) : evt.event === 'resume_download' || evt.event === 'download' ? (
                                                    <span className="text-dark/70 dark:text-light/70 font-mono text-[11px]">
                                                      {evt.download_num ? `Download #${evt.download_num}` : 'PDF Download'}
                                                    </span>
                                                  ) : (
                                                    <span className="text-dark/40 dark:text-light/40">—</span>
                                                  )}
                                                </td>

                                                <td className="py-2.5">
                                                  {(() => {
                                                    const loc = formatLocation(evt.city, evt.country, evt.client_class, evt.ip_trunc);
                                                    return loc.isProxy ? (
                                                      <div>
                                                        <div
                                                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                                          title={loc.tooltip}
                                                        >
                                                          <Shield className="w-3 h-3 shrink-0" />
                                                          <span>{loc.text}</span>
                                                        </div>
                                                        <div className="text-[10px] font-mono text-dark/40 dark:text-light/40 mt-0.5">
                                                          {evt.ip_trunc || 'IP redacted'}
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      <div>
                                                        <div className="text-dark/80 dark:text-light/80 font-medium">
                                                          {loc.text}
                                                        </div>
                                                        <div className="text-[10px] font-mono text-dark/50 dark:text-light/50">
                                                          {evt.ip_trunc || 'IP redacted'}
                                                        </div>
                                                      </div>
                                                    );
                                                  })()}
                                                </td>

                                                <td className="py-2.5 font-mono text-right">
                                                  <div className="font-semibold text-xs text-dark/90 dark:text-light/90">
                                                    {formatRelativeTime(evt.ts)}
                                                  </div>
                                                  <div className="text-[10px] text-dark/50 dark:text-light/50">
                                                    {evt.ist_time || evt.ts}
                                                  </div>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : feedViewMode === 'blocked' ? (
              /* View Mode 3: Blocked & Bounced Quarantine Feed */
              <div className="overflow-x-auto">
                <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>
                      <strong>Quarantined Inactive Applications:</strong> {blockedCompaniesList.length} emails excluded from active outreach metrics due to enterprise tenant blocks or decommissioned mailboxes.
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-700 dark:text-rose-300">
                    {summary.total_blocked ?? 0} Blocked · {summary.total_bounced ?? 0} Bounced
                  </span>
                </div>

                {blockedCompaniesList.length === 0 ? (
                  <div className="text-center py-8 text-xs text-dark/50 dark:text-light/50 font-medium">
                    No blocked or bounced emails found in database.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-dark/10 dark:border-light/10 text-dark/60 dark:text-light/60 font-mono text-[11px]">
                        <th className="pb-3 font-semibold">Company &amp; Recruiter</th>
                        <th className="pb-3 font-semibold">Category</th>
                        <th className="pb-3 font-semibold">Reason / Server Response</th>
                        <th className="pb-3 font-semibold text-right">Identified Time (IST)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark/5 dark:divide-light/5">
                      {blockedCompaniesList.map((item, idx) => (
                        <tr
                          key={`${item.token}-${idx}`}
                          className="hover:bg-dark/5 dark:hover:bg-light/5 transition-colors"
                        >
                          <td className="py-3.5">
                            <div className="font-bold text-dark dark:text-light">
                              {item.company}
                            </div>
                            <div className="text-[11px] text-dark/60 dark:text-light/60">
                              {item.recipient}
                            </div>
                            {item.track && (
                              <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.5 bg-dark/5 dark:bg-light/10 text-dark/70 dark:text-light/70 rounded-full font-medium">
                                {item.track}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                item.status === 'blocked'
                                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                                  : item.status === 'voided'
                                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400'
                                  : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {item.status === 'blocked'
                                ? 'Domain Block'
                                : item.status === 'voided'
                                ? 'Deleted / Retried'
                                : 'Address Bounce'}
                            </span>
                          </td>

                          <td className="py-3.5 text-xs text-dark/70 dark:text-light/70 max-w-md">
                            <div className="line-clamp-2 font-mono text-[11px]" title={item.reason}>
                              {item.reason}
                            </div>
                          </td>

                          <td className="py-3.5 font-mono text-right text-xs text-dark/70 dark:text-light/70">
                            <div>{formatRelativeTime(item.bounced_at)}</div>
                            <div className="text-[10px] text-dark/50 dark:text-light/50">
                              {item.bounced_at_formatted}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              /* Flat Chronological Feed View */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-dark/10 dark:border-light/10 text-dark/60 dark:text-light/60 font-mono">
                      <th className="pb-3 font-semibold">Recruiter &amp; Company</th>
                      <th className="pb-3 font-semibold">Event &amp; Class</th>
                      <th className="pb-3 font-semibold">Detail</th>
                      <th className="pb-3 font-semibold">Location &amp; IP</th>
                      <th className="pb-3 font-semibold text-right">Time (IST)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark/5 dark:divide-light/5">
                    {recentEvents.map((evt, idx) => {
                      const { badgeStyle, label } = getEventBadge(evt);
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
                              {label}
                            </span>
                          </td>

                          <td className="py-3.5 text-dark/80 dark:text-light/80 font-medium">
                            {evt.slug && (
                              <span className="font-mono text-primary dark:text-primaryDark">
                                /{evt.slug}
                              </span>
                            )}
                            {evt.dwell_ms && <span>{Math.round(evt.dwell_ms / 1000)}s visible</span>}
                            {!evt.slug && !evt.dwell_ms && evt.event === 'open' && (
                              <span className="text-dark/70 dark:text-light/70 font-mono text-[11px]">
                                Email Opened
                              </span>
                            )}
                            {!evt.slug && !evt.dwell_ms && evt.event === 'resume_view' && (
                              <span className="text-dark/70 dark:text-light/70 font-mono text-[11px]">
                                {evt.session_num ? `Session #${evt.session_num}` : 'Web Resume'}
                              </span>
                            )}
                            {!evt.slug && !evt.dwell_ms && (evt.event === 'resume_download' || evt.event === 'download') && (
                              <span className="text-dark/70 dark:text-light/70 font-mono text-[11px]">
                                {evt.download_num ? `Download #${evt.download_num}` : 'PDF Download'}
                              </span>
                            )}
                            {!evt.slug && !evt.dwell_ms && evt.event !== 'open' && evt.event !== 'resume_view' && evt.event !== 'resume_download' && evt.event !== 'download' && (
                              <span className="text-dark/40 dark:text-light/40">—</span>
                            )}
                          </td>

                          <td className="py-3.5">
                            {(() => {
                              const loc = formatLocation(evt.city, evt.country, evt.client_class, evt.ip_trunc);
                              return loc.isProxy ? (
                                <div>
                                  <div
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                    title={loc.tooltip}
                                  >
                                    <Shield className="w-3 h-3 shrink-0" />
                                    <span>{loc.text}</span>
                                  </div>
                                  <div className="text-[11px] font-mono text-dark/40 dark:text-light/40 mt-0.5">
                                    {evt.ip_trunc || 'IP redacted'}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="text-dark/80 dark:text-light/80 font-medium">
                                    {loc.text}
                                  </div>
                                  <div className="text-[11px] font-mono text-dark/50 dark:text-light/50">
                                    {evt.ip_trunc || 'IP redacted'}
                                  </div>
                                </div>
                              );
                            })()}
                          </td>

                          <td className="py-3.5 font-mono text-right">
                            <div className="font-semibold text-xs text-dark/90 dark:text-light/90">
                              {formatRelativeTime(evt.ts)}
                            </div>
                            <div className="text-[10px] text-dark/50 dark:text-light/50">
                              {evt.ist_time || evt.ts}
                            </div>
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
