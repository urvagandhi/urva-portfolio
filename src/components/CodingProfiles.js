import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { LeetCodeIcon, CodeforcesIcon, CodeChefIcon, GeeksforGeeksIcon, HackerRankIcon } from "./Icons";
import { ProfileCard } from "./coding/ProfileCard";

const LeetCodeModal = dynamic(() => import("./coding/LeetCodeModal").then(mod => mod.LeetCodeModal), { ssr: false });
const CodeforcesModal = dynamic(() => import("./coding/CodeforcesModal").then(mod => mod.CodeforcesModal), { ssr: false });
const CodeChefModal = dynamic(() => import("./coding/CodeChefModal").then(mod => mod.CodeChefModal), { ssr: false });
const GFGModal = dynamic(() => import("./coding/GFGModal").then(mod => mod.GFGModal), { ssr: false });
const HackerRankModal = dynamic(() => import("./coding/HackerRankModal").then(mod => mod.HackerRankModal), { ssr: false });

export default function CodingProfiles() {
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [cfData, setCfData] = useState(null);
  const [showCfModal, setShowCfModal] = useState(false);

  const [ccData, setCcData] = useState(null);
  const [showCcModal, setShowCcModal] = useState(false);

  const [gfgData, setGfgData] = useState(null);
  const [showGfgModal, setShowGfgModal] = useState(false);

  const [hrData, setHrData] = useState(null);
  const [showHrModal, setShowHrModal] = useState(false);

  useEffect(() => {
    fetch("/api/leetcode?username=urva_gandhi")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setLeetcodeData(data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch LeetCode dynamic statistics", err);
      });

    fetch("/api/codeforces?username=Urva_Gandhi")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setCfData(data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch Codeforces statistics", err);
      });

    fetch("/api/codechef?username=urva_gandhi")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setCcData(data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch CodeChef statistics", err);
      });

    fetch("/api/gfg?username=urva_gandhi")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setGfgData(data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch GeeksforGeeks statistics", err);
      });

    fetch("/api/hackerrank?username=urvagandhi24")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setHrData(data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch HackerRank statistics", err);
      });
  }, []);

  // LeetCode Card dynamic helper values (with fallbacks)
  const leetcodeRating = leetcodeData?.contestRanking?.rating 
    ? Math.round(leetcodeData.contestRanking.rating).toString() 
    : "1604";
  
  const leetcodeHighestRating = leetcodeData?.contestHistory && leetcodeData.contestHistory.length > 0
    ? Math.round(Math.max(...leetcodeData.contestHistory.map(h => h.rating))).toString()
    : "1616";
  
  const leetcodeBadge = leetcodeData?.contestRanking?.topPercentage 
    ? `Top ${leetcodeData.contestRanking.topPercentage}%` 
    : "Top 23.25%";

  const topLanguage = leetcodeData?.languages?.length > 0
    ? [...leetcodeData.languages].sort((a, b) => b.problemsSolved - a.problemsSolved)[0]?.languageName
    : "Java";

  const totalSolvedCount = leetcodeData?.submitStats?.acSubmissionNum?.find(q => q.difficulty === "All")?.count
    || leetcodeData?.submitStats?.acSubmissionNum?.[0]?.count 
    || 298;

  const leetcodeSolved = `Solved ${totalSolvedCount} DSA problems in ${topLanguage}`;

  // Codeforces Card dynamic helper values (with fallbacks)
  const cfRating = cfData?.info?.rating 
    ? cfData.info.rating.toString() 
    : "1394";

  const cfHighestRating = cfData?.info?.maxRating
    ? cfData.info.maxRating.toString()
    : "1394";

  const cfRank = cfData?.info?.rank 
    ? cfData.info.rank.charAt(0).toUpperCase() + cfData.info.rank.slice(1) 
    : "Pupil";

  const cfSolvedCount = cfData?.derivedMetrics?.totalSolved || 73;
  const cfPrimaryLang = cfData?.derivedMetrics?.primaryLanguage || "Java 21";
  const cfSolvedText = `Solved ${cfSolvedCount} problems in ${cfPrimaryLang}`;

  // CodeChef Card dynamic helper values (with fallbacks)
  const ccRating = ccData?.info?.rating 
    ? ccData.info.rating.toString() 
    : "1240";

  const ccHighestRating = ccData?.info?.highestRating
    ? ccData.info.highestRating.toString()
    : "1270";

  const ccStars = ccData?.info?.stars 
    ? ccData.info.stars 
    : "1★";

  const ccRank = ccData?.info?.stars 
    ? `${ccData.info.stars} Rated` 
    : "1★ Rated";

  const ccSolvedCount = ccData?.problemsSolved || 27;
  const ccPrimaryLang = ccData?.languages?.[0]?.languageName || "JAVA";
  const ccSolvedText = `Solved ${ccSolvedCount} problems in ${ccPrimaryLang}`;

  // GeeksforGeeks Card dynamic helper values (with fallbacks)
  const gfgScore = gfgData?.info?.score 
    ? gfgData.info.score.toString() 
    : "198";

  const gfgSolvedCount = gfgData?.info?.total_problems_solved || 55;
  const gfgRank = gfgData?.info?.institute_rank 
    ? `Rank #${gfgData.info.institute_rank}` 
    : "Rank #547";

  const gfgSolvedText = `Solved ${gfgSolvedCount} coding problems`;

  // HackerRank Card dynamic helper values (with fallbacks)
  const hrLevel = hrData?.profile?.level 
    ? hrData.profile.level.toString() 
    : "5";

  const hrBadgesCount = hrData?.badges?.length || 2;
  const hrTracksCount = hrData?.skills?.length || 2;
  const hrSolvedText = `Earned ${hrBadgesCount} badges in ${hrTracksCount} skills`;

  const profiles = [
    {
      platform: "LeetCode",
      icon: LeetCodeIcon,
      rating: leetcodeRating,
      highestRating: leetcodeHighestRating,
      subText: leetcodeSolved,
      badge: leetcodeBadge,
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      link: "https://leetcode.com/u/urva_gandhi",
      colorFrom: "#f59e0b",
      colorTo: "#d97706",
      onClick: () => setShowModal(true),
      potd: leetcodeData?.potd
    },
    {
      platform: "Codeforces",
      icon: CodeforcesIcon,
      rating: cfRating,
      highestRating: cfHighestRating,
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
      highestRating: ccHighestRating,
      subText: ccSolvedText,
      badge: ccRank,
      badgeColor: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      link: "https://codechef.com/users/urva_gandhi",
      colorFrom: "#ef4444",
      colorTo: "#dc2626",
      onClick: () => setShowCcModal(true)
    },
    {
      platform: "GeeksforGeeks",
      icon: GeeksforGeeksIcon,
      rating: gfgScore,
      ratingLabel: "score",
      subText: gfgSolvedText,
      badge: gfgRank,
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      link: "https://www.geeksforgeeks.org/user/urva_gandhi/",
      colorFrom: "#10b981",
      colorTo: "#059669",
      onClick: () => setShowGfgModal(true),
      potd: gfgData?.potd
    },
    {
      platform: "HackerRank",
      icon: HackerRankIcon,
      rating: hrLevel,
      ratingLabel: "level",
      subText: hrSolvedText,
      badge: "HackerRank",
      badgeColor: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      link: "https://www.hackerrank.com/profile/urvagandhi24",
      colorFrom: "#2ec866",
      colorTo: "#00e676",
      onClick: () => setShowHrModal(true)
    },
  ];

  return (
    <div className="w-full mt-16">
      <h3 className="text-2xl font-bold dark:text-light mb-6">Coding Profiles & Stats</h3>
      <div className="grid grid-cols-3 gap-6 lg:grid-cols-2 md:grid-cols-1">
        {profiles.map((profile, index) => (
          <ProfileCard key={index} {...profile} />
        ))}
      </div>

      <LeetCodeModal 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        data={leetcodeData} 
      />

      <CodeforcesModal 
        show={showCfModal} 
        onClose={() => setShowCfModal(false)} 
        data={cfData} 
      />

      <CodeChefModal 
        show={showCcModal} 
        onClose={() => setShowCcModal(false)} 
        data={ccData} 
      />

      <GFGModal 
        show={showGfgModal} 
        onClose={() => setShowGfgModal(false)} 
        data={gfgData} 
      />

      <HackerRankModal 
        show={showHrModal} 
        onClose={() => setShowHrModal(false)} 
        data={hrData} 
      />
    </div>
  );
}
