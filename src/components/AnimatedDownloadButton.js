import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LinkArrow } from "./Icons";

const AnimatedDownloadButton = ({ href = "/resume.pdf", filename = "resume.pdf" }) => {
  const [status, setStatus] = useState("idle"); // idle, downloading, completed
  const [progress, setProgress] = useState(0);

  const startDownload = (e) => {
    e.preventDefault();
    if (status !== "idle") return;

    setStatus("downloading");
    setProgress(0);

    // Simulate download progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus("completed");
          
          // Trigger actual download
          const link = document.createElement("a");
          link.href = href;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Reset after delay
          setTimeout(() => {
            setStatus("idle");
            setProgress(0);
          }, 3000);
          
          return 100;
        }
        return prev + 1; // Animation speed
      });
    }, 20);
  };

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
            className="absolute flex flex-col items-center justify-center w-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {/* Percentage Text */}
            <span className="mb-2 text-sm font-bold text-dark dark:text-light">
              Downloading... {progress.toFixed(0)}%
            </span>

            <div className="relative w-full h-1 bg-gray-300 dark:bg-gray-700 rounded-full mt-1">
              {/* String / Progress Line */}
              <motion.div 
                className="absolute top-0 left-0 h-full bg-primary dark:bg-primaryDark rounded-full"
                style={{ width: `${progress}%` }}
              />

              {/* Rolling Ball */}
              <motion.div 
                className="absolute top-1/2 -mt-1.5 h-3 w-3 rounded-full bg-primary dark:bg-primaryDark shadow-[0_0_10px_rgba(182,62,150,0.8)] dark:shadow-[0_0_10px_rgba(88,230,217,0.8)] z-20"
                style={{ left: `${progress}%`, x: "-50%" }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
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
