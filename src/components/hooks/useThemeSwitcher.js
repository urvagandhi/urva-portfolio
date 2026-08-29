import { useEffect, useRef, useState } from "react";

const useThemeSwitcher = () => {
  const preferDarkQuery = "(prefers-color-scheme: dark)";
  const [mode, setMode] = useState("light");
  const prevMode = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(preferDarkQuery);

    const handleChange = () => {
      const userPref = window.localStorage.getItem("theme");
      if (userPref === "dark" || userPref === "light") {
        setMode(userPref);
      } else {
        setMode(mediaQuery.matches ? "dark" : "light");
      }
    };

    handleChange();

    mediaQuery.addEventListener("change", handleChange);

    // SYNC STATE ACROSS COMPONENT INSTANCES
    const handleCustomThemeChange = (e) => {
      // Mark prevMode so the sync useEffect below becomes a no-op
      // (ThemeSwitcher already handled localStorage, DOM class, and event dispatch)
      prevMode.current = e.detail;
      setMode(e.detail);
    };
    window.addEventListener("themeChange", handleCustomThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      window.removeEventListener("themeChange", handleCustomThemeChange);
    };
  }, []);

  useEffect(() => {
    // Skip if mode hasn't actually changed (prevents redundant event dispatches)
    if (mode === prevMode.current) return;
    prevMode.current = mode;

    if (mode === "dark") {
      window.localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
      window.dispatchEvent(new CustomEvent("themeChange", { detail: "dark" }));
    }
    if (mode === "light") {
      window.localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
      window.dispatchEvent(new CustomEvent("themeChange", { detail: "light" }));
    }
  }, [mode]);

  return [mode, setMode];
};

export default useThemeSwitcher;
