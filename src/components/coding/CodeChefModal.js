import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BorderBeam } from "../magicui/border-beam";
import { useModalControls } from "@/components/hooks/useModalControls";
import { formatDate } from "./helpers";
import { 
  X, Award, Flame, Zap, Globe, GraduationCap, Calendar, 
  BarChart3, Clock, Trophy, MapPin, Info, CheckCircle2, AlertCircle, ExternalLink,
  LayoutDashboard, Code2, Target, Loader2, Terminal, Flag
} from "lucide-react";

const getCcRatingStyle = (starsStr) => {
  const starsNum = parseInt(starsStr) || 1;
  switch (starsNum) {
    case 1:
      return { color: "#666666", name: "1★ Coder", labelBg: "bg-gray-500" };
    case 2:
      return { color: "#1e7d22", name: "2★ Coder", labelBg: "bg-emerald-600" };
    case 3:
      return { color: "#3366cc", name: "3★ Coder", labelBg: "bg-blue-600" };
    case 4:
      return { color: "#684273", name: "4★ Coder", labelBg: "bg-purple-600" };
    case 5:
      return { color: "#ffbf00", name: "5★ Coder", labelBg: "bg-amber-500" };
    case 6:
      return { color: "#ff7f00", name: "6★ Coder", labelBg: "bg-orange-500" };
    case 7:
      return { color: "#d0011b", name: "7★ Coder", labelBg: "bg-red-600" };
    default:
      return { color: "#666666", name: `${starsNum}★ Coder`, labelBg: "bg-gray-500" };
  }
};

const CodeChefStarBadge = ({ stars }) => {
  const ratingStyle = getCcRatingStyle(stars);
  
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="filter drop-shadow-md hover:drop-shadow-lg transition-all duration-300 select-none"
    >
      <defs>
        {/* Outer Ring Gold Gradient */}
        <linearGradient id="cc-gold-outer" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e5ba73" />
          <stop offset="50%" stopColor="#c59242" />
          <stop offset="100%" stopColor="#a3742c" />
        </linearGradient>

        {/* Inner Circle Gold Gradient */}
        <linearGradient id="cc-gold-inner" x1="100" y1="38" x2="100" y2="162" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f7e6c4" />
          <stop offset="100%" stopColor="#e7c68b" />
        </linearGradient>

        {/* Trophy Metallic Gold Gradient */}
        <linearGradient id="cc-trophy-gold" x1="100" y1="75" x2="100" y2="145" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d4a34f" />
          <stop offset="100%" stopColor="#b27f2f" />
        </linearGradient>
        
        {/* Drop shadow filter for inner circle */}
        <filter id="cc-inner-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Outer Coin / Rim */}
      <circle cx="100" cy="100" r="90" fill="url(#cc-gold-outer)" stroke="#8b5d1a" strokeWidth="1.5" />
      
      {/* Outer Rim Accent Lines for 3D effect */}
      <circle cx="100" cy="100" r="82" fill="none" stroke="#fbe4b5" strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="#71480f" strokeWidth="1" strokeOpacity="0.3" />

      {/* Shine Reflection Arc */}
      <path
        d="M 42 35 A 72 72 0 0 0 24 95"
        fill="none"
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.35"
      />

      {/* Inner Gold Disc */}
      <circle
        cx="100"
        cy="100"
        r="64"
        fill="url(#cc-gold-inner)"
        stroke="#bd9552"
        strokeWidth="1.5"
        filter="url(#cc-inner-shadow)"
      />
      <circle cx="100" cy="100" r="59" fill="none" stroke="#71480f" strokeWidth="0.8" strokeOpacity="0.15" />

      {/* Trophy Artwork */}
      {/* Handles */}
      <path
        d="M 72 82 C 55 82 55 106 72 106 L 72 100 C 62 100 62 88 72 88 Z"
        fill="url(#cc-trophy-gold)"
        stroke="#8b5d1a"
        strokeWidth="0.5"
      />
      <path
        d="M 128 82 C 145 82 145 106 128 106 L 128 100 C 138 100 138 88 128 88 Z"
        fill="url(#cc-trophy-gold)"
        stroke="#8b5d1a"
        strokeWidth="0.5"
      />

      {/* Bowl */}
      <path
        d="M 72 75 L 128 75 C 128 102 116 117 106 117 L 94 117 C 84 117 72 102 72 75 Z"
        fill="url(#cc-trophy-gold)"
        stroke="#8b5d1a"
        strokeWidth="0.7"
      />
      
      {/* Stem */}
      <rect
        x="94"
        y="114"
        width="12"
        height="18"
        fill="url(#cc-trophy-gold)"
        stroke="#8b5d1a"
        strokeWidth="0.7"
      />

      {/* Base */}
      <path
        d="M 80 130 L 120 130 C 120 130 122 138 116 138 L 84 138 C 78 138 80 130 80 130 Z"
        fill="url(#cc-trophy-gold)"
        stroke="#8b5d1a"
        strokeWidth="0.7"
      />

      {/* Star on the Trophy Cup */}
      <polygon
        points="100,82 104,91 113,92 106,98 109,107 100,102 91,107 94,98 87,92 96,91"
        fill="#fcfcfc"
        stroke="#bd9552"
        strokeWidth="0.3"
      />

      {/* Stars Level Banner at the bottom */}
      <g transform="translate(0, 4)">
        <rect
          x="62"
          y="142"
          width="76"
          height="22"
          rx="11"
          fill={ratingStyle.color}
          stroke="#ffffff"
          strokeWidth="1.8"
          style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.15))" }}
        />
        <text
          x="100"
          y="157"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="11"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.5"
        >
          {stars}
        </text>
      </g>
    </svg>
  );
};

