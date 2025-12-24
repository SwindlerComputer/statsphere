// fetchLeaguesAndTeams.js
// This script fetches football leagues and teams from RapidAPI and saves them as CSV files

import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory path (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env file
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

// Main function
async function fetchLeaguesAndTeams() {
  try {
    // Step 1: Get API key from environment variables
    const apiKey = process.env.RAPID_API_KEY;
    
    if (!apiKey) {
      console.error("Error: RAPID_API_KEY not found in .env file");
      return;
    }

    // Step 2: Set up headers for RapidAPI
    const headers = {
      "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
      "x-rapidapi-key": apiKey
    };

    // ============================================
    // PART 1: FETCH LEAGUES
    // ============================================
    
    console.log("Fetching leagues...");

    // Step 3: Set up the API URL for leagues
    const leaguesUrl = "https://free-api-live-football-data.p.rapidapi.com/leagues";

    // Step 4: Send GET request to fetch leagues
    const leaguesResponse = await fetch(leaguesUrl, {
      method: "GET",
      headers: headers
    });

    // Step 5: Convert response to JSON
    const leaguesData = await leaguesResponse.json();

    // Step 6: Check if we have leagues data
    let leaguesArray = [];
    if (leaguesData.leagues) {
      leaguesArray = leaguesData.leagues;
    } else if (Array.isArray(leaguesData)) {
      leaguesArray = leaguesData;
    } else if (leaguesData.data) {
      leaguesArray = leaguesData.data;
    }

    console.log("Found " + leaguesArray.length + " leagues");

    // Step 7: Create CSV header for leagues
    let leaguesCsv = "League Name,Country\n";

    // Step 8: Loop through leagues using for-loop
    for (let i = 0; i < leaguesArray.length; i++) {
      const league = leaguesArray[i];
      
      // Step 9: Extract basic fields from league
      const leagueName = league.name || league.league_name || "Unknown";
      const country = league.country || league.country_name || "Unknown";
      
      // Step 10: Build CSV row using string concatenation
      leaguesCsv = leaguesCsv + leagueName + "," + country + "\n";
    }

    // Step 11: Set up file path to save leagues CSV
    const projectRoot = path.resolve(__dirname, "../..");
    const outputDir = path.join(projectRoot, "ml", "data", "raw");
    const leaguesFile = path.join(outputDir, "leagues_api.csv");

    // Step 12: Create directory if needed
    await fs.mkdir(outputDir, { recursive: true });

    // Step 13: Save leagues CSV file
    await fs.writeFile(leaguesFile, leaguesCsv, "utf8");
    console.log("Leagues CSV saved: " + leaguesFile);

    // ============================================
    // PART 2: FETCH TEAMS
    // ============================================

    console.log("Fetching teams...");

    // Step 14: Set up the API URL for teams
    const teamsUrl = "https://free-api-live-football-data.p.rapidapi.com/teams";

    // Step 15: Send GET request to fetch teams
    const teamsResponse = await fetch(teamsUrl, {
      method: "GET",
      headers: headers
    });

    // Step 16: Convert response to JSON
    const teamsData = await teamsResponse.json();

    // Step 17: Check if we have teams data
    let teamsArray = [];
    if (teamsData.teams) {
      teamsArray = teamsData.teams;
    } else if (Array.isArray(teamsData)) {
      teamsArray = teamsData;
    } else if (teamsData.data) {
      teamsArray = teamsData.data;
    }

    console.log("Found " + teamsArray.length + " teams");

    // Step 18: Create CSV header for teams
    let teamsCsv = "Team Name,League,Country\n";

    // Step 19: Loop through teams using for-loop
    for (let i = 0; i < teamsArray.length; i++) {
      const team = teamsArray[i];
      
      // Step 20: Extract basic fields from team
      const teamName = team.name || team.team_name || "Unknown";
      const league = team.league || team.league_name || "Unknown";
      const country = team.country || team.country_name || "Unknown";
      
      // Step 21: Build CSV row using string concatenation
      teamsCsv = teamsCsv + teamName + "," + league + "," + country + "\n";
    }

    // Step 22: Set up file path to save teams CSV
    const teamsFile = path.join(outputDir, "teams_api.csv");

    // Step 23: Save teams CSV file
    await fs.writeFile(teamsFile, teamsCsv, "utf8");
    console.log("Teams CSV saved: " + teamsFile);

    console.log("All done! Both CSV files saved successfully.");

  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Run the function
fetchLeaguesAndTeams();


