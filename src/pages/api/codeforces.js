/**
 * Codeforces API Handler
 * ─────────────────────────────────────────────────────────────────────
 * Data fetched dynamically via official Codeforces REST API:
 *   - User Info:    https://codeforces.com/api/user.info?handles={handle}
 *   - Rating History: https://codeforces.com/api/user.rating?handle={handle}
 *   - Submissions:  https://codeforces.com/api/user.status?handle={handle}
 *
 * Method: REST (public API, no auth required)
 *
 * Data returned:
 *   - info: handle, rating, maxRating, rank, maxRank, avatar, country, org
 *   - derivedMetrics: totalSolved, highestProblemRating, contestCount,
 *     bestContestRank, averageContestRank, ratingGain, streaks,
 *     activeDays, acceptanceRate, favoriteTag, primaryLanguage
 *   - difficultyDistribution, languageDistribution
 *   - recentSubmissions (last 15)
 *   - contestHistory (full rating change history)
 *   - calendar (submission heatmap data)
 * ─────────────────────────────────────────────────────────────────────
 */
export default async function handler(req, res) {
  const { username } = req.query;
  const handle = username || "Urva_Gandhi";

  try {
    const [infoRes, ratingRes, statusRes] = await Promise.all([
      fetch(`https://codeforces.com/api/user.info?handles=${handle}`),
      fetch(`https://codeforces.com/api/user.rating?handle=${handle}`),
      fetch(`https://codeforces.com/api/user.status?handle=${handle}`)
    ]);

    const infoData = await infoRes.json();
    const ratingData = await ratingRes.json();
    const statusData = await statusRes.json();

    if (infoData.status !== "OK" || ratingData.status !== "OK" || statusData.status !== "OK") {
      return res.status(500).json({ error: "Failed to fetch data from Codeforces API" });
    }

    const info = infoData.result[0];
    const ratingHistory = ratingData.result; // array of contests
    const submissions = statusData.result; // array of submissions

    // Process Submissions
    const solvedProblems = new Set();
    const solvedDifficultyCount = {};
    let highestProblemRating = 0;
    const tagCount = {};
    const langCount = {};
    let totalAccepted = 0;
    
    // Sort submissions ascending by time
    const sortedSubmissions = [...submissions].sort((a, b) => a.creationTimeSeconds - b.creationTimeSeconds);

    submissions.forEach(sub => {
      const isOK = sub.verdict === "OK";
      const lang = sub.programmingLanguage || "Unknown";
      langCount[lang] = (langCount[lang] || 0) + 1;

      if (isOK) {
        totalAccepted++;
        const probId = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!solvedProblems.has(probId)) {
          solvedProblems.add(probId);
          
          // Difficulty
          const rating = sub.problem.rating;
          if (rating) {
            solvedDifficultyCount[rating] = (solvedDifficultyCount[rating] || 0) + 1;
            if (rating > highestProblemRating) {
              highestProblemRating = rating;
            }
          }

          // Tags
          const tags = sub.problem.tags || [];
          tags.forEach(tag => {
            // Capitalize tags for presentation
            const capitalizedTag = tag.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
            tagCount[capitalizedTag] = (tagCount[capitalizedTag] || 0) + 1;
          });
        }
      }
    });

    const totalSolved = solvedProblems.size;

    // Streaks and Active Days
    const activeDates = new Set();
    submissions.forEach(sub => {
      const dateStr = new Date(sub.creationTimeSeconds * 1000).toISOString().split("T")[0];
      activeDates.add(dateStr);
    });

    const sortedDates = [...activeDates].sort((a, b) => new Date(a) - new Date(b));
    const activeDays = sortedDates.length;

    let currentStreak = 0;
    let longestStreak = 0;

    if (sortedDates.length > 0) {
      let tempStreak = 1;
      let maxStreak = 1;

      for (let i = 1; i < sortedDates.length; i++) {
        const d1 = new Date(sortedDates[i - 1]);
        const d2 = new Date(sortedDates[i]);
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          if (tempStreak > maxStreak) {
            maxStreak = tempStreak;
          }
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(maxStreak, tempStreak);

      // Current Streak Calculation
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const todayStr = today.toISOString().split("T")[0];
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const hasActivityToday = activeDates.has(todayStr);
      const hasActivityYesterday = activeDates.has(yesterdayStr);

      if (hasActivityToday || hasActivityYesterday) {
        let tempCurrent = 0;
        let checkDate = hasActivityToday ? today : yesterday;
        while (activeDates.has(checkDate.toISOString().split("T")[0])) {
          tempCurrent++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
        currentStreak = tempCurrent;
      }
    }

    const totalSubmissions = submissions.length;
    const acceptanceRate = totalSubmissions > 0 ? ((totalAccepted / totalSubmissions) * 100).toFixed(1) : "0";

    // Favorite Tag
    let favoriteTag = "Greedy";
    let maxTagCount = 0;
    Object.entries(tagCount).forEach(([tag, count]) => {
      if (count > maxTagCount) {
        maxTagCount = count;
        favoriteTag = tag;
      }
    });

    // Primary Language
    let primaryLanguage = "Java";
    let maxLangCount = 0;
    Object.entries(langCount).forEach(([lang, count]) => {
      if (count > maxLangCount) {
        maxLangCount = count;
        primaryLanguage = lang;
      }
    });

    // Contest Details
    const contestCount = ratingHistory.length;
    let bestContestRank = 0;
    let totalContestRank = 0;
    let ratingGain = 0;

    if (contestCount > 0) {
      bestContestRank = Math.min(...ratingHistory.map(h => h.rank));
      totalContestRank = ratingHistory.reduce((sum, h) => sum + h.rank, 0);
      ratingGain = ratingHistory[contestCount - 1].newRating - ratingHistory[0].oldRating;
    }
    const averageContestRank = contestCount > 0 ? Math.round(totalContestRank / contestCount) : 0;

    // Format Contribution Calendar
    const calendarData = {};
    submissions.forEach(sub => {
      const date = new Date(sub.creationTimeSeconds * 1000);
      date.setUTCHours(0, 0, 0, 0);
      const dayTimestamp = Math.floor(date.getTime() / 1000);
      calendarData[dayTimestamp] = (calendarData[dayTimestamp] || 0) + 1;
    });

    // Extract recent submissions (limit 15)
    const recentSubmissions = submissions.slice(0, 15).map(sub => ({
      id: sub.id,
      title: sub.problem.name,
      contestId: sub.problem.contestId,
      index: sub.problem.index,
      timestamp: sub.creationTimeSeconds,
      statusDisplay: sub.verdict === "OK" ? "Accepted" : sub.verdict,
      lang: sub.programmingLanguage,
      rating: sub.problem.rating
    }));

    // Group difficulty distribution
    const difficultyDistribution = Object.entries(solvedDifficultyCount).map(([r, count]) => ({
      rating: parseInt(r),
      count
    })).sort((a, b) => a.rating - b.rating);

    // Group Language distribution
    const languageDistribution = Object.entries(langCount).map(([lang, count]) => ({
      languageName: lang,
      problemsSolved: count
    })).sort((a, b) => b.problemsSolved - a.problemsSolved);

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=300"
    );

    res.status(200).json({
      info: {
        handle: info.handle,
        rating: info.rating || 0,
        maxRating: info.maxRating || 0,
        rank: info.rank || "Unrated",
        maxRank: info.maxRank || "Unrated",
        avatar: info.avatar,
        titlePhoto: info.titlePhoto,
        country: info.country || "India",
        organization: info.organization || "Nirma University",
        contribution: info.contribution || 0,
        friendOfCount: info.friendOfCount || 0
      },
      derivedMetrics: {
        totalSolved,
        highestProblemRating,
        contestCount,
        bestContestRank,
        averageContestRank,
        ratingGain,
        currentStreak,
        longestStreak,
        activeDays,
        acceptanceRate,
        favoriteTag,
        primaryLanguage,
        totalSubmissions
      },
      difficultyDistribution,
      languageDistribution,
      recentSubmissions,
      contestHistory: ratingHistory,
      calendar: calendarData
    });
  } catch (error) {
    console.error("Codeforces API error:", error);
    res.status(500).json({ error: "Failed to fetch Codeforces data" });
  }
}
