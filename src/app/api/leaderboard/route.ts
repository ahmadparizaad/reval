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

// Get backend URL from environment variable or use default
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || '10000', 10); // Default to 10 seconds

// Transform backend data to frontend format
function transformBackendData(backendData: any[]) {
  return backendData.map(item => ({
    model_name: item.model,
    overall_score: item.avg_score,
    coherence: item.metrics.coherence,
    token_overlap: item.metrics.token_overlap,
    length_ratio: item.metrics.length_ratio,
    user_rating: item.user_rating / 5, // Convert from 5-point scale to 0-1 scale
    evaluation_count: item.total_evaluations
  }));
}

// Handler for GET requests
export async function GET() {
  console.log('🔍 DEBUG: Leaderboard API route called');
  try {
    const backendUrl = `${BACKEND_URL}/api/leaderboard`;
    console.log('API route: Fetching leaderboard data from backend...');
    console.log('🔍 DEBUG: Attempting to connect to', backendUrl);
    
    // Get the leaderboard data from the backend with timeout
    const response = await axios.get(backendUrl, {
      timeout: API_TIMEOUT,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    // Return the leaderboard data
    const backendData = response.data;
    console.log('🔍 DEBUG: Successfully received data from backend');
    
    // Validate the response data structure
    if (!Array.isArray(backendData)) {
      throw new Error('Backend response is not an array');
    }
    
    // Validate each model entry
    const isValidData = backendData.every(item => {
      const requiredFields = ['model', 'avg_score', 'metrics', 'user_rating', 'total_evaluations'];
      const requiredMetrics = ['coherence', 'length_ratio', 'token_overlap'];
      
      return requiredFields.every(field => field in item) &&
        requiredMetrics.every(metric => metric in item.metrics) &&
        typeof item.model === 'string' &&
        typeof item.avg_score === 'number' &&
        typeof item.user_rating === 'number' &&
        typeof item.total_evaluations === 'number';
    });
    
    if (!isValidData) {
      throw new Error('Backend response contains invalid data structure');
    }
    
    // Transform the data to match frontend expectations
    const leaderboardData = transformBackendData(backendData);
    console.log('🔍 DEBUG: Transformed data:', leaderboardData);
    
    return NextResponse.json({ leaderboardData });
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    
    // Provide more detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'Unknown',
      timestamp: new Date().toISOString()
    };
    
    console.log('🔍 DEBUG: Error details:', errorDetails);
    console.log('🔍 DEBUG: Falling back to mock data');
    
    // Return mock data with a flag indicating it's mock data
    return NextResponse.json({ 
      leaderboardData: mockLeaderboardData,
      isMockData: true,
      error: errorDetails
    });
  }
} 