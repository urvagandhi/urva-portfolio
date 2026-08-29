import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BorderBeam } from "../magicui/border-beam";
import { useModalControls } from "@/components/hooks/useModalControls";
import { formatDate, formatRelativeTime } from "./helpers";
import { 
  X, Award, Flame, Zap, Globe, GraduationCap, Calendar, 
  BarChart3, Clock, Trophy, MapPin, Info, CheckCircle2, AlertCircle, ExternalLink,
  LayoutDashboard, Code2, Target, Loader2, Terminal
} from "lucide-react";

export const CodeforcesModal = ({ show, onClose, data }) => {
  const { canPortal } = useModalControls(show, onClose);
  const [cfActiveTab, setCfActiveTab] = useState("overview");
  const [hoveredCfContest, setHoveredCfContest] = useState(null);
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (show && scrollContainerRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = scrollContainerRef.current;
        setShowScrollArrow(scrollHeight - scrollTop - clientHeight > 30);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [show, cfActiveTab, data]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setShowScrollArrow(scrollHeight - scrollTop - clientHeight > 30);
  };

  if (!canPortal) return null;

  const cfData = data || {};
  const cfLoading = !data;

  // Determine Codeforces Rank Label
  const cfRatingVal = cfData?.info?.rating || 1394;
  let cfRank = "Pupil";
  if (cfRatingVal >= 2400) cfRank = "Grandmaster";
  else if (cfRatingVal >= 2100) cfRank = "Master";
  else if (cfRatingVal >= 1900) cfRank = "Candidate Master";
  else if (cfRatingVal >= 1600) cfRank = "Expert";
  else if (cfRatingVal >= 1400) cfRank = "Specialist";
  else if (cfRatingVal >= 1200) cfRank = "Pupil";
  else cfRank = "Newbie";

  const cfRating = cfData?.info?.rating ? cfData.info.rating.toString() : "1394";

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          key="codeforces-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-default"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onMouseDown={onClose}
            className="absolute inset-0 bg-dark/60 dark:bg-black/80 backdrop-blur-md"
          />
          {/* Modal Body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotateX: -5, y: 15 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, rotateX: 5, y: 15 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl border border-solid border-dark/10 bg-light shadow-2xl dark:border-primaryDark/30 dark:bg-dark flex flex-col cursor-default"
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
            <div className="p-8 xs:p-4 pb-4 xs:pb-2 border-b border-solid border-dark/10 dark:border-light/10 flex flex-col md:gap-4 relative">
              <BorderBeam size={150} duration={8} delay={4} colorFrom="#22c55e" colorTo="#10b981" />
              <div className="flex items-center gap-4 sm:flex-col sm:items-start">
                <div className="relative w-20 h-20 xs:w-14 xs:h-14 rounded-2xl overflow-hidden border-2 border-solid border-green-500/50 shadow-md">
                  <img
                    src={cfData?.info?.avatar || "https://codeforces.org/s/0/images/codeforces-telegram-logo.png"}
                    alt={cfData?.info?.handle || "Codeforces"}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="text-3xl xs:text-xl font-extrabold tracking-tight">
                      Urva Gandhi
                    </h4>
                    {cfData?.info?.rating && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-solid border-green-500/20">
                        <Award className="w-3.5 h-3.5" /> Contest Rating: {cfData.info.rating} ({cfRank})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-dark/70 dark:text-light/70 flex-wrap">
                    <span className="font-semibold text-green-500">@{cfData?.info?.handle || "Urva_Gandhi"}</span>
                    {cfData?.info?.country && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-green-500" /> {cfData.info.country}
                      </span>
                    )}
                    {cfData?.info?.organization && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4 text-green-500" /> {cfData.info.organization}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-2 mt-6 xs:mt-3 overflow-x-auto no-scrollbar border-b border-solid border-dark/5 dark:border-light/5">
                {[
                  { id: "overview", label: "Overview", icon: LayoutDashboard },
                  { id: "problems", label: "Problems & Languages", icon: Code2 },
                  { id: "contest", label: "Contest Stats", icon: Trophy },
                  { id: "recent", label: "Recent Submissions", icon: Clock },
                ].map((tab) => {
                  const isActive = cfActiveTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCfActiveTab(tab.id)}
                      className={`relative pb-3 xs:pb-2 px-4 xs:px-3 text-sm xs:text-xs font-bold flex items-center gap-2 transition-colors duration-200 whitespace-nowrap ${
                        isActive
                          ? "text-green-600 dark:text-green-400"
                          : "text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      {isActive && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.2 }}
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 origin-center"
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
                className="p-8 xs:p-4 flex-1 overflow-y-auto max-h-[50vh] xs:max-h-[55vh] min-h-0 no-scrollbar bg-light dark:bg-[#0d1117]/95"
              >
              {cfLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-green-500" />
                  <span className="text-sm font-bold text-dark/60 dark:text-light/60">Fetching Codeforces profile...</span>
                </div>
              ) : (
                <>
                  {/* Overview Tab */}
                  {cfActiveTab === "overview" && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Summary Metrics Grid */}
                      <div className="grid grid-cols-4 gap-4 md:grid-cols-2 xs:grid-cols-1">
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-dark/5 dark:bg-light/5 hover:bg-green-500/5 transition-all duration-300 relative group overflow-hidden">
                          <Flame className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <div className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase">Current Streak</div>
                          <div className="text-2xl font-extrabold mt-1">{cfData?.derivedMetrics?.currentStreak || 0} days</div>
                        </div>
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-dark/5 dark:bg-light/5 hover:bg-green-500/5 transition-all duration-300 relative group overflow-hidden">
                          <Trophy className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <div className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase">Longest Streak</div>
                          <div className="text-2xl font-extrabold mt-1">{cfData?.derivedMetrics?.longestStreak || 0} days</div>
                        </div>
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-dark/5 dark:bg-light/5 hover:bg-green-500/5 transition-all duration-300 relative group overflow-hidden">
                          <Calendar className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <div className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase">Active Days</div>
                          <div className="text-2xl font-extrabold mt-1">{cfData?.derivedMetrics?.activeDays || 0} days</div>
                        </div>
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-dark/5 dark:bg-light/5 hover:bg-green-500/5 transition-all duration-300 relative group overflow-hidden">
                          <Target className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <div className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase">Total Solved</div>
                          <div className="text-2xl font-extrabold mt-1">{cfData?.derivedMetrics?.totalSolved || 0}</div>
                        </div>
                      </div>

                      {/* Calendar & Derived Stats Grid */}
                      <div className="grid grid-cols-2 gap-6 md:grid-cols-1">
                        {/* Codeforces heatmap (Contribution Calendar) */}
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-6 rounded-2xl bg-light dark:bg-dark">
                          <h5 className="text-md font-bold mb-4 border-b border-solid border-dark/10 dark:border-light/10 pb-2">Submission Activity Calendar</h5>
                          <div className="overflow-x-auto pb-2 no-scrollbar">
                            {(() => {
                              // Generate last 6 months matrix (7 rows for days of week)
                              const now = new Date();
                              const startDate = new Date();
                              startDate.setMonth(startDate.getMonth() - 5);
                              startDate.setDate(startDate.getDate() - startDate.getDay()); // align to Sunday

                              const dayMs = 24 * 60 * 60 * 1000;
                              const cols = [];
                              let currentWeek = [];

                              for (let d = startDate.getTime(); d <= now.getTime(); d += dayMs) {
                                const dateObj = new Date(d);
                                dateObj.setUTCHours(0, 0, 0, 0);
                                const timestamp = Math.floor(dateObj.getTime() / 1000);
                                const submissionsOnDay = cfData?.calendar?.[timestamp] || 0;

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
                                <div className="flex gap-1 min-w-[340px]">
                                  {cols.map((week, wIdx) => (
                                    <div key={wIdx} className="flex flex-col gap-1">
                                      {week.map((day, dIdx) => {
                                        if (!day.date) return <div key={dIdx} className="w-2.5 h-2.5 bg-transparent" />;
                                        
                                        // Color ranges based on submissions count
                                        let bgClass = "bg-dark/10 dark:bg-light/10";
                                        if (day.count > 0 && day.count <= 2) bgClass = "bg-green-500/20";
                                        else if (day.count > 2 && day.count <= 5) bgClass = "bg-green-500/50";
                                        else if (day.count > 5) bgClass = "bg-green-500";

                                        return (
                                          <div
                                            key={dIdx}
                                            className={`w-2.5 h-2.5 rounded-sm transition-all duration-200 ${bgClass}`}
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

                        {/* Derived Statistics */}
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-6 rounded-2xl bg-light dark:bg-dark">
                          <h5 className="text-md font-bold mb-4 border-b border-solid border-dark/10 dark:border-light/10 pb-2">Derived Statistics</h5>
                          <div className="space-y-3.5 text-sm font-semibold">
                            <div className="flex justify-between">
                              <span className="text-dark/50 dark:text-light/50">Highest Difficulty Solved</span>
                              <span className="text-green-500">{cfData?.derivedMetrics?.highestProblemRating || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-dark/50 dark:text-light/50">Favorite Problem Tag</span>
                              <span>{cfData?.derivedMetrics?.favoriteTag || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-dark/50 dark:text-light/50">Primary Language</span>
                              <span>{cfData?.derivedMetrics?.primaryLanguage || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-dark/50 dark:text-light/50">Submission Success Rate</span>
                              <span>{cfData?.derivedMetrics?.acceptanceRate || "0"}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Problems & Languages Tab */}
                  {cfActiveTab === "problems" && (
                    <motion.div
                      key="problems"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-2 gap-6 md:grid-cols-1"
                    >
                      {/* Difficulty Distribution Chart */}
                      <div className="border border-solid border-dark/10 dark:border-light/10 p-6 rounded-2xl bg-light dark:bg-dark flex flex-col justify-between">
                        <div>
                          <h5 className="text-md font-bold mb-4 border-b border-solid border-dark/10 dark:border-light/10 pb-2">Problems Solved by Difficulty Rating</h5>
                          {cfData?.difficultyDistribution?.length > 0 ? (
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                              {(() => {
                                const maxCount = Math.max(...(cfData.difficultyDistribution.map(d => d.count) || [1]));
                                return cfData.difficultyDistribution.map((dist, idx) => {
                                  const percentage = (dist.count / maxCount) * 100;
                                  return (
                                    <div key={idx} className="flex items-center gap-3">
                                      <span className="w-12 text-xs font-bold text-dark/70 dark:text-light/70">{dist.rating}</span>
                                      <div className="flex-1 h-3 rounded-full bg-dark/5 dark:bg-light/10 overflow-hidden">
                                        <div
                                          style={{ width: `${percentage}%` }}
                                          className="h-full bg-green-500 rounded-full transition-all duration-500"
                                        />
                                      </div>
                                      <span className="w-8 text-right text-xs font-extrabold">{dist.count}</span>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          ) : (
                            <div className="py-12 text-center text-sm font-semibold text-dark/40 dark:text-light/40">No problem difficulty stats available</div>
                          )}
                        </div>
                      </div>

                      {/* Languages Distribution */}
                      <div className="border border-solid border-dark/10 dark:border-light/10 p-6 rounded-2xl bg-light dark:bg-dark flex flex-col justify-between">
                        <div>
                          <h5 className="text-md font-bold mb-4 border-b border-solid border-dark/10 dark:border-light/10 pb-2">Programming Languages Used</h5>
                          {cfData?.languageDistribution?.length > 0 ? (
                            <div className="space-y-4">
                              {(() => {
                                const totalLangSubmissions = cfData.languageDistribution.reduce((sum, l) => sum + l.problemsSolved, 0);
                                return cfData.languageDistribution.map((lang, idx) => {
                                  const percentage = totalLangSubmissions > 0 ? ((lang.problemsSolved / totalLangSubmissions) * 100).toFixed(1) : 0;
                                  return (
                                    <div key={idx} className="space-y-1">
                                      <div className="flex justify-between text-xs font-bold">
                                        <span className="text-dark/70 dark:text-light/70">{lang.languageName}</span>
                                        <span>{lang.problemsSolved} submissions ({percentage}%)</span>
                                      </div>
                                      <div className="h-2.5 rounded-full bg-dark/5 dark:bg-light/10 overflow-hidden">
                                        <div
                                          style={{ width: `${percentage}%` }}
                                          className="h-full bg-green-500 rounded-full transition-all duration-500"
                                        />
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          ) : (
                            <div className="py-12 text-center text-sm font-semibold text-dark/40 dark:text-light/40">No language stats available</div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Contest History Tab */}
                  {cfActiveTab === "contest" && (
                    <motion.div
                      key="contest"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {cfData?.info?.rating ? (
                        <div className="space-y-6">
                          {/* Contest Stats Cards */}
                          <div className="border border-solid border-dark/10 dark:border-light/10 rounded-2xl p-8 bg-dark/5 dark:bg-light/5 flex items-center justify-between gap-8 md:flex-col md:items-stretch">
                            <div className="flex-1">
                              <h5 className="text-3xl font-extrabold flex items-center gap-2 text-green-500">
                                <Trophy className="w-8 h-8" /> Rating: {cfRating}
                              </h5>
                              <p className="mt-3 text-sm font-bold text-dark/70 dark:text-light/70">
                                Participated in <span className="text-green-500">{cfData?.derivedMetrics?.contestCount}</span> official contests on Codeforces.
                                Max rating achieved: <span className="text-green-500">{cfData?.info?.maxRating} ({cfData?.info?.maxRank})</span>!
                              </p>
                              
                              <div className="grid grid-cols-3 gap-4 mt-6 md:grid-cols-2 sm:grid-cols-1">
                                <div className="border border-solid border-dark/10 dark:border-light/10 p-4 rounded-xl bg-light dark:bg-dark">
                                  <div className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase">Best Rank</div>
                                  <div className="text-xl font-extrabold mt-1">#{cfData?.derivedMetrics?.bestContestRank?.toLocaleString()}</div>
                                </div>
                                <div className="border border-solid border-dark/10 dark:border-light/10 p-4 rounded-xl bg-light dark:bg-dark">
                                  <div className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase">Avg Rank</div>
                                  <div className="text-xl font-extrabold mt-1">#{cfData?.derivedMetrics?.averageContestRank?.toLocaleString()}</div>
                                </div>
                                <div className="border border-solid border-dark/10 dark:border-light/10 p-4 rounded-xl bg-light dark:bg-dark">
                                  <div className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase">Rating Gain</div>
                                  <div className={`text-xl font-extrabold mt-1 ${cfData?.derivedMetrics?.ratingGain >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                    {cfData?.derivedMetrics?.ratingGain >= 0 ? `+${cfData.derivedMetrics.ratingGain}` : cfData?.derivedMetrics?.ratingGain}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Graphic indicator */}
                            <div className="w-48 h-48 md:w-full md:h-auto flex flex-col items-center justify-center border border-dashed border-dark/20 dark:border-light/20 rounded-2xl p-6 bg-light dark:bg-dark/40 shadow-sm relative overflow-hidden">
                              <BorderBeam size={100} duration={8} delay={2} colorFrom="#22c55e" colorTo="#10b981" />
                              <Award className="w-16 h-16 text-green-500 animate-pulse" />
                              <div className="text-md font-extrabold mt-3 text-green-600 dark:text-green-400">
                                {cfRank}
                              </div>
                              <div className="text-xs font-bold text-dark/60 dark:text-light/60 mt-1">Max: {cfData?.info?.maxRating}</div>
                            </div>
                          </div>

                          {/* Contest Rating Chart */}
                          {cfData?.contestHistory?.length > 0 && (
                            <div className="border border-solid border-dark/10 dark:border-light/10 rounded-2xl p-6 bg-light dark:bg-[#0d1117]/50">
                              <h5 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-solid border-dark/10 dark:border-light/10 pb-2">
                                <BarChart3 className="w-5 h-5 text-green-500" /> Contest Rating Progress
                              </h5>

                              <div className="grid grid-cols-3 gap-6 md:grid-cols-1">
                                {/* Interactive SVG Chart */}
                                <div className="col-span-2 relative h-[220px]">
                                  {(() => {
                                    const sortedCfHistory = [...cfData.contestHistory]
                                      .sort((a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds);
                                    const svgWidth = 500;
                                    const svgHeight = 200;
                                    const padX = 40;
                                    const padY = 30;

                                    const historyRatings = sortedCfHistory.map(h => h.newRating);
                                    const minR = Math.min(...historyRatings, 1200) - 30;
                                    const maxR = Math.max(...historyRatings, 1350) + 30;
                                    const rRange = maxR - minR;

                                    const points = sortedCfHistory.map((h, i) => {
                                      const x = padX + (i / (sortedCfHistory.length - 1 || 1)) * (svgWidth - 2 * padX);
                                      const y = svgHeight - padY - ((h.newRating - minR) / rRange) * (svgHeight - 2 * padY);
                                      return { x, y, ...h };
                                    });

                                    const linePathStr = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
                                    const areaPathStr = points.length > 0 
                                      ? `${linePathStr} L ${points[points.length - 1].x} ${svgHeight - padY} L ${points[0].x} ${svgHeight - padY} Z`
                                      : "";

                                    return (
                                      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                                        <defs>
                                          <linearGradient id="cfChartGlow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
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
                                          <path d={areaPathStr} fill="url(#cfChartGlow)" />
                                        )}

                                        {/* Stroke Line */}
                                        {linePathStr && (
                                          <path 
                                            d={linePathStr} 
                                            fill="none" 
                                            stroke="#22c55e" 
                                            strokeWidth="3.5" 
                                            strokeLinecap="round"
                                            strokeLinejoin="round" 
                                          />
                                        )}

                                        {/* Interactive Points */}
                                        {points.map((p, idx) => {
                                          const isSelected = hoveredCfContest?.contestId === p.contestId || (!hoveredCfContest && idx === points.length - 1);
                                          return (
                                            <g key={idx}>
                                              <circle
                                                cx={p.x}
                                                cy={p.y}
                                                r={isSelected ? 6 : 4}
                                                className={`fill-green-500 transition-all duration-150 cursor-pointer ${
                                                  isSelected ? "stroke-light dark:stroke-[#0d1117] stroke-2" : "hover:scale-125"
                                                }`}
                                                onMouseEnter={() => setHoveredCfContest(p)}
                                                onClick={() => setHoveredCfContest(p)}
                                              />
                                              {/* Hidden bigger circle for easier hover targeting */}
                                              <circle
                                                cx={p.x}
                                                cy={p.y}
                                                r={14}
                                                className="fill-transparent cursor-pointer"
                                                onMouseEnter={() => setHoveredCfContest(p)}
                                                onClick={() => setHoveredCfContest(p)}
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
                                  const sortedCfHistory = [...cfData.contestHistory]
                                    .sort((a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds);
                                  const activeItem = hoveredCfContest || sortedCfHistory[sortedCfHistory.length - 1];
                                  const delta = Math.round(activeItem.newRating - activeItem.oldRating);

                                  return (
                                    <div className="border border-solid border-dark/10 dark:border-light/10 rounded-xl p-4 bg-dark/5 dark:bg-light/5 flex flex-col justify-between h-full min-h-[160px]">
                                      <div>
                                        <div className="text-[10px] font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider">
                                          Contest Performance
                                        </div>
                                        <h6 className="text-sm font-bold mt-1 text-green-500 leading-tight">
                                          {activeItem.contestName}
                                        </h6>
                                        <div className="text-[11px] text-dark/60 dark:text-light/60 mt-1">
                                          {formatDate(activeItem.ratingUpdateTimeSeconds)}
                                        </div>
                                      </div>

                                      <div className="mt-4 space-y-2 text-xs font-semibold">
                                        <div className="flex justify-between">
                                          <span className="text-dark/60 dark:text-light/60">Rating After</span>
                                          <span className="text-dark dark:text-light flex items-center gap-1">
                                            {activeItem.newRating}
                                            <span className={`text-[10px] font-extrabold ${delta >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                              {delta >= 0 ? `+${delta}` : delta}
                                            </span>
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-dark/60 dark:text-light/60">Rank in Contest</span>
                                          <span className="text-dark dark:text-light">
                                            #{activeItem.rank.toLocaleString()}
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
                            This user hasn&apos;t participated in any official Codeforces contests yet, or rating calculation is pending.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Recent Submissions Tab */}
                  {cfActiveTab === "recent" && (
                    <motion.div
                      key="recent"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {cfData?.recentSubmissions?.length > 0 ? (
                        <div className="border border-solid border-dark/10 dark:border-light/10 rounded-2xl overflow-hidden divide-y divide-solid divide-dark/10 dark:divide-light/10">
                          {cfData.recentSubmissions.map((sub, idx) => {
                            const isAC = sub.statusDisplay === "Accepted" || sub.statusDisplay === "OK";
                            const formatCfVerdict = (verdict) => {
                              if (!verdict) return "";
                              if (verdict === "OK" || verdict === "Accepted") return "Accepted";
                              return verdict
                                .split("_")
                                .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                                .join(" ");
                            };
                            return (
                              <div key={idx} className="p-4 flex items-center justify-between hover:bg-dark/5 dark:hover:bg-light/5 transition-colors duration-150">
                                <div className="flex flex-col gap-1">
                                  <Link 
                                    href={`https://codeforces.com/contest/${sub.contestId}/problem/${sub.index}`} 
                                    target="_blank"
                                    className="font-bold hover:text-green-500 dark:hover:text-green-400 flex items-center gap-1.5"
                                  >
                                    {sub.title} <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                                  </Link>
                                  <div className="flex items-center gap-3 text-xs font-semibold text-dark/50 dark:text-light/50">
                                    <span className="capitalize">{sub.lang}</span>
                                    <span>•</span>
                                    {sub.rating && (
                                      <>
                                        <span className="text-green-500 font-bold">Rating: {sub.rating}</span>
                                        <span>•</span>
                                      </>
                                    )}
                                    <span>{formatRelativeTime(sub.timestamp)}</span>
                                  </div>
                                </div>
                                
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  isAC 
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-solid border-emerald-500/20" 
                                    : "bg-red-500/10 text-red-600 dark:text-red-400 border border-solid border-red-500/20"
                                }`}>
                                  {formatCfVerdict(sub.statusDisplay)}
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
                {showScrollArrow && !cfLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-4 left-0 right-0 z-20 pointer-events-none flex flex-col items-center justify-center text-green-500 animate-bounce"
                  >
                    <span className="text-[10px] font-extrabold tracking-wider bg-light/95 dark:bg-dark/95 px-2.5 py-1 rounded-full border border-solid border-green-500/30 shadow-md backdrop-blur-sm">
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
                Data fetched dynamically via official Codeforces REST API.
              </span>
              <Link
                href="https://codeforces.com/profile/Urva_Gandhi"
                target="_blank"
                className="rounded-xl bg-green-600 hover:bg-green-700 text-center text-sm font-bold text-white dark:text-black dark:bg-green-400 dark:hover:bg-green-300 transition-all duration-300 px-6 py-2.5"
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

export default CodeforcesModal;
