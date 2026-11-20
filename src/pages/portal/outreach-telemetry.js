import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import TransitionEffect from '@/components/layout/TransitionEffect.js';
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
  Users,
  Copy,
  Check,
  ExternalLink,
  Cpu,
  Search,
  Filter,
  Inbox
} from 'lucide-react';

export { getServerSideProps } from '../../lib/mail/portal-gssp.js';

// Helper to format and decode geographic locations gracefully, masking privacy proxies
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

// Clean event badge styling without noisy pastel backgrounds
function getEventBadge(evt) {
  let badgeStyle = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
  let label = evt.event;

  if (evt.event === 'prefetch' || evt.is_prefetch) {
    if (evt.prefetch_type === 'security_scanner') {
      badgeStyle = 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-400';
      label = 'Security Scanner';
    } else if (evt.prefetch_type === 'scanner_link_detonation') {
      badgeStyle = 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-400';
      label = 'Link Detonation';
    } else if (evt.prefetch_type === 'scanner_doc_detonation') {
      badgeStyle = 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-400';
      label = 'Doc Detonation';
    } else if (evt.prefetch_type === 'sender_browsing_burst') {
      badgeStyle = 'bg-purple-500/10 border-purple-500/25 text-purple-700 dark:text-purple-400';
      label = 'Sender Review';
    } else if (evt.client_class === 'gmail_proxy' || evt.prefetch_type === 'gmail_prefetch') {
      badgeStyle = 'bg-blue-500/10 border-blue-500/25 text-blue-700 dark:text-blue-400';
      label = 'Google Prefetch';
    } else if (evt.client_class === 'apple_mpp' || evt.prefetch_type === 'apple_prefetch') {
      badgeStyle = 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-400';
      label = 'Apple MPP';
    } else {
      badgeStyle = 'bg-zinc-500/10 border-zinc-500/25 text-zinc-700 dark:text-zinc-400';
      label = 'Machine Prefetch';
    }
  } else if (evt.event === 'open') {
    badgeStyle =
      evt.client_class === 'apple_mpp'
        ? 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-400'
        : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400';
    label = `Recruiter Open (${evt.client_class === 'gmail_proxy' ? 'Gmail' : (evt.client_class || 'direct')})`;
  } else if (evt.event === 'click') {
    badgeStyle = 'bg-cyan-500/10 border-cyan-500/25 text-cyan-700 dark:text-cyan-400';
    label = 'Showcase Click';
  } else if (evt.event === 'resume_view') {
    badgeStyle = 'bg-purple-500/10 border-purple-500/25 text-purple-700 dark:text-purple-400';
    label = 'Resume View';
  } else if (evt.event === 'download' || evt.event === 'resume_download') {
    badgeStyle = 'bg-indigo-500/10 border-indigo-500/25 text-indigo-700 dark:text-indigo-400';
    label = 'Resume Download';
  } else if (evt.event === 'beacon_dwell') {
    label = 'Active Dwell';
  }

  return { badgeStyle, label };
}

// Minimalist hairline sparklines
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

