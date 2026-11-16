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
  ChevronLeft,
  ChevronUp,
  Building2,
  Layers,
  Users,
  Copy,
  Check,
  ExternalLink,
  ArrowDown,
  Cpu
} from 'lucide-react';

export { getServerSideProps } from '../../lib/mail/portal-gssp.js';

// Helper to format and decode geographic locations gracefully, masking privacy proxies dynamically
function formatLocation(city, country, clientClass, ip = '', asNumber = '', via = '') {
  const asn = String(asNumber || '').trim();
  const viaHeader = typeof via === 'string' ? via.toLowerCase() : '';

  const isGoogleProxy =
    clientClass === 'gmail_proxy' ||
    asn === '15169' ||
    asn === '36492' ||
    viaHeader.includes('google') ||
    (ip && (ip.startsWith('66.249.') || ip.startsWith('209.85.') || ip.startsWith('66.102.') || ip.startsWith('108.177.')));

  const isAppleRelay =
    clientClass === 'apple_mpp' ||
    asn === '13335' ||
    asn === '714' ||
    (ip && (ip.startsWith('17.') || ip.startsWith('104.28.')));

  if (isGoogleProxy) {
    return {
      text: 'Google Proxy (IP Masked)',
      isProxy: true,
      tooltip: 'GoogleImageProxy / AS15169 routed image fetch through Google Cloud data center to protect recipient privacy. Real IP is masked.'
    };
  }

  if (isAppleRelay) {
    return {
      text: 'Apple Relay (IP Masked)',
      isProxy: true,
      tooltip: 'Apple Mail Privacy Protection (MPP) / AS13335 pre-fetched image via Apple Privacy Relay network. Real IP is masked.'
    };
  }

  let cleanCity = city || '';
  try {
    cleanCity = decodeURIComponent(cleanCity);
  } catch (_) {}
  const text = [cleanCity, country].filter(Boolean).join(', ') || 'Direct / Unknown';
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

  if (evt.event === 'prefetch' || evt.is_prefetch) {
    if (evt.prefetch_type === 'security_scanner') {
      badgeStyle = 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400';
      label = 'Security Scanner';
    } else if (evt.client_class === 'gmail_proxy' || evt.prefetch_type === 'gmail_prefetch') {
      badgeStyle = 'bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400';
      label = 'Google Prefetch';
    } else if (evt.client_class === 'apple_mpp' || evt.prefetch_type === 'apple_prefetch') {
      badgeStyle = 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400';
      label = 'Apple MPP Prefetch';
    } else {
      badgeStyle = 'bg-zinc-500/10 border border-zinc-500/30 text-zinc-600 dark:text-zinc-400';
      label = 'Machine Prefetch';
    }
  } else if (evt.event === 'open') {
    badgeStyle =
      evt.client_class === 'apple_mpp'
        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400'
        : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400';
    label = `Recruiter Open (${evt.client_class === 'gmail_proxy' ? 'Gmail' : (evt.client_class || 'direct')})`;
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

// Helper to parse complex SMTP Diagnostic Status Notifications (DSNs) into structured tokens
function parseDiagnostic(raw) {
  if (!raw || typeof raw !== 'string') {
    return {
      code: null,
      cleanMsg: 'Mailbox delivery rejected.',
      helpUrl: null,
      serverTrace: null,
      raw: ''
    };
  }

  let text = raw.trim();
  const prefixMatch = text.match(/^(?:Bounced Email|Blocked Domain|Domain Block)\s*\(([\s\S]*)\)$/i);
  if (prefixMatch) {
    text = prefixMatch[1].trim();
  }

  let helpUrl = null;
  const urlMatch = text.match(/(https?:\/\/[^\s\]\)]+)/i);
  if (urlMatch) {
    helpUrl = urlMatch[1];
  }

  let serverTrace = null;
  const traceMatches = [...text.matchAll(/\[([A-Za-z0-9.\-_\s:T=]+)\]/g)];
  if (traceMatches.length > 0) {
    serverTrace = traceMatches.map((m) => m[1].trim()).join(' · ');
  }

  let code = null;
  const codeMatch = text.match(/\b(5\d{2}(?:\s+\d+\.\d+(?:\.\d+)?)?)\b/);
  if (codeMatch) {
    code = codeMatch[1];
  }

  let cleanMsg = text;
  if (code) {
    cleanMsg = cleanMsg.replace(code, '');
  }
  if (helpUrl) {
    cleanMsg = cleanMsg.replace(/For more information,? (?:see|go to)\s+https?:\/\/[^\s\]\)]+/gi, '');
    cleanMsg = cleanMsg.replace(helpUrl, '');
  }
  cleanMsg = cleanMsg.replace(/For more information,? (?:see|go to)\s*$/gi, '');
  cleanMsg = cleanMsg.replace(/\[[^\]]*\]/g, '');
  cleanMsg = cleanMsg.replace(/\[.*$/g, '');
  cleanMsg = cleanMsg.replace(/\s+/g, ' ').trim();
  cleanMsg = cleanMsg.replace(/^[:\s\-]+|[:\s\-]+$/g, '');

  if (!cleanMsg) {
    if (code && code.includes('5.1.1')) {
      cleanMsg = 'The email account that you tried to reach does not exist (NoSuchUser)';
    } else if (code && code.includes('5.4.1')) {
      cleanMsg = 'Recipient address rejected: Access denied (Enterprise tenant policy)';
    } else if (code && code.includes('5.4.14')) {
      cleanMsg = 'Hop count exceeded: Possible mail loop in mail router';
    } else if (code && code.includes('5.4.310')) {
      cleanMsg = 'Internal DNS domain not found on destination mail server';
    } else if (code && code.includes('5.7.1')) {
      cleanMsg = 'Relay access denied / recipient administrative restriction';
    } else {
      cleanMsg = 'Mailbox rejected transmission or address unreachable';
    }
  }

  if (cleanMsg && !/[.!?]$/.test(cleanMsg)) {
    cleanMsg += '.';
  }

  return { code, cleanMsg, helpUrl, serverTrace, raw };
}

