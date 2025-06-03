import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  console.log('🔍 DEBUG: Ranking API route called');
  try {
    console.log('API route: Fetching ranking data from backend...');
    console.log('🔍 DEBUG: Attempting to connect to http://localhost:5000/api/ranking');
    
    const response = await axios.get('http://localhost:5000/api/ranking', {
      timeout: 5000
    });
    
    console.log('API route: Successfully fetched ranking data from backend');
    console.log('🔍 DEBUG: Raw Flask ranking response:', JSON.stringify(response.data, null, 2));
    
    const backendData = response.data;
    
    if (Array.isArray(backendData) && backendData.length > 0) {
      // Transform the backend data to match what your frontend expects
      const rankingData: Record<string, number> = {};
      const trendsData: Record<string, string> = {};
      
      backendData.forEach((item) => {
        const modelName = item.model;
        // Use the correct field name from your backend
        rankingData[modelName] = item.combined_score || item.avg_score || 0;
        
        // Generate trend data based on rank
        if (item.rank === 1) {
          trendsData[modelName] = 'up';
        } else if (item.rank === backendData.length) {
          trendsData[modelName] = 'down';
        } else {
          trendsData[modelName] = 'stable';
        }
      });
      
      console.log('🔍 DEBUG: Transformed ranking data:', rankingData);
      console.log('🔍 DEBUG: Generated trends data:', trendsData);
      
      return NextResponse.json({
        rankingData,
        trendsData,
        isMockData: false
      });
    } else {
      console.warn('🔍 DEBUG: Flask ranking returned empty or invalid data');
      
      const fallbackRankingData = {
        "Gemini": 0.7,
        "ChatGPT": 0.65,
        "Llama": 0.59
      };
      
      const fallbackTrendsData = {
        "Gemini": "up",
        "ChatGPT": "stable", 
        "Llama": "down"
      };
      
      return NextResponse.json({
        rankingData: fallbackRankingData,
        trendsData: fallbackTrendsData,
        isMockData: true,
        errorMessage: 'Flask backend returned empty ranking data'
      });
    }
    
  } catch (error) {
    console.error('Error fetching ranking data:', error);
    console.log('🔍 DEBUG: Error details:', error instanceof Error ? error.message : 'Unknown error');
    
    const fallbackRankingData = {
      "Gemini": 0.7,
      "ChatGPT": 0.65,
      "Llama": 0.59
    };
    
    const fallbackTrendsData = {
      "Gemini": "up",
      "ChatGPT": "stable", 
      "Llama": "down"
    };
    
    return NextResponse.json({
      rankingData: fallbackRankingData,
      trendsData: fallbackTrendsData,
      isMockData: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown error connecting to backend'
    });
  }
}
