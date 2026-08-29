import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LinkArrow } from "./Icons";

const AnimatedDownloadButton = ({
  href = "/urva-gandhi_resume.pdf",
  filename = "urva-gandhi_resume.pdf",
}) => {
  const [status, setStatus] = useState("idle"); // idle, downloading, completed
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startDownload = (e) => {
    e.preventDefault();
    if (status !== "idle") return;

    setStatus("downloading");
    setProgress(0);

    // Simulate download progress
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setStatus("completed");

          // Trigger actual download
          const link = document.createElement("a");
          link.href = href;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Reset after delay
          timeoutRef.current = setTimeout(() => {
            setStatus("idle");
            setProgress(0);
            timeoutRef.current = null;
          }, 3000);

          return 100;
        }
        return prev + 1; // Animation speed
      });
    }, 20);
  };

  // Dynamic parabola: sags DOWN to 50%, then rises back UP to the baseline at 100%
  const t = Math.max(0, Math.min(1, progress / 100));
  const ctrlY = 74 - 50 * Math.abs(2 * t - 1);
  const ropeD = `M 12 24 Q 100 ${ctrlY} 188 24`;

  // Point on the quadratic bezier at the current progress (riding ball)
  const bx = (1 - t) * (1 - t) * 12 + 2 * (1 - t) * t * 100 + t * t * 188;
  const by = (1 - t) * (1 - t) * 24 + 2 * (1 - t) * t * ctrlY + t * t * 24;

  // Lowest point of the parabola so the label sits just above the rope (no overlap)
  const minY = 12 + ctrlY / 2;
  const labelY = minY - 14;

  return (
    <div className="relative h-12 w-48 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.a
            key="button"
            href={href}
            onClick={startDownload}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute z-10 flex items-center rounded-lg border-2 border-solid border-dark bg-dark p-2.5 px-6 text-lg font-semibold capitalize text-light hover:border-dark hover:bg-transparent hover:text-dark dark:border-light dark:bg-light dark:text-dark dark:hover:border-light dark:hover:bg-dark dark:hover:text-light md:p-2 md:px-4 md:text-base cursor-pointer shadow-lg hover:shadow-xl transition-all"
          >
            Resume <LinkArrow className={"ml-1 !w-6 md:!w-4"} />
          </motion.a>
        )}

        {status === "downloading" && (
          <motion.div
            key="progress"
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            aria-live="polite"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="flex flex-col items-center justify-center translate-y-3">
              <svg
                viewBox="0 0 200 84"
                className="w-40 h-[84px] overflow-visible"
              >
                {/* Back rope (unfilled) */}
                <path
                  d={ropeD}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.15"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Progress rope (consistent parabola) */}
                <motion.path
                  d={ropeD}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.95"
                  strokeWidth="4"
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={1 - progress / 100}
                />

                {/* Ball riding the rope tip */}
                <motion.circle
                  cx={bx}
                  cy={by}
                  r="6"
                  fill="currentColor"
                  animate={{ r: [5.5, 6.5, 5.5] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    ease: "easeInOut",
                  }}
                />

                {/* Percentage inside the parabola */}
                <text
                  x="100"
                  y={labelY}
                  textAnchor="middle"
                  className="fill-dark dark:fill-light font-bold"
                  fontSize="18"
                >
                  {Math.round(progress)}%
                </text>
              </svg>

              <span className="relative -mt-1 text-[11px] font-semibold uppercase tracking-widest text-dark/60 dark:text-light/60">
                Downloading
              </span>
            </div>
          </motion.div>
        )}

        {status === "completed" && (
          <motion.div
            key="success"
            className="absolute flex flex-col items-center justify-center font-bold text-green-600 dark:text-green-400"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <span className="text-sm mt-1">Downloaded!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedDownloadButton;
