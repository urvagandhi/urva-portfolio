import { motion } from "framer-motion";
import Link from "next/link";

const MotionLink = motion.create(Link);

const Logo = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <MotionLink
        href="/"
        aria-label="Urva Gandhi - Home"
        className="relative flex items-center justify-center rounded-full w-16 h-16 overflow-hidden group"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.92 }}
      >
        {/* Rotating conic gradient ring (orbiting light) */}
        <span
          className="absolute inset-0 rounded-full animate-spin-slow"
          style={{
            background:
              "conic-gradient(from 0deg, #58E6D9, #8B5CF6, #3B82F6, #58E6D9, #8B5CF6, #58E6D9)",
          }}
        />

        {/* Inner disc */}
        <span className="absolute inset-[3px] rounded-full bg-light dark:bg-dark flex items-center justify-center shadow-[inset_0_0_12px_rgba(88,230,217,0.35)] dark:shadow-[inset_0_0_12px_rgba(0,0,0,0.7)]">
          {/* "UG" monogram with gradient */}
          <span className="relative font-extrabold text-2xl tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-br from-primaryDark via-cyan-400 to-purple-500 dark:from-primaryDark dark:to-purple-500">
            UG
          </span>
        </span>

        {/* Soft glow on hover */}
        <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_25px_rgba(88,230,217,0.7)] dark:shadow-[0_0_25px_rgba(88,230,217,0.55)]" />

        {/* Shooting-star / meteor streaks */}
        <span
          className="animate-logo-meteor absolute left-1/2 top-0 -translate-x-1/2"
          style={{ "--angle": "150deg", animationDelay: "0s" }}
        >
          <span className="block w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-primaryDark ring-2 ring-white/80 dark:ring-transparent shadow-[0_0_8px_rgba(8,145,178,0.9)] dark:shadow-[0_0_8px_rgba(88,230,217,0.9)]" />
          <span className="absolute top-1/2 -translate-y-1/2 left-2 h-px w-6 bg-gradient-to-r from-cyan-600 to-transparent dark:from-primaryDark dark:to-transparent" />
        </span>
        <span
          className="animate-logo-meteor absolute right-0 top-1/3"
          style={{ "--angle": "210deg", animationDelay: "1.1s" }}
        >
          <span className="block w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400 ring-2 ring-white/80 dark:ring-transparent shadow-[0_0_8px_rgba(109,40,217,0.9)] dark:shadow-[0_0_8px_rgba(139,92,246,0.9)]" />
          <span className="absolute top-1/2 -translate-y-1/2 left-2 h-px w-6 bg-gradient-to-r from-purple-600 to-transparent dark:from-purple-400 dark:to-transparent" />
        </span>
        <span
          className="animate-logo-meteor absolute left-1/2 bottom-0 -translate-x-1/2"
          style={{ "--angle": "30deg", animationDelay: "2.2s" }}
        >
          <span className="block w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-300 ring-2 ring-white/80 dark:ring-transparent shadow-[0_0_8px_rgba(6,182,212,0.9)] dark:shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
          <span className="absolute top-1/2 -translate-y-1/2 left-2 h-px w-6 bg-gradient-to-r from-cyan-500 to-transparent dark:from-cyan-300 dark:to-transparent" />
        </span>
      </MotionLink>
    </div>
  );
};

export default Logo;
