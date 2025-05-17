/**
 * API Testing Script
 * 
 * This simple script tests the API routes of the Reval application
 * to verify they're working correctly and properly encoded.
 * 
 * Usage: 
 *   node src/scripts/test-api.js
 */

import { get } from 'http';

const BASE_URL = 'http://localhost:3000';
const ROUTES = [
  '/api/health',
  '/api/leaderboard',
  '/api/ranking'
];

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

console.log(`${colors.cyan}====================================${colors.reset}`);
console.log(`${colors.cyan}       REVAL API ROUTE TESTER       ${colors.reset}`);
console.log(`${colors.cyan}====================================${colors.reset}\n`);

console.log(`${colors.yellow}Testing API routes at: ${colors.white}${BASE_URL}${colors.reset}\n`);

// Test each route sequentially
let completedRequests = 0;

function testRoute(route) {
  const url = BASE_URL + route;
  console.log(`${colors.blue}Testing route: ${colors.white}${route}${colors.reset}`);
  
  const req = get(url, (res) => {
    let data = '';
    
    // Log status code
    const statusColor = res.statusCode >= 200 && res.statusCode < 300 ? colors.green : colors.red;
    console.log(`${statusColor}Status: ${res.statusCode} ${res.statusMessage}${colors.reset}`);
    
    // Log headers for encoding info
    console.log(`${colors.white}Content-Type: ${res.headers['content-type'] || 'not specified'}${colors.reset}`);
    console.log(`${colors.white}Content-Encoding: ${res.headers['content-encoding'] || 'not specified'}${colors.reset}`);
    
    // Collect response data
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    // Process complete response
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        console.log(`${colors.green}Response parsed successfully${colors.reset}`);
        
        // Show a preview of the response
        const preview = JSON.stringify(parsedData, null, 2).slice(0, 200);
        console.log(`${colors.white}Preview: ${preview}${preview.length >= 200 ? '...' : ''}${colors.reset}`);
      } catch (error) {
        console.log(`${colors.red}Failed to parse response: ${error.message}${colors.reset}`);
        console.log(`${colors.red}Raw response: ${data.slice(0, 100)}...${colors.reset}`);
      }
      
      console.log('\n-----------------------------------\n');
      
      completedRequests++;
      if (completedRequests === ROUTES.length) {
        console.log(`${colors.cyan}All tests completed${colors.reset}`);
      }
    });
  });
  
  req.on('error', (error) => {
    console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
    console.log('\n-----------------------------------\n');
    
    completedRequests++;
    if (completedRequests === ROUTES.length) {
      console.log(`${colors.cyan}All tests completed${colors.reset}`);
    }
  });
  
  req.end();
}

// Run tests with a small delay between each
ROUTES.forEach((route, index) => {
  setTimeout(() => {
    testRoute(route);
  }, index * 500); // 500ms delay between each test
});
