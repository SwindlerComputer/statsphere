// fetchPlayersFromApi.js
// This script fetches football player data from RapidAPI and saves it as CSV

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
async function fetchPlayersFromApi() {
  try {
    // Step 1: Get API key from environment variables
    const apiKey = process.env.RAPID_API_KEY;
    
    if (!apiKey) {
      console.error("Error: RAPID_API_KEY not found in .env file");
      return;
    }

    // Step 2: Set up the API URL
    const apiUrl = "https://free-api-live-football-data.p.rapidapi.com/football-players-search?search=ronaldo";

    // Step 3: Set up headers for RapidAPI
    const headers = {
      "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
      "x-rapidapi-key": apiKey
    };

    // Step 4: Send GET request to the API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: headers
    });

    // Step 5: Convert response to JSON
    const data = await response.json();

    // Step 6: Check if we have players
    if (!data.players || data.players.length === 0) {
      console.log("No players found");
      return;
    }

    console.log("Found " + data.players.length + " players");

    // Step 7: Create CSV header
    let csvContent = "Player Name,Team Name,League/Country\n";

    // Step 8: Loop through players using for-loop
    for (let i = 0; i < data.players.length; i++) {
      const player = data.players[i];
      
      // Step 9: Extract basic fields from player
      const playerName = player.name || "Unknown";
      const teamName = player.team || "Unknown";
      const leagueOrCountry = player.league || player.country || "Unknown";
      
      // Step 10: Build CSV row using string concatenation
      csvContent = csvContent + playerName + "," + teamName + "," + leagueOrCountry + "\n";
    }

    // Step 11: Set up file path to save CSV
    const projectRoot = path.resolve(__dirname, "../..");
    const outputDir = path.join(projectRoot, "ml", "data", "raw");
    const outputFile = path.join(outputDir, "players_api.csv");

    // Step 12: Create directory if needed
    await fs.mkdir(outputDir, { recursive: true });

    // Step 13: Save CSV file
    await fs.writeFile(outputFile, csvContent, "utf8");

    console.log("CSV file saved successfully!");
    console.log("File location: " + outputFile);

  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Run the function
fetchPlayersFromApi();

