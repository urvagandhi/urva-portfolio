import { useEffect, useState } from "react";

const useThemeSwitcher = () => {
    const preferDarkQuery = "(prefer-color-scheme: dark)";
    const [mode, setMode] = useState("");

    useEffect(() => {
        const mediaQuery = window.matchMedia(preferDarkQuery);
        const userPref = window.localStorage.getItem("theme");

        const handleChange = () => {
            if (userPref) {
                let check = userPref === "dark" ? "dark" : "light";
                setMode(check);
            } else {
                let check = mediaQuery.matches ? "dark" : "light";
                setMode(check);
            }
        };

        handleChange();

        mediaQuery.addEventListener("change", handleChange);

        // SYNC STATE ACROSS COMPONENT INSTANCES
        const handleCustomThemeChange = (e) => {
            setMode(e.detail);
        };
        window.addEventListener("themeChange", handleCustomThemeChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
            window.removeEventListener("themeChange", handleCustomThemeChange);
        };
    }, []);

    useEffect(() => {
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
