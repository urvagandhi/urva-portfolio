import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LinkArrow } from "../Icons";
import { BorderBeam } from "../magicui/border-beam";
import { Info } from "lucide-react";

export const ProfileCard = ({ platform, icon: Icon, rating, highestRating, ratingLabel, subText, badge, badgeColor, link, colorFrom, colorTo, onClick }) => {
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
          <div className="flex items-baseline gap-2 flex-wrap">
            <div className="text-3xl font-extrabold text-dark dark:text-light flex items-baseline gap-1">
              {rating}
              <span className="text-sm font-medium text-dark/60 dark:text-light/60">{ratingLabel || "rating"}</span>
            </div>
            {highestRating && (
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md border border-solid shadow-sm ${
                platform === "LeetCode" 
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" 
                  : platform === "Codeforces"
                    ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                    : platform === "CodeChef"
                      ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                      : platform === "GeeksforGeeks"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
              }`}>
                Highest: {highestRating}
              </span>
            )}
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

export default ProfileCard;
