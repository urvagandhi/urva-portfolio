import React from 'react';
import { motion } from 'framer-motion';

const themes = {
  blue: {
    underline: "from-cyan-400 to-blue-600",
    textLight: "from-slate-900 to-blue-700",
    textDark: "dark:from-slate-100 dark:to-cyan-500",
    dotText: "text-cyan-500",
    dots: ["bg-cyan-400", "bg-cyan-500", "bg-cyan-600"]
  },
  emerald: {
    underline: "from-emerald-400 to-teal-600",
    textLight: "from-slate-900 to-teal-700",
    textDark: "dark:from-slate-100 dark:to-emerald-500",
    dotText: "text-emerald-500",
    dots: ["bg-emerald-400", "bg-emerald-500", "bg-emerald-600"]
  },
  purple: {
    underline: "from-fuchsia-400 to-purple-600",
    textLight: "from-slate-900 to-purple-700",
    textDark: "dark:from-slate-100 dark:to-fuchsia-500",
    dotText: "text-fuchsia-500",
    dots: ["bg-fuchsia-400", "bg-fuchsia-500", "bg-fuchsia-600"]
  },
  rose: {
    underline: "from-rose-400 to-red-600",
    textLight: "from-slate-900 to-red-700",
    textDark: "dark:from-slate-100 dark:to-rose-500",
    dotText: "text-rose-500",
    dots: ["bg-rose-400", "bg-rose-500", "bg-rose-600"]
  },
  amber: {
    underline: "from-amber-400 to-orange-600",
    textLight: "from-slate-900 to-orange-700",
    textDark: "dark:from-slate-100 dark:to-amber-500",
    dotText: "text-amber-500",
    dots: ["bg-amber-400", "bg-amber-500", "bg-amber-600"]
  }
};

const SectionHeading = ({ title, subTitle, className = "", theme = "blue" }) => {
  const colors = themes[theme] || themes.blue;

  return (
    <div className={`relative flex flex-col items-start ${className}`}>
      {/* Subtitle */}
      {subTitle && (
        <div className="relative mb-2">
          <motion.h3 
            className="text-lg md:text-base font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {subTitle}
          </motion.h3>
          {/* Underline */}
          <motion.div 
            className={`absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r ${colors.underline}`}
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
            viewport={{ once: true, margin: "-100px" }}
          />
        </div>
      )}

      {/* Title */}
      <div className="relative inline-block mt-2">
        <motion.h2 
          className={`text-8xl lg:text-7xl sm:text-6xl xs:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${colors.textLight} ${colors.textDark} leading-tight`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          {title}
          <span className={`${colors.dotText} font-black`}>.</span>
        </motion.h2>

        {/* Floating Dots */}
        <div className="absolute top-0 -right-12 sm:-right-8 flex flex-row items-end gap-1.5">
          <motion.span 
            className={`w-1.5 h-1.5 rounded-full ${colors.dots[0]}`} 
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.6, type: "spring" }}
            viewport={{ once: true, margin: "-50px" }}
            style={{ animation: 'float-dot 2s ease-in-out infinite' }}
          />
          <motion.span 
            className={`w-2 h-2 rounded-full ${colors.dots[1]} mb-1`} 
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.8, type: "spring" }}
            viewport={{ once: true, margin: "-50px" }}
            style={{ animation: 'float-dot 2s ease-in-out infinite 0.2s' }}
          />
          <motion.span 
            className={`w-2.5 h-2.5 rounded-full ${colors.dots[2]} mb-2.5`} 
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 1.0, type: "spring" }}
            viewport={{ once: true, margin: "-50px" }}
            style={{ animation: 'float-dot 2s ease-in-out infinite 0.4s' }}
          />
        </div>
      </div>
    </div>
  );
};

export default SectionHeading;
