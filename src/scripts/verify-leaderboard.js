/**
 * Leaderboard Verification Script
 * 
 * This script verifies the leaderboard functionality by testing:
 * 1. API route encoding
 * 2. API response format
 * 3. Data structure validation
 * 
 * Usage: 
 *   node src/scripts/verify-leaderboard.js
 */

import { get } from 'http';

const BASE_URL = 'http://localhost:3000';
const LEADERBOARD_ROUTE = '/api/leaderboard';
const RANKING_ROUTE = '/api/ranking';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
};

console.log(`${colors.cyan}${colors.bold}====================================${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}     LEADERBOARD VERIFICATION      ${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}====================================${colors.reset}\n`);

// Helper function to fetch API data
function fetchApi(route) {
  return new Promise((resolve, reject) => {
    const url = BASE_URL + route;
    console.log(`${colors.blue}Fetching from: ${colors.white}${url}${colors.reset}`);
    
    const req = get(url, (res) => {
      let data = '';
      
      // Log status code
      const statusColor = res.statusCode >= 200 && res.statusCode < 300 ? colors.green : colors.red;
      console.log(`${statusColor}Status: ${res.statusCode} ${res.statusMessage}${colors.reset}`);
      
      // Collect response data
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      // Process complete response
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          console.log(`${colors.green}✓ Response parsed successfully${colors.reset}`);
          resolve(parsedData);
        } catch (error) {
          console.log(`${colors.red}✗ Failed to parse response: ${error.message}${colors.reset}`);
          console.log(`${colors.red}Raw response: ${data.slice(0, 100)}...${colors.reset}`);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
      reject(error);
    });
    
    req.end();
  });
}

// Validate the data structure
function validateLeaderboardData(data) {
  console.log(`${colors.blue}Validating leaderboard data...${colors.reset}`);
  
  // Check if leaderboardData exists and is an array
  if (!data.leaderboardData || !Array.isArray(data.leaderboardData)) {
    console.log(`${colors.red}✗ leaderboardData is not an array${colors.reset}`);
    return false;
  }
  
  // Check if there are items in the array
  if (data.leaderboardData.length === 0) {
    console.log(`${colors.yellow}⚠ leaderboardData array is empty${colors.reset}`);
    return false;
  }
  
  console.log(`${colors.green}✓ Found ${data.leaderboardData.length} model entries${colors.reset}`);
  
  // Check first item structure
  const firstItem = data.leaderboardData[0];
  console.log(`${colors.blue}Checking model data structure...${colors.reset}`);
  
  const requiredFields = ['model_name', 'overall_score', 'coherence', 'token_overlap', 'length_ratio'];
  const missingFields = requiredFields.filter(field => !(field in firstItem));
  
  if (missingFields.length > 0) {
    console.log(`${colors.red}✗ Missing required fields: ${missingFields.join(', ')}${colors.reset}`);
    return false;
  }
  
  console.log(`${colors.green}✓ All required fields present${colors.reset}`);
  
  // Check field types
  let typeErrors = 0;
  
  if (typeof firstItem.model_name !== 'string') {
    console.log(`${colors.red}✗ model_name should be string, got ${typeof firstItem.model_name}${colors.reset}`);
    typeErrors++;
  }
  
  const scoreFields = ['overall_score', 'coherence', 'token_overlap', 'length_ratio'];
  scoreFields.forEach(field => {
    if (typeof firstItem[field] !== 'number' || firstItem[field] < 0 || firstItem[field] > 1) {
      console.log(`${colors.red}✗ ${field} should be number between 0-1, got ${firstItem[field]} (${typeof firstItem[field]})${colors.reset}`);
      typeErrors++;
    }
  });
  
  if (typeErrors === 0) {
    console.log(`${colors.green}✓ All fields have correct data types${colors.reset}`);
    return true;
  } else {
    console.log(`${colors.red}✗ Found ${typeErrors} type validation errors${colors.reset}`);
    return false;
  }
}

// Validate ranking data
function validateRankingData(data) {
  console.log(`${colors.blue}Validating ranking data...${colors.reset}`);
  
  // Check if rankingData exists
  if (!data.rankingData || typeof data.rankingData !== 'object') {
    console.log(`${colors.red}✗ rankingData is not an object${colors.reset}`);
    return false;
  }
  
  // Check if there are entries
  const rankingKeys = Object.keys(data.rankingData);
  if (rankingKeys.length === 0) {
    console.log(`${colors.yellow}⚠ rankingData has no entries${colors.reset}`);
    return false;
  }
  
  console.log(`${colors.green}✓ Found ${rankingKeys.length} model rankings${colors.reset}`);
  
  // Check if values are numbers
  let valueErrors = 0;
  rankingKeys.forEach(key => {
    if (typeof data.rankingData[key] !== 'number') {
      console.log(`${colors.red}✗ Value for ${key} should be number, got ${typeof data.rankingData[key]}${colors.reset}`);
      valueErrors++;
    }
  });
  
  if (valueErrors === 0) {
    console.log(`${colors.green}✓ All ranking values are numbers${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Found ${valueErrors} ranking value errors${colors.reset}`);
    return false;
  }
  
  // Check trends data if present
  if (data.trendsData) {
    console.log(`${colors.blue}Validating trends data...${colors.reset}`);
    
    // Check if trends exist for each model
    const trendKeys = Object.keys(data.trendsData);
    console.log(`${colors.green}✓ Found ${trendKeys.length} trend entries${colors.reset}`);
    
    // Check if all trends have valid values
    const validTrends = ['up', 'down', 'stable'];
    let trendErrors = 0;
    
    trendKeys.forEach(key => {
      if (!validTrends.includes(data.trendsData[key])) {
        console.log(`${colors.red}✗ Trend for ${key} should be one of ${validTrends.join(', ')}, got ${data.trendsData[key]}${colors.reset}`);
        trendErrors++;
      }
    });
    
    if (trendErrors === 0) {
      console.log(`${colors.green}✓ All trend values are valid${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}✗ Found ${trendErrors} trend value errors${colors.reset}`);
      return false;
    }
  }
  
  return true;
}

// Run the validation
async function runValidation() {
  let success = true;
  
  console.log(`${colors.yellow}Starting validation of leaderboard functionality...${colors.reset}\n`);
  
  try {
    // Test leaderboard API
    console.log(`${colors.cyan}[1/2] Testing leaderboard API${colors.reset}`);
    const leaderboardData = await fetchApi(LEADERBOARD_ROUTE);
    const leaderboardValid = validateLeaderboardData(leaderboardData);
    
    console.log('\n-----------------------------------\n');
    
    // Test ranking API
    console.log(`${colors.cyan}[2/2] Testing ranking API${colors.reset}`);
    const rankingData = await fetchApi(RANKING_ROUTE);
    const rankingValid = validateRankingData(rankingData);
    
    console.log('\n-----------------------------------\n');
    
    // Final summary
    success = leaderboardValid && rankingValid;
    
    if (success) {
      console.log(`${colors.green}${colors.bold}✅ VALIDATION PASSED: All leaderboard components are working correctly!${colors.reset}`);
    } else {
      console.log(`${colors.red}${colors.bold}❌ VALIDATION FAILED: There are issues with the leaderboard functionality.${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}${colors.bold}❌ VALIDATION FAILED: ${error.message}${colors.reset}`);
    success = false;
  }
  
  console.log(`\n${colors.cyan}${colors.bold}====================================${colors.reset}`);
  process.exit(success ? 0 : 1);
}

runValidation();
