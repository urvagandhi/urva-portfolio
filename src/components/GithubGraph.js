import React, { useState, useEffect, useCallback } from "react";
import { GitHubCalendar } from "react-github-calendar";

export default function GithubGraph({ username, themeMode }) {
  const [mounted, setMounted] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState([]);

  useEffect(() => {
    setMounted(true);
    // User's GitHub account was created in 2024, so generate years from 2024 to current
    const currentYear = new Date().getFullYear();
    const activeYears = [];
    for (let y = currentYear; y >= 2024; y--) {
      activeYears.push(y);
    }
    setYears(activeYears);
  }, []);

  const explicitTheme = {
    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
  };

  const transformContributions = useCallback((contributions) => {
    if (!contributions || contributions.length === 0) {
      // Safe fallback to prevent "Activity data must not be empty" crash
      const days = [];
      const startDate = new Date(Date.UTC(selectedYear, 0, 1));
      const endDate = new Date(Date.UTC(selectedYear, 11, 31));
      const current = new Date(startDate);
      while (current <= endDate) {
        const dateStr = current.toISOString().split("T")[0];
        days.push({
          date: dateStr,
          count: 0,
          level: 0,
        });
        current.setUTCDate(current.getUTCDate() + 1);
      }
      return days;
    }
    return contributions;
  }, [selectedYear]);

  if (!mounted) return null;

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
            transformData={transformContributions}
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

