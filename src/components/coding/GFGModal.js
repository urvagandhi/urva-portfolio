import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BorderBeam } from "../magicui/border-beam";
import { useModalControls } from "@/components/hooks/useModalControls";
import { 
  X, Award, Flame, Zap, GraduationCap, MapPin, ExternalLink,
  LayoutDashboard, Code2, Target, Calendar, CheckCircle2, User
} from "lucide-react";

export const GFGModal = ({ show, onClose, data }) => {
  const { canPortal } = useModalControls(show, onClose);
  const [activeTab, setActiveTab] = useState("overview");
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
  }, [show, activeTab, data]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setShowScrollArrow(scrollHeight - scrollTop - clientHeight > 30);
  };

  if (!canPortal) return null;

  const gfgData = data || {};
  const gfgLoading = !data;
  
  const userInfo = gfgData.info || {};
  const mentor = gfgData.mentor || {};
  
  const score = userInfo.score || 0;
  const monthlyScore = userInfo.monthly_score || 0;
  const totalSolved = userInfo.total_problems_solved || 0;
  const rankVal = userInfo.institute_rank || "547";
  const rank = `#${rankVal}`;
  const institute = userInfo.institute_name || "Nirma University (NU) Ahmedabad";
  const currentStreak = userInfo.pod_solved_current_streak || 0;
  const longestStreak = userInfo.pod_solved_longest_streak || 0;
  const globalLongestStreak = userInfo.pod_solved_global_longest_streak || 0;
  const podSubmissions = userInfo.pod_correct_submissions_count || 0;

  const schoolSolved = userInfo.School || 0;
  const basicSolved = userInfo.Basic || 0;
  const easySolved = userInfo.Easy || 0;
  const mediumSolved = userInfo.Medium || 0;
  const hardSolved = userInfo.Hard || 0;

  const totalCalculated = schoolSolved + basicSolved + easySolved + mediumSolved + hardSolved;
  const totalDisplay = totalCalculated > 0 ? totalCalculated : totalSolved;

  const schoolPercent = totalDisplay > 0 ? Math.round((schoolSolved / totalDisplay) * 100) : 0;
  const basicPercent = totalDisplay > 0 ? Math.round((basicSolved / totalDisplay) * 100) : 0;
  const easyPercent = totalDisplay > 0 ? Math.round((easySolved / totalDisplay) * 100) : 0;
  const mediumPercent = totalDisplay > 0 ? Math.round((mediumSolved / totalDisplay) * 100) : 0;
  const hardPercent = totalDisplay > 0 ? Math.round((hardSolved / totalDisplay) * 100) : 0;

  const bio = mentor.bio || "Actively practicing on GeeksforGeeks, solving algorithmic challenges to strengthen core data structures & algorithms knowledge. The platform serves as a vital resource for interview preparation and problem-solving skill development.";
  const headline = mentor.headline || "Software Engineer";
  const followers = mentor.follower_count || 0;
  const following = mentor.following_count || 0;
  const articlesCount = gfgData.articleCount?.total_articles_published || 0;
  const qualification = mentor.qualification?.[0] || {};
  const gradYear = qualification.graduationYear;
  const displayInstitute = gradYear ? `${institute} (Class of ${gradYear})` : institute;

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          key="gfg-overlay"
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
            className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl border border-solid border-dark/10 bg-light shadow-2xl dark:border-emerald-500/30 dark:bg-dark flex flex-col cursor-default"
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
              <BorderBeam size={150} duration={8} delay={4} colorFrom="#10b981" colorTo="#059669" />
              <div className="flex items-center gap-4 sm:flex-col sm:items-start">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-solid border-emerald-500/50 shadow-md flex items-center justify-center bg-emerald-500/10">
                  {userInfo.profile_image_url ? (
                    <img
                      src={userInfo.profile_image_url}
                      alt={userInfo.name || "GeeksforGeeks"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-emerald-500" />
                  )}
                </div>

                 <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="text-3xl font-extrabold tracking-tight">
                      {userInfo.name || "Urva Gandhi"}
                    </h4>
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-solid border-emerald-500/20">
                      <Award className="w-3.5 h-3.5" /> GeeksforGeeks
                    </span>
                  </div>
                  {headline && (
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {headline}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-sm text-dark/70 dark:text-light/70 flex-wrap">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">@{gfgData.username || "urva_gandhi"}</span>
                    {(followers > 0 || following > 0 || articlesCount > 0) && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-dark/20 dark:bg-light/20" />
                        <span><strong>{followers}</strong> followers</span>
                        <span className="h-1 w-1 rounded-full bg-dark/20 dark:bg-light/20" />
                        <span><strong>{following}</strong> following</span>
                        {articlesCount > 0 && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-dark/20 dark:bg-light/20" />
                            <span><strong>{articlesCount}</strong> articles</span>
                          </>
                        )}
                      </>
                    )}
                    <span className="h-1 w-1 rounded-full bg-dark/20 dark:bg-light/20" />
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-emerald-500" /> India
                    </span>
                    {institute && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-dark/20 dark:bg-light/20" />
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4 text-emerald-500" /> {institute}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar border-b border-solid border-dark/5 dark:border-light/5">
                {[
                  { id: "overview", label: "Overview Stats", icon: LayoutDashboard },
                  { id: "solved", label: "Solved Problems", icon: Code2 },
                  { id: "streaks", label: "POD Activity & Streaks", icon: Flame },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-colors duration-200 whitespace-nowrap ${
                        isActive
                           ? "text-emerald-600 dark:text-emerald-400"
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
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 origin-center"
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
              {gfgLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-solid border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  <span className="text-sm font-bold text-dark/50 dark:text-light/50">Fetching GeeksforGeeks Analytics...</span>
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
                      {/* Top Stats Counters Row */}
                      <div className="grid grid-cols-4 gap-4 sm:grid-cols-2">
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                          <Zap className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-2xl font-extrabold">{score}</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Overall Score</span>
                        </div>
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                          <Calendar className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-2xl font-extrabold">{monthlyScore}</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Monthly Score</span>
                        </div>
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                          <Code2 className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-2xl font-extrabold">{totalSolved}</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Solved Problems</span>
                        </div>
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                          <Target className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-2xl font-extrabold">{rank}</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Institute Rank</span>
                        </div>
                      </div>

                      {/* Info and platform highlights */}
                      <div className="border border-solid border-dark/10 dark:border-light/10 p-6 rounded-2xl bg-light dark:bg-dark space-y-4">
                        <h5 className="text-md font-bold border-b border-solid border-dark/10 dark:border-light/10 pb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500" /> GeeksforGeeks Highlights
                        </h5>
                        <p className="text-sm leading-relaxed text-dark/80 dark:text-light/80">
                          {bio}
                        </p>
                        <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-1">
                          <div className="flex items-center gap-3">
                            <GraduationCap className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-dark/50 dark:text-light/50 font-bold uppercase">Affiliated Institute</div>
                              <div className="text-sm font-semibold">{displayInstitute}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-dark/50 dark:text-light/50 font-bold uppercase">Campus Ambassador status</div>
                              <div className="text-sm font-semibold">{userInfo.is_campus_ambassador ? "Yes, Campus Ambassador" : "Regular Member"}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Submission Activity Heatmap */}
                      <div className="border border-solid border-dark/10 dark:border-light/10 p-6 rounded-2xl bg-light dark:bg-dark">
                        <h5 className="text-md font-bold mb-4 border-b border-solid border-dark/10 dark:border-light/10 pb-2 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-emerald-500" /> Submission Activity Calendar
                        </h5>
                        <div className="overflow-x-auto pb-2 no-scrollbar">
                          {(() => {
                            // Generate last 6 months matrix (7 rows for days of week)
                            const now = new Date();
                            const startDate = new Date();
                            startDate.setMonth(startDate.getMonth() - 5);
                            startDate.setDate(startDate.getDate() - startDate.getDay()); // align to Sunday

                            const getSeedRandom = (seedStr) => {
                              let h = 1779033703 ^ seedStr.length;
                              for (let i = 0; i < seedStr.length; i++) {
                                h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
                                h = h << 13 | h >>> 19;
                              }
                              return () => {
                                h = Math.imul(h ^ (h >>> 16), 2246822507);
                                h = Math.imul(h ^ (h >>> 13), 3266489909);
                                return ((h ^= h >>> 16) >>> 0) / 4294967296;
                              };
                            };

                            const generateGFGContributions = (totalSolved, currentStreak, longestStreak, username) => {
                              const numDays = 180;
                              const contributions = Array(numDays).fill(0);

                              // 1. Satisfy current streak: index 0 to currentStreak-1 must be active
                              for (let i = 0; i < Math.min(currentStreak, numDays); i++) {
                                contributions[i] = 1;
                              }

                              // 2. Satisfy longest streak
                              const rng = getSeedRandom(username || "urva_gandhi");
                              const longestStart = 20 + Math.floor(rng() * 60);
                              for (let i = longestStart; i < Math.min(longestStart + longestStreak, numDays); i++) {
                                contributions[i] = Math.max(contributions[i], 1);
                              }

                              // Calculate remaining to distribute
                              const currentSum = contributions.reduce((a, b) => a + b, 0);
                              let solvedLeft = Math.max(0, totalSolved - currentSum);

                              // 3. Generate stable deterministic weights (stable relative to today)
                              const dayWeights = [];
                              for (let i = 0; i < numDays; i++) {
                                const dayRng = getSeedRandom(`${username || "urva_gandhi"}_day_${i}`);
                                const decay = Math.exp(-i / 80.0);
                                let weight = dayRng() * decay;
                                if (contributions[i] > 0) {
                                  weight += 0.5; // Grouping boost
                                }
                                dayWeights.push({ weight, index: i });
                              }

                              // Sort by weight descending
                              dayWeights.sort((a, b) => b.weight - a.weight);

                              // Distribute remaining solved problems
                              let idx = 0;
                              while (solvedLeft > 0) {
                                const dayIdx = dayWeights[idx % numDays].index;
                                if (contributions[dayIdx] < 3) {
                                  contributions[dayIdx] += 1;
                                  solvedLeft -= 1;
                                }
                                idx += 1;
                              }

                              return contributions;
                            };

                            const gfgContributions = generateGFGContributions(totalSolved, currentStreak, longestStreak, gfgData.username);
                            const dayMs = 24 * 60 * 60 * 1000;
                            const cols = [];
                            let currentWeek = [];

                            for (let d = startDate.getTime(); d <= now.getTime(); d += dayMs) {
                              const dateObj = new Date(d);
                              const diffDays = Math.floor((now.getTime() - d) / dayMs);
                              const submissionsOnDay = (diffDays >= 0 && diffDays < 180) ? gfgContributions[diffDays] : 0;

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
                                      
                                      // Green colors for GFG
                                      let bgClass = "bg-dark/10 dark:bg-light/10";
                                      if (day.count > 0 && day.count <= 1) bgClass = "bg-emerald-500/45 dark:bg-emerald-400/40";
                                      else if (day.count > 1 && day.count <= 2) bgClass = "bg-emerald-500/75 dark:bg-emerald-400/70";
                                      else if (day.count > 2) bgClass = "bg-emerald-500 dark:bg-emerald-400";

                                      return (
                                        <div
                                          key={dIdx}
                                          className={`w-3.5 h-3.5 rounded-sm transition-all duration-200 ${bgClass}`}
                                          title={`${day.count} solved on ${day.date}`}
                                        />
                                      );
                                    })}
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                        <div className="mt-2 text-right text-[10px] text-dark/40 dark:text-light/40 font-bold">
                          * Activity map generated dynamically from total solved counts
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Solved Problems Tab */}
                  {activeTab === "solved" && (
                    <motion.div
                      key="solved"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div className="border border-solid border-dark/10 dark:border-light/10 rounded-2xl p-6 bg-light dark:bg-dark">
                        <h5 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-solid border-dark/10 dark:border-light/10 pb-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Solved by Difficulty
                        </h5>

                        <div className="space-y-5">
                          {/* School */}
                          {schoolSolved > 0 && (
                            <div>
                              <div className="flex justify-between text-sm font-bold mb-1">
                                <span className="text-purple-500">School</span>
                                <span className="text-dark dark:text-light">
                                  {schoolSolved} <span className="text-xs text-dark/50 dark:text-light/50">({schoolPercent}% of total solved)</span>
                                </span>
                              </div>
                              <div className="w-full h-3.5 bg-dark/5 dark:bg-light/10 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${schoolPercent}%` }}
                                  className="h-full bg-purple-500 rounded-full"
                                />
                              </div>
                            </div>
                          )}

                          {/* Basic */}
                          {basicSolved > 0 && (
                            <div>
                              <div className="flex justify-between text-sm font-bold mb-1">
                                <span className="text-blue-500">Basic</span>
                                <span className="text-dark dark:text-light">
                                  {basicSolved} <span className="text-xs text-dark/50 dark:text-light/50">({basicPercent}% of total solved)</span>
                                </span>
                              </div>
                              <div className="w-full h-3.5 bg-dark/5 dark:bg-light/10 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${basicPercent}%` }}
                                  className="h-full bg-blue-500 rounded-full"
                                />
                              </div>
                            </div>
                          )}

                          {/* Easy */}
                          <div>
                            <div className="flex justify-between text-sm font-bold mb-1">
                              <span className="text-emerald-500">Easy</span>
                              <span className="text-dark dark:text-light">
                                {easySolved} <span className="text-xs text-dark/50 dark:text-light/50">({easyPercent}% of total solved)</span>
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
                                {mediumSolved} <span className="text-xs text-dark/50 dark:text-light/50">({mediumPercent}% of total solved)</span>
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
                                {hardSolved} <span className="text-xs text-dark/50 dark:text-light/50">({hardPercent}% of total solved)</span>
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
                          <span className="text-dark/60 dark:text-light/60">Total Solved Problems</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{totalSolved}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Streaks Tab */}
                  {activeTab === "streaks" && (
                    <motion.div
                      key="streaks"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-3 gap-4 sm:grid-cols-1">
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark text-center">
                          <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                          <span className="text-2xl font-extrabold">{currentStreak} days</span>
                          <span className="block text-xs font-bold text-dark/50 dark:text-light/50 uppercase mt-1">Current POD Streak</span>
                        </div>
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark text-center">
                          <Award className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                          <span className="text-2xl font-extrabold">{longestStreak} days</span>
                          <span className="block text-xs font-bold text-dark/50 dark:text-light/50 uppercase mt-1">Longest POD Streak</span>
                        </div>
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark text-center">
                          <CheckCircle2 className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                          <span className="text-2xl font-extrabold">{podSubmissions}</span>
                          <span className="block text-xs font-bold text-dark/50 dark:text-light/50 uppercase mt-1">Correct POD Solves</span>
                        </div>
                      </div>

                      <div className="border border-solid border-dark/10 dark:border-light/10 p-6 rounded-2xl bg-light dark:bg-dark">
                        <h5 className="text-md font-bold mb-3 border-b border-solid border-dark/10 dark:border-light/10 pb-2">What is Problem of the Day (POD)?</h5>
                        <p className="text-sm leading-relaxed text-dark/70 dark:text-light/70">
                          GeeksforGeeks Problem of the Day (POD) is a daily coding challenge aimed at improving consistency. Every day, a selected problem from basic, easy, medium, or hard difficulty is featured. Achieving consistent streaks demonstrates persistent dedication to coding discipline.
                        </p>
                        {globalLongestStreak > 0 && (
                          <div className="mt-4 p-3 rounded-xl bg-orange-500/5 border border-solid border-orange-500/10 text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2">
                            <Flame className="w-4 h-4 flex-shrink-0" />
                            <span>Global platform longest streak reference value: {globalLongestStreak} days!</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
              </div>

              <AnimatePresence>
                {showScrollArrow && !gfgLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-4 left-0 right-0 z-20 pointer-events-none flex flex-col items-center justify-center text-emerald-500 animate-bounce"
                  >
                    <span className="text-[10px] font-extrabold tracking-wider bg-light/95 dark:bg-dark/95 px-2.5 py-1 rounded-full border border-solid border-emerald-500/30 shadow-md backdrop-blur-sm">
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
                Data scraped dynamically from GeeksforGeeks User Profile.
              </span>
              <a
                href={`https://www.geeksforgeeks.org/user/${gfgData.username || "urva_gandhi"}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-center text-sm font-bold text-white dark:text-black dark:bg-emerald-400 dark:hover:bg-emerald-300 transition-all duration-300 px-6 py-2.5"
              >
                Visit Official Profile
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
