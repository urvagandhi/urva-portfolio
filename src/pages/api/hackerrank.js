/**
 * HackerRank API Handler
 * ─────────────────────────────────────────────────────────────────────
 * Data fetched dynamically from HackerRank REST API endpoints:
 *   - Profile:  /rest/contests/master/hackers/{username}/profile
 *   - Badges:   /rest/hackers/{username}/badges
 *   - Scores:   /rest/hackers/{username}/scores_elo
 *
 * Method: REST (public endpoints, no auth required)
 *
 * Note: Certificates are NOT included — the certificate endpoint
 *       (hacker_certificate?username=...) 404s and the actual API
 *       is likely GraphQL or an internal endpoint. Can be added
 *       once the correct request URL is discovered via DevTools.
 * ─────────────────────────────────────────────────────────────────────
 */
export default async function handler(req, res) {
  const { username } = req.query;
  const user = username || "urvagandhi24";

  try {
    const [profileRes, badgesRes, scoresRes] = await Promise.all([
      fetch(
        `https://www.hackerrank.com/rest/contests/master/hackers/${user}/profile`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        }
      ),
      fetch(
        `https://www.hackerrank.com/rest/hackers/${user}/badges`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        }
      ),
      fetch(
        `https://www.hackerrank.com/rest/hackers/${user}/scores_elo`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        }
      )
    ]);

    if (!profileRes.ok) {
      return res.status(profileRes.status).json({ error: `HackerRank profile fetch failed with status: ${profileRes.status}` });
    }

    const profileJson = await profileRes.json();
    const badgesJson = await badgesRes.json();
    const scoresJson = await scoresRes.json();

    const profile = profileJson.model || {};
    const badgesRaw = badgesJson.models || [];
    const scoresRaw = scoresJson || [];

    // Cache responses
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=300"
    );

    res.status(200).json({
      // Structured profile card data
      profile: {
        id: profile.id,
        name: profile.name,
        username: profile.username,
        title: profile.title,
        headline: profile.jobs_headline,
        country: profile.country,
        location: profile.location,
        level: profile.level,
        avatar: profile.avatar,
      },

      // Normalized badges with star counts and ranks
      badges: badgesRaw.map((badge) => ({
        name: badge.badge_name,
        type: badge.badge_type,
        stars: badge.stars,
        totalStars: badge.total_stars,
        points: badge.current_points,
        rank: badge.hacker_rank,
        solved: badge.solved,
        totalChallenges: badge.total_challenges,
      })),

      // Only skills with actual practice activity (filter out zero-score entries)
      skills: scoresRaw
        .filter(skill => (skill.practice?.score ?? 0) > 0)
        .map(skill => ({
          name: skill.name,
          slug: skill.slug,
          score: skill.practice.score,
          rank: skill.practice.rank,
        })),

      // Placeholder for future certificate discovery
      certificates: [],
    });
  } catch (err) {
    console.error("HackerRank API Error:", err);
    res.status(500).json({
      error: "Failed to fetch HackerRank data"
    });
  }
}
