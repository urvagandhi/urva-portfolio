import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const cursorVariants = {
  blinking: {
    opacity: [0, 0, 1, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatDelay: 0,
      ease: "linear",
      times: [0, 0.5, 0.5, 1],
    },
  },
};

const TypewriterText = ({ text, className = "" }) => {
  const [displayedText, setDisplayedText] = useState(text);
  const indexRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    lastTimeRef.current = 0;
    setDisplayedText("");
    let rafId = null;
    const typingSpeed = 100; // ms per character

    const typeCharacter = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;

      if (elapsed >= typingSpeed && indexRef.current < text.length) {
        indexRef.current++;
        lastTimeRef.current = timestamp;
        setDisplayedText(text.slice(0, indexRef.current));
      }

      if (indexRef.current < text.length) {
        rafId = requestAnimationFrame(typeCharacter);
      }
    };

    rafId = requestAnimationFrame(typeCharacter);
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [text]);

  return (
    <div className="w-full mx-auto flex flex-col items-start justify-center overflow-hidden">
      {/* Grid-stacked spans: the invisible spacer reserves the full-text
          height, so the typing animation never collapses the H1 (no CLS). */}
      <h1 className={`grid w-full font-bold capitalize ${className}`}>
        <span
          aria-hidden="true"
          className="col-start-1 row-start-1 invisible select-none pointer-events-none"
        >
          {text}
        </span>
        <span className="col-start-1 row-start-1">
          {displayedText}
          <motion.span
            variants={cursorVariants}
            animate="blinking"
            className="inline-block text-primary dark:text-primaryDark ml-1 font-normal w-1 h-[1em] bg-primary dark:bg-primaryDark align-bottom"
          />
        </span>
      </h1>
    </div>
  );
};

export default TypewriterText;
