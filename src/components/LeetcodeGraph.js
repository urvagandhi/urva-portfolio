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
    <div className="w-full h-full flex flex-col items-start gap-4 mb-4">
      <h3 className="text-2xl font-bold dark:text-light mb-2">LeetCode Contributions</h3>
      
      <div className="w-full h-full flex md:flex-col gap-4 border border-solid border-dark/20 dark:border-light/20 bg-light dark:bg-[#0d1117] p-8 rounded-2xl shadow-sm min-h-[220px]">
        <div className="flex-1 overflow-x-auto flex items-center justify-center">
          {loading ? (
            <div className="text-dark/50 dark:text-light/50">Loading LeetCode data...</div>
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
