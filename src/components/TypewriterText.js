import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const cursorVariants = {
  blinking: {
    opacity: [0, 0, 1, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatDelay: 0,
      ease: "linear",
      times: [0, 0.5, 0.5, 1]
    }
  }
};

const TypewriterText = ({ text, className = "" }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => {
        if (index < text.length) {
          index++;
          return text.slice(0, index);
        }
        clearInterval(intervalId);
        return prev;
      });
    }, 150); // Adjust typing speed here (50ms per character)

    return () => clearInterval(intervalId);
  }, [text]);

  return (
    <div className="w-full mx-auto flex flex-col items-start justify-center overflow-hidden">
      <h1 className={`inline-block w-full font-bold capitalize ${className}`}>
        {displayedText}
        <motion.span
          variants={cursorVariants}
          animate="blinking"
          className="inline-block text-primary dark:text-primaryDark ml-1 font-normal w-1 h-[1em] bg-primary dark:bg-primaryDark align-bottom"
        />
      </h1>
    </div>
  );
};

export default TypewriterText;
