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
      instance: "/api/gfg",
      resolution_hint: "Use HTTP GET with username query parameter.",
    });
  }

  const { username } = req.query;
  const handle = username || "urvagandhi";

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const [profileResponse, submissionsResponse, potdResponse] =
      await Promise.all([
        fetch(`https://www.geeksforgeeks.org/user/${username}/`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        }).catch((err) => {
          console.error("Profile fetch error:", err);
          return null;
        }),
        fetch(
          `https://practiceapi.geeksforgeeks.org/api/v1/user/problems/submissions/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            body: JSON.stringify({ handle: username }),
          },
        ).catch((err) => {
          console.error("Submissions fetch error:", err);
          return null;
        }),
        fetch(
          `https://practiceapi.geeksforgeeks.org/api/v1/problems-of-day/problem/today/`,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          },
        ).catch((err) => {
          console.error("POTD fetch error:", err);
          return null;
        }),
      ]);

    if (!profileResponse || !profileResponse.ok) {
      const status = profileResponse ? profileResponse.status : 500;
      return res.status(status).json({ error: `GFG profile fetch failed` });
    }

    let submissionsData = null;
    if (submissionsResponse && submissionsResponse.ok) {
      try {
        const body = await submissionsResponse.json();
        submissionsData = body.result;
      } catch (e) {
        console.error("Failed to parse GFG submissions JSON:", e);
      }
    }

    let potdData = null;
    if (potdResponse && potdResponse.ok) {
      try {
        potdData = await potdResponse.json();
      } catch (e) {
        console.error("Failed to parse GFG POTD JSON:", e);
      }
    }

    const html = await profileResponse.text();

    // Look for indicators of GFG user data (e.g., mentor, articleCount, userData) in the page
    let idx = html.indexOf('"mentor"');
    if (idx === -1) idx = html.indexOf('\\"mentor\\"');
    if (idx === -1) idx = html.indexOf('"articleCount"');
    if (idx === -1) idx = html.indexOf('\\"articleCount\\"');
    if (idx === -1) idx = html.indexOf('"userData"');
    if (idx === -1) idx = html.indexOf('\\"userData\\"');

    let userDataObj = null;
    let mentorDataObj = null;
    let parsedParentObj = null;

    if (idx !== -1) {
      // Find the start of the self.__next_f.push command containing this data block if possible
      let startSearch = Math.max(0, idx - 30);
      const pushIdx = html.lastIndexOf("self.__next_f.push(", idx);
      if (pushIdx !== -1 && pushIdx < idx) {
        startSearch = pushIdx;
      }

      let sub = html.substring(startSearch);
      let braceStart = sub.indexOf("{");
      if (braceStart !== -1) {
        let bracesCount = 0;
        let endedIdx = -1;
        let inString = false;
        let isEscaped = false;

        for (let i = braceStart; i < sub.length; i++) {
          let char = sub[i];
          if (char === "\\" && !isEscaped) {
            isEscaped = true;
            continue;
          }
          if (char === '"' && !isEscaped) {
            inString = !inString;
          }
          if (!inString) {
            if (char === "{") {
              bracesCount++;
            } else if (char === "}") {
              bracesCount--;
              if (bracesCount === 0) {
                endedIdx = i;
                break;
              }
            }
          }
          isEscaped = false;
        }

        if (endedIdx !== -1) {
          const jsonStr = sub.substring(braceStart, endedIdx + 1);
          let finalJsonStr = jsonStr;
          if (jsonStr.includes('\\"')) {
            finalJsonStr = jsonStr.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
          }
          try {
            parsedParentObj = JSON.parse(finalJsonStr);
            if (parsedParentObj) {
              userDataObj = parsedParentObj.userData || null;
              mentorDataObj = parsedParentObj.mentor || null;
            }
          } catch (e) {
            console.error("Failed to parse mentor parent JSON:", e);
          }
        }
      }
    }

    // Fallback parser: if mentor-based parsing failed or was not found, search specifically for userData
    if (!userDataObj) {
      const key = '"userData"';
      let uIdx = html.indexOf(key);
      if (uIdx === -1) {
        uIdx = html.indexOf('\\"userData\\"');
      }

      if (uIdx === -1) {
        return res.status(404).json({
          error: "GeeksforGeeks user data not found on the profile page",
        });
      }

      let sub = html.substring(uIdx);
      let colonIdx = sub.indexOf(":");
      let braceStart = sub.indexOf("{", colonIdx);

      if (braceStart === -1) {
        return res.status(500).json({
          error:
            "Failed to locate JSON start brace for GeeksforGeeks user data",
        });
      }

      let bracesCount = 0;
      let endedIdx = -1;
      let inString = false;
      let isEscaped = false;

      for (let i = braceStart; i < sub.length; i++) {
        let char = sub[i];
        if (char === "\\" && !isEscaped) {
          isEscaped = true;
          continue;
        }
        if (char === '"' && !isEscaped) {
          inString = !inString;
        }
        if (!inString) {
          if (char === "{") {
            bracesCount++;
          } else if (char === "}") {
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
        return res.status(500).json({
          error:
            "Failed to extract complete JSON block for GeeksforGeeks user data",
        });
      }

      const jsonStr = sub.substring(braceStart, endedIdx + 1);
      let finalJsonStr = jsonStr;
      if (jsonStr.includes('\\"')) {
        finalJsonStr = jsonStr.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
      }

      try {
        userDataObj = JSON.parse(finalJsonStr);
      } catch (e) {
        console.error("Failed to parse fallback userData JSON:", e);
      }
    }

    // Resolve reference pointer in userData.data if needed
    let finalUserData = null;
    if (userDataObj && userDataObj.data) {
      if (typeof userDataObj.data === "object") {
        finalUserData = userDataObj.data;
      } else if (typeof userDataObj.data === "string") {
        // Next.js RSC reference format like "$6:props:articleCount"
        const parts = userDataObj.data.split(":");
        const propName = parts[parts.length - 1];
        if (parsedParentObj && parsedParentObj[propName]) {
          finalUserData = parsedParentObj[propName];
        } else if (parsedParentObj && parsedParentObj.articleCount) {
          finalUserData = parsedParentObj.articleCount;
        }
      }
    }

    // If finalUserData is still not resolved, check if we parsed the parent object and can get articleCount
    if (!finalUserData && parsedParentObj && parsedParentObj.articleCount) {
      finalUserData = parsedParentObj.articleCount;
    }

    if (!finalUserData) {
      return res
        .status(404)
        .json({ error: "Invalid GeeksforGeeks user data format" });
    }

    const extractProblemStats = (result) => {
      const stats = {
        School: 0,
        Basic: 0,
        Easy: 0,
        Medium: 0,
        Hard: 0,
      };
      if (result && typeof result === "object") {
        for (const key of Object.keys(stats)) {
          if (result[key] && typeof result[key] === "object") {
            stats[key] = Object.keys(result[key]).length;
          }
        }
      }
      return stats;
    };

    const problemStats = extractProblemStats(submissionsData);

    const mergedInfo = {
      ...finalUserData,
      ...problemStats,
    };

    // Return the response matching the common coding profile format
    return res.status(200).json({
      info: mergedInfo,
      mentor: mentorDataObj,
      username: username,
      /* POTD temporarily commented out
      potd: potdData ? {
        title: potdData.problem_name,
        link: potdData.problem_url,
        difficulty: potdData.difficulty
      } : null
      */
      potd: null,
    });
  } catch (err) {
    console.error("GeeksforGeeks API Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
