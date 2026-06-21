import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    if (show) {
      setActiveTab("overview");
    }
  }, [show]);

  if (!canPortal) return null;

  const gfgData = data || {};
  const gfgLoading = !data;
  
  const userInfo = gfgData.info || {};
  
  const score = userInfo.score || 0;
  const monthlyScore = userInfo.monthly_score || 0;
  const totalSolved = userInfo.total_problems_solved || 0;
  const rank = userInfo.institute_rank || "N/A";
  const institute = userInfo.institute_name || "Nirma University (NU) Ahmedabad";
  const currentStreak = userInfo.pod_solved_current_streak || 0;
  const longestStreak = userInfo.pod_solved_longest_streak || 0;
  const globalLongestStreak = userInfo.pod_solved_global_longest_streak || 0;
  const podSubmissions = userInfo.pod_correct_submissions_count || 0;

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
            className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl border border-solid border-dark/10 bg-light shadow-2xl dark:border-green-500/30 dark:bg-dark flex flex-col cursor-default"
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
              <BorderBeam size={150} duration={8} delay={4} colorFrom="#15803d" colorTo="#22c55e" />
              <div className="flex items-center gap-4 sm:flex-col sm:items-start">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-solid border-green-500/50 shadow-md flex items-center justify-center bg-green-500/10">
                  {userInfo.profile_image_url ? (
                    <img
                      src={userInfo.profile_image_url}
                      alt={userInfo.name || "GeeksforGeeks"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-green-500" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="text-3xl font-extrabold tracking-tight">
                      {userInfo.name || "Urva Gandhi"}
                    </h4>
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-solid border-green-500/20">
                      <Award className="w-3.5 h-3.5" /> GeeksforGeeks
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-dark/70 dark:text-light/70 flex-wrap">
                    <span className="font-semibold text-green-600 dark:text-green-400">@{gfgData.username || "urva_gandhi"}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-green-500" /> India
                    </span>
                    {institute && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4 text-green-500" /> {institute}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar border-b border-solid border-dark/5 dark:border-light/5">
                {[
                  { id: "overview", label: "Overview Stats", icon: LayoutDashboard },
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

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-8 max-h-[50vh] min-h-[40vh] no-scrollbar bg-light dark:bg-[#0d1117]/95">
              {gfgLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-solid border-green-500/20 border-t-green-500 rounded-full animate-spin" />
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
                          <span className="text-2xl font-extrabold">#{rank}</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Institute Rank</span>
                        </div>
                      </div>

                      {/* Info and platform highlights */}
                      <div className="border border-solid border-dark/10 dark:border-light/10 p-6 rounded-2xl bg-light dark:bg-dark space-y-4">
                        <h5 className="text-md font-bold border-b border-solid border-dark/10 dark:border-light/10 pb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500" /> GeeksforGeeks Highlights
                        </h5>
                        <p className="text-sm leading-relaxed text-dark/80 dark:text-light/80">
                          Actively practicing on GeeksforGeeks, solving algorithmic challenges to strengthen core data structures & algorithms knowledge. The platform serves as a vital resource for interview preparation and problem-solving skill development.
                        </p>
                        <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-1">
                          <div className="flex items-center gap-3">
                            <GraduationCap className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-dark/50 dark:text-light/50 font-bold uppercase">Affiliated Institute</div>
                              <div className="text-sm font-semibold">{institute}</div>
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

            {/* Footer containing Link */}
            <div className="p-6 border-t border-solid border-dark/10 dark:border-light/10 bg-dark/5 dark:bg-light/5 flex items-center justify-between">
              <span className="text-xs text-dark/50 dark:text-light/50 font-semibold">
                Data scraped dynamically from GeeksforGeeks User Profile.
              </span>
              <a
                href={`https://www.geeksforgeeks.org/user/${gfgData.username || "urva_gandhi"}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 transition-colors"
              >
                View GFG Profile <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
