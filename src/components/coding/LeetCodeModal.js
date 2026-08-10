import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LeetCodeIcon, LinkArrow } from "../Icons";
import { BorderBeam } from "../magicui/border-beam";
import { useModalControls } from "@/components/hooks/useModalControls";
import { formatDate, formatRelativeTime } from "./helpers";
import { 
  X, Award, Flame, Zap, Globe, GraduationCap, Calendar, 
  BarChart3, Clock, Trophy, MapPin, Info, CheckCircle2, AlertCircle, ExternalLink,
  LayoutDashboard, Code2, Target, Loader2, Terminal
} from "lucide-react";

export const LeetCodeModal = ({ show, onClose, data }) => {
  const { canPortal } = useModalControls(show, onClose);
  const [activeTab, setActiveTab] = useState("overview");
  const [hoveredContest, setHoveredContest] = useState(null);
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const scrollContainerRef = React.useRef(null);

  useEffect(() => {
    if (show) {
      setActiveTab("overview");
    }
  }, [show]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (show && scrollContainerRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = scrollContainerRef.current;
        setShowScrollArrow(scrollHeight - scrollTop - clientHeight > 30);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [show, activeTab, data]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setShowScrollArrow(scrollHeight - scrollTop - clientHeight > 30);
  };

  if (!canPortal) return null;

  // Local helper values derived from leetcodeData
  const profile = data?.profile || {};
  const contest = data?.contestRanking || {};
  const submitStats = data?.submitStats?.acSubmissionNum || [];
  const languageStats = data?.languages || [];
  const badges = data?.badges || [];
  const recentSubmissions = data?.recentSubmissions || [];
  const loading = !data;

  // Easy/Med/Hard stats
  const easySolved = submitStats.find(q => q.difficulty === "Easy")?.count || 0;
  const mediumSolved = submitStats.find(q => q.difficulty === "Medium")?.count || 0;
  const hardSolved = submitStats.find(q => q.difficulty === "Hard")?.count || 0;
  const totalSolved = submitStats.find(q => q.difficulty === "All")?.count || 0;

  // Total counts on platform
  const easyTotal = data?.totalQuestions?.find(q => q.difficulty === "Easy")?.count || 839;
  const mediumTotal = data?.totalQuestions?.find(q => q.difficulty === "Medium")?.count || 1729;
  const hardTotal = data?.totalQuestions?.find(q => q.difficulty === "Hard")?.count || 745;
  const allTotal = easyTotal + mediumTotal + hardTotal;

  // Percentages
  const easyPercent = easyTotal > 0 ? Math.round((easySolved / easyTotal) * 100) : 0;
  const mediumPercent = mediumTotal > 0 ? Math.round((mediumSolved / mediumTotal) * 100) : 0;
  const hardPercent = hardTotal > 0 ? Math.round((hardSolved / hardTotal) * 100) : 0;
  const totalSubmissions = data?.submitStats?.totalSubmissionNum?.find(q => q.difficulty === "All")?.submissions;
  const acSubmissions = data?.submitStats?.acSubmissionNum?.find(q => q.difficulty === "All")?.submissions;

  const acceptanceRate = (totalSubmissions && acSubmissions)
    ? ((acSubmissions / totalSubmissions) * 100).toFixed(2)
    : "N/A";

  // Languages used
  const languages = languageStats.slice(0, 4) || [];

  // Derived metrics fact sheet
  const derived = data?.derivedMetrics || {};
  const activeBadge = data?.activeBadge || {};
  const contestHistory = data?.contestHistory || [];
  
  // Highest rating
  const leetcodeHighestRating = contestHistory.length > 0
    ? Math.round(Math.max(...contestHistory.map(h => h.rating))).toString()
    : "1616";

  // Filter history to only include contests where participant actually attended
  const sortedHistory = [...contestHistory]
    .filter(h => h.attended)
    .sort((a, b) => a.contest.startTime - b.contest.startTime);

  const tabs = [
    { id: "overview", label: "Overview", icon: Globe },
    { id: "solved", label: "Problems & Languages", icon: BarChart3 },
    { id: "contest", label: "Contest Stats", icon: Trophy },
    { id: "recent", label: "Recent Submissions", icon: Clock },
  ];

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          key="leetcode-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-default"
        >
          {/* Backdrop - onMouseDown prevents text-selection-triggered closes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onMouseDown={onClose}
            className="absolute inset-0 bg-dark/60 dark:bg-black/80 backdrop-blur-md"
          />
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotateX: -5, y: 15 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, rotateX: 5, y: 15 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-light/95 dark:bg-[#0d1117]/95 border border-dark/10 dark:border-light/10 shadow-2xl rounded-3xl overflow-hidden z-10 max-h-[90vh] flex flex-col text-dark dark:text-light cursor-default"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-dark/10 dark:hover:bg-light/10 transition-all z-20"
              aria-label="Close dialog"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header Details */}
            <div className="p-8 pb-4 border-b border-solid border-dark/10 dark:border-light/10 flex flex-col md:gap-4 relative">
              <BorderBeam size={150} duration={8} delay={4} colorFrom="#f59e0b" colorTo="#eab308" />
              <div className="flex items-center gap-4 sm:flex-col sm:items-start">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-solid border-amber-500/50 shadow-md">
                  {profile.userAvatar ? (
                    <img src={profile.userAvatar} alt="LeetCode Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-amber-500/20 flex items-center justify-center text-amber-600 text-2xl font-bold">
                      U
                    </div>
                  )}
                  {activeBadge.icon && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-dark dark:bg-light rounded-full p-0.5 shadow-sm">
                      <img src={activeBadge.icon} alt="Active Badge" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="text-3xl font-extrabold tracking-tight">
                      {profile.realName || "Urva Gandhi"}
                    </h4>
                    {contest.rating && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-solid border-amber-500/20">
                        <Award className="w-3.5 h-3.5" /> {contest.badge?.name ? `${contest.badge.name} (` : ""}Contest Rating: {Math.round(contest.rating)}{contest.badge?.name ? ")" : ""}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-dark/70 dark:text-light/70 flex-wrap">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">@{data?.profile?.username || "urva_gandhi"}</span>
                    {profile.countryName && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-amber-500" /> {profile.countryName}
                      </span>
                    )}
                    {profile.school && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4 text-amber-500" /> {profile.school}
                      </span>
                    )}
                    {profile.company && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4 text-amber-500" /> {profile.company}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {profile.aboutMe && (
                <p className="mt-4 text-sm font-medium leading-relaxed max-w-3xl text-dark/80 dark:text-light/80">
                  {profile.aboutMe}
                </p>
              )}

              {/* Tab Navigation */}
              <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar border-b border-solid border-dark/5 dark:border-light/5">
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-colors duration-200 whitespace-nowrap ${
                        isActive
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light"
                      }`}
                    >
                      <TabIcon className="w-4 h-4" />
                      {tab.label}
                      {isActive && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.2 }}
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 origin-center"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Body Content Wrapper */}
            <div className="relative flex-1 flex flex-col min-h-0">
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="p-8 flex-1 overflow-y-auto max-h-[50vh] min-h-[40vh] no-scrollbar bg-light dark:bg-[#0d1117]/95"
              >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-solid border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                  <span className="text-sm font-bold text-dark/50 dark:text-light/50">Fetching LeetCode Analytics...</span>
                </div>
              ) : (
                <>
                  {/* Overview Tab */}
                  {activeTab === "overview" && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Highlights Grid */}
                      <div className="grid grid-cols-4 gap-4 md:grid-cols-2 xs:grid-cols-1">
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                          <Flame className="w-8 h-8 text-orange-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-2xl font-extrabold">{data?.streak || 0} days</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Current Streak</span>
                        </div>

                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                          <Trophy className="w-8 h-8 text-amber-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-2xl font-extrabold">{derived.longestStreak || 0} days</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Longest Streak</span>
                        </div>

                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                          <Calendar className="w-8 h-8 text-amber-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-2xl font-extrabold">{data?.totalActiveDays || 0} days</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Active Days</span>
                        </div>

                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                          <Zap className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-2xl font-extrabold">{totalSolved}</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Total Solved</span>
                        </div>
                      </div>

                      {/* Badges & Key Metrics Grid */}
                      <div className="grid grid-cols-2 gap-6 md:grid-cols-1">
                        {/* Badges Section */}
                        <div className="border border-solid border-dark/10 dark:border-light/10 rounded-2xl p-6 bg-light dark:bg-dark flex flex-col">
                          <h5 className="text-md font-bold mb-4 flex items-center gap-2 border-b border-solid border-dark/10 dark:border-light/10 pb-2">
                            <Award className="w-5 h-5 text-amber-500" /> Badges Earned ({badges.length})
                          </h5>
                          {badges.length > 0 ? (
                            <div className="flex flex-wrap gap-4 mt-2">
                              {badges.map((badge, idx) => (
                                <motion.div 
                                  key={idx}
                                  whileHover={{ scale: 1.1 }}
                                  className="flex flex-col items-center gap-1 cursor-help group/badge relative"
                                >
                                  <img src={badge.icon} alt={badge.displayName} className="w-20 h-20 object-contain" />
                                  {/* Badge Tooltip */}
                                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/badge:block w-48 bg-dark dark:bg-light text-light dark:text-dark text-[11px] py-2 px-3 rounded-xl shadow-xl text-center leading-normal z-30 border border-solid border-dark/10 dark:border-light/10 pointer-events-none">
                                    <div className="font-extrabold text-amber-500 mb-0.5">{badge.displayName}</div>
                                    {badge.hoverText && badge.hoverText !== badge.displayName && (
                                      <div className="text-[10px] opacity-80 font-medium mb-1">{badge.hoverText}</div>
                                    )}
                                    {badge.creationDate && (
                                      <div className="text-[9px] opacity-60 font-bold">Earned: {badge.creationDate}</div>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-dark/50 dark:text-light/50 text-sm font-semibold flex items-center gap-2 py-4">
                              <AlertCircle className="w-5 h-5 text-amber-500" /> No badges unlocked yet.
                            </div>
                          )}
                        </div>

                        <div className="border border-solid border-dark/10 dark:border-light/10 rounded-2xl p-6 bg-light dark:bg-dark">
                          <h5 className="text-md font-bold mb-4 flex items-center gap-2 border-b border-solid border-dark/10 dark:border-light/10 pb-2">
                            <BarChart3 className="w-5 h-5 text-amber-500" /> Key Activity Metrics
                          </h5>
                          <div className="space-y-3.5 text-sm font-semibold">
                            <div className="flex justify-between">
                              <span className="text-dark/60 dark:text-light/60">Total Contributions (This Year)</span>
                              <span className="text-dark dark:text-light">{derived.yearContributions || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-dark/60 dark:text-light/60">Average Submissions Per Active Day</span>
                              <span className="text-dark dark:text-light">{derived.avgSubmissionsPerActiveDay || 0}/day</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-dark/60 dark:text-light/60">Most Active Month</span>
                              <span className="text-dark dark:text-light text-amber-600 dark:text-amber-400 font-bold">{derived.mostActiveMonth || "N/A"}</span>
                            </div>
                            {derived.mostActiveDay?.date && (
                              <div className="flex justify-between">
                                <span className="text-dark/60 dark:text-light/60">Most Active Day</span>
                                <span className="text-dark dark:text-light">
                                  {derived.mostActiveDay.count} submissions ({derived.mostActiveDay.date})
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-dark/60 dark:text-light/60">Profile Reputation</span>
                              <span className="text-dark dark:text-light">{profile.reputation || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-dark/60 dark:text-light/60">Global Ranking</span>
                              <span className="text-dark dark:text-light">#{profile.ranking?.toLocaleString() || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* LeetCode heatmap (Contribution Calendar) - Spanning Full Width at Bottom */}
                      <div className="border border-solid border-dark/10 dark:border-light/10 p-6 rounded-2xl bg-light dark:bg-dark">
                        <h5 className="text-md font-bold mb-4 border-b border-solid border-dark/10 dark:border-light/10 pb-2">Submission Activity Calendar</h5>
                        <div className="overflow-x-auto pb-2 no-scrollbar">
                          {(() => {
                            // Generate last 6 months matrix (7 rows for days of week)
                            const now = new Date();
                            const startDate = new Date();
                            startDate.setMonth(startDate.getMonth() - 5);
                            startDate.setDate(startDate.getDate() - startDate.getDay()); // align to Sunday

                            const leetcodeCalendarMap = {};
                            data?.contributions?.forEach(c => {
                              leetcodeCalendarMap[c.date] = c.count;
                            });

                            const dayMs = 24 * 60 * 60 * 1000;
                            const cols = [];
                            let currentWeek = [];

                            for (let d = startDate.getTime(); d <= now.getTime(); d += dayMs) {
                              const dateObj = new Date(d);
                              const year = dateObj.getFullYear();
                              const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                              const day = String(dateObj.getDate()).padStart(2, '0');
                              const dateStr = `${year}-${month}-${day}`;
                              const submissionsOnDay = leetcodeCalendarMap[dateStr] || 0;

                              currentWeek.push({
                                date: dateObj.toDateString(),
                                count: submissionsOnDay
                              });

                              if (currentWeek.length === 7) {
                                cols.push(currentWeek);
                                currentWeek = [];
                              }
                            }
                            if (currentWeek.length > 0) {
                              while (currentWeek.length < 7) {
                                currentWeek.push({ date: null, count: 0 });
                              }
                              cols.push(currentWeek);
                            }

                            return (
                              <div className="flex gap-1.5 min-w-[450px] justify-center md:justify-start">
                                {cols.map((week, wIdx) => (
                                  <div key={wIdx} className="flex flex-col gap-1.5">
                                    {week.map((day, dIdx) => {
                                      if (!day.date) return <div key={dIdx} className="w-3.5 h-3.5 bg-transparent" />;
                                      
                                      // Color ranges based on submissions count
                                      let bgClass = "bg-dark/10 dark:bg-light/10";
                                      if (day.count > 0 && day.count <= 2) bgClass = "bg-amber-500/20";
                                      else if (day.count > 2 && day.count <= 5) bgClass = "bg-amber-500/50";
                                      else if (day.count > 5) bgClass = "bg-amber-500";

                                      return (
                                        <div
                                          key={dIdx}
                                          className={`w-3.5 h-3.5 rounded-sm transition-all duration-200 ${bgClass}`}
                                          title={`${day.count} submissions on ${day.date}`}
                                        />
                                      );
                                    })}
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  )}


                  {/* Solved Problems & Languages Tab */}
                  {activeTab === "solved" && (
                    <motion.div
                      key="solved"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-2 gap-8 md:grid-cols-1"
                    >
                      {/* Problems Breakdown */}
                      <div className="border border-solid border-dark/10 dark:border-light/10 rounded-2xl p-6">
                        <h5 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-solid border-dark/10 dark:border-light/10 pb-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Solved by Difficulty
                        </h5>

                        <div className="space-y-6">
                          {/* Easy */}
                          <div>
                            <div className="flex justify-between text-sm font-bold mb-1">
                              <span className="text-emerald-500">Easy</span>
                              <span className="text-dark dark:text-light">
                                {easySolved} <span className="text-xs text-dark/50 dark:text-light/50">/ {easyTotal} ({easyPercent}%)</span>
                              </span>
                            </div>
                            <div className="w-full h-3.5 bg-dark/5 dark:bg-light/10 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${easyPercent}%` }}
                                className="h-full bg-emerald-500 rounded-full"
                              />
                            </div>
                          </div>

                          {/* Medium */}
                          <div>
                            <div className="flex justify-between text-sm font-bold mb-1">
                              <span className="text-amber-500">Medium</span>
                              <span className="text-dark dark:text-light">
                                {mediumSolved} <span className="text-xs text-dark/50 dark:text-light/50">/ {mediumTotal} ({mediumPercent}%)</span>
                              </span>
                            </div>
                            <div className="w-full h-3.5 bg-dark/5 dark:bg-light/10 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${mediumPercent}%` }}
                                className="h-full bg-amber-500 rounded-full"
                              />
                            </div>
                          </div>

                          {/* Hard */}
                          <div>
                            <div className="flex justify-between text-sm font-bold mb-1">
                              <span className="text-red-500">Hard</span>
                              <span className="text-dark dark:text-light">
                                {hardSolved} <span className="text-xs text-dark/50 dark:text-light/50">/ {hardTotal} ({hardPercent}%)</span>
                              </span>
                            </div>
                            <div className="w-full h-3.5 bg-dark/5 dark:bg-light/10 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${hardPercent}%` }}
                                className="h-full bg-red-500 rounded-full"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-solid border-dark/5 dark:border-light/5 text-sm font-semibold flex justify-between">
                          <span className="text-dark/60 dark:text-light/60">Submissions Acceptance Rate</span>
                          <span className="text-primary dark:text-primaryDark font-bold">{acceptanceRate}%</span>
                        </div>
                      </div>

                      {/* Languages breakdown */}
                      <div className="border border-solid border-dark/10 dark:border-light/10 rounded-2xl p-6">
                        <h5 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-solid border-dark/10 dark:border-light/10 pb-2">
                          <Terminal className="w-5 h-5 text-blue-500" /> Languages Used
                        </h5>

                        <div className="space-y-5">
                          {languages.length > 0 ? (
                            languages.map((lang, idx) => {
                              const percentage = totalSolved > 0 
                                ? ((lang.problemsSolved / totalSolved) * 100).toFixed(1)
                                : "0";
                              
                              // Color badges depending on language
                              let color = "bg-blue-500";
                              if (lang.languageName === "Java") color = "bg-amber-600";
                              if (lang.languageName === "Python") color = "bg-green-500";
                              if (lang.languageName === "MySQL") color = "bg-purple-500";

                              return (
                                <div key={idx}>
                                  <div className="flex justify-between text-sm font-bold mb-1">
                                    <span className="text-dark dark:text-light">{lang.languageName}</span>
                                    <span className="text-dark/60 dark:text-light/60">
                                      {lang.problemsSolved} solved ({percentage}%)
                                    </span>
                                  </div>
                                  <div className="w-full h-2.5 bg-dark/5 dark:bg-light/10 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${percentage}%` }}
                                      className={`h-full ${color} rounded-full`}
                                    />
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-dark/50 dark:text-light/50 text-sm font-semibold py-4">
                              No language data found.
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Contest Stats Tab */}
                  {activeTab === "contest" && (
                    <motion.div
                      key="contest"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {contest.rating ? (
                        <div className="space-y-6">
                          {/* Contest Stats Cards */}
                          <div className="border border-solid border-dark/10 dark:border-light/10 rounded-2xl p-8 bg-dark/5 dark:bg-light/5 flex items-center justify-between gap-8 md:flex-col md:items-stretch">
                            <div className="flex-1">
                              <h5 className="text-3xl font-extrabold flex items-center gap-2 text-amber-500">
                                <Trophy className="w-8 h-8" /> Rating: {Math.round(contest.rating)}
                              </h5>
                              <p className="mt-3 text-sm font-bold text-dark/70 dark:text-light/70">
                                Attended <span className="text-primary dark:text-primaryDark">{contest.attendedContestsCount}</span> contests on LeetCode. 
                                Positioned in the top <span className="text-primary dark:text-primaryDark">{contest.topPercentage}%</span> of active participants globally!
                              </p>
                              
                              <div className="grid grid-cols-3 gap-4 mt-6 md:grid-cols-2 sm:grid-cols-1">
                                <div className="border border-solid border-dark/10 dark:border-light/10 p-4 rounded-xl bg-light dark:bg-dark">
                                  <div className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase">Highest Rating</div>
                                  <div className="text-2xl font-extrabold mt-1 text-amber-500">{leetcodeHighestRating}</div>
                                </div>
                                <div className="border border-solid border-dark/10 dark:border-light/10 p-4 rounded-xl bg-light dark:bg-dark">
                                  <div className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase">Global Contest Rank</div>
                                  <div className="text-2xl font-extrabold mt-1">#{contest.globalRanking?.toLocaleString()}</div>
                                </div>
                                <div className="border border-solid border-dark/10 dark:border-light/10 p-4 rounded-xl bg-light dark:bg-dark">
                                  <div className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase">Total Competitors</div>
                                  <div className="text-2xl font-extrabold mt-1">{contest.totalParticipants?.toLocaleString()}</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Graphic indicator */}
                            <div className="w-48 h-48 md:w-full md:h-auto flex flex-col items-center justify-center border border-dashed border-dark/20 dark:border-light/20 rounded-2xl p-6 bg-light dark:bg-dark/40 shadow-sm relative overflow-hidden">
                              <BorderBeam size={100} duration={8} delay={2} colorFrom="#f59e0b" colorTo="#3b82f6" />
                              <Award className="w-16 h-16 text-amber-500 animate-pulse" />
                              <div className="text-md font-extrabold mt-3 text-amber-600 dark:text-amber-400">
                                {contest.badge?.name || "Contestant"}
                              </div>
                              <div className="text-xs font-bold text-dark/60 dark:text-light/60 mt-1">Top {contest.topPercentage}%</div>
                              <div className="text-xs font-bold text-dark/60 dark:text-light/60 mt-1">Max: {leetcodeHighestRating}</div>
                            </div>
                          </div>

                          {/* Contest Rating Chart */}
                          {sortedHistory.length > 0 && (
                            <div className="border border-solid border-dark/10 dark:border-light/10 rounded-2xl p-6 bg-light dark:bg-[#0d1117]/50">
                              <h5 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-solid border-dark/10 dark:border-light/10 pb-2">
                                <BarChart3 className="w-5 h-5 text-amber-500" /> Contest Rating Progress
                              </h5>

                              <div className="grid grid-cols-3 gap-6 md:grid-cols-1">
                                {/* Interactive SVG Chart */}
                                <div className="col-span-2 relative h-[220px]">
                                  {(() => {
                                    const svgWidth = 500;
                                    const svgHeight = 200;
                                    const padX = 40;
                                    const padY = 30;

                                    const historyRatings = sortedHistory.map(h => h.rating);
                                    const minR = Math.min(...historyRatings, 1500) - 30;
                                    const maxR = Math.max(...historyRatings, 1600) + 30;
                                    const rRange = maxR - minR;

                                    const points = sortedHistory.map((h, i) => {
                                      const x = padX + (i / (sortedHistory.length - 1 || 1)) * (svgWidth - 2 * padX);
                                      const y = svgHeight - padY - ((h.rating - minR) / rRange) * (svgHeight - 2 * padY);
                                      return { x, y, ...h };
                                    });

                                    const linePathStr = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
                                    const areaPathStr = points.length > 0 
                                      ? `${linePathStr} L ${points[points.length - 1].x} ${svgHeight - padY} L ${points[0].x} ${svgHeight - padY} Z`
                                      : "";

                                    return (
                                      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                                        <defs>
                                          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                                          </linearGradient>
                                        </defs>

                                        {/* Horizontal Guide Lines */}
                                        {[0, 1, 2].map((val) => {
                                          const rValue = minR + val * (rRange / 2);
                                          const yPos = svgHeight - padY - ((rValue - minR) / rRange) * (svgHeight - 2 * padY);
                                          return (
                                            <g key={val}>
                                              <line 
                                                x1={padX} 
                                                y1={yPos} 
                                                x2={svgWidth - padX} 
                                                y2={yPos} 
                                                className="stroke-dark/10 dark:stroke-light/10" 
                                                strokeDasharray="4 4" 
                                              />
                                              <text 
                                                x={padX - 8} 
                                                y={yPos + 4} 
                                                className="text-[10px] font-bold fill-dark/40 dark:fill-light/40 text-right"
                                                textAnchor="end"
                                              >
                                                {Math.round(rValue)}
                                              </text>
                                            </g>
                                          );
                                        })}

                                        {/* Fill Area */}
                                        {areaPathStr && (
                                          <path d={areaPathStr} fill="url(#chartGlow)" />
                                        )}

                                        {/* Stroke Line */}
                                        {linePathStr && (
                                          <path 
                                            d={linePathStr} 
                                            fill="none" 
                                            stroke="#f59e0b" 
                                            strokeWidth="3.5" 
                                            strokeLinecap="round"
                                            strokeLinejoin="round" 
                                          />
                                        )}

                                        {/* Interactive Points */}
                                        {points.map((p, idx) => {
                                          const isSelected = hoveredContest?.contest?.title === p.contest.title || (!hoveredContest && idx === points.length - 1);
                                          return (
                                            <g key={idx}>
                                              <circle
                                                cx={p.x}
                                                cy={p.y}
                                                r={isSelected ? 6 : 4}
                                                className={`fill-amber-500 transition-all duration-150 cursor-pointer ${
                                                  isSelected ? "stroke-light dark:stroke-[#0d1117] stroke-2" : "hover:scale-125"
                                                }`}
                                                onMouseEnter={() => setHoveredContest(p)}
                                                onClick={() => setHoveredContest(p)}
                                              />
                                              {/* Hidden bigger circle for easier hover targeting */}
                                              <circle
                                                cx={p.x}
                                                cy={p.y}
                                                r={14}
                                                className="fill-transparent cursor-pointer"
                                                onMouseEnter={() => setHoveredContest(p)}
                                                onClick={() => setHoveredContest(p)}
                                              />
                                            </g>
                                          );
                                        })}
                                      </svg>
                                    );
                                  })()}
                                </div>

                                {/* Point Info Panel */}
                                {(() => {
                                  const activeItem = hoveredContest || sortedHistory[sortedHistory.length - 1];
                                  const prevIdx = sortedHistory.findIndex(h => h.contest.title === activeItem.contest.title) - 1;
                                  const prevRating = prevIdx >= 0 ? sortedHistory[prevIdx].rating : 1500;
                                  const delta = Math.round(activeItem.rating - prevRating);

                                  return (
                                    <div className="border border-solid border-dark/10 dark:border-light/10 rounded-xl p-4 bg-dark/5 dark:bg-light/5 flex flex-col justify-between h-full min-h-[160px]">
                                      <div>
                                        <div className="text-[10px] font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider">
                                          Contest Performance
                                        </div>
                                        <h6 className="text-sm font-bold mt-1 text-primary dark:text-primaryDark leading-tight">
                                          {activeItem.contest.title}
                                        </h6>
                                        <div className="text-[11px] text-dark/60 dark:text-light/60 mt-1">
                                          {formatDate(activeItem.contest.startTime)}
                                        </div>
                                      </div>

                                      <div className="mt-4 space-y-2 text-xs font-semibold">
                                        <div className="flex justify-between">
                                          <span className="text-dark/60 dark:text-light/60">Rating After</span>
                                          <span className="text-dark dark:text-light flex items-center gap-1">
                                            {Math.round(activeItem.rating)}
                                            <span className={`text-[10px] font-extrabold ${delta >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                              {delta >= 0 ? `+${delta}` : delta}
                                            </span>
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-dark/60 dark:text-light/60">Rank in Contest</span>
                                          <span className="text-dark dark:text-light">
                                            #{activeItem.ranking.toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-dark/60 dark:text-light/60">Problems Solved</span>
                                          <span className="text-dark dark:text-light">
                                            {activeItem.problemsSolved} / {activeItem.totalProblems}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="border border-solid border-dark/10 dark:border-light/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3">
                          <Trophy className="w-12 h-12 text-dark/30 dark:text-light/30" />
                          <h5 className="text-lg font-bold">No Contest History</h5>
                          <p className="text-sm text-dark/60 dark:text-light/60 max-w-md">
                            This user hasn&apos;t participated in any official LeetCode contests yet, or rating calculation is pending.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Recent Submissions Tab */}
                  {activeTab === "recent" && (
                    <motion.div
                      key="recent"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {recentSubmissions.length > 0 ? (
                        <div className="border border-solid border-dark/10 dark:border-light/10 rounded-2xl overflow-hidden divide-y divide-solid divide-dark/10 dark:divide-light/10">
                          {recentSubmissions.map((sub, idx) => {
                            const isAC = sub.statusDisplay === "Accepted";
                            return (
                              <div key={idx} className="p-4 flex items-center justify-between hover:bg-dark/5 dark:hover:bg-light/5 transition-colors duration-150">
                                <div className="flex flex-col gap-1">
                                  <Link 
                                    href={`https://leetcode.com/problems/${sub.titleSlug}/`} 
                                    target="_blank"
                                    className="font-bold hover:text-primary dark:hover:text-primaryDark flex items-center gap-1.5"
                                  >
                                    {sub.title} <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                                  </Link>
                                  <div className="flex items-center gap-3 text-xs font-semibold text-dark/50 dark:text-light/50">
                                    <span className="capitalize">{sub.lang}</span>
                                    <span>•</span>
                                    <span>{formatRelativeTime(sub.timestamp)}</span>
                                  </div>
                                </div>
                                
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  isAC 
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-solid border-emerald-500/20" 
                                    : "bg-red-500/10 text-red-600 dark:text-red-400 border border-solid border-red-500/20"
                                }`}>
                                  {sub.statusDisplay}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="border border-solid border-dark/10 dark:border-light/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3">
                          <Clock className="w-12 h-12 text-dark/30 dark:text-light/30" />
                          <h5 className="text-lg font-bold">No Recent Submissions</h5>
                          <p className="text-sm text-dark/60 dark:text-light/60 max-w-md">
                            We couldn&apos;t load recent submissions for this user right now.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </>
              )}
              </div>

              <AnimatePresence>
                {showScrollArrow && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-4 left-0 right-0 z-20 pointer-events-none flex flex-col items-center justify-center text-amber-500 animate-bounce"
                  >
                    <span className="text-[10px] font-extrabold tracking-wider bg-light/95 dark:bg-dark/95 px-2.5 py-1 rounded-full border border-solid border-amber-500/30 shadow-md backdrop-blur-sm">
                      Scroll Down
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="drop-shadow-md"
                    >
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-solid border-dark/10 dark:border-light/10 bg-dark/5 dark:bg-light/5 flex items-center justify-between sm:flex-col sm:gap-4 sm:items-stretch">
              <span className="text-xs font-bold text-dark/50 dark:text-light/50">
                Data fetched dynamically via LeetCode GraphQL API.
              </span>
              <Link
                href="https://leetcode.com/u/urva_gandhi"
                target="_blank"
                className="rounded-xl bg-amber-500 hover:bg-amber-600 text-center text-sm font-bold text-white dark:text-black dark:hover:bg-amber-400 transition-all duration-300 px-6 py-2.5"
              >
                Visit Official Profile
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default LeetCodeModal;
