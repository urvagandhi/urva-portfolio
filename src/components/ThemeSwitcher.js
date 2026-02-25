import React, { useRef } from 'react';
import { flushSync } from 'react-dom';

const ThemeSwitcher = ({ mode, setMode, className = "" }) => {
  const switchRef = useRef(null);

  const toggleTheme = (e) => {
    e.preventDefault();
    const isDark = mode === "dark";
    const nextMode = isDark ? "light" : "dark";

    if (!document.startViewTransition) {
      setMode(nextMode);
      return;
    }

    const rect = switchRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      // Update DOM class directly for the snapshot
      if (nextMode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      // Persist and broadcast BEFORE flushSync so all listeners
      // (e.g. _app.js particle color) update within the same synchronous flush
      window.localStorage.setItem("theme", nextMode);
      window.dispatchEvent(new CustomEvent("themeChange", { detail: nextMode }));
      // Synchronously update React state so the new snapshot reflects the correct UI
      flushSync(() => {
        setMode(nextMode);
      });
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath: isDark ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement: isDark
            ? "::view-transition-old(root)"
            : "::view-transition-new(root)",
        }
      );
    }).catch((e) => {
      console.warn("View transition aborted", e);
    });
  };

  return (
    <button 
      ref={switchRef} 
      type="button"
      className={`theme-switch-wrapper ${mode === "dark" ? "is-dark" : ""} ${className}`} 
      aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
      onClick={toggleTheme}
    >
      <div className="slider round">
        <div className="sun-moon">
          <svg className="moon-dot moon-dot-1" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50"></circle>
          </svg>
          <svg className="moon-dot moon-dot-2" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50"></circle>
          </svg>
          <svg className="moon-dot moon-dot-3" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50"></circle>
          </svg>
          <svg className="light-ray light-ray-1" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50"></circle>
          </svg>
          <svg className="light-ray light-ray-2" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50"></circle>
          </svg>
          <svg className="light-ray light-ray-3" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50"></circle>
          </svg>

          <svg className="cloud-dark cloud-1" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50"></circle>
          </svg>
          <svg className="cloud-dark cloud-2" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50"></circle>
          </svg>
          <svg className="cloud-dark cloud-3" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50"></circle>
          </svg>
          <svg className="cloud-light cloud-4" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50"></circle>
          </svg>
          <svg className="cloud-light cloud-5" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50"></circle>
          </svg>
          <svg className="cloud-light cloud-6" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50"></circle>
          </svg>
        </div>
        <div className="stars">
          <svg className="star star-1" viewBox="0 0 20 20">
            <path
              d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"
            ></path>
          </svg>
          <svg className="star star-2" viewBox="0 0 20 20">
            <path
              d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"
            ></path>
          </svg>
          <svg className="star star-3" viewBox="0 0 20 20">
            <path
              d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"
            ></path>
          </svg>
          <svg className="star star-4" viewBox="0 0 20 20">
            <path
              d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"
            ></path>
          </svg>
        </div>
      </div>
    </button>
  );
};

export default ThemeSwitcher;
