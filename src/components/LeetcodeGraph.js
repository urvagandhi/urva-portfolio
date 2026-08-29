import React, { useState, useEffect } from "react";
import { ActivityCalendar } from "react-activity-calendar";

export default function LeetcodeGraph({ username, themeMode }) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!username) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/leetcode?username=${username}&year=${selectedYear}`);
        const json = await res.json();

        if (json.contributions) {
          // react-activity-calendar needs start and end dates to render the full year grid.
          const startDate = `${selectedYear}-01-01`;
          const endDate = `${selectedYear}-12-31`;

          const dataMap = {};
          json.contributions.forEach((item) => {
            dataMap[item.date] = item;
          });

          // Fill in 365 days
          const filledData = [];
          const current = new Date(startDate);
          const end = new Date(endDate);

          while (current <= end) {
            const dateStr = current.toISOString().split("T")[0];
            if (dataMap[dateStr]) {
              filledData.push(dataMap[dateStr]);
            } else {
              filledData.push({ date: dateStr, count: 0, level: 0 });
            }
            current.setDate(current.getDate() + 1);
          }

          setData(filledData);

          if (json.activeYears) {
            setYears([...json.activeYears].sort((a, b) => b - a));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, selectedYear]);

  if (!mounted) return null;

  const explicitTheme = {
    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
  };

  return (
    <div className="w-full h-full min-w-0 flex flex-col items-start gap-4 mb-4">
      <h3 className="text-2xl font-bold dark:text-light mb-2">LeetCode Contributions</h3>
      
      <div className="w-full h-full flex md:flex-col gap-4 border border-solid border-dark/20 dark:border-light/20 bg-light dark:bg-[#0d1117] p-8 md:p-5 xs:p-3 rounded-2xl shadow-sm min-h-[220px]">
        <div className="flex-1 flex flex-col min-w-0">
          <span className="text-[11px] font-semibold text-dark/50 dark:text-light/50 mb-2 md:block hidden">
            ← Scroll horizontally to explore activity →
          </span>
          <div className="relative min-w-0 w-full overflow-x-auto no-scrollbar">
            {loading ? (
              <div className="w-full flex flex-col gap-4 animate-pulse py-2">
                {/* High Level Stats Skeleton Row */}
                <div className="grid grid-cols-4 sm:grid-cols-2 gap-3 w-full">
                  <div className="h-14 rounded-xl bg-dark/10 dark:bg-light/10 p-2 flex flex-col justify-center gap-1.5">
                    <div className="h-2.5 w-14 rounded bg-dark/20 dark:bg-light/20" />
                    <div className="h-4 w-10 rounded bg-dark/30 dark:bg-light/30" />
                  </div>
                  <div className="h-14 rounded-xl bg-dark/10 dark:bg-light/10 p-2 flex flex-col justify-center gap-1.5">
                    <div className="h-2.5 w-14 rounded bg-dark/20 dark:bg-light/20" />
                    <div className="h-4 w-10 rounded bg-dark/30 dark:bg-light/30" />
                  </div>
                  <div className="h-14 rounded-xl bg-dark/10 dark:bg-light/10 p-2 flex flex-col justify-center gap-1.5">
                    <div className="h-2.5 w-14 rounded bg-dark/20 dark:bg-light/20" />
                    <div className="h-4 w-10 rounded bg-dark/30 dark:bg-light/30" />
                  </div>
                  <div className="h-14 rounded-xl bg-dark/10 dark:bg-light/10 p-2 flex flex-col justify-center gap-1.5">
                    <div className="h-2.5 w-14 rounded bg-dark/20 dark:bg-light/20" />
                    <div className="h-4 w-10 rounded bg-dark/30 dark:bg-light/30" />
                  </div>
                </div>

                {/* Heatmap Grid Skeleton Placeholder */}
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex justify-between items-center text-[10px] text-dark/40 dark:text-light/40 font-mono">
                    <span>Fetching live LeetCode submissions...</span>
                    <span className="hidden sm:inline">Connecting API</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1.5 w-full">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-3 rounded-sm bg-dark/15 dark:bg-light/15"
                        style={{ opacity: 0.3 + (i % 5) * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : data.length > 0 ? (
              <ActivityCalendar
                data={data}
                theme={explicitTheme}
                colorScheme={themeMode === "dark" ? "dark" : "light"}
                blockSize={14}
                blockMargin={5}
                fontSize={14}
                labels={{
                  totalCount: `{{count}} contributions in ${selectedYear}`,
                }}
              />
            ) : (
              <div className="text-dark/50 dark:text-light/50">No data found</div>
            )}
          </div>
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