// Reusable Pagination Component with Page Size Selector & Numbered Buttons
function PaginationBar({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'records'
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIdx = Math.min(safePage * pageSize, totalItems);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    if (safePage > 3) {
      pages.push('ellipsis-1');
    }
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (safePage < totalPages - 2) {
      pages.push('ellipsis-2');
    }
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 mt-4 border-t border-dark/10 dark:border-light/10 text-xs">
      {/* Left: Range info & Page Size Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-dark/60 dark:text-light/60 font-mono">
          Showing <span className="font-bold text-dark dark:text-light">{startIdx}</span> to{' '}
          <span className="font-bold text-dark dark:text-light">{endIdx}</span> of{' '}
          <span className="font-bold text-dark dark:text-light">{totalItems}</span> {itemLabel}
        </span>

        <div className="flex items-center gap-1.5 pl-2 sm:border-l sm:border-dark/10 sm:dark:border-light/10">
          <span className="text-dark/50 dark:text-light/50 text-[11px]">Show:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 rounded-lg bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10 font-mono text-dark dark:text-light text-xs focus:outline-none focus:border-primary dark:focus:border-primaryDark cursor-pointer"
          >
            {[10, 15, 25, 50, 100].map((sz) => (
              <option key={sz} value={sz} className="bg-light dark:bg-dark text-dark dark:text-light">
                {sz} per page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Page Navigation Buttons */}
      <div className="flex items-center gap-1 self-center sm:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage <= 1}
          className="px-2.5 py-1.5 rounded-lg border border-dark/10 dark:border-light/10 font-medium text-dark/70 dark:text-light/70 hover:bg-dark/5 dark:hover:bg-light/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Prev</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, pIdx) => {
            if (typeof p === 'string') {
              return (
                <span key={`ell-${pIdx}`} className="px-1 text-dark/40 dark:text-light/40">
                  …
                </span>
              );
            }
            const isActive = p === safePage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`w-7 h-7 rounded-lg font-mono font-medium text-xs flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-light dark:bg-primaryDark dark:text-dark font-bold shadow-xs'
                    : 'hover:bg-dark/5 dark:hover:bg-light/5 text-dark/70 dark:text-light/70'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage >= totalPages}
          className="px-2.5 py-1.5 rounded-lg border border-dark/10 dark:border-light/10 font-medium text-dark/70 dark:text-light/70 hover:bg-dark/5 dark:hover:bg-light/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
          title="Next Page"
        >
          <span className="hidden xs:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
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

  // Pagination states across views and sub-filters
  const [pageSize, setPageSize] = useState(15);
  const [pageCompany, setPageCompany] = useState(1);
  const [pageFlat, setPageFlat] = useState(1);
  const [pageBlocked, setPageBlocked] = useState(1);

  // Expandable raw diagnostic logs toggle state
  const [expandedDiagnostics, setExpandedDiagnostics] = useState({});
  const [copiedEmail, setCopiedEmail] = useState('');

  const toggleRawDiagnostic = (id) => {
    setExpandedDiagnostics((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopy = (email) => {
    if (!email) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(email);
        setCopiedEmail(email);
        setTimeout(() => setCopiedEmail(''), 2000);
      }
    } catch (_) {}
  };

  const handleCompanyFilterChange = (filter) => {
    setCompanyFilter(filter);
    setPageCompany(1);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPageCompany(1);
    setPageFlat(1);
    setPageBlocked(1);
  };

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
    (c) => (c.confidence_tier === 'high' || c.confidence_tier === 'medium' || c.opened > 0 || c.resume_viewed > 0 || c.clicks > 0)
  );
  const prefetchedCompanies = companyRollups.filter(
    (c) => c.confidence_tier === 'low' || (c.prefetches > 0 && !(c.opened > 0 || c.resume_viewed > 0 || c.clicks > 0))
  );
  const unopenedCompanies = companyRollups.filter(
    (c) => c.confidence_tier === 'unopened' || (!(c.opened > 0 || c.resume_viewed > 0 || c.clicks > 0) && !(c.prefetches > 0))
  );

  const displayedCompanies = companyFilter === 'opened'
    ? openedCompanies
    : companyFilter === 'prefetched'
    ? prefetchedCompanies
    : companyFilter === 'unopened'
    ? unopenedCompanies
    : companyRollups;

  // Sliced paginated datasets
  const paginatedCompanies = displayedCompanies.slice(
    (pageCompany - 1) * pageSize,
    pageCompany * pageSize
  );
  const paginatedEvents = recentEvents.slice(
    (pageFlat - 1) * pageSize,
    pageFlat * pageSize
  );
  const paginatedBlocked = blockedCompaniesList.slice(
    (pageBlocked - 1) * pageSize,
    pageBlocked * pageSize
  );

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
                  <div className="mt-3 flex items-center justify-between text-[11px] text-dark/60 dark:text-light/60 font-medium">
                    <span>Verified Human Reads</span>
                    {Number(summary.machine_prefetches || 0) > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400" title={`${summary.machine_prefetches} automated Google Image Proxy or Security Gateway prefetch scan(s)`}>
                        +{summary.machine_prefetches} prefetched
                      </span>
                    )}
                  </div>
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
                <div className="inline-flex rounded-xl p-1 bg-dark/[0.03] dark:bg-light/[0.04] border border-dark/5 dark:border-light/5 text-xs flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => handleCompanyFilterChange('all')}
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
                    onClick={() => handleCompanyFilterChange('opened')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      companyFilter === 'opened'
                        ? 'bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-300 font-bold shadow-sm'
                        : 'text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light'
                    }`}
                    title="Verified human reads, link clicks and resume views"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    <span>Human Engaged</span>
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
                    onClick={() => handleCompanyFilterChange('prefetched')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      companyFilter === 'prefetched'
                        ? 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-300 font-bold shadow-sm'
                        : 'text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light'
                    }`}
                    title="Automated Google Image Proxy or Security Gateway prefetching upon delivery"
                  >
                    <Cpu className="w-3.5 h-3.5 text-blue-500" />
                    <span>Prefetched</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                      companyFilter === 'prefetched'
                        ? 'bg-blue-500/20 text-blue-800 dark:text-blue-200'
                        : 'bg-dark/5 dark:bg-light/10 text-dark/60 dark:text-light/60'
                    }`}>
                      {prefetchedCompanies.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCompanyFilterChange('unopened')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      companyFilter === 'unopened'
                        ? 'bg-amber-500/20 text-amber-800 dark:bg-amber-500/30 dark:text-amber-300 font-bold shadow-sm'
                        : 'text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light'
                    }`}
                    title="Sent but pending recruiter opening"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                    <span>Unopened</span>
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
                  ? 'No human recruiter engagement recorded yet.'
                  : companyFilter === 'prefetched'
                  ? 'No automated machine prefetches recorded.'
                  : companyFilter === 'unopened'
                  ? 'All outreach emails have been engaged!'
                  : 'No company outreach registered yet. Telemetry will stream in real time.'}
              </div>
            ) : feedViewMode === 'company' ? (
              /* Grouped Company Rollup Table with Expandable Accordion */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[760px]">
                  <thead>
                    <tr className="border-b border-dark/10 dark:border-light/10 text-dark/60 dark:text-light/60 font-mono">
                      <th className="pb-3 pr-6 font-semibold min-w-[280px]">Company</th>
                      <th className="pb-3 px-3 font-semibold text-center w-14">Sent</th>
                      <th className="pb-3 px-3 font-semibold text-center w-16">Opened</th>
                      <th className="pb-3 px-3 font-semibold text-center w-16">Resume</th>
                      <th className="pb-3 px-3 font-semibold text-center w-14">Clicks</th>
                      <th className="pb-3 px-4 font-semibold min-w-[130px]">Last Active</th>
                      <th className="pb-3 pl-4 font-semibold text-right w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark/5 dark:divide-light/5">
                    {paginatedCompanies.map((c) => {
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
                            <td className="py-4 pr-6 font-bold text-dark dark:text-light">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="p-1 rounded-md bg-dark/5 dark:bg-light/5 group-hover:bg-primary/10 transition-colors shrink-0">
                                  {isExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-primary dark:text-primaryDark" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-dark/50 dark:text-light/50" />
                                  )}
                                </span>
                                <span className="text-sm font-semibold">{c.company}</span>
                                {Array.isArray(c.recipients) && c.recipients.length > 0 && (
                                  <span className="text-[11px] font-normal font-mono text-dark/60 dark:text-light/60">
                                    ({c.recipients.join(', ')})
                                  </span>
                                )}
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-dark/5 dark:bg-light/10 text-dark/70 dark:text-light/70">
                                  {compEvents.length} event{compEvents.length === 1 ? '' : 's'}
                                </span>
                                {c.journey_type === 'retry_success' && (
                                  <span
                                    className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 inline-flex items-center gap-1"
                                    title={`${c.prior_quarantined?.length || 1} prior failed attempt(s) replaced by active recipient`}
                                  >
                                    <AlertCircle className="w-3 h-3 text-amber-500" />
                                    <span>{c.prior_quarantined?.length || 1} Retried</span>
                                  </span>
                                )}
                                {c.journey_type === 'multi_contact' && (
                                  <span
                                    className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 inline-flex items-center gap-1"
                                    title={`${c.recipients?.length || 2} distinct recruiter contacts reached at this company`}
                                  >
                                    <Users className="w-3 h-3 text-blue-500" />
                                    <span>{c.recipients?.length || 2} Contacts</span>
                                  </span>
                                )}
                                {c.is_security_scanner && (
                                  <span
                                    className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 inline-flex items-center gap-1"
                                    title={c.scanner_note || 'Automated Email Security Gateway'}
                                  >
                                    <Shield className="w-3 h-3 text-purple-500" />
                                    <span>Scanner</span>
                                  </span>
                                )}
                                {c.confidence_tier === 'high' && (
                                  <span
                                    className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 inline-flex items-center gap-1"
                                    title={c.confidence_tooltip || 'Confirmed human engagement: Recruiter clicked links or inspected resume'}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                                    <span>Confirmed Read</span>
                                  </span>
                                )}
                                {c.confidence_tier === 'medium' && (
                                  <span
                                    className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 inline-flex items-center gap-1"
                                    title={c.confidence_tooltip || 'Probable human: Email opened > 60s post-send'}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                                    <span>Probable Read</span>
                                  </span>
                                )}
                                {c.confidence_tier === 'low' && (
                                  <span
                                    className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 inline-flex items-center gap-1"
                                    title={c.confidence_tooltip || 'Automated prefetch: Cached by Google Image Proxy or security scanner'}
                                  >
                                    <Cpu className="w-3 h-3 text-blue-500" />
                                    <span>Prefetched</span>
                                  </span>
                                )}
                                {c.confidence_tier === 'unopened' && (
                                  <span
                                    className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-dark/5 dark:bg-light/10 text-dark/50 dark:text-light/50 border border-dark/10 dark:border-light/10 inline-flex items-center gap-1"
                                    title={c.confidence_tooltip || 'Delivered to inbox, pending recruiter opening'}
                                  >
                                    <span>Unopened</span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-3 text-center text-dark/70 dark:text-light/70 font-mono">{c.sent}</td>
                            <td className="py-4 px-3 text-center font-mono">
                              <span className={`font-bold ${c.opened > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-dark/40 dark:text-light/40'}`}>
                                {c.opened}
                              </span>
                              {c.prefetches > 0 && (
                                <span className="block text-[9px] font-normal text-blue-500/80 font-mono" title={`${c.prefetches} automated prefetch/scan(s)`}>
                                  +{c.prefetches}p
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-3 text-center text-purple-600 dark:text-purple-400 font-bold font-mono">{c.resume_viewed}</td>
                            <td className="py-4 px-3 text-center text-amber-600 dark:text-amber-400 font-bold font-mono">{c.clicks}</td>
                            <td className="py-4 px-4 font-mono text-left whitespace-nowrap">
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
                            <td className="py-4 pl-4 text-right font-medium whitespace-nowrap">
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

                                  {/* Outreach Delivery Journey & Multi-Contact Stepper (Minimalist Timeline) */}
                                  {c.attempts_journey && c.attempts_journey.length > 1 && (
                                    <div className="mb-4 p-3.5 rounded-2xl bg-dark/[0.02] dark:bg-light/[0.02] border border-dark/10 dark:border-light/10 text-xs">
                                      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-dark/5 dark:border-light/5">
                                        <div className="flex items-center gap-2">
                                          <Clock className="w-3.5 h-3.5 text-primary dark:text-primaryDark" />
                                          <span className="font-semibold text-dark/80 dark:text-light/80">
                                            {c.journey_type === 'multi_contact' ? 'Multi-Contact Recruiter Outreach' : 'Delivery Journey'}
                                          </span>
                                          <span className="text-[10px] text-dark/40 dark:text-light/40 font-mono">
                                            ({c.attempts_journey.length} steps)
                                          </span>
                                        </div>
                                        <span className="text-[10px] font-mono text-dark/50 dark:text-light/50">
                                          {c.journey_type === 'multi_contact' ? 'Multi-Contact' : 'Discovery Chain'}
                                        </span>
                                      </div>

                                      <div className="space-y-2">
                                        {c.attempts_journey.map((att, attIdx) => {
                                          const isBlock = att.status === 'blocked';
                                          const isVoid = att.status === 'voided';
                                          const isFailed = !att.is_active;
                                          const diag = isFailed ? parseDiagnostic(att.reason) : null;
                                          const journeyRawKey = `journey-${att.token}-${attIdx}`;
                                          const isRawExpanded = !!expandedDiagnostics[journeyRawKey];

                                          return (
                                            <div
                                              key={`${att.token}-${attIdx}`}
                                              className={`p-3 rounded-xl border transition-all ${
                                                att.is_active
                                                  ? 'bg-emerald-500/[0.03] border-emerald-500/20 dark:bg-emerald-500/[0.06]'
                                                  : 'bg-dark/[0.02] dark:bg-light/[0.02] border-dark/10 dark:border-light/10'
                                              }`}
                                            >
                                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                  {/* Recruiter Email & Status Badges Row */}
                                                  <div className="flex items-center gap-2 flex-wrap">
                                                    <span
                                                      className={`w-4 h-4 rounded-full text-[9px] font-bold font-mono flex items-center justify-center shrink-0 ${
                                                        att.is_active
                                                          ? 'bg-emerald-500 text-white'
                                                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/30'
                                                      }`}
                                                    >
                                                      {att.is_active ? '✓' : att.step}
                                                    </span>

                                                    <span className={`font-mono text-xs font-semibold ${att.is_active ? 'text-dark dark:text-light' : 'text-dark/50 dark:text-light/50 line-through'}`}>
                                                      {att.recipient}
                                                    </span>

                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopy(att.recipient);
                                                      }}
                                                      className="p-0.5 hover:bg-dark/10 dark:hover:bg-light/10 rounded transition-colors text-dark/40 dark:text-light/40 hover:text-dark dark:hover:text-light cursor-pointer"
                                                      title="Copy recruiter email"
                                                    >
                                                      {copiedEmail === att.recipient ? (
                                                        <Check className="w-3 h-3 text-emerald-500" />
                                                      ) : (
                                                        <Copy className="w-3 h-3" />
                                                      )}
                                                    </button>

                                                    {att.track && (
                                                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase bg-dark/5 dark:bg-light/10 text-dark/60 dark:text-light/60">
                                                        {att.track}
                                                      </span>
                                                    )}

                                                    <span
                                                      className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                                                        att.is_active
                                                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                          : isBlock
                                                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                          : isVoid
                                                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                      }`}
                                                    >
                                                      {att.is_active ? 'Active' : isBlock ? 'Blocked' : isVoid ? 'Voided' : 'Bounced'}
                                                    </span>
                                                  </div>

                                                  {/* Details Row */}
                                                  {att.is_active ? (
                                                    <div className="mt-1 pl-6 flex items-center gap-2 flex-wrap font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                                                      <span className="font-semibold">Delivered &amp; Active</span>
                                                      <span className="text-dark/30 dark:text-light/30">·</span>
                                                      <span className="text-dark/70 dark:text-light/70">{att.opens} opens</span>
                                                      <span className="text-dark/70 dark:text-light/70">{att.clicks} clicks</span>
                                                      <span className="text-dark/70 dark:text-light/70">{att.resume_views} resume view{att.resume_views === 1 ? '' : 's'}</span>
                                                    </div>
                                                  ) : (
                                                    <div className="mt-1 pl-6 text-[11px] text-dark/70 dark:text-light/70">
                                                      <div className="flex items-baseline gap-1.5 flex-wrap">
                                                        {diag?.code && (
                                                          <span className="font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                                            [{diag.code}]
                                                          </span>
                                                        )}
                                                        <span className="leading-snug">{diag?.cleanMsg}</span>
                                                        {diag?.helpUrl && (
                                                          <a
                                                            href={diag.helpUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-0.5 font-mono text-[10px] text-primary dark:text-primaryDark hover:underline"
                                                          >
                                                            <span>Docs</span>
                                                            <ExternalLink className="w-2.5 h-2.5" />
                                                          </a>
                                                        )}
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleRawDiagnostic(journeyRawKey);
                                                          }}
                                                          className="text-[10px] font-mono text-dark/40 dark:text-light/40 hover:text-dark dark:hover:text-light underline decoration-dotted cursor-pointer"
                                                        >
                                                          {isRawExpanded ? 'hide raw' : 'raw dsn'}
                                                        </button>
                                                      </div>

                                                      {isRawExpanded && (
                                                        <div className="mt-1.5 p-2 rounded-lg bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10 font-mono text-[10px] text-dark/70 dark:text-light/70 break-all select-all">
                                                          {diag?.raw}
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>

                                                {/* Timestamp */}
                                                <div className="text-[10px] font-mono text-dark/40 dark:text-light/40 sm:text-right shrink-0 pl-6 sm:pl-0">
                                                  <div>{formatRelativeTime(att.created_at)}</div>
                                                  <div className="text-[9px] text-dark/30 dark:text-light/30">{att.created_at_formatted}</div>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
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
                                                  ) : evt.event === 'open' || evt.event === 'prefetch' || evt.is_prefetch ? (
                                                    <span className="text-dark/70 dark:text-light/70 font-mono text-[11px]">
                                                      {evt.delta_sec ? (evt.delta_sec >= 60 ? `+${Math.round(evt.delta_sec / 60)}m post-send` : `+${evt.delta_sec}s post-send`) : (evt.is_prefetch ? 'Automated Pre-scan' : 'Email Opened')}
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
                                                    const loc = formatLocation(evt.city, evt.country, evt.client_class, evt.ip_trunc, evt.as_number, evt.via);
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
                <PaginationBar
                  totalItems={displayedCompanies.length}
                  currentPage={pageCompany}
                  pageSize={pageSize}
                  onPageChange={setPageCompany}
                  onPageSizeChange={handlePageSizeChange}
                  itemLabel="organisations"
                />
              </div>
            ) : feedViewMode === 'blocked' ? (
              /* View Mode 3: Blocked & Bounced Quarantine Feed */
              <div className="overflow-x-auto">
                <div className="mb-4 p-4 rounded-2xl bg-white/70 dark:bg-dark/40 backdrop-blur-md border border-dark/10 dark:border-light/10 shadow-sm flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-dark dark:text-light">
                        Quarantined Inactive Applications ({blockedCompaniesList.length})
                      </div>
                      <div className="text-[11px] text-dark/60 dark:text-light/60">
                        Excluded from active engagement metrics due to decommissioned mailboxes or domain blocks.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold border border-rose-500/20">
                      {summary.total_blocked ?? 0} Blocked
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/20">
                      {summary.total_bounced ?? 0} Bounced
                    </span>
                    {summary.total_voided > 0 && (
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold border border-purple-500/20">
                        {summary.total_voided} Retried
                      </span>
                    )}
                  </div>
                </div>

                {blockedCompaniesList.length === 0 ? (
                  <div className="text-center py-12 text-xs text-dark/50 dark:text-light/50 font-medium">
                    No blocked or bounced emails found in database.
                  </div>
                ) : (
                  <>
                    <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-dark/10 dark:border-light/10 text-dark/60 dark:text-light/60 font-mono text-[11px]">
                        <th className="pb-3 font-semibold">Company &amp; Recruiter</th>
                        <th className="pb-3 font-semibold">Classification</th>
                        <th className="pb-3 font-semibold">Server Diagnostic Response</th>
                        <th className="pb-3 font-semibold text-right">Identified Time (IST)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark/5 dark:divide-light/5">
                      {(() => {
                        const activeCompanyNames = new Set(companyRollups.map(c => (c.company || '').toLowerCase().trim()));
                        const companyFailCounts = {};
                        for (const b of blockedCompaniesList) {
                          const norm = (b.company || '').toLowerCase().trim();
                          companyFailCounts[norm] = (companyFailCounts[norm] || 0) + 1;
                        }

                        return paginatedBlocked.map((item, idx) => {
                          const normName = (item.company || '').toLowerCase().trim();
                          const hasActive = activeCompanyNames.has(normName);
                          const failCount = companyFailCounts[normName] || 1;
                          const diag = parseDiagnostic(item.reason);
                          const isRawExpanded = !!expandedDiagnostics[item.token];

                          return (
                            <tr
                              key={`${item.token}-${idx}`}
                              className="hover:bg-dark/[0.02] dark:hover:bg-light/[0.02] transition-colors"
                            >
                              <td className="py-3.5 pr-4">
                                <div className="font-bold text-dark dark:text-light flex items-center gap-1.5 flex-wrap">
                                  <span>{item.company}</span>
                                  {hasActive ? (
                                    <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 rounded-full font-mono font-medium">
                                      ✓ Retried &amp; Active
                                    </span>
                                  ) : failCount > 1 ? (
                                    <span className="text-[9px] px-2 py-0.5 bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/25 rounded-full font-mono font-medium">
                                      {failCount} Attempts Failed
                                    </span>
                                  ) : null}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[11px] text-dark/60 dark:text-light/60 font-mono">
                                    {item.recipient}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(item.recipient);
                                    }}
                                    className="p-1 hover:bg-dark/10 dark:hover:bg-light/10 rounded transition-colors text-dark/40 dark:text-light/40 hover:text-dark dark:hover:text-light cursor-pointer"
                                    title="Copy recruiter email"
                                  >
                                    {copiedEmail === item.recipient ? (
                                      <Check className="w-3 h-3 text-emerald-500" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                                {item.track && (
                                  <span className="inline-block mt-1 text-[9px] px-1.5 py-0.2 bg-dark/5 dark:bg-light/10 text-dark/60 dark:text-light/60 rounded font-mono uppercase tracking-wider">
                                    {item.track}
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 pr-4 whitespace-nowrap">
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
                                    ? 'Voided for Retry'
                                    : 'Address Bounce'}
                                </span>
                              </td>

                              <td className="py-3.5 pr-4 text-xs">
                                <div className="space-y-1.5 max-w-xl">
                                  <div className="flex items-start gap-2 flex-wrap">
                                    {diag.code && (
                                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/25 shrink-0">
                                        {diag.code}
                                      </span>
                                    )}
                                    <span className="text-xs font-medium text-dark/90 dark:text-light/90 leading-relaxed">
                                      {diag.cleanMsg}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3 pt-0.5 flex-wrap">
                                    {diag.helpUrl && (
                                      <a
                                        href={diag.helpUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[11px] font-mono text-primary dark:text-primaryDark hover:underline cursor-pointer"
                                      >
                                        <span>
                                          {diag.helpUrl.includes('google')
                                            ? 'Google Help Guide'
                                            : diag.helpUrl.includes('aka.ms') || diag.helpUrl.includes('microsoft')
                                            ? 'Microsoft DSN Guide'
                                            : 'Vendor Help Guide'}
                                        </span>
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => toggleRawDiagnostic(item.token)}
                                      className="text-[10px] font-mono text-dark/50 dark:text-light/50 hover:text-dark dark:hover:text-light underline decoration-dotted transition-colors cursor-pointer"
                                    >
                                      {isRawExpanded ? '▲ Hide raw server DSN' : '▼ Raw server DSN log'}
                                    </button>
                                  </div>

                                  {isRawExpanded && (
                                    <div className="mt-2 p-2.5 rounded-xl bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10 font-mono text-[10px] text-dark/80 dark:text-light/80 break-all select-all leading-relaxed">
                                      {diag.raw}
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td className="py-3.5 font-mono text-right text-xs text-dark/70 dark:text-light/70 whitespace-nowrap">
                                <div className="font-semibold text-dark/90 dark:text-light/90">{formatRelativeTime(item.bounced_at)}</div>
                                <div className="text-[10px] text-dark/45 dark:text-light/45">
                                  {item.bounced_at_formatted}
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                    <PaginationBar
                      totalItems={blockedCompaniesList.length}
                      currentPage={pageBlocked}
                      pageSize={pageSize}
                      onPageChange={setPageBlocked}
                      onPageSizeChange={handlePageSizeChange}
                      itemLabel="quarantined records"
                    />
                  </>
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
                    {paginatedEvents.map((evt, idx) => {
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
                            {!evt.slug && !evt.dwell_ms && (evt.event === 'open' || evt.event === 'prefetch' || evt.is_prefetch) && (
                              <span className="text-dark/70 dark:text-light/70 font-mono text-[11px]">
                                {evt.delta_sec ? (evt.delta_sec >= 60 ? `+${Math.round(evt.delta_sec / 60)}m post-send` : `+${evt.delta_sec}s post-send`) : (evt.is_prefetch ? 'Automated Pre-scan' : 'Email Opened')}
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
                              const loc = formatLocation(evt.city, evt.country, evt.client_class, evt.ip_trunc, evt.as_number, evt.via);
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
                <PaginationBar
                  totalItems={recentEvents.length}
                  currentPage={pageFlat}
                  pageSize={pageSize}
                  onPageChange={setPageFlat}
                  onPageSizeChange={handlePageSizeChange}
                  itemLabel="interaction events"
                />
              </div>
            )}
          </div>
        </Layout>
      </main>
    </>
  );
}
