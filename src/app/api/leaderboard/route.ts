import { NextResponse } from "next/server";
import axios from "axios";

// Mock data to use as fallback when backend is unavailable
const mockLeaderboardData = [
  {
    model_name: "ChatGPT",
    overall_score: 0.85,
    coherence: 0.88,
    token_overlap: 0.82,
    length_ratio: 0.79,
    user_rating: 0.90,
    evaluation_count: 124
  },
  {
    model_name: "Gemini",
    overall_score: 0.78,
    coherence: 0.80,
    token_overlap: 0.76,
    length_ratio: 0.75,
    user_rating: 0.82,
    evaluation_count: 98
  },
  {
    model_name: "Llama",
    overall_score: 0.72,
    coherence: 0.74,
    token_overlap: 0.70,
    length_ratio: 0.68,
    user_rating: 0.75,
    evaluation_count: 76
  }
];

// Handler for GET requests
export async function GET() {
  try {
    console.log('API route: Fetching leaderboard data from backend...');
    console.log('🔍 DEBUG: Attempting to connect to http://localhost:5000/api/leaderboard');
    
    const response = await axios.get('http://localhost:5000/api/leaderboard', {
      timeout: 5000
    });
    
    console.log('API route: Successfully fetched leaderboard data from backend');
    console.log('🔍 DEBUG: Raw Flask response:', JSON.stringify(response.data, null, 2));
    console.log('🔍 DEBUG: Response status:', response.status);
    console.log('🔍 DEBUG: Response headers:', response.headers);
    
    const leaderboardData = response.data;
    
    // Validate expected data format
    if (Array.isArray(leaderboardData) && leaderboardData.length > 0) {
      console.log(`🔍 DEBUG: Received ${leaderboardData.length} model entries from Flask`);
      console.log('🔍 DEBUG: First Flask model data:', JSON.stringify(leaderboardData[0], null, 2));
      
      // Transform backend data to match frontend expectations
      const transformedData = leaderboardData.map(item => ({
        model_name: item.model,
        overall_score: item.avg_score,
        coherence: item.metrics.coherence,
        token_overlap: item.metrics.token_overlap,
        length_ratio: item.metrics.length_ratio,
        user_rating: item.user_rating,
        evaluation_count: item.total_evaluations
      }));
      
      // Return the data in the format your frontend expects
      return NextResponse.json({ 
        leaderboardData: transformedData,
        isMockData: false 
      });
    } else {
      console.warn('🔍 DEBUG: Flask returned empty or invalid data format');
      console.log('🔍 DEBUG: Falling back to mock data');
      
      return NextResponse.json({ 
        leaderboardData: mockLeaderboardData,
        isMockData: true,
        errorMessage: 'Flask backend returned empty or invalid data'
      });
    }
    
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    console.log('🔍 DEBUG: Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.log('🔍 DEBUG: Falling back to mock data');
    
    return NextResponse.json({ 
      leaderboardData: mockLeaderboardData,
      isMockData: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown error connecting to backend'
    });
  }
}
