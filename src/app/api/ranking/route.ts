import { NextResponse } from "next/server";
import axios from "axios";

// Fallback mock data if the backend API is unavailable
const mockRankingData = {
  ChatGPT: 0.85,
  Gemini: 0.78, 
  Llama: 0.72
};

// Handler for GET requests
export async function GET() {
  console.log('🔍 DEBUG: Ranking API route called');
  try {
    console.log('API route: Fetching ranking data from backend...');
    console.log('🔍 DEBUG: Attempting to connect to http://localhost:5000/api/ranking');
    // Get the ranking data from the backend
    const response = await axios.get('http://localhost:5000/api/ranking', {
      timeout: 5000 // Set a 5 second timeout to fail faster if backend is unavailable
    });
    
    // Extract ranking data
    const rankingData = response.data.ranking;
    console.log('API route: Successfully fetched ranking data from backend');
    console.log('🔍 DEBUG: Raw backend response:', JSON.stringify(response.data, null, 2));
    console.log('🔍 DEBUG: Extracted ranking data:', JSON.stringify(rankingData, null, 2));
    
    // Calculate trends if available
    const trendsData = calculateTrends(rankingData);
    console.log('🔍 DEBUG: Generated trends data:', JSON.stringify(trendsData, null, 2));
    
    return NextResponse.json({ rankingData, trendsData });
  } catch (error) {
    console.error('Error fetching ranking data:', error);
    console.log('🔍 DEBUG: Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.log('API route: Using mock ranking data due to backend connection issue');
    // Return mock data instead of an error to ensure the frontend works
    const mockedTrendsData = calculateTrends(mockRankingData);
    
    return NextResponse.json({ 
      rankingData: mockRankingData,
      trendsData: mockedTrendsData,
      isMockData: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown error connecting to backend'
    });
  }
}

// Define a type for the ranking data
type RankingDataType = Record<string, number>;

// Calculate trend indicators based on previous data
function calculateTrends(rankingData: RankingDataType) {
  // This is a placeholder for trend calculation logic
  // In a real implementation, this would compare current rankings with historical data
  // to determine if models are trending up, down, or stable
  
  // When using mock data, provide consistent trends rather than random ones
  if (rankingData === mockRankingData) {
    return {
      'ChatGPT': 'up',
      'Gemini': 'stable',
      'Llama': 'up'
    };
  }
  
  const trends: Record<string, string> = {};
  
  // For now, just generate random trends for each model
  for (const model in rankingData) {
    // Randomly assign 'up', 'down', or 'stable'
    const random = Math.random();
    if (random < 0.33) {
      trends[model] = 'up';
    } else if (random < 0.66) {
      trends[model] = 'down';
    } else {
      trends[model] = 'stable';
    }
  }
  
  return trends;
}
