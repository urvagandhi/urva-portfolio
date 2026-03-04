export default async function handler(req, res) {
  const { username, year } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const variables = { username };
  if (year) {
    variables.year = parseInt(year);
  }

  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query userProfileCalendar($username: String!, $year: Int) {
            matchedUser(username: $username) {
              userCalendar(year: $year) {
                activeYears
                streak
                totalActiveDays
                submissionCalendar
              }
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

    const { matchedUser } = data.data;
    if (!matchedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const calendar = matchedUser.userCalendar;
    const submissions = JSON.parse(calendar.submissionCalendar);
    
    // Format to react-activity-calendar format: [{ date: "YYYY-MM-DD", count: 1, level: 1 }]
    const formattedData = Object.entries(submissions).map(([timestamp, count]) => {
      const date = new Date(parseInt(timestamp) * 1000);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      
      // Determine level (0-4) based on count relative to github scale
      let level = 0;
      if (count > 0) level = 1;
      if (count >= 5) level = 2;
      if (count >= 10) level = 3;
      if (count >= 15) level = 4;

      return {
        date: `${year}-${month}-${day}`,
        count,
        level,
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Fill in missing dates for the requested year, or the last 365 days
    // This is optional if react-activity-calendar can handle sparse data (it can, but needs start/end if we want a full year)

    res.status(200).json({
      activeYears: calendar.activeYears,
      totalActiveDays: calendar.totalActiveDays,
      streak: calendar.streak,
      contributions: formattedData,
    });
  } catch (error) {
    console.error("LeetCode API Error:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