export const CodeChefModal = ({ show, onClose, data }) => {
  const { canPortal } = useModalControls(show, onClose);
  const [ccActiveTab, setCcActiveTab] = useState("overview");
  const [hoveredCcContest, setHoveredCcContest] = useState(null);
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
  }, [show, ccActiveTab, data]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setShowScrollArrow(scrollHeight - scrollTop - clientHeight > 30);
  };

  if (!canPortal) return null;

  const ccData = data || {};
  const ccLoading = !data;

  const ccStars = ccData?.info?.stars ? ccData.info.stars : "1★";
  const ccSolvedCount = ccData?.problemsSolved || 27;
  const ccPrimaryLang = ccData?.languages?.[0]?.languageName || "JAVA";

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          key="codechef-overlay"
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
            className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl border border-solid border-dark/10 bg-light shadow-2xl dark:border-red-500/30 dark:bg-dark flex flex-col cursor-default"
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
              <BorderBeam size={150} duration={8} delay={4} colorFrom="#ef4444" colorTo="#dc2626" />
              <div className="flex items-center gap-4 sm:flex-col sm:items-start">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-solid border-red-500/50 shadow-md">
                  <img
                    src={ccData?.info?.avatar || "https://cdn.codechef.com/sites/all/themes/abessive/images/user_default_thumb.jpg"}
                    alt={ccData?.info?.handle || "CodeChef"}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="text-3xl font-extrabold tracking-tight">
                      {ccData?.info?.realName || "Urva Gandhi"}
                    </h4>
                    {ccData?.info?.rating && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-solid border-red-500/20">
                        <Award className="w-3.5 h-3.5" /> Contest Rating: {ccData.info.rating} ({ccStars})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-dark/70 dark:text-light/70 flex-wrap">
                    <span className="font-semibold text-red-600 dark:text-red-400">@{ccData?.info?.handle || "urva_gandhi"}</span>
                    {ccData?.info?.country && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-red-500" /> {ccData.info.country}
                      </span>
                    )}
                    {ccData?.info?.organization && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4 text-red-500" /> {ccData.info.organization}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar border-b border-solid border-dark/5 dark:border-light/5">
                {[
                  { id: "overview", label: "Overview", icon: LayoutDashboard },
                  { id: "badges", label: "Badges & Languages", icon: Award },
                  { id: "contest", label: "Contest Stats", icon: Trophy },
                  { id: "recent", label: "Recent Submissions", icon: Clock },
                ].map((tab) => {
                  const isActive = ccActiveTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCcActiveTab(tab.id)}
                      className={`relative pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-colors duration-200 whitespace-nowrap ${
                        isActive
                          ? "text-red-600 dark:text-red-400"
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
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 origin-center"
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
                className="flex-1 overflow-y-auto p-8 max-h-[50vh] min-h-[40vh] no-scrollbar bg-light dark:bg-[#0d1117]/95"
              >
              {ccLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-solid border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                  <span className="text-sm font-bold text-dark/50 dark:text-light/50">Fetching CodeChef Analytics...</span>
                </div>
              ) : (
                <>
                  {/* Overview Tab */}
                  {ccActiveTab === "overview" && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Top Stats Counters Row */}
                      <div className="grid grid-cols-6 gap-4 lg:grid-cols-3 sm:grid-cols-2">
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                          <Trophy className="w-8 h-8 text-red-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-2xl font-extrabold">{ccData?.info?.rating || "1240"}</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Rating</span>
                        </div>
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                          <div className="w-14 h-14 mb-2 group-hover:scale-110 transition-transform duration-200 flex items-center justify-center">
                            <CodeChefStarBadge stars={ccStars} />
                          </div>
                          <span className="text-2xl font-extrabold">{ccStars}</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Stars</span>
                        </div>
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                          <Zap className="w-8 h-8 text-red-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-2xl font-extrabold">{ccSolvedCount}</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Problems Solved</span>
                        </div>
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                          <Globe className="w-8 h-8 text-red-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-2xl font-extrabold">{ccData?.info?.globalRank || "N/A"}</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Global Rank</span>
                        </div>
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                          <Flag className="w-8 h-8 text-red-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-2xl font-extrabold">{ccData?.info?.countryRank || "N/A"}</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Country Rank</span>
                        </div>
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                          <Calendar className="w-8 h-8 text-red-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-2xl font-extrabold">{ccData?.totalActiveDays || "0"}</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Active Days</span>
                        </div>
                      </div>

                      {/* Calendar & Derived Stats Grid */}
                      <div className="grid grid-cols-2 gap-6 md:grid-cols-1">
                        {/* CodeChef heatmap (Contribution Calendar) */}
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-6 rounded-2xl bg-light dark:bg-dark">
                          <h5 className="text-md font-bold mb-4 border-b border-solid border-dark/10 dark:border-light/10 pb-2">Submission Activity Calendar</h5>
                          <div className="overflow-x-auto pb-2 no-scrollbar">
                            {(() => {
                              const now = new Date();
                              const startDate = new Date();
                              startDate.setMonth(startDate.getMonth() - 5);
                              startDate.setDate(startDate.getDate() - startDate.getDay()); // align to Sunday

                              const ccCalendarMap = {};
                              ccData?.contributions?.forEach(c => {
                                ccCalendarMap[c.date] = c.count;
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
                                const submissionsOnDay = ccCalendarMap[dateStr] || 0;

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
                                        
                                        let bgClass = "bg-dark/10 dark:bg-light/10";
                                        if (day.count > 0 && day.count <= 2) bgClass = "bg-red-500/20";
                                        else if (day.count > 2 && day.count <= 5) bgClass = "bg-red-500/50";
                                        else if (day.count > 5) bgClass = "bg-red-500";

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
                              <span className="text-dark/50 dark:text-light/50">Highest Rating</span>
                              <span className="text-red-500">{ccData?.info?.highestRating || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-dark/50 dark:text-light/50">Longest Streak</span>
                              <span>{ccData?.derivedMetrics?.longestStreak || "0"} days</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-dark/50 dark:text-light/50">Primary Language</span>
                              <span>{ccPrimaryLang}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-dark/50 dark:text-light/50">Submission Success Rate</span>
                              <span>{ccData?.derivedMetrics?.acceptanceRate || "0"}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Badges & Languages Tab */}
                  {ccActiveTab === "badges" && (
                    <motion.div
                      key="badges"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-2 gap-6 md:grid-cols-1"
                    >
                      {/* Earned Badges */}
                      <div className="border border-solid border-dark/10 dark:border-light/10 p-6 rounded-2xl bg-light dark:bg-dark flex flex-col justify-between">
                        <div>
                          <h5 className="text-md font-bold mb-4 border-b border-solid border-dark/10 dark:border-light/10 pb-2">Earned Badges</h5>
                          
                          {/* Prominent Star Coder badge */}
                          <div className="flex items-center gap-6 p-4 mb-6 rounded-2xl bg-red-500/5 border border-solid border-red-500/10 shadow-sm">
                            <div className="w-20 h-20 flex-shrink-0">
                              <CodeChefStarBadge stars={ccStars} />
                            </div>
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-500">CodeChef Rank Level</span>
                              <h6 className="text-base font-extrabold mt-0.5">{getCcRatingStyle(ccStars).name}</h6>
                              <p className="text-xs text-dark/60 dark:text-light/60 mt-1 leading-snug">
                                Dynamic rating-tier achievement badge based on active contest ratings.
                              </p>
                            </div>
                          </div>

                          {ccData?.badges?.length > 0 ? (
                            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2">
                              {ccData.badges.map((badge, idx) => (
                                <div key={idx} className="flex gap-4 p-3 rounded-xl hover:bg-dark/5 dark:hover:bg-light/5 transition-all duration-300 items-center">
                                  <div className="w-12 h-12 flex-shrink-0">
                                    <img src={badge.image} alt={badge.title} className="w-full h-full object-contain" />
                                  </div>
                                  <div className="flex-1">
                                    <h6 className="text-xs font-bold text-red-500 leading-tight">{badge.title}</h6>
                                    <p className="text-[10px] text-dark/60 dark:text-light/60 mt-1 leading-snug">{badge.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-8 text-center text-sm font-semibold text-dark/40 dark:text-light/40">No other badges earned yet</div>
                          )}
                        </div>
                      </div>

                      {/* Languages Distribution */}
                      <div className="border border-solid border-dark/10 dark:border-light/10 p-6 rounded-2xl bg-light dark:bg-dark flex flex-col justify-between">
                        <div>
                          <h5 className="text-md font-bold mb-4 border-b border-solid border-dark/10 dark:border-light/10 pb-2">Programming Languages Used</h5>
                          {ccData?.languages?.length > 0 ? (
                            <div className="space-y-4">
                              {ccData.languages.map((lang, idx) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between text-xs font-bold">
                                    <span className="text-dark/70 dark:text-light/70">{lang.languageName}</span>
                                    <span>{lang.problemsSolved} submissions ({lang.percentage}%)</span>
                                  </div>
                                  <div className="h-2.5 rounded-full bg-dark/5 dark:bg-light/10 overflow-hidden">
                                    <div
                                      style={{ width: `${lang.percentage}%` }}
                                      className="h-full bg-red-500 rounded-full transition-all duration-500"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-12 text-center text-sm font-semibold text-dark/40 dark:text-light/40">No language stats available</div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Contest Stats Tab */}
                  {ccActiveTab === "contest" && (
                    <motion.div
                      key="contest"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Contest Rating Progress */}
                      {ccData?.contestHistory?.length > 0 && (
                        <div className="border border-solid border-dark/10 dark:border-light/10 rounded-2xl p-6 bg-light dark:bg-[#0d1117]/50">
                          <h5 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-solid border-dark/10 dark:border-light/10 pb-2">
                            <BarChart3 className="w-5 h-5 text-red-500" /> Contest Rating Progress
                          </h5>

                          <div className="grid grid-cols-3 gap-6 md:grid-cols-1">
                            {/* Interactive SVG Chart */}
                            <div className="col-span-2 relative h-[220px]">
                              {(() => {
                                const sortedCcHistory = [...ccData.contestHistory]
                                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                                const svgWidth = 500;
                                const svgHeight = 200;
                                const padX = 40;
                                const padY = 30;

                                const historyRatings = sortedCcHistory.map(h => h.rating);
                                const minR = Math.min(...historyRatings, 1000) - 30;
                                const maxR = Math.max(...historyRatings, 1300) + 30;
                                const rRange = maxR - minR;

                                const points = sortedCcHistory.map((h, i) => {
                                  const x = padX + (i / (sortedCcHistory.length - 1 || 1)) * (svgWidth - 2 * padX);
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
                                      <linearGradient id="ccChartGlow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
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
                                      <path d={areaPathStr} fill="url(#ccChartGlow)" />
                                    )}

                                    {/* Stroke Line */}
                                    {linePathStr && (
                                      <path 
                                        d={linePathStr} 
                                        fill="none" 
                                        stroke="#ef4444" 
                                        strokeWidth="3.5" 
                                        strokeLinecap="round"
                                        strokeLinejoin="round" 
                                      />
                                    )}

                                    {/* Interactive Points */}
                                    {points.map((p, idx) => {
                                      const isSelected = hoveredCcContest?.contestId === p.contestId || (!hoveredCcContest && idx === points.length - 1);
                                      return (
                                        <g key={idx}>
                                          <circle
                                            cx={p.x}
                                            cy={p.y}
                                            r={isSelected ? 6 : 4}
                                            className={`fill-red-500 transition-all duration-150 cursor-pointer ${
                                              isSelected ? "stroke-light dark:stroke-[#0d1117] stroke-2" : "hover:scale-125"
                                            }`}
                                            onMouseEnter={() => setHoveredCcContest(p)}
                                            onClick={() => setHoveredCcContest(p)}
                                          />
                                          <circle
                                            cx={p.x}
                                            cy={p.y}
                                            r={14}
                                            className="fill-transparent cursor-pointer"
                                            onMouseEnter={() => setHoveredCcContest(p)}
                                            onClick={() => setHoveredCcContest(p)}
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
                              const sortedCcHistory = [...ccData.contestHistory]
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                              const activeItem = hoveredCcContest || sortedCcHistory[sortedCcHistory.length - 1];
                              
                              const idx = sortedCcHistory.findIndex(h => h.contestId === activeItem.contestId);
                              const prevItem = idx > 0 ? sortedCcHistory[idx - 1] : null;
                              const delta = prevItem ? activeItem.rating - prevItem.rating : activeItem.rating - 1000;

                              return (
                                <div className="border border-solid border-dark/10 dark:border-light/10 rounded-xl p-4 bg-dark/5 dark:bg-light/5 flex flex-col justify-between h-full min-h-[160px]">
                                  <div>
                                    <div className="text-[10px] font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider">
                                      Contest Performance
                                    </div>
                                    <h6 className="text-sm font-bold mt-1 text-red-500 leading-tight">
                                      {activeItem.contestName}
                                    </h6>
                                    <div className="text-[11px] text-dark/60 dark:text-light/60 mt-1">
                                      {activeItem.date}
                                    </div>
                                  </div>

                                  <div className="mt-4 space-y-2 text-xs font-semibold">
                                    <div className="flex justify-between">
                                      <span className="text-dark/60 dark:text-light/60">Rating After</span>
                                      <span className="text-dark dark:text-light flex items-center gap-1">
                                        {activeItem.rating}
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
                    </motion.div>
                  )}

                  {/* Recent Submissions Tab */}
                  {ccActiveTab === "recent" && (
                    <motion.div
                      key="recent"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {ccData?.recentSubmissions?.length > 0 ? (
                        <div className="border border-solid border-dark/10 dark:border-light/10 rounded-2xl overflow-hidden divide-y divide-solid divide-dark/10 dark:divide-light/10">
                          {ccData.recentSubmissions.map((sub, idx) => {
                            const isAC = sub.verdict.toLowerCase() === "accepted";
                            return (
                              <div key={idx} className="p-4 flex items-center justify-between hover:bg-dark/5 dark:hover:bg-light/5 transition-colors duration-150">
                                <div className="flex flex-col gap-1">
                                  <Link 
                                    href={sub.problemUrl} 
                                    target="_blank"
                                    className="font-bold hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1.5"
                                  >
                                    {sub.problemCode} <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                                  </Link>
                                  <div className="flex items-center gap-3 text-xs font-semibold text-dark/50 dark:text-light/50">
                                    <span className="capitalize">{sub.lang}</span>
                                    <span>{sub.time}</span>
                                  </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isAC ? "bg-green-500/10 text-green-500 border border-solid border-green-500/20" : "bg-red-500/10 text-red-500 border border-solid border-red-500/20"}`}>
                                  {sub.verdict.charAt(0).toUpperCase() + sub.verdict.slice(1)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-sm font-semibold text-dark/40 dark:text-light/40">No recent submissions found</div>
                      )}
                    </motion.div>
                  )}
                </>
              )}
              </div>

              <AnimatePresence>
                {showScrollArrow && !ccLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-4 left-0 right-0 z-20 pointer-events-none flex flex-col items-center justify-center text-red-500 animate-bounce"
                  >
                    <span className="text-[10px] font-extrabold tracking-wider bg-light/95 dark:bg-dark/95 px-2.5 py-1 rounded-full border border-solid border-red-500/30 shadow-md backdrop-blur-sm">
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
                Data scraped dynamically from CodeChef User Profile.
              </span>
              <Link
                href="https://codechef.com/users/urva_gandhi"
                target="_blank"
                className="rounded-xl bg-red-600 hover:bg-red-700 text-center text-sm font-bold text-white dark:text-black dark:bg-red-400 dark:hover:bg-red-300 transition-all duration-300 px-6 py-2.5"
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

export default CodeChefModal;
