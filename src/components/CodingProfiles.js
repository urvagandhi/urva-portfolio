import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LeetCodeIcon, CodeforcesIcon, CodeChefIcon, LinkArrow } from "./Icons";
import { BorderBeam } from "./magicui/border-beam";

const ProfileCard = ({ platform, icon: Icon, rating, subText, badge, badgeColor, link, colorFrom, colorTo }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="relative flex flex-col justify-between rounded-2xl border border-solid border-dark/20 bg-light p-6 shadow-md dark:border-light/10 dark:bg-[#0d1117] overflow-hidden group min-h-[200px]"
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
        <Link
          href={link}
          target="_blank"
          className="flex items-center gap-1 text-sm font-bold text-primary dark:text-primaryDark group-hover:underline"
        >
          View Profile
          <LinkArrow className="w-4 ml-1" />
        </Link>
      </div>
    </motion.div>
  );
};

export default function CodingProfiles() {
  const profiles = [
    {
      platform: "LeetCode",
      icon: LeetCodeIcon,
      rating: "1607",
      subText: "Solved 270+ DSA problems in Java",
      badge: "Top 22.84%",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      link: "https://leetcode.com/u/urva_gandhi",
      colorFrom: "#f59e0b",
      colorTo: "#d97706",
    },
    {
      platform: "Codeforces",
      icon: CodeforcesIcon,
      rating: "1307",
      subText: "Max Rating: 1307 (Pupil)",
      badge: "Pupil",
      badgeColor: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      link: "https://codeforces.com/profile/Urva_Gandhi",
      colorFrom: "#22c55e",
      colorTo: "#16a34a",
    },
    {
      platform: "CodeChef",
      icon: CodeChefIcon,
      rating: "1264",
      subText: "1 Rated Star",
      badge: "1 Rated",
      badgeColor: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      link: "https://codechef.com/users/urva_gandhi",
      colorFrom: "#ef4444",
      colorTo: "#dc2626",
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
    </div>
  );
}
