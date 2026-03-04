import React, { useState, useEffect } from "react";
import { GitHubCalendar } from "react-github-calendar";

export default function GithubGraph({ username, themeMode }) {
  const [mounted, setMounted] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState([]);

  useEffect(() => {
    setMounted(true);
    // Standard GitHub year generation (say, from 2020 to current)
    const currentYear = new Date().getFullYear();
    const activeYears = [];
    for (let y = currentYear; y >= currentYear - 4; y--) {
      activeYears.push(y);
    }
    setYears(activeYears);
  }, []);

  if (!mounted) return null;

  const explicitTheme = {
    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
  };

  return (
    <div className="w-full h-full flex flex-col items-start gap-4 mb-4">
      <h3 className="text-2xl font-bold dark:text-light mb-2">GitHub Contributions</h3>
      
      <div className="w-full h-full flex md:flex-col gap-4 border border-solid border-dark/20 dark:border-light/20 bg-light dark:bg-[#0d1117] p-8 rounded-2xl shadow-sm">
        <div className="flex-1 overflow-x-auto">
          <GitHubCalendar
            username={username}
            year={selectedYear}
            theme={explicitTheme}
            colorScheme={themeMode === "dark" ? "dark" : "light"}
            blockSize={14}
            blockMargin={5}
            fontSize={14}
          />
        </div>

        {/* Year Selector */}
        <div className="flex flex-col gap-2 min-w-[80px] md:flex-row md:flex-wrap md:justify-center">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                selectedYear === year
                  ? "bg-primary text-light dark:bg-primaryDark dark:text-dark"
                  : "bg-transparent text-dark/70 dark:text-light/70 hover:bg-dark/5 dark:hover:bg-light/10"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
