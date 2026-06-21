import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BorderBeam } from "../magicui/border-beam";
import { useModalControls } from "@/components/hooks/useModalControls";
import { 
  X, Award, Star, Trophy, GraduationCap, MapPin, ExternalLink,
  LayoutDashboard, Code2, Target, Calendar, CheckCircle2, User, Globe
} from "lucide-react";

export const HackerRankModal = ({ show, onClose, data }) => {
  const { canPortal } = useModalControls(show, onClose);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (show) {
      setActiveTab("overview");
    }
  }, [show]);

  if (!canPortal) return null;

  const hrData = data || {};
  const hrLoading = !data;

  const profile = hrData.profile || {};
  const name = profile.name || "Urva Gandhi";
  const username = profile.username || "urvagandhi24";
  const avatar = profile.avatar || "https://d1ce3iv5vajdy.cloudfront.net/hackerrank/assets/gravatar.jpg";
  const location = profile.location || "Ahmedabad";
  const country = profile.country || "India";
  const headline = profile.headline || "Java Full-Stack & AI/ML Engineer";
  const level = profile.level || 5;

  const badges = hrData.badges || [];
  // Skills are already pre-filtered by the API (zero-score entries removed)
  const skills = hrData.skills || [];

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          key="hackerrank-overlay"
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
              <BorderBeam size={150} duration={8} delay={4} colorFrom="#2ec866" colorTo="#00e676" />
              <div className="flex items-center gap-4 sm:flex-col sm:items-start">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-solid border-green-500/50 shadow-md flex items-center justify-center bg-green-500/10">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-green-500" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="text-3xl font-extrabold tracking-tight">
                      {name}
                    </h4>
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-solid border-green-500/20">
                      <Award className="w-3.5 h-3.5" /> HackerRank
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-dark/60 dark:text-light/60 mt-1 max-w-[90%]">
                    {headline}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-sm text-dark/70 dark:text-light/70 flex-wrap">
                    <span className="font-semibold text-green-600 dark:text-green-400">@{username}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-green-500" /> {location && `${location}, `}{country}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar border-b border-solid border-dark/5 dark:border-light/5">
                {[
                  { id: "overview", label: "Overview", icon: LayoutDashboard },
                  { id: "badges", label: "Badges & Skills", icon: Award },
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
              {hrLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-solid border-green-500/20 border-t-green-500 rounded-full animate-spin" />
                  <span className="text-sm font-bold text-dark/50 dark:text-light/50">Fetching HackerRank Analytics...</span>
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
                      <div className="grid grid-cols-3 gap-4 sm:grid-cols-1">
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                          <Trophy className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-2xl font-extrabold">Level {level}</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Platform Level</span>
                        </div>
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                          <Award className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-2xl font-extrabold">{badges.length}</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Badges Earned</span>
                        </div>
                        <div className="border border-solid border-dark/10 dark:border-light/10 p-5 rounded-2xl bg-light dark:bg-dark flex flex-col items-center justify-center text-center group hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
                          <Code2 className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-2xl font-extrabold">{skills.length}</span>
                          <span className="text-xs font-bold text-dark/50 dark:text-light/50 uppercase tracking-wider mt-1">Practice Tracks</span>
                        </div>
                      </div>

                      {/* Info and platform highlights */}
                      <div className="border border-solid border-dark/10 dark:border-light/10 p-6 rounded-2xl bg-light dark:bg-dark space-y-4">
                        <h5 className="text-md font-bold border-b border-solid border-dark/10 dark:border-light/10 pb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500" /> HackerRank Performance Highlights
                        </h5>
                        <p className="text-sm leading-relaxed text-dark/80 dark:text-light/80">
                          Solving technical challenges across several developer domains. Demonstrates strong coding competency in core programming environments and algorithms.
                        </p>
                        {skills.length > 0 && (
                          <div className="pt-2">
                            <div className="text-xs text-dark/50 dark:text-light/50 font-bold uppercase mb-2">Active Skills Overview</div>
                            <div className="flex flex-wrap gap-2">
                              {skills.map((skill, i) => (
                                <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-dark/5 dark:bg-light/5 border border-solid border-dark/10 dark:border-light/10">
                                  {skill.name}: {skill.score} pts
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Badges Tab */}
                  {activeTab === "badges" && (
                    <motion.div
                      key="badges"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Badges list */}
                      <div className="border border-solid border-dark/10 dark:border-light/10 p-6 rounded-2xl bg-light dark:bg-dark">
                        <h5 className="text-md font-bold mb-4 border-b border-solid border-dark/10 dark:border-light/10 pb-2">Earned Badges</h5>
                        {badges.length === 0 ? (
                          <span className="text-sm text-dark/50 dark:text-light/50">No badges found.</span>
                        ) : (
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                            {badges.map((badge, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-dark/5 dark:bg-light/5 border border-solid border-dark/10 dark:border-light/10">
                                <Award className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <div>
                                  <div className="text-sm font-bold">{badge.name}</div>
                                  <div className="flex items-center gap-1 mt-1">
                                    {badge.stars > 0 ? (
                                      Array.from({ length: badge.stars }).map((_, s) => (
                                        <Star key={s} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                                      ))
                                    ) : (
                                      <span className="text-xs font-semibold text-dark/50 dark:text-light/50">Completed (0 Stars)</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Skills/ELO Leaderboard Scores list */}
                      <div className="border border-solid border-dark/10 dark:border-light/10 p-6 rounded-2xl bg-light dark:bg-dark">
                        <h5 className="text-md font-bold mb-4 border-b border-solid border-dark/10 dark:border-light/10 pb-2">Domain Practice & Leaderboard Rankings</h5>
                        {skills.length === 0 ? (
                          <span className="text-sm text-dark/50 dark:text-light/50">No active domain rankings found.</span>
                        ) : (
                          <div className="space-y-4">
                            {skills.map((skill, i) => (
                              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-dark/5 dark:bg-light/5 border border-solid border-dark/10 dark:border-light/10 flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <Code2 className="w-5 h-5 text-green-500" />
                                  <span className="font-bold text-sm">{skill.name}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-semibold text-dark/70 dark:text-light/70">
                                  <span>Score: <strong className="text-green-500">{skill.score}</strong></span>
                                  {skill.rank && (
                                    <span>Rank: <strong className="text-green-500">#{skill.rank.toLocaleString()}</strong></span>
                                  )}
                                </div>
                              </div>
                            ))}
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
                Data fetched dynamically via HackerRank REST API.
              </span>
              <a
                href={`https://www.hackerrank.com/profile/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 transition-colors"
              >
                View HackerRank Profile <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
