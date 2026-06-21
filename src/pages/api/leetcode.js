/**
 * LeetCode API Handler
 * ─────────────────────────────────────────────────────────────────────
 * Data fetched dynamically via LeetCode GraphQL API:
 *   - Endpoint: https://leetcode.com/graphql
 *
 * Method: GraphQL (single query, no auth required)
 *
 * GraphQL query fetches:
 *   - allQuestionsCount (total problems by difficulty)
 *   - matchedUser: profile, submitStatsGlobal, languageProblemCount,
 *     badges, activeBadge, userCalendar (streak, heatmap)
 *   - userContestRanking (rating, globalRanking, topPercentage)
 *   - userContestRankingHistory (per-contest performance)
 *   - recentSubmissionList (last 15 submissions)
 *
 * Derived metrics computed server-side:
 *   - longestStreak, mostActiveDay, mostActiveMonth
 *   - yearContributions, avgSubmissionsPerActiveDay
 *   - Contribution calendar formatted for react-activity-calendar
 * ─────────────────────────────────────────────────────────────────────
 */
export default async function handler(req, res) {
  const { username, year } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const variables = { username };

  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": `https://leetcode.com/u/${username}/`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      },
      body: JSON.stringify({
        query: `
          query leetcodeStats($username: String!) {
          allQuestionsCount {
            difficulty
            count
          }
          matchedUser(username: $username) {
            username
            profile {
              realName
              userAvatar
              countryName
              ranking
              reputation
              aboutMe
              company
              school
            }
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
              totalSubmissionNum {
                difficulty
                count
                submissions
              }
            }
            languageProblemCount {
              languageName
              problemsSolved
            }
            badges {
              id
              name
              displayName
              icon
              hoverText
            }
            activeBadge {
              id
              name
              displayName
              icon
            }
            userCalendar {
              activeYears
              streak
              totalActiveDays
              submissionCalendar
            }
          }
          userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
            totalParticipants
            topPercentage
            badge {
              name
            }
          }
          userContestRankingHistory(username: $username) {
            attended
            problemsSolved
            totalProblems
            rating
            ranking
            contest {
              title
              startTime
            }
          }
          recentSubmissionList(username: $username, limit: 15) {
            title
            titleSlug
            timestamp
            statusDisplay
            lang
          }
        }
      `,
      variables,
    }),
  });

    const data = await response.json();

    if (data.errors) {
      return res.status(500).json({ error: data.errors[0].message });
    }

    const { allQuestionsCount, matchedUser, userContestRanking, recentSubmissionList, userContestRankingHistory } = data.data;
    if (!matchedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const calendar = matchedUser.userCalendar;
    let submissions = {};
    if (calendar && calendar.submissionCalendar) {
      submissions = JSON.parse(calendar.submissionCalendar);
    }
    
    // Format to react-activity-calendar format: [{ date: "YYYY-MM-DD", count: 1, level: 1 }]
    const formattedData = Object.entries(submissions).map(([timestamp, count]) => {
      const date = new Date(parseInt(timestamp) * 1000);
      const y = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      
      let level = 0;
      if (count > 0) level = 1;
      if (count >= 5) level = 2;
      if (count >= 10) level = 3;
      if (count >= 15) level = 4;

      return {
        date: `${y}-${month}-${day}`,
        count,
        level,
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Filter contributions to the requested year if provided
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const contributions = formattedData.filter(d => d.date.startsWith(String(targetYear)));

    // Calculate derived metrics
    let longestStreak = 0;
    let mostActiveDayCount = 0;
    let mostActiveDayDate = null;
    let mostActiveMonth = "N/A";
    let yearContributions = 0;
    let avgSubmissionsPerActiveDay = 0;

    if (calendar && calendar.submissionCalendar) {
      // 1. Longest streak
      const activeDates = Object.keys(submissions)
        .map(ts => new Date(parseInt(ts) * 1000).toISOString().split('T')[0])
        .sort();
      
      let currentRun = 0;
      let prevDate = null;
      for (const dateStr of activeDates) {
        if (!prevDate) {
          currentRun = 1;
        } else {
          const prev = new Date(prevDate);
          const curr = new Date(dateStr);
          const diffTime = Math.abs(curr - prev);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            currentRun++;
          } else if (diffDays > 1) {
            longestStreak = Math.max(longestStreak, currentRun);
            currentRun = 1;
          }
        }
        prevDate = dateStr;
      }
      longestStreak = Math.max(longestStreak, currentRun);

      // 2. Most active day
      Object.entries(submissions).forEach(([timestamp, count]) => {
        if (count > mostActiveDayCount) {
          mostActiveDayCount = count;
          mostActiveDayDate = new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0];
        }
      });

      // 3. Most active month
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const monthCounts = Array(12).fill(0);
      Object.entries(submissions).forEach(([timestamp, count]) => {
        const date = new Date(parseInt(timestamp) * 1000);
        monthCounts[date.getMonth()] += count;
      });
      const maxMonthIdx = monthCounts.indexOf(Math.max(...monthCounts));
      if (Math.max(...monthCounts) > 0) {
        mostActiveMonth = months[maxMonthIdx];
      }

      // 4. Total contributions this year
      Object.entries(submissions).forEach(([timestamp, count]) => {
        const date = new Date(parseInt(timestamp) * 1000);
        if (date.getFullYear() === targetYear) {
          yearContributions += count;
        }
      });

      // 5. Average submissions per active day
      const totalSub = matchedUser.submitStatsGlobal?.acSubmissionNum?.[0]?.submissions || 0;
      const totalActiveDays = calendar.totalActiveDays || 0;
      avgSubmissionsPerActiveDay = totalActiveDays > 0 ? (totalSub / totalActiveDays).toFixed(2) : 0;
    }

    // Determine the most recent badge from the badges list as the primary active badge
    let activeBadge = matchedUser.activeBadge;
    if (matchedUser.badges && matchedUser.badges.length > 0) {
      const sortedBadges = [...matchedUser.badges].sort((a, b) => parseInt(b.id) - parseInt(a.id));
      activeBadge = sortedBadges[0];
    }

    // Filter contest history for attended contests
    const contestHistory = userContestRankingHistory ? userContestRankingHistory.filter(c => c.attended) : [];

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=300"
    );

    res.status(200).json({
      activeYears: calendar ? calendar.activeYears : [new Date().getFullYear()],
      totalActiveDays: calendar ? calendar.totalActiveDays : 0,
      streak: calendar ? calendar.streak : 0,
      contributions,
      // Comprehensive profile metrics
      allQuestions: allQuestionsCount,
      profile: matchedUser.profile,
      submitStats: matchedUser.submitStatsGlobal,
      languages: matchedUser.languageProblemCount,
      badges: matchedUser.badges,
      activeBadge: activeBadge,
      contestRanking: userContestRanking,
      contestHistory: contestHistory,
      recentSubmissions: recentSubmissionList,
      derivedMetrics: {
        longestStreak,
        mostActiveDay: {
          count: mostActiveDayCount,
          date: mostActiveDayDate
        },
        mostActiveMonth,
        yearContributions,
        avgSubmissionsPerActiveDay
      }
    });
  } catch (error) {
    console.error("LeetCode API Error:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
