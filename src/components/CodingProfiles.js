import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LeetCodeIcon, CodeforcesIcon, CodeChefIcon, LinkArrow } from "./Icons";
import { BorderBeam } from "./magicui/border-beam";
import { 
  X, Award, Flame, Zap, Globe, GraduationCap, Calendar, 
  BarChart3, Clock, Trophy, MapPin, Building, Info, CheckCircle2, AlertCircle, ExternalLink,
  LayoutDashboard, Code2, Target, Loader2
} from "lucide-react";

// Relative time formatting helper
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "";
  const now = new Date();
  const submissionDate = new Date(parseInt(timestamp) * 1000);
  const diffMs = now - submissionDate;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return `${diffMins || 1}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
};

// Date formatter helper
const formatDate = (startTime) => {
  if (!startTime) return "";
  const d = new Date(startTime * 1000);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const ProfileCard = ({ platform, icon: Icon, rating, subText, badge, badgeColor, link, colorFrom, colorTo, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`relative flex flex-col justify-between rounded-2xl border border-solid border-dark/20 bg-light p-6 shadow-md dark:border-light/10 dark:bg-[#0d1117] overflow-hidden group min-h-[200px] ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <BorderBeam size={120} duration={8} delay={3} colorFrom={colorFrom} colorTo={colorTo} />
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center dark:text-light">
              <Icon className="w-full h-full" />
            </div>
            <h4 className="text-xl font-bold text-dark dark:text-light">{platform}</h4>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border border-solid ${badgeColor}`}>
            {badge}
          </span>
        </div>

        <div className="my-4">
          <div className="text-3xl font-extrabold text-dark dark:text-light flex items-baseline gap-1">
            {rating}
            <span className="text-sm font-medium text-dark/60 dark:text-light/60">rating</span>
          </div>
          <p className="text-sm font-medium text-dark/70 dark:text-light/70 mt-1">
            {subText}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-solid border-dark/10 dark:border-light/10 flex items-center justify-between">
        {onClick ? (
          <span className="text-xs font-semibold text-primary dark:text-primaryDark group-hover:underline flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> Click to Expand Analytics
          </span>
        ) : (
          <Link
            href={link}
            target="_blank"
            className="flex items-center gap-1 text-sm font-bold text-primary dark:text-primaryDark group-hover:underline"
          >
            View Profile
            <LinkArrow className="w-4 ml-1" />
          </Link>
        )}
        
        {onClick && (
          <Link
            href={link}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-sm font-bold text-dark/60 dark:text-light/60 hover:text-primary dark:hover:text-primaryDark transition-colors duration-200"
          >
            View Profile
            <LinkArrow className="w-4 ml-1" />
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default function CodingProfiles() {
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [hoveredContest, setHoveredContest] = useState(null);

  const [cfData, setCfData] = useState(null);
  const [cfLoading, setCfLoading] = useState(true);
  const [showCfModal, setShowCfModal] = useState(false);
  const [cfActiveTab, setCfActiveTab] = useState("overview");
  const [hoveredCfContest, setHoveredCfContest] = useState(null);

  const [ccData, setCcData] = useState(null);
  const [ccLoading, setCcLoading] = useState(true);
  const [showCcModal, setShowCcModal] = useState(false);
  const [ccActiveTab, setCcActiveTab] = useState("overview");
  const [hoveredCcContest, setHoveredCcContest] = useState(null);

  useEffect(() => {
    fetch("/api/leetcode?username=urva_gandhi")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setLeetcodeData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch LeetCode dynamic statistics", err);
        setLoading(false);
      });

    fetch("/api/codeforces?username=Urva_Gandhi")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setCfData(data);
        }
        setCfLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch Codeforces statistics", err);
        setCfLoading(false);
      });

    fetch("/api/codechef?username=urva_gandhi")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setCcData(data);
        }
        setCcLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch CodeChef statistics", err);
        setCcLoading(false);
      });
  }, []);

  // LeetCode Card dynamic helper values (with fallbacks)
  const leetcodeRating = leetcodeData?.contestRanking?.rating 
    ? Math.round(leetcodeData.contestRanking.rating).toString() 
    : "1604";
  
  const leetcodeBadge = leetcodeData?.contestRanking?.topPercentage 
    ? `Top ${leetcodeData.contestRanking.topPercentage}%` 
    : "Top 23.25%";

  const topLanguage = leetcodeData?.languages?.length > 0
    ? [...leetcodeData.languages].sort((a, b) => b.problemsSolved - a.problemsSolved)[0]?.languageName
    : "Java";

  const totalSolvedCount = leetcodeData?.submitStats?.acSubmissionNum?.find(q => q.difficulty === "All")?.count
    || leetcodeData?.submitStats?.acSubmissionNum?.[0]?.count 
    || 291;

  const leetcodeSolved = `Solved ${totalSolvedCount} DSA problems in ${topLanguage}`;

  // Codeforces Card dynamic helper values (with fallbacks)
  const cfRating = cfData?.info?.rating 
    ? cfData.info.rating.toString() 
    : "1307";

  const cfRank = cfData?.info?.rank 
    ? cfData.info.rank.charAt(0).toUpperCase() + cfData.info.rank.slice(1) 
    : "Pupil";

  const cfSolvedCount = cfData?.derivedMetrics?.totalSolved || 450;
  const cfPrimaryLang = cfData?.derivedMetrics?.primaryLanguage || "Java";
  const cfSolvedText = `Solved ${cfSolvedCount} problems in ${cfPrimaryLang}`;

  // CodeChef Card dynamic helper values (with fallbacks)
  const ccRating = ccData?.info?.rating 
    ? ccData.info.rating.toString() 
    : "1240";

  const ccStars = ccData?.info?.stars 
    ? ccData.info.stars 
    : "1★";

  const ccRank = ccData?.info?.stars 
    ? `${ccData.info.stars} Rated` 
    : "1★ Rated";

  const ccSolvedCount = ccData?.problemsSolved || 27;
  const ccPrimaryLang = ccData?.languages?.[0]?.languageName || "Java";
  const ccSolvedText = `Solved ${ccSolvedCount} problems in ${ccPrimaryLang}`;

  const profiles = [
    {
      platform: "LeetCode",
      icon: LeetCodeIcon,
      rating: leetcodeRating,
      subText: leetcodeSolved,
      badge: leetcodeBadge,
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      link: "https://leetcode.com/u/urva_gandhi",
      colorFrom: "#f59e0b",
      colorTo: "#d97706",
      onClick: () => setShowModal(true)
    },
    {
      platform: "Codeforces",
      icon: CodeforcesIcon,
      rating: cfRating,
      subText: cfSolvedText,
      badge: cfRank,
      badgeColor: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      link: "https://codeforces.com/profile/Urva_Gandhi",
      colorFrom: "#22c55e",
      colorTo: "#16a34a",
      onClick: () => setShowCfModal(true)
    },
    {
      platform: "CodeChef",
      icon: CodeChefIcon,
      rating: ccRating,
      subText: ccSolvedText,
      badge: ccRank,
      badgeColor: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      link: "https://codechef.com/users/urva_gandhi",
      colorFrom: "#ef4444",
      colorTo: "#dc2626",
      onClick: () => setShowCcModal(true)
    },
  ];

  // Helper variables for modal stats
  const profile = leetcodeData?.profile || {};
  const contest = leetcodeData?.contestRanking || {};
  const submitStats = leetcodeData?.submitStats || {};
  const derived = leetcodeData?.derivedMetrics || {};
  const languages = leetcodeData?.languages || [];
  const badges = leetcodeData?.badges || [];
  const activeBadge = leetcodeData?.activeBadge || {};
  const recentSubmissions = leetcodeData?.recentSubmissions || [];
  const sortedHistory = [...(leetcodeData?.contestHistory || [])]
    .sort((a, b) => a.contest.startTime - b.contest.startTime);

  const getQuestionTotal = (difficulty) => {
    if (!leetcodeData || !leetcodeData.allQuestions) return 0;
    const item = leetcodeData.allQuestions.find(q => q.difficulty === difficulty);
    return item ? item.count : 0;
  };

  const getSolvedCount = (difficulty) => {
    if (!submitStats || !submitStats.acSubmissionNum) return 0;
    const item = submitStats.acSubmissionNum.find(q => q.difficulty === difficulty);
    return item ? item.count : 0;
  };

  const easySolved = getSolvedCount("Easy") || 138;
  const easyTotal = getQuestionTotal("Easy") || 820;
  const mediumSolved = getSolvedCount("Medium") || 130;
  const mediumTotal = getQuestionTotal("Medium") || 1650;
  const hardSolved = getSolvedCount("Hard") || 23;
  const hardTotal = getQuestionTotal("Hard") || 740;
  const totalSolved = getSolvedCount("All") || (easySolved + mediumSolved + hardSolved);

  const easyPercent = ((easySolved / easyTotal) * 100).toFixed(1);
  const mediumPercent = ((mediumSolved / mediumTotal) * 100).toFixed(1);
  const hardPercent = ((hardSolved / hardTotal) * 100).toFixed(1);

  // Total submissions acceptance calculations
  const totalACSub = submitStats.acSubmissionNum?.[0]?.submissions || 0;
  const totalAllSub = submitStats.totalSubmissionNum?.[0]?.submissions || 1;
  const acceptanceRate = ((totalACSub / totalAllSub) * 100).toFixed(1);

  const tabs = [
    { id: "overview", label: "Overview", icon: Globe },
    { id: "solved", label: "Problems & Languages", icon: BarChart3 },
    { id: "contest", label: "Contest Stats", icon: Trophy },
    { id: "recent", label: "Recent Submissions", icon: Clock },
  ];

  return (
    <div className="w-full mt-16">
      <h3 className="text-2xl font-bold dark:text-light mb-6">Coding Profiles & Stats</h3>
      <div className="grid grid-cols-3 gap-6 lg:grid-cols-2 md:grid-cols-1">
        {profiles.map((profile, index) => (
          <ProfileCard key={index} {...profile} />
        ))}
      </div>

      {/* Immersive Expandable LeetCode Analytics Dialog */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            key="leetcode-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 dark:bg-black/60 backdrop-blur-md cursor-default"
          >
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-light/95 dark:bg-[#0d1117]/95 border border-dark/10 dark:border-light/10 shadow-2xl rounded-3xl overflow-hidden z-10 max-h-[90vh] flex flex-col text-dark dark:text-light cursor-default"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
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
                      <span className="font-semibold text-primary dark:text-primaryDark">@{leetcodeData?.profile?.username || "urva_gandhi"}</span>
                      {profile.countryName && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-primary dark:text-primaryDark" /> {profile.countryName}
                        </span>
                      )}
                      {profile.school && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4 text-primary dark:text-primaryDark" /> {profile.school}
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
                            ? "text-primary dark:text-primaryDark"
                            : "text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light"
                        }`}
                      >
                        <TabIcon className="w-4 h-4" />
                        {tab.label}
                        {isActive && (
                          <motion.div
                            layoutId="activeTabIndicator"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-primaryDark"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable Body Content */}
              <div className="p-8 flex-1 overflow-y-auto max-h-[50vh]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="w-10 h-10 border-4 border-solid border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-semibold text-dark/50 dark:text-light/50">Fetching detailed LeetCode profile analytics...</span>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                      <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-8"
                      >
                        {/* Highlights Grid */}
                        <div className="grid grid-cols-4 gap-4 md:grid-cols-2 xs:grid-cols-1">
                          <div className="bg-dark/5 dark:bg-light/5 border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl flex flex-col items-start gap-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-dark/50 dark:text-light/50 flex items-center gap-1">
                              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" /> Current Streak
                            </span>
                            <span className="text-3xl font-extrabold">{leetcodeData?.streak || 0} days</span>
                          </div>

                          <div className="bg-dark/5 dark:bg-light/5 border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl flex flex-col items-start gap-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-dark/50 dark:text-light/50 flex items-center gap-1">
                              <Trophy className="w-4 h-4 text-amber-500" /> Longest Streak
                            </span>
                            <span className="text-3xl font-extrabold">{derived.longestStreak || 0} days</span>
                          </div>

                          <div className="bg-dark/5 dark:bg-light/5 border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl flex flex-col items-start gap-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-dark/50 dark:text-light/50 flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-primary dark:text-primaryDark" /> Active Days
                            </span>
                            <span className="text-3xl font-extrabold">{leetcodeData?.totalActiveDays || 0} days</span>
                          </div>

                          <div className="bg-dark/5 dark:bg-light/5 border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl flex flex-col items-start gap-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-dark/50 dark:text-light/50 flex items-center gap-1">
                              <Zap className="w-4 h-4 text-blue-500 fill-blue-500" /> Total Solved
                            </span>
                            <span className="text-3xl font-extrabold">{totalSolved}</span>
                          </div>
                        </div>

                        {/* Derived Metrics Fact Sheet */}
                        <div className="grid grid-cols-2 gap-6 md:grid-cols-1">
                          <div className="border border-solid border-dark/10 dark:border-light/10 rounded-2xl p-6">
                            <h5 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-solid border-dark/10 dark:border-light/10 pb-2">
                              <BarChart3 className="w-5 h-5 text-primary" /> Key Activity Metrics
                            </h5>
                            <div className="space-y-4 text-sm font-semibold">
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
                                <span className="text-dark dark:text-light text-primary dark:text-primaryDark font-bold">{derived.mostActiveMonth || "N/A"}</span>
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
                                <span className="text-dark/60 dark:text-light/60">Global Ranking</span>
                                <span className="text-dark dark:text-light">#{profile.ranking?.toLocaleString() || "N/A"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Badges Section */}
                          <div className="border border-solid border-dark/10 dark:border-light/10 rounded-2xl p-6 flex flex-col justify-between">
                            <div>
                              <h5 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-solid border-dark/10 dark:border-light/10 pb-2">
                                <Award className="w-5 h-5 text-primary" /> Badges Earned ({badges.length})
                              </h5>
                              {badges.length > 0 ? (
                                <div className="flex flex-wrap gap-4 mt-2">
                                  {badges.map((badge, idx) => (
                                    <motion.div 
                                      key={idx}
                                      whileHover={{ scale: 1.1 }}
                                      className="flex flex-col items-center gap-1 cursor-help group/badge relative"
                                    >
                                      <img src={badge.icon} alt={badge.displayName} className="w-14 h-14 object-contain" />
                                      {/* Badge Tooltip */}
                                      <div className="absolute bottom-full mb-2 hidden group-hover/badge:block w-36 bg-dark dark:bg-light text-light dark:text-dark text-[11px] font-bold py-1.5 px-2 rounded shadow-lg text-center leading-normal z-30">
                                        {badge.displayName}
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-dark/50 dark:text-light/50 text-sm font-semibold flex items-center gap-2 py-4">
                                  <AlertCircle className="w-5 h-5" /> No badges unlocked yet.
                                </div>
                              )}
                            </div>
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
                                
                                <div className="grid grid-cols-2 gap-4 mt-6">
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
                  </AnimatePresence>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-solid border-dark/10 dark:border-light/10 bg-dark/5 dark:bg-light/5 flex items-center justify-between sm:flex-col sm:gap-4 sm:items-stretch">
                <span className="text-xs font-bold text-dark/50 dark:text-light/50">
                  Data fetched dynamically via LeetCode GraphQL API.
                </span>
                <Link
                  href="https://leetcode.com/u/urva_gandhi"
                  target="_blank"
                  className="rounded-xl bg-dark px-6 py-2.5 text-center text-sm font-bold text-light dark:bg-primaryDark dark:text-dark dark:hover:bg-primaryDark/80 transition-all duration-300"
                >
                  Visit Official Profile
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Codeforces Analytics Modal */}
      <AnimatePresence>
        {showCfModal && (
          <motion.div
            key="codeforces-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowCfModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 dark:bg-dark/80 backdrop-blur-md cursor-default"
          >
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl border border-solid border-dark/10 bg-light shadow-2xl dark:border-primaryDark/30 dark:bg-dark flex flex-col cursor-default"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowCfModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-dark/10 dark:hover:bg-light/10 transition-all z-20"
                aria-label="Close dialog"
              >
                <X className="w-6 h-6" />
              </button>
              {/* Header Details */}
              <div className="p-8 pb-4 border-b border-solid border-dark/10 dark:border-light/10 flex flex-col md:gap-4 relative">
                <BorderBeam size={150} duration={8} delay={4} colorFrom="#22c55e" colorTo="#10b981" />
                <div className="flex items-center gap-4 sm:flex-col sm:items-start">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-solid border-green-500/50 shadow-md">
                    <img
                      src={cfData?.info?.avatar || "https://codeforces.org/s/0/images/codeforces-telegram-logo.png"}
                      alt={cfData?.info?.handle || "Codeforces"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="text-3xl font-extrabold tracking-tight">
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
                <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar border-b border-solid border-dark/5 dark:border-light/5">
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
                        className={`relative pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-colors duration-200 whitespace-nowrap ${
                          isActive
                            ? "text-green-500"
                            : "text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                        {isActive && (
                          <motion.div
                            layoutId="cfActiveTabIndicator"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setShowCfModal(false)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-dark/10 dark:hover:bg-light/10 transition-all z-20"
                  aria-label="Close dialog"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Body Content */}
              <div className="p-8 flex-1 overflow-y-auto max-h-[50vh] min-h-0 bg-light dark:bg-[#0d1117]/95">
                {cfLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-green-500" />
                    <span className="text-sm font-bold text-dark/60 dark:text-light/60">Fetching Codeforces profile...</span>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
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
                  </AnimatePresence>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-solid border-dark/10 dark:border-light/10 bg-dark/5 dark:bg-light/5 flex items-center justify-between sm:flex-col sm:gap-4 sm:items-stretch">
                <span className="text-xs font-bold text-dark/50 dark:text-light/50">
                  Data fetched dynamically via official Codeforces REST API.
                </span>
                <Link
                  href="https://codeforces.com/profile/Urva_Gandhi"
                  target="_blank"
                  className="rounded-xl bg-dark px-6 py-2.5 text-center text-sm font-bold text-light dark:bg-green-500 dark:text-dark dark:hover:bg-green-500/80 transition-all duration-300"
                >
                  Visit Official Profile
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CodeChef Analytics Modal */}
      <AnimatePresence>
        {showCcModal && (
          <motion.div
            key="codechef-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowCcModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 dark:bg-dark/80 backdrop-blur-md cursor-default"
          >
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl border border-solid border-dark/10 bg-light shadow-2xl dark:border-red-500/30 dark:bg-dark flex flex-col cursor-default"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowCcModal(false)}
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
                      <span className="font-semibold text-red-500">@{ccData?.info?.handle || "urva_gandhi"}</span>
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
                            ? "text-red-500"
                            : "text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                        {isActive && (
                          <motion.div
                            layoutId="ccActiveTabIndicator"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto p-8 max-h-[50vh] min-h-[40vh] no-scrollbar">
                {ccLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-4 border-solid border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                    <span className="text-sm font-bold text-dark/50 dark:text-light/50">Fetching CodeChef Analytics...</span>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
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
                        <div className="grid grid-cols-4 gap-4 sm:grid-cols-2">
                          <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                            <Trophy className="w-8 h-8 text-red-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                            <span className="text-2xl font-extrabold">{ccData?.info?.rating || "1240"}</span>
                            <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Rating</span>
                          </div>
                          <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                            <Award className="w-8 h-8 text-red-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                            <span className="text-2xl font-extrabold">{ccStars}</span>
                            <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Stars</span>
                          </div>
                          <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                            <Zap className="w-8 h-8 text-red-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                            <span className="text-2xl font-extrabold">{ccSolvedCount}</span>
                            <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Problems Solved</span>
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
                            {ccData?.badges?.length > 0 ? (
                              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
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
                              <div className="py-12 text-center text-sm font-semibold text-dark/40 dark:text-light/40">No badges earned yet</div>
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
                        {/* Contest Rating Chart */}
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
                  </AnimatePresence>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-solid border-dark/10 dark:border-light/10 bg-dark/5 dark:bg-light/5 flex items-center justify-between sm:flex-col sm:gap-4 sm:items-stretch">
                <span className="text-xs font-bold text-dark/50 dark:text-light/50">
                  Data scraped dynamically from CodeChef User Profile.
                </span>
                <Link
                  href="https://codechef.com/users/urva_gandhi"
                  target="_blank"
                  className="rounded-xl bg-dark px-6 py-2.5 text-center text-sm font-bold text-light dark:bg-red-500 dark:text-dark dark:hover:bg-red-500/80 transition-all duration-300"
                >
                  Visit Official Profile
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Custom Terminal icon SVG (since we don't import all icons)
function Terminal({ className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}
