/**
 * GeeksforGeeks API Handler
 * ─────────────────────────────────────────────────────────────────────
 * Data scraped dynamically from GeeksforGeeks User Profile page:
 *   - Profile URL: https://www.geeksforgeeks.org/user/{username}/
 *
 * Method: HTML Scraping (no public REST API available)
 *
 * How it works:
 *   1. Fetches the full profile HTML page
 *   2. Locates the embedded `userData` JSON blob in the page source
 *   3. Extracts JSON via brace-matching (handles escaped strings)
 *   4. Returns the parsed `data` object containing:
 *      - score, monthly_score
 *      - total_problems_solved
 *      - institute_rank, institute_name
 *      - pod_solved_current_streak, pod_solved_longest_streak
 *      - pod_solved_global_longest_streak
 *      - pod_correct_submissions_count
 *      - profile_image_url, name, is_campus_ambassador
 * ─────────────────────────────────────────────────────────────────────
 */
export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const profileResponse = await fetch(`https://www.geeksforgeeks.org/user/${username}/`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!profileResponse.ok) {
      return res.status(profileResponse.status).json({ error: `GFG profile fetch failed with status: ${profileResponse.status}` });
    }

    const html = await profileResponse.text();

    // Look for userData script / JSON data in the page
    const key = '"userData"';
    let idx = html.indexOf(key);
    if (idx === -1) {
      idx = html.indexOf('\\"userData\\"');
    }

    if (idx === -1) {
      return res.status(404).json({ error: "GeeksforGeeks user data not found on the profile page" });
    }

    // Extract the JSON object by matching brace counts
    let sub = html.substring(idx);
    let colonIdx = sub.indexOf(':');
    let braceStart = sub.indexOf('{', colonIdx);

    if (braceStart === -1) {
      return res.status(500).json({ error: "Failed to locate JSON start brace for GeeksforGeeks user data" });
    }

    let bracesCount = 0;
    let endedIdx = -1;
    let inString = false;
    let isEscaped = false;

    for (let i = braceStart; i < sub.length; i++) {
      let char = sub[i];
      if (char === '\\' && !isEscaped) {
        isEscaped = true;
        continue;
      }
      if (char === '"' && !isEscaped) {
        inString = !inString;
      }
      if (!inString) {
        if (char === '{') {
          bracesCount++;
        } else if (char === '}') {
          bracesCount--;
          if (bracesCount === 0) {
            endedIdx = i;
            break;
          }
        }
      }
      isEscaped = false;
    }

    if (endedIdx === -1) {
      return res.status(500).json({ error: "Failed to extract complete JSON block for GeeksforGeeks user data" });
    }

    const jsonStr = sub.substring(braceStart, endedIdx + 1);
    let finalJsonStr = jsonStr;
    if (jsonStr.includes('\\"')) {
      finalJsonStr = jsonStr.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }

    const userDataObj = JSON.parse(finalJsonStr);

    if (!userDataObj || !userDataObj.data) {
      return res.status(404).json({ error: "Invalid GeeksforGeeks user data format" });
    }

    // Return the response matching the common coding profile format
    return res.status(200).json({
      info: userDataObj.data,
      username: username
    });

  } catch (err) {
    console.error("GeeksforGeeks API Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
