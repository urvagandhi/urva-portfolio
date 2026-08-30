/**
 * CodeChef API Handler
 * ─────────────────────────────────────────────────────────────────────
 * Data scraped dynamically from CodeChef User Profile page:
 *   - Profile URL:  https://www.codechef.com/users/{username}
 *   - Recent Subs:  https://www.codechef.com/recent/user?page=0&user_handle={username}
 *
 * Method: HTML Scraping (no public REST API available)
 *
 * Data extracted via regex from the profile page HTML:
 *   - Rating, Stars, Highest Rating
 *   - Global Rank, Country Rank
 *   - Name, Avatar, Country, Institution
 *   - Problems Solved count
 *   - Badges (image, title, description)
 *   - Daily Submission stats (heatmap / contributions)
 *   - Rating History (contest-by-contest)
 *   - Recent Submissions (from AJAX endpoint)
 *   - Derived: Language stats, streaks, active days, acceptance rate
 * ─────────────────────────────────────────────────────────────────────
 */
export default async function handler(req, res) {
  res.setHeader("RateLimit-Limit", "100");
  res.setHeader("RateLimit-Remaining", "99");
  res.setHeader("RateLimit-Reset", "60");
  res.setHeader("X-RateLimit-Limit", "100");
  res.setHeader("X-RateLimit-Remaining", "99");
  res.setHeader("X-RateLimit-Reset", "60");
  res.setHeader("X-API-Version", "1.0.0");

  if (req.method !== "GET") {
    res.setHeader("Content-Type", "application/problem+json");
    return res.status(405).json({
      type: "https://urvagandhi.tech/docs/errors/method-not-allowed",
      title: "Method Not Allowed",
      status: 405,
      code: "METHOD_NOT_ALLOWED",
      detail: "Only HTTP GET method is allowed.",
      instance: "/api/codechef",
      resolution_hint: "Use HTTP GET with username query parameter.",
    });
  }

  const { username, year } = req.query;

  if (!username) {
    res.setHeader("Content-Type", "application/problem+json");
    return res.status(400).json({
      type: "https://urvagandhi.tech/docs/errors/invalid-parameters",
      title: "Bad Request",
      status: 400,
      code: "MISSING_USERNAME",
      detail: "The 'username' query parameter is required.",
      instance: "/api/codechef",
      resolution_hint:
        "Provide username query parameter (e.g., /api/codechef?username=urva_gandhi).",
    });
  }

  try {
    // 1. Fetch main profile page
    const profileResponse = await fetch(
      `https://www.codechef.com/users/${username}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      },
    );
    const html = await profileResponse.text();

    // Parse Rating
    const ratingMatch = html.match(/<div class="rating-number">([^<]+)<\/div>/);
    const rating = ratingMatch ? parseInt(ratingMatch[1].trim()) : null;

    // Parse Stars
    const starsMatch = html.match(/<div class="rating-star">([\s\S]*?)<\/div>/);
    const starsCount = starsMatch
      ? (starsMatch[1].match(/&#9733;/g) || []).length
      : 0;
    const stars = starsCount > 0 ? `${starsCount}★` : "1★";

    // Parse Highest Rating
    const highestMatch = html.match(/\(Highest Rating\s+(\d+)\)/);
    const highestRating = highestMatch ? parseInt(highestMatch[1]) : null;

    // Parse Global Rank
    const globalRankMatch = html.match(
      /<a href="\/ratings\/all">[^<]*?<strong>([^<]+)<\/strong>/,
    );
    const globalRank = globalRankMatch ? globalRankMatch[1].trim() : null;

    // Parse Country Rank
    const countryRankMatch = html.match(
      /<a href="\/ratings\/all\?filterBy=Country[^>]*>[^<]*?<strong>([^<]+)<\/strong>/,
    );
    const countryRank = countryRankMatch ? countryRankMatch[1].trim() : null;

    // Parse Name
    const nameMatch = html.match(/<h1 class="h2-style">([^<]+)<\/h1>/);
    const realName = nameMatch ? nameMatch[1].trim() : null;

    // Parse Avatar
    const avatarMatch = html.match(
      /<img class=['"]profileImage['"] src=['"]([^'"]+)['"]/,
    );
    const userAvatar = avatarMatch ? avatarMatch[1] : null;

    // Parse Country
    const countryNameMatch = html.match(
      /<span class="user-country-name"[^>]*>([^<]+)<\/span>/,
    );
    const countryName = countryNameMatch ? countryNameMatch[1].trim() : null;

    // Parse Institution
    const institutionMatch = html.match(
      /<li><label>Institution:<\/label><span>([^<]+)<\/span><\/li>/,
    );
    const institution = institutionMatch ? institutionMatch[1].trim() : null;

    // Parse Problems Solved count
    const solvedMatch = html.match(/<h3>Total Problems Solved:\s*(\d+)<\/h3>/);
    const problemsSolved = solvedMatch ? parseInt(solvedMatch[1]) : 0;

    // Parse Badges
    const badgesRaw =
      html.match(/<div class=['"]badge['"]>([\s\S]*?)<\/div>\s*<\/div>/g) || [];
    const badges = badgesRaw.map((b) => {
      const imgMatch = b.match(/<img[^>]+src=['"]([^'"]+)['"]/);
      const titleMatch = b.match(/<p class=['"]badge__title['"]>([^<]+)<\/p>/);
      const descMatch = b.match(
        /<p class=['"]badge__description['"]>([\s\S]*?)<\/p>/,
      );

      return {
        image: imgMatch ? imgMatch[1] : null,
        title: titleMatch ? titleMatch[1].trim() : null,
        description: descMatch
          ? descMatch[1].replace(/<[^>]+>/g, "").trim()
          : null,
      };
    });

    // Parse Daily Submission stats (heatmap data)
    const dailySubmissionsMatch = html.match(
      /var userDailySubmissionsStats\s*=\s*(\[[\s\S]*?\]);/,
    );
    let dailySubmissions = [];
    if (dailySubmissionsMatch) {
      try {
        dailySubmissions = JSON.parse(dailySubmissionsMatch[1]);
      } catch (e) {
        console.error("Failed to parse daily submissions:", e);
      }
    }

    // Parse Rating History
    const allRatingMatch = html.match(/var all_rating\s*=\s*(\[[\s\S]*?\]);/);
    let contestHistoryRaw = [];
    if (allRatingMatch) {
      try {
        contestHistoryRaw = JSON.parse(allRatingMatch[1]);
      } catch (e) {
        console.error("Failed to parse rating history:", e);
      }
    }

    // Format rating history
    const contestHistory = contestHistoryRaw.map((c) => {
      return {
        contestName: c.name.trim(),
        contestId: c.code,
        rating: parseInt(c.rating),
        rank: parseInt(c.rank),
        date: `${c.getyear}-${String(c.getmonth).padStart(2, "0")}-${String(c.getday).padStart(2, "0")}`,
      };
    });

    // Format heatmap contributions
    const formattedContributions = dailySubmissions
      .map((item) => {
        const parts = item.date.split("-");
        const y = parts[0];
        const m = String(parts[1]).padStart(2, "0");
        const d = String(parts[2]).padStart(2, "0");
        const dateStr = `${y}-${m}-${d}`;
        const count = item.value;

        let level = 0;
        if (count > 0) level = 1;
        if (count >= 3) level = 2;
        if (count >= 6) level = 3;
        if (count >= 10) level = 4;

        return {
          date: dateStr,
          count,
          level,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Filter to requested year
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const contributions = formattedContributions.filter((d) =>
      d.date.startsWith(String(targetYear)),
    );

    // Calculate streaks and active days
    const activeDates = formattedContributions.map((c) => c.date).sort();
    let longestStreak = 0;
    let currentStreak = 0;
    const activeDays = activeDates.length;

    if (activeDates.length > 0) {
      let tempStreak = 1;
      let prev = new Date(activeDates[0]);
      for (let i = 1; i < activeDates.length; i++) {
        const curr = new Date(activeDates[i]);
        const diffTime = Math.abs(curr - prev);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
        prev = curr;
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      // Current streak calculation
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const lastActiveDate = new Date(activeDates[activeDates.length - 1]);
      lastActiveDate.setHours(0, 0, 0, 0);

      if (
        lastActiveDate.getTime() === today.getTime() ||
        lastActiveDate.getTime() === yesterday.getTime()
      ) {
        let tempCurrent = 1;
        let prevDate = lastActiveDate;
        for (let i = activeDates.length - 2; i >= 0; i--) {
          const currDate = new Date(activeDates[i]);
          currDate.setHours(0, 0, 0, 0);
          const diffTime = Math.abs(prevDate - currDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            tempCurrent++;
            prevDate = currDate;
          } else {
            break;
          }
        }
        currentStreak = tempCurrent;
      }
    }

    // 2. Fetch recent submissions
    let recentSubmissions = [];
    try {
      const recentResponse = await fetch(
        `https://www.codechef.com/recent/user?page=0&user_handle=${username}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "x-requested-with": "XMLHttpRequest",
          },
        },
      );
      const recentData = await recentResponse.json();
      const recentHtml = recentData.content;

      const tbodyMatch = recentHtml.match(/<tbody>([\s\S]*?)<\/tbody>/);
      if (tbodyMatch) {
        const rows = tbodyMatch[1].match(/<tr\s*>([\s\S]*?)<\/tr>/g) || [];
        recentSubmissions = rows.map((row) => {
          const timeMatch = row.match(
            /<span class=['"]tooltiptext['"]>([^<]+)<\/span>/,
          );
          const time = timeMatch ? timeMatch[1].trim() : "N/A";

          const problemLinkMatch = row.match(
            /<a href=['"]([^'"]+)['"][^>]*>([^<]+)<\/a>/,
          );
          const problemCode = problemLinkMatch
            ? problemLinkMatch[2].trim()
            : "N/A";
          const problemUrl = problemLinkMatch
            ? "https://www.codechef.com" + problemLinkMatch[1]
            : "#";

          const verdictMatch = row.match(/<span title=['"]([^'"]+)['"]/);
          const verdict = verdictMatch ? verdictMatch[1].trim() : "N/A";

          const cols = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
          let lang = "N/A";
          if (cols.length >= 4) {
            lang = cols[3].replace(/<[^>]+>/g, "").trim();
          }

          return { time, problemCode, problemUrl, verdict, lang };
        });
      }
    } catch (e) {
      console.error("Failed to fetch recent submissions:", e);
    }

    // Derived Language Statistics
    const langCounts = {};
    recentSubmissions.forEach((sub) => {
      if (sub.lang && sub.lang !== "N/A") {
        langCounts[sub.lang] = (langCounts[sub.lang] || 0) + 1;
      }
    });

    const totalLangSubmissions = Object.values(langCounts).reduce(
      (a, b) => a + b,
      0,
    );
    const languages = Object.entries(langCounts)
      .map(([name, count]) => ({
        languageName: name,
        problemsSolved: count,
        percentage:
          totalLangSubmissions > 0
            ? Math.round((count / totalLangSubmissions) * 100)
            : 0,
      }))
      .sort((a, b) => b.problemsSolved - a.problemsSolved);

    // Cache responses
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=300",
    );

    res.status(200).json({
      activeYears: Array.from(
        new Set(
          formattedContributions.map((c) => new Date(c.date).getFullYear()),
        ),
      ).sort((a, b) => b - a),
      totalActiveDays: activeDays,
      streak: currentStreak,
      contributions,
      info: {
        handle: username,
        realName: realName || username,
        avatar:
          userAvatar ||
          "https://cdn.codechef.com/sites/all/themes/abessive/images/user_default_thumb.jpg",
        stars,
        rating: rating || 0,
        highestRating: highestRating || rating || 0,
        globalRank: globalRank || "N/A",
        countryRank: countryRank || "N/A",
        country: countryName || "India",
        organization: institution || "Nirma University",
      },
      problemsSolved,
      languages,
      badges,
      contestHistory,
      recentSubmissions,
      derivedMetrics: {
        longestStreak,
        activeDays,
        acceptanceRate:
          recentSubmissions.length > 0
            ? (
                (recentSubmissions.filter(
                  (s) => s.verdict.toLowerCase() === "accepted",
                ).length /
                  recentSubmissions.length) *
                100
              ).toFixed(1)
            : "0.0",
      },
    });
  } catch (error) {
    console.error("CodeChef Proxy Error:", error);
    res.status(500).json({ error: "Failed to fetch CodeChef profile data" });
  }
}