// Helper to parse complex SMTP Diagnostic Status Notifications (DSNs) into clean structured tokens
function parseDiagnostic(raw) {
  if (!raw || typeof raw !== 'string') {
    return {
      code: null,
      cleanMsg: 'Mailbox delivery rejected',
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

  return { code, cleanMsg, helpUrl, serverTrace, raw };
}

// Clean pagination control following unslop tokens
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
    <div className="flex items-center justify-between sm:flex-col sm:items-start gap-3 px-5 py-3.5 border-t border-zinc-200/80 dark:border-zinc-800/80 text-xs bg-zinc-50/50 dark:bg-zinc-900/20">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-zinc-500 font-mono">
          Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">{startIdx}</span>–<span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">{endIdx}</span> of <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">{totalItems}</span> {itemLabel}
        </span>

        <div className="flex items-center gap-1.5 pl-2 sm:border-l sm:border-zinc-200 sm:dark:border-zinc-800">
          <span className="text-zinc-400 text-[11px]">Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 cursor-pointer shadow-2xs"
          >
            {[10, 15, 25, 50, 100].map((sz) => (
              <option key={sz} value={sz} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                {sz}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1 self-center sm:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage <= 1}
          className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer text-xs shadow-2xs"
          title="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Prev</span>
        </button>

        <div className="flex items-center gap-0.5">
          {getPageNumbers().map((p, pIdx) => {
            if (typeof p === 'string') {
              return (
                <span key={`ell-${pIdx}`} className="px-1.5 text-zinc-400">
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
                className={`w-7 h-7 rounded font-mono text-xs flex items-center justify-center transition-colors cursor-pointer tabular-nums ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
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
          className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer text-xs shadow-2xs"
          title="Next page"
        >
          <span>Next</span>
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

  // Accordion toggle state and view mode switch
  const [collapsedCompanies, setCollapsedCompanies] = useState({});
  const [feedViewMode, setFeedViewMode] = useState('company'); // 'company' | 'flat' | 'blocked'
  const [companyFilter, setCompanyFilter] = useState('all'); // 'all' | 'opened' | 'prefetched' | 'unopened'
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination states
  const [pageSize, setPageSize] = useState(15);
  const [pageCompany, setPageCompany] = useState(1);
  const [pageFlat, setPageFlat] = useState(1);
  const [pageBlocked, setPageBlocked] = useState(1);

  // Diagnostics toggle and copy state
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

  // Fetch telemetry statistics
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

  // Manual refresh with visual feedback and cache bypass
  const handleManualRefresh = async () => {
    if (isManualRefreshing || loadingStats) return;
    setIsManualRefreshing(true);
    const start = Date.now();
    try {
      await fetchStats(false, true);
    } finally {
      const elapsed = Date.now() - start;
      const minSpinMs = 500;
      if (elapsed < minSpinMs) {
        await new Promise((resolve) => setTimeout(resolve, minSpinMs - elapsed));
      }
      setIsManualRefreshing(false);
    }
  };

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
        setAuthError(data.error || 'Invalid administrative passkey');
      }
    } catch (err) {
      setAuthError('Connection failed. Please retry');
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
    } catch (_) {}
    setIsAuthenticated(false);
    setStats(null);
  };

  // View 1: Unauthenticated Passkey Console Gateway
  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Outreach Telemetry Gateway | Urva Gandhi</title>
          <meta name="robots" content="noindex, nofollow, noarchive" />
        </Head>
        <TransitionEffect />
        <main className="flex min-h-screen w-full flex-col items-center justify-center px-4 pt-32 pb-16 bg-[#f8f9fa] dark:bg-[#0a0a0c]">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121316] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Telemetry Console
                </h1>
                <p className="text-xs text-zinc-500">
                  Administrative access required
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {authError && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Security passkey
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    placeholder="Enter passkey"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors pr-9 font-mono"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading || !passkey.trim()}
                className="w-full py-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
              >
                {authLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Unlock console</span>
                  </>
                )}
              </button>
            </form>
          </div>
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

  const displayedCompaniesBase = companyFilter === 'opened'
    ? openedCompanies
    : companyFilter === 'prefetched'
    ? prefetchedCompanies
    : companyFilter === 'unopened'
    ? unopenedCompanies
    : companyRollups;

  // Real-time search filter
  const displayedCompanies = useMemo(() => {
    if (!searchTerm.trim()) return displayedCompaniesBase;
    const q = searchTerm.toLowerCase().trim();
    return displayedCompaniesBase.filter((c) => {
      const matchComp = (c.company || '').toLowerCase().includes(q);
      const matchRec = Array.isArray(c.recipients) && c.recipients.some(r => r.toLowerCase().includes(q));
      return matchComp || matchRec;
    });
  }, [displayedCompaniesBase, searchTerm]);

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

  const sparkOutreach = computeRealSparkline(recentEvents, () => true);
  const sparkOpens = computeRealSparkline(recentEvents, (e) => e.event === 'open');
  const sparkResumes = computeRealSparkline(
    recentEvents,
    (e) => e.event === 'resume_view' || e.event === 'beacon_dwell'
  );
  const sparkClicks = computeRealSparkline(recentEvents, (e) => e.event === 'click');

  return (
    <>
      <Head>
        <title>Outreach Telemetry | Urva Gandhi</title>
        <meta name="robots" content="noindex, nofollow, noarchive" />
      </Head>
      <TransitionEffect />
      <main className="w-full min-h-screen text-zinc-900 dark:text-zinc-100 pb-20 pt-32 sm:pt-28 bg-[#f8f9fa] dark:bg-[#0a0a0c]">
        <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-4">
          
          {/* Console Header Bar */}
          <div className="flex items-end justify-between md:flex-col md:items-start gap-4 pb-6 mb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 dark:text-zinc-500 mb-1.5">
                <span>Portal</span>
                <span>/</span>
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">Outreach Telemetry</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Outreach Telemetry
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Deliverability, recipient interaction and scanner telemetry across active applications
              </p>
            </div>

            {/* Console Actions & Status */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Calm Status Heartbeat */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-medium shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Live</span>
                <span className="text-zinc-300 dark:text-zinc-700">·</span>
                <span className="tabular-nums">{summary.total_companies ?? companyRollups.length} orgs</span>
              </div>

              {/* IST Clock */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 text-xs font-mono tabular-nums text-zinc-600 dark:text-zinc-300 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>{currentTimeIst || 'Syncing...'}</span>
              </div>

              {/* Refresh Action */}
              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isManualRefreshing || loadingStats}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/80 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                title="Refresh metrics"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 transition-transform ${
                    isManualRefreshing || loadingStats ? 'animate-spin' : ''
                  }`}
                />
                <span>{isManualRefreshing ? 'Refreshing' : 'Refresh'}</span>
              </button>

              {/* Sign Out Action */}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>

          {statsError && (
            <div className="w-full mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statsError}</span>
            </div>
          )}

          {/* 4 Top KPI Metric Cards in Desktop-First 4-Column Grid */}
          <div className="grid grid-cols-4 lg:grid-cols-2 sm:grid-cols-1 gap-4 w-full mb-6">
            
            {/* Card 1: Total Companies Outreach */}
            <div className="p-5 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121316] flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Total companies
                  </span>
                  <Mail className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-semibold tracking-tight font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                      {companyRollups.length > 0 ? companyRollups.length : (summary.total_companies ?? summary.total_sent ?? 0)}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      orgs
                    </span>
                  </div>
                  {/* Real 1.5px Hairline Sparkline */}
                  <svg viewBox="0 0 80 24" className="w-16 h-6" fill="none">
                    <path d={sparkOutreach.line} stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="tabular-nums font-medium text-zinc-700 dark:text-zinc-300">{summary.total_sent ?? 0}</span> active
                </span>
                {(summary.total_inactive ?? 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => setFeedViewMode('blocked')}
                    className="text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 underline decoration-dotted cursor-pointer tabular-nums"
                    title="View filtered and quarantined addresses"
                  >
                    {summary.total_inactive} filtered
                  </button>
                )}
              </div>
            </div>

            {/* Card 2: Human Engaged */}
            <div className="p-5 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121316] flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Human engaged
                  </span>
                  <Eye className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold tracking-tight font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                      {openedCompanies.length}
                    </span>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 tabular-nums">
                      {companyRollups.length > 0 ? Math.round((openedCompanies.length / companyRollups.length) * 100) : (summary.open_rate_percent ?? 0)}%
                    </span>
                  </div>
                  <svg viewBox="0 0 80 24" className="w-16 h-6" fill="none">
                    <path d={sparkOpens.line} stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-500">
                <span className="tabular-nums"><strong className="text-zinc-800 dark:text-zinc-200 font-medium">{summary.verified_opens ?? 0}</strong> read</span>
                {Number(summary.machine_prefetches || 0) > 0 && (
                  <span className="text-[11px] tabular-nums text-zinc-400" title={`${summary.machine_prefetches} automated scanner prefetch scans`}>
                    +{summary.machine_prefetches} prefetched
                  </span>
                )}
              </div>
            </div>

            {/* Card 3: Resume Views */}
            <div className="p-5 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121316] flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Resume views
                  </span>
                  <FileText className="w-4 h-4 text-purple-500" />
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold tracking-tight font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                      {summary.total_resume_views ?? 0}
                    </span>
                    <span className="text-xs font-mono text-zinc-500 tabular-nums">
                      {summary.avg_dwell_seconds ?? 0}s avg
                    </span>
                  </div>
                  <svg viewBox="0 0 80 24" className="w-16 h-6" fill="none">
                    <path d={sparkResumes.line} stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="tabular-nums font-medium text-zinc-700 dark:text-zinc-300">{summary.total_downloads ?? 0}</span> direct downloads
                </span>
              </div>
            </div>

            {/* Card 4: Project Clicks */}
            <div className="p-5 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121316] flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Project clicks
                  </span>
                  <MousePointer className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-semibold tracking-tight font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                    {summary.total_clicks ?? 0}
                  </span>
                  <svg viewBox="0 0 80 24" className="w-16 h-6" fill="none">
                    <path d={sparkClicks.line} stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-500">
                <span>Showcase &amp; demo hops</span>
                <span className="tabular-nums text-zinc-400">{slugRankings.length} slugs</span>
              </div>
            </div>

          </div>

          {/* Showcase Link Leaderboard */}
          <div className="p-5 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121316] mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-zinc-500" />
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Showcase Link Leaderboard
                </h2>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                {slugRankings.length} slugs tracked
              </span>
            </div>

            {slugRankings.length === 0 ? (
              <div className="text-center py-4 text-xs text-zinc-400">
                No project clicks recorded yet
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-8 gap-y-3.5">
                {slugRankings.map((item, idx) => {
                  const maxClicks = Math.max(...slugRankings.map((s) => s.clicks), 1);
                  const pct = Math.round((item.clicks / maxClicks) * 100);
                  return (
                    <div key={item.slug} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-800 dark:text-zinc-200 font-medium flex items-center gap-1.5">
                          <span className="text-[10px] text-zinc-400">#{idx + 1}</span>
                          <span>{item.slug}</span>
                        </span>
                        <span className="text-zinc-500 tabular-nums">
                          {item.clicks} click{item.clicks === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-zinc-700 dark:bg-zinc-300 h-1.5 rounded-full transition-[width] duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recruiter Engagement Hub Table Container */}
          <div className="rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121316] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            
            {/* Header: Title + Primary View Switcher */}
            <div className="p-4 sm:p-5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between lg:flex-col lg:items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-zinc-500" />
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Recruiter Engagement &amp; Deliverability
                  </h2>
                </div>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">
                  {feedViewMode === 'company'
                    ? `${displayedCompanies.length} of ${companyRollups.length} organisations · ${recentEvents.length} interaction events`
                    : feedViewMode === 'flat'
                    ? `${recentEvents.length} chronological interaction events`
                    : `${blockedCompaniesList.length} quarantined addresses (${summary.total_blocked || 0} blocked · ${summary.total_bounced || 0} bounced)`
                  }
                </p>
              </div>

              {/* Segmented View Switcher */}
              <div className="inline-flex rounded-lg p-0.5 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setFeedViewMode('company')}
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                    feedViewMode === 'company'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-2xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Company View</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFeedViewMode('flat')}
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                    feedViewMode === 'flat'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-2xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>All Events</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFeedViewMode('blocked')}
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                    feedViewMode === 'blocked'
                      ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 font-semibold shadow-2xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                  title="View blocked domains and bounced email addresses"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Filtered</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 tabular-nums">
                    {blockedCompaniesList.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Sub-Filters & Real-Time Search Bar (for Company View) */}
            {feedViewMode === 'company' && (
              <div className="p-3.5 sm:p-3 bg-zinc-50/70 dark:bg-zinc-900/40 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between lg:flex-col lg:items-stretch gap-3 text-xs">
                
                {/* Segmented Filter Control */}
                <div className="inline-flex rounded-lg p-0.5 bg-zinc-200/60 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 font-medium">
                  <button
                    type="button"
                    onClick={() => handleCompanyFilterChange('all')}
                    className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                      companyFilter === 'all'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-2xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <span>All</span>
                    <span className="font-mono text-[11px] tabular-nums text-zinc-400">{companyRollups.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCompanyFilterChange('opened')}
                    className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                      companyFilter === 'opened'
                        ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 font-semibold shadow-2xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                    title="Verified human reads, clicks and resume views"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Human Engaged</span>
                    <span className="font-mono text-[11px] tabular-nums text-zinc-400">{openedCompanies.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCompanyFilterChange('prefetched')}
                    className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                      companyFilter === 'prefetched'
                        ? 'bg-white dark:bg-zinc-900 text-blue-700 dark:text-blue-400 font-semibold shadow-2xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                    title="Automated scanner or image proxy prefetch upon delivery"
                  >
                    <Cpu className="w-3.5 h-3.5 text-blue-500" />
                    <span>Prefetched</span>
                    <span className="font-mono text-[11px] tabular-nums text-zinc-400">{prefetchedCompanies.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCompanyFilterChange('unopened')}
                    className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                      companyFilter === 'unopened'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-semibold shadow-2xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                    title="Delivered to inbox, pending recruiter opening"
                  >
                    <span>Unopened</span>
                    <span className="font-mono text-[11px] tabular-nums text-zinc-400">{unopenedCompanies.length}</span>
                  </button>
                </div>

                {/* Search Box + Expand/Collapse */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPageCompany(1);
                      }}
                      placeholder="Filter company or recruiter..."
                      className="pl-8 pr-6 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors w-60 sm:w-full font-mono shadow-2xs"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs font-mono"
                        title="Clear filter"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {displayedCompanies.length > 0 && (
                    <div className="flex items-center gap-1 text-xs font-mono text-zinc-400 shrink-0">
                      <button
                        type="button"
                        onClick={() => expandAll()}
                        className="px-2 py-1 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer flex items-center gap-1"
                        title="Expand all"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>Expand</span>
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => collapseAll(displayedCompanies)}
                        className="px-2 py-1 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer flex items-center gap-1"
                        title="Collapse all"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span>Collapse</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {displayedCompanies.length === 0 ? (
              <div className="text-center py-12 text-xs text-zinc-400">
                {searchTerm
                  ? `No organisations matching "${searchTerm}"`
                  : companyFilter === 'opened'
                  ? 'No human recruiter engagement recorded yet'
                  : companyFilter === 'prefetched'
                  ? 'No automated machine prefetches recorded'
                  : companyFilter === 'unopened'
                  ? 'All outreach emails have been engaged'
                  : 'No company outreach registered yet'}
              </div>
            ) : feedViewMode === 'company' ? (
              
              /* Grouped Company Rollup Table with Dedicated Status Column */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[840px]">
                  <thead>
                    <tr className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-500 font-mono text-[11px]">
                      <th className="py-3 px-5 font-medium min-w-[280px]">Company &amp; Recruiter</th>
                      <th className="py-3 px-3 font-medium min-w-[170px]">Status &amp; Confidence</th>
                      <th className="py-3 px-3 font-medium text-center w-14">Sent</th>
                      <th className="py-3 px-3 font-medium text-center w-16">Opened</th>
                      <th className="py-3 px-3 font-medium text-center w-16">Resume</th>
                      <th className="py-3 px-3 font-medium text-center w-14">Clicks</th>
                      <th className="py-3 pr-5 pl-3 font-medium text-right min-w-[130px]">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
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
                            className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                          >
                            {/* Column 1: Company & Recruiter Email */}
                            <td className="py-3.5 px-5">
                              <div className="flex items-start gap-2.5">
                                <span className="p-0.5 mt-0.5 rounded text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors shrink-0">
                                  {isExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  )}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                    {c.company}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[11px] text-zinc-500 truncate">
                                    <span>{c.recipients?.[0] || 'No email recorded'}</span>
                                    {c.recipients?.length > 1 && (
                                      <span className="text-[10px] text-zinc-400">+{c.recipients.length - 1}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Column 2: Dedicated Status & Confidence Badge */}
                            <td className="py-3.5 px-3">
                              <div className="flex flex-col items-start gap-1">
                                {c.confidence_tier === 'high' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span>Confirmed read</span>
                                  </span>
                                ) : c.confidence_tier === 'medium' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    <span>Probable read</span>
                                  </span>
                                ) : c.is_security_scanner ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                                    <Shield className="w-3 h-3" />
                                    <span>Scanner pre-scan</span>
                                  </span>
                                ) : c.confidence_tier === 'low' || c.prefetches > 0 ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                                    <Cpu className="w-3 h-3" />
                                    <span>Prefetched</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                                    <span>Unopened</span>
                                  </span>
                                )}

                                <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
                                  {c.journey_type === 'retry_success' && (
                                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                                      <AlertCircle className="w-2.5 h-2.5" />
                                      <span>{c.prior_quarantined?.length || 1} retried</span>
                                    </span>
                                  )}
                                  {c.journey_type === 'multi_contact' && (
                                    <span className="text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                                      <Users className="w-2.5 h-2.5" />
                                      <span>{c.recipients?.length} contacts</span>
                                    </span>
                                  )}
                                  <span>{compEvents.length} event{compEvents.length === 1 ? '' : 's'}</span>
                                </div>
                              </div>
                            </td>

                            {/* Column 3: Sent Count */}
                            <td className="py-3.5 px-3 text-center text-zinc-500 font-mono tabular-nums">{c.sent}</td>

                            {/* Column 4: Opened Count */}
                            <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                              {c.opened > 0 ? (
                                <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20">
                                  {c.opened}
                                </span>
                              ) : (
                                <span className="text-zinc-400 text-xs">0</span>
                              )}
                              {c.prefetches > 0 && (
                                <span className="block text-[10px] text-zinc-400 mt-0.5 font-normal" title={`${c.prefetches} automated prefetch scan(s)`}>
                                  +{c.prefetches}p
                                </span>
                              )}
                            </td>

                            {/* Column 5: Resume Views */}
                            <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                              {c.resume_viewed > 0 ? (
                                <span className="inline-block px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-400 font-semibold text-xs border border-purple-500/20">
                                  {c.resume_viewed}
                                </span>
                              ) : (
                                <span className="text-zinc-300 dark:text-zinc-700 text-xs">—</span>
                              )}
                            </td>

                            {/* Column 6: Project Clicks */}
                            <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                              {c.clicks > 0 ? (
                                <span className="inline-block px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold text-xs border border-amber-500/20">
                                  {c.clicks}
                                </span>
                              ) : (
                                <span className="text-zinc-300 dark:text-zinc-700 text-xs">—</span>
                              )}
                            </td>

                            {/* Column 7: Last Active */}
                            <td className="py-3.5 pr-5 pl-3 font-mono text-right whitespace-nowrap">
                              {c.last_active > 0 ? (
                                <div>
                                  <div className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">
                                    {formatRelativeTime(c.last_active)}
                                  </div>
                                  <div className="text-[10px] text-zinc-400 tabular-nums">
                                    {c.last_active_formatted}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-zinc-400 text-xs">Pending</span>
                              )}
                            </td>
                          </tr>

                          {/* Nested Interaction Details Accordion */}
                          {isExpanded && (
                            <tr className="bg-zinc-50/60 dark:bg-zinc-900/40">
                              <td colSpan={7} className="p-0 border-none">
                                <div className="m-3 p-4 rounded-lg bg-white dark:bg-[#111113] border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs">
                                  <div className="flex items-center justify-between mb-3 text-xs">
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono flex items-center gap-1.5">
                                      <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                                      <span>Interactions for {c.company}</span>
                                    </span>
                                    <span className="text-[11px] text-zinc-400 font-mono tabular-nums">
                                      {compEvents.length} recorded event{compEvents.length === 1 ? '' : 's'}
                                    </span>
                                  </div>

                                  {c.is_security_scanner && (
                                    <div className="mb-3 p-2.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2">
                                      <Shield className="w-4 h-4 shrink-0 text-blue-500" />
                                      <span>
                                        <strong>Enterprise Security Gateway:</strong> Links were automatically pre-screened in seconds across cloud scanner IPs upon email delivery.
                                      </span>
                                    </div>
                                  )}

                                  {/* Outreach Delivery Journey Stepper */}
                                  {c.attempts_journey && c.attempts_journey.length > 1 && (
                                    <div className="mb-4 p-3 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 text-xs">
                                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
                                        <div className="flex items-center gap-2">
                                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                            {c.journey_type === 'multi_contact' ? 'Multi-Contact Recruiter Outreach' : 'Delivery Journey'}
                                          </span>
                                          <span className="text-[10px] text-zinc-400 font-mono">
                                            ({c.attempts_journey.length} steps)
                                          </span>
                                        </div>
                                        <span className="text-[10px] font-mono text-zinc-400">
                                          {c.journey_type === 'multi_contact' ? 'Multi-Contact' : 'Discovery Chain'}
                                        </span>
                                      </div>

                                      <div className="space-y-1.5">
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
                                              className={`p-2.5 rounded border transition-colors ${
                                                att.is_active
                                                  ? 'bg-emerald-500/[0.04] border-emerald-500/20'
                                                  : 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800'
                                              }`}
                                            >
                                              <div className="flex items-start justify-between sm:flex-col gap-2">
                                                <div className="min-w-0 flex-1">
                                                  <div className="flex items-center gap-2 flex-wrap">
                                                    <span
                                                      className={`w-4 h-4 rounded text-[9px] font-semibold font-mono flex items-center justify-center shrink-0 ${
                                                        att.is_active
                                                          ? 'bg-emerald-500 text-white'
                                                          : 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                                                      }`}
                                                    >
                                                      {att.is_active ? '✓' : att.step}
                                                    </span>

                                                    <span className={`font-mono text-xs ${att.is_active ? 'font-semibold text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 line-through'}`}>
                                                      {att.recipient}
                                                    </span>

                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopy(att.recipient);
                                                      }}
                                                      className="p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                                                      title="Copy email"
                                                    >
                                                      {copiedEmail === att.recipient ? (
                                                        <Check className="w-3 h-3 text-emerald-500" />
                                                      ) : (
                                                        <Copy className="w-3 h-3" />
                                                      )}
                                                    </button>

                                                    {att.track && (
                                                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                                        {att.track}
                                                      </span>
                                                    )}

                                                    <span
                                                      className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                                                        att.is_active
                                                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                                          : isBlock
                                                          ? 'bg-red-500/10 text-red-700 dark:text-red-400'
                                                          : isVoid
                                                          ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400'
                                                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                                      }`}
                                                    >
                                                      {att.is_active ? 'Active' : isBlock ? 'Blocked' : isVoid ? 'Voided' : 'Bounced'}
                                                    </span>
                                                  </div>

                                                  {att.is_active ? (
                                                    <div className="mt-1 pl-6 flex items-center gap-2 flex-wrap font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                                                      <span className="font-semibold">Delivered</span>
                                                      <span className="text-zinc-300 dark:text-zinc-700">·</span>
                                                      <span className="text-zinc-600 dark:text-zinc-400 tabular-nums">{att.opens} opens</span>
                                                      <span className="text-zinc-600 dark:text-zinc-400 tabular-nums">{att.clicks} clicks</span>
                                                      <span className="text-zinc-600 dark:text-zinc-400 tabular-nums">{att.resume_views} resume view{att.resume_views === 1 ? '' : 's'}</span>
                                                    </div>
                                                  ) : (
                                                    <div className="mt-1 pl-6 text-[11px] text-zinc-600 dark:text-zinc-400">
                                                      <div className="flex items-baseline gap-1.5 flex-wrap">
                                                        {diag?.code && (
                                                          <span className="font-mono text-[10px] font-semibold text-red-600 dark:text-red-400">
                                                            [{diag.code}]
                                                          </span>
                                                        )}
                                                        <span className="leading-snug">{diag?.cleanMsg}</span>
                                                        {diag?.helpUrl && (
                                                          <a
                                                            href={diag.helpUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-0.5 font-mono text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline"
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
                                                          className="text-[10px] font-mono text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 underline decoration-dotted cursor-pointer"
                                                        >
                                                          {isRawExpanded ? 'hide raw' : 'raw dsn'}
                                                        </button>
                                                      </div>

                                                      {isRawExpanded && (
                                                        <div className="mt-1.5 p-2 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-[10px] text-zinc-700 dark:text-zinc-300 break-all select-all">
                                                          {diag?.raw}
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>

                                                <div className="text-[10px] font-mono text-zinc-400 sm:text-right shrink-0 pl-6 sm:pl-0 tabular-nums">
                                                  <div>{formatRelativeTime(att.created_at)}</div>
                                                  <div className="text-[9px] text-zinc-400">{att.created_at_formatted}</div>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {compEvents.length === 0 ? (
                                    <div className="text-center py-4 text-xs text-zinc-400">
                                      No interaction events recorded yet for this organisation
                                    </div>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left text-xs">
                                        <thead>
                                          <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-mono text-[11px]">
                                            <th className="pb-2 font-medium">Recruiter &amp; Track</th>
                                            <th className="pb-2 font-medium">Event</th>
                                            <th className="pb-2 font-medium">Detail</th>
                                            <th className="pb-2 font-medium">Location &amp; IP</th>
                                            <th className="pb-2 font-medium text-right">Time (IST)</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                                          {compEvents.map((evt, eIdx) => {
                                            const { badgeStyle, label } = getEventBadge(evt);
                                            return (
                                              <tr
                                                key={`${evt.token}-${evt.ts}-${eIdx}`}
                                                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                                              >
                                                <td className="py-2.5">
                                                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                    {evt.recipient || 'No email'}
                                                  </div>
                                                  {evt.track && (
                                                    <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded font-mono">
                                                      {evt.track}
                                                    </span>
                                                  )}
                                                </td>

                                                <td className="py-2.5">
                                                  <span
                                                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${badgeStyle}`}
                                                  >
                                                    {label}
                                                  </span>
                                                </td>

                                                <td className="py-2.5 text-zinc-700 dark:text-zinc-300">
                                                  {evt.slug ? (
                                                    <span className="font-mono text-zinc-900 dark:text-zinc-100 font-medium">
                                                      /{evt.slug}
                                                    </span>
                                                  ) : evt.dwell_ms ? (
                                                    <span className="font-mono tabular-nums">{Math.round(evt.dwell_ms / 1000)}s visible</span>
                                                  ) : evt.event === 'open' || evt.event === 'prefetch' || evt.is_prefetch ? (
                                                    <span className="text-zinc-500 font-mono text-[11px] tabular-nums">
                                                      {evt.delta_sec ? (evt.delta_sec >= 60 ? `+${Math.round(evt.delta_sec / 60)}m post-send` : `+${evt.delta_sec}s post-send`) : (evt.is_prefetch ? 'Automated pre-scan' : 'Email opened')}
                                                    </span>
                                                  ) : evt.event === 'resume_view' ? (
                                                    <span className="text-zinc-500 font-mono text-[11px]">
                                                      {evt.session_num ? `Session #${evt.session_num}` : 'Web resume'}
                                                    </span>
                                                  ) : evt.event === 'resume_download' || evt.event === 'download' ? (
                                                    <span className="text-zinc-500 font-mono text-[11px]">
                                                      {evt.download_num ? `Download #${evt.download_num}` : 'PDF download'}
                                                    </span>
                                                  ) : (
                                                    <span className="text-zinc-400">—</span>
                                                  )}
                                                </td>

                                                <td className="py-2.5">
                                                  {(() => {
                                                    const loc = formatLocation(evt.city, evt.country, evt.client_class, evt.ip_trunc, evt.as_number, evt.via);
                                                    return loc.isProxy ? (
                                                      <div>
                                                        <div
                                                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
                                                          title={loc.tooltip}
                                                        >
                                                          <Shield className="w-3 h-3 shrink-0" />
                                                          <span>{loc.text}</span>
                                                        </div>
                                                        <div className="text-[10px] font-mono text-zinc-400 mt-0.5 tabular-nums">
                                                          {evt.ip_trunc || 'IP redacted'}
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      <div>
                                                        <div className="text-zinc-800 dark:text-zinc-200 font-medium">
                                                          {loc.text}
                                                        </div>
                                                        <div className="text-[10px] font-mono text-zinc-400 tabular-nums">
                                                          {evt.ip_trunc || 'IP redacted'}
                                                        </div>
                                                      </div>
                                                    );
                                                  })()}
                                                </td>

                                                <td className="py-2.5 font-mono text-right tabular-nums">
                                                  <div className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">
                                                    {formatRelativeTime(evt.ts)}
                                                  </div>
                                                  <div className="text-[10px] text-zinc-400">
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
                <div className="p-4 bg-zinc-50/60 dark:bg-zinc-900/30 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between sm:flex-col sm:items-start gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        Quarantined Inactive Applications ({blockedCompaniesList.length})
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Excluded from active engagement metrics due to decommissioned mailboxes or tenant blocks
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-700 dark:text-red-400 font-medium border border-red-500/20 tabular-nums">
                      {summary.total_blocked ?? 0} blocked
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium border border-amber-500/20 tabular-nums">
                      {summary.total_bounced ?? 0} bounced
                    </span>
                    {summary.total_voided > 0 && (
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-400 font-medium border border-purple-500/20 tabular-nums">
                        {summary.total_voided} retried
                      </span>
                    )}
                  </div>
                </div>

                {blockedCompaniesList.length === 0 ? (
                  <div className="text-center py-12 text-xs text-zinc-400">
                    No blocked or bounced emails found in database
                  </div>
                ) : (
                  <>
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-500 font-mono text-[11px]">
                          <th className="py-3 px-5 font-medium">Company &amp; Recruiter</th>
                          <th className="py-3 px-3 font-medium">Classification</th>
                          <th className="py-3 px-3 font-medium">Server Diagnostic Response</th>
                          <th className="py-3 pr-5 pl-3 font-medium text-right">Identified (IST)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
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
                                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                              >
                                <td className="py-3.5 px-5">
                                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 flex-wrap">
                                    <span>{item.company}</span>
                                    {hasActive ? (
                                      <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded font-mono">
                                        ✓ Retried &amp; Active
                                      </span>
                                    ) : failCount > 1 ? (
                                      <span className="text-[9px] px-1.5 py-0.2 bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 rounded font-mono tabular-nums">
                                        {failCount} attempts failed
                                      </span>
                                    ) : null}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[11px] text-zinc-500 font-mono">
                                      {item.recipient}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(item.recipient);
                                      }}
                                      className="p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                                      title="Copy email"
                                    >
                                      {copiedEmail === item.recipient ? (
                                        <Check className="w-3 h-3 text-emerald-500" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                  {item.track && (
                                    <span className="inline-block mt-1 text-[9px] px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded font-mono uppercase">
                                      {item.track}
                                    </span>
                                  )}
                                </td>

                                <td className="py-3.5 px-3 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                                      item.status === 'blocked'
                                        ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'
                                        : item.status === 'voided'
                                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-400'
                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'
                                    }`}
                                  >
                                    {item.status === 'blocked'
                                      ? 'Domain Block'
                                      : item.status === 'voided'
                                      ? 'Voided for Retry'
                                      : 'Address Bounce'}
                                  </span>
                                </td>

                                <td className="py-3.5 px-3 text-xs">
                                  <div className="space-y-1 max-w-xl">
                                    <div className="flex items-start gap-1.5 flex-wrap">
                                      {diag.code && (
                                        <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 shrink-0">
                                          {diag.code}
                                        </span>
                                      )}
                                      <span className="text-xs text-zinc-800 dark:text-zinc-200 leading-snug">
                                        {diag.cleanMsg}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-3 pt-0.5 flex-wrap">
                                      {diag.helpUrl && (
                                        <a
                                          href={diag.helpUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline cursor-pointer"
                                        >
                                          <span>Vendor guide</span>
                                          <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => toggleRawDiagnostic(item.token)}
                                        className="text-[10px] font-mono text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 underline decoration-dotted transition-colors cursor-pointer"
                                      >
                                        {isRawExpanded ? 'hide raw dsn' : 'raw server dsn'}
                                      </button>
                                    </div>

                                    {isRawExpanded && (
                                      <div className="mt-1.5 p-2 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-[10px] text-zinc-700 dark:text-zinc-300 break-all select-all leading-relaxed">
                                        {diag.raw}
                                      </div>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3.5 pr-5 pl-3 font-mono text-right text-xs text-zinc-500 whitespace-nowrap tabular-nums">
                                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">{formatRelativeTime(item.bounced_at)}</div>
                                  <div className="text-[10px] text-zinc-400">
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
                    <tr className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-500 font-mono text-[11px]">
                      <th className="py-3 px-5 font-medium">Recruiter &amp; Company</th>
                      <th className="py-3 px-3 font-medium">Event</th>
                      <th className="py-3 px-3 font-medium">Detail</th>
                      <th className="py-3 px-3 font-medium">Location &amp; IP</th>
                      <th className="py-3 pr-5 pl-3 font-medium text-right">Time (IST)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {paginatedEvents.map((evt, idx) => {
                      const { badgeStyle, label } = getEventBadge(evt);
                      return (
                        <tr
                          key={`${evt.token}-${evt.ts}-${idx}`}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <td className="py-3.5 px-5">
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {evt.company || 'Unknown Organisation'}
                            </div>
                            <div className="text-[11px] text-zinc-500 font-mono">
                              {evt.recipient || 'No email'}
                            </div>
                            {evt.track && (
                              <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded font-mono uppercase">
                                {evt.track}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-3">
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${badgeStyle}`}
                            >
                              {label}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-zinc-700 dark:text-zinc-300">
                            {evt.slug && (
                              <span className="font-mono text-zinc-900 dark:text-zinc-100 font-medium">
                                /{evt.slug}
                              </span>
                            )}
                            {evt.dwell_ms && <span className="font-mono tabular-nums">{Math.round(evt.dwell_ms / 1000)}s visible</span>}
                            {!evt.slug && !evt.dwell_ms && (evt.event === 'open' || evt.event === 'prefetch' || evt.is_prefetch) && (
                              <span className="text-zinc-500 font-mono text-[11px] tabular-nums">
                                {evt.delta_sec ? (evt.delta_sec >= 60 ? `+${Math.round(evt.delta_sec / 60)}m post-send` : `+${evt.delta_sec}s post-send`) : (evt.is_prefetch ? 'Automated pre-scan' : 'Email opened')}
                              </span>
                            )}
                            {!evt.slug && !evt.dwell_ms && evt.event === 'resume_view' && (
                              <span className="text-zinc-500 font-mono text-[11px]">
                                {evt.session_num ? `Session #${evt.session_num}` : 'Web resume'}
                              </span>
                            )}
                            {!evt.slug && !evt.dwell_ms && (evt.event === 'resume_download' || evt.event === 'download') && (
                              <span className="text-zinc-500 font-mono text-[11px]">
                                {evt.download_num ? `Download #${evt.download_num}` : 'PDF download'}
                              </span>
                            )}
                            {!evt.slug && !evt.dwell_ms && evt.event !== 'open' && evt.event !== 'resume_view' && evt.event !== 'resume_download' && evt.event !== 'download' && (
                              <span className="text-zinc-400">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-3">
                            {(() => {
                              const loc = formatLocation(evt.city, evt.country, evt.client_class, evt.ip_trunc, evt.as_number, evt.via);
                              return loc.isProxy ? (
                                <div>
                                  <div
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
                                    title={loc.tooltip}
                                  >
                                    <Shield className="w-3 h-3 shrink-0" />
                                    <span>{loc.text}</span>
                                  </div>
                                  <div className="text-[10px] font-mono text-zinc-400 mt-0.5 tabular-nums">
                                    {evt.ip_trunc || 'IP redacted'}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="text-zinc-800 dark:text-zinc-200 font-medium">
                                    {loc.text}
                                  </div>
                                  <div className="text-[10px] font-mono text-zinc-400 tabular-nums">
                                    {evt.ip_trunc || 'IP redacted'}
                                  </div>
                                </div>
                              );
                            })()}
                          </td>

                          <td className="py-3.5 pr-5 pl-3 font-mono text-right tabular-nums">
                            <div className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">
                              {formatRelativeTime(evt.ts)}
                            </div>
                            <div className="text-[10px] text-zinc-400">
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

        </div>
      </main>
    </>
  );
}
