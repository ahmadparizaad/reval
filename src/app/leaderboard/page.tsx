"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import axios from 'axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, ArrowDown, Minus, Loader2 } from 'lucide-react';

interface ModelScore {
  model_name: string;
  overall_score: number;
  coherence: number;
  token_overlap: number;
  length_ratio: number;
  user_rating: number;
  evaluation_count: number;
}

type LeaderboardData = ModelScore[];

type RankingData = {
  [key: string]: number;
};

type TrendData = {
  [key: string]: string;
};

// Add a debug logger utility function
function debugLog(area: string, message: string, data?: unknown): void {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
  console.log(`[${timestamp}] 🔍 ${area}: ${message}`);
  if (data !== undefined) {
    if (typeof data === 'object' && data !== null) {
      try {
        // For objects, limit the depth and handle circular references
        const stringifiedData = JSON.stringify(data, (key, value) => {
          if (key === '') return value;
          if (typeof value === 'object' && value !== null) {
            // For nested objects, just return type and keys
            return `[${value.constructor.name}: ${Object.keys(value).join(', ')}]`;
          }
          return value;
        }, 2);
        console.log(`[${timestamp}] 🔍 ${area} data:`, stringifiedData.length > 500 ? 
          stringifiedData.substring(0, 500) + '... (truncated)' : 
          stringifiedData);
      } catch (_error) {
        console.log(`[${timestamp}] 🔍 ${area} data: [Object cannot be stringified]`);
        console.log(_error)
      }
    } else {
      console.log(`[${timestamp}] 🔍 ${area} data:`, data);
    }
  }
};

export default function LeaderboardPage() {  // Mock data to use as fallback
  const mockLeaderboardData = React.useMemo<LeaderboardData>(() => [
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
  ], []);
  // We no longer need mockRankingData as we'll derive it from mockLeaderboardData

  const mockTrendData = React.useMemo<TrendData>(() => ({
    ChatGPT: 'up',
    Gemini: 'stable',
    Llama: 'up'
  }), []);

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('overall_score');
  const [useMockData, setUseMockData] = useState(false);
    const fetchLeaderboardData = React.useCallback(async () => {
    try {
      debugLog('API', 'Starting data fetch process for leaderboard...');
      debugLog('API', 'Fetching leaderboard data from API endpoint');
      const leaderboardRes = await axios.get('/api/leaderboard');
      debugLog('API', 'Received leaderboard data response', leaderboardRes.data);
      
      // Analyze the data structure to help with debugging
      const analyzeDataStructure = (data: unknown): string => {
        if (data === null) return 'null';
        if (data === undefined) return 'undefined';
        if (Array.isArray(data)) {
          return `Array(${data.length}) of ${data.length > 0 ? typeof data[0] : 'empty'}`;
        }
        if (typeof data === 'object') {
          return `Object with keys: ${Object.keys(data as object).join(', ')}`;
        }
        return typeof data;
      };
      
      debugLog('API', 'Leaderboard data structure analysis', {
        responseType: analyzeDataStructure(leaderboardRes.data),
        leaderboardData: leaderboardRes.data.leaderboardData ? 
          analyzeDataStructure(leaderboardRes.data.leaderboardData) : 'not found',
        isMockData: leaderboardRes.data.isMockData ? 'true' : 'false'
      });
      
      if (leaderboardRes.data.leaderboardData) {
        console.log('🔍 DEBUG: Leaderboard data format check:', {
          isArray: Array.isArray(leaderboardRes.data.leaderboardData),
          length: leaderboardRes.data.leaderboardData.length,
          firstItem: leaderboardRes.data.leaderboardData[0],
          expectedKeys: ['model_name', 'overall_score', 'coherence', 'token_overlap', 'length_ratio']
        });
          // Add validation for each required field in the data
        const dataIsValid = Array.isArray(leaderboardRes.data.leaderboardData) && 
          leaderboardRes.data.leaderboardData.every((model: Record<string, unknown>) => {
            const requiredFields = ['model_name', 'overall_score', 'coherence', 'token_overlap', 'length_ratio'];
            const hasAllRequiredFields = requiredFields.every(field => field in model);
            
            // Check data types and reasonable value ranges
            const isValidData = typeof model.model_name === 'string' &&
              typeof model.overall_score === 'number' && model.overall_score >= 0 && model.overall_score <= 1 &&
              typeof model.coherence === 'number' && model.coherence >= 0 && model.coherence <= 1 &&
              typeof model.token_overlap === 'number' && model.token_overlap >= 0 && model.token_overlap <= 1 &&
              typeof model.length_ratio === 'number' && model.length_ratio >= 0 && model.length_ratio <= 1;
            
            if (!hasAllRequiredFields) {
              console.warn('🔍 DEBUG: Missing required fields in model data:', 
                requiredFields.filter(field => !(field in model)));
            }
            
            if (!isValidData && hasAllRequiredFields) {
              console.warn('🔍 DEBUG: Invalid data types or ranges in model:', model.model_name);
            }
            
            return hasAllRequiredFields && isValidData;
          });
        
        if (!dataIsValid) {
          console.warn('🔍 DEBUG: Received invalid leaderboard data format, falling back to mock data');
          setLeaderboardData(mockLeaderboardData);
          setUseMockData(true);
        } else {
          console.log('🔍 DEBUG: Leaderboard data validation passed, using received data');
          setLeaderboardData(leaderboardRes.data.leaderboardData);
          
          // Convert array data to ranking data format
          const convertedRankingData: RankingData = {};
          leaderboardRes.data.leaderboardData.forEach((model: ModelScore) => {
            convertedRankingData[model.model_name] = model.overall_score;
          });
          setRankingData(convertedRankingData);
          console.log('🔍 DEBUG: Converted ranking data:', convertedRankingData);
          
          // Check if we're using mock data from the API
          if (leaderboardRes.data.isMockData) {
            console.log('🔍 DEBUG: Using mock data from API');
            setUseMockData(true);
          } else {
            console.log('🔍 DEBUG: Using real data from backend');
            setUseMockData(false);
          }
        }
      } else {
        console.warn('No leaderboard data received, using mock data');
        setLeaderboardData(mockLeaderboardData);
        
        // Convert the mock data to ranking format
        const convertedRankingData: RankingData = {};
        mockLeaderboardData.forEach((model) => {
          convertedRankingData[model.model_name] = model.overall_score;
        });
        setRankingData(convertedRankingData);
        
        setUseMockData(true);
      }
        // For real implementation - fetch trend data from a separate endpoint
      // For now, we'll generate trend data based on models or use mock data
      try {
        console.log('🔍 DEBUG: Fetching ranking/trend data...');
        console.log('Fetching ranking data...');
        const rankingRes = await axios.get('/api/ranking');
        console.log('Ranking API response:', rankingRes.data);
        console.log('🔍 DEBUG: Ranking raw data structure:', JSON.stringify(rankingRes.data, null, 2));
        
        if (rankingRes.data.trendsData) {
          console.log('🔍 DEBUG: Trend data received:', rankingRes.data.trendsData);
          setTrendData(rankingRes.data.trendsData);
          // Only set mock data flag if not already set
          if (rankingRes.data.isMockData && !leaderboardRes.data.isMockData) {
            setUseMockData(true);
          }
        } else {
          console.warn('No trend data received, generating trend data');
          // Generate trend data from the model names in leaderboard data
          const generatedTrends: TrendData = {};
          leaderboardRes.data.leaderboardData.forEach((model: ModelScore, index: number) => {
            // Alternate between trends for demonstration
            generatedTrends[model.model_name] = index % 3 === 0 ? 'up' : (index % 3 === 1 ? 'down' : 'stable');
          });
          console.log('🔍 DEBUG: Generated trend data:', generatedTrends);
          setTrendData(generatedTrends);
        }
      } catch (error) {
        console.warn('Error fetching trend data, generating mock trends', error);
        console.log('🔍 DEBUG: Error details:', error instanceof Error ? error.message : 'Unknown error');
        // Generate trend data from the leaderboard data we just fetched
        const generatedTrends: TrendData = {};
        // Use the leaderboard data from the response instead of the state
        if (leaderboardRes.data.leaderboardData) {
          leaderboardRes.data.leaderboardData.forEach((model: ModelScore, index: number) => {
            // Alternate between trends for demonstration
            generatedTrends[model.model_name] = index % 3 === 0 ? 'up' : (index % 3 === 1 ? 'down' : 'stable');
          });
        } else {
          // Fallback to mock data if needed
          mockLeaderboardData.forEach((model, index) => {
            generatedTrends[model.model_name] = index % 3 === 0 ? 'up' : (index % 3 === 1 ? 'down' : 'stable');
          });
        }
        setTrendData(generatedTrends);
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      console.warn('Using mock data due to API errors');
      setLeaderboardData(mockLeaderboardData);
      
      // Convert the mock data to ranking format
      const convertedRankingData: RankingData = {};
      mockLeaderboardData.forEach((model) => {
        convertedRankingData[model.model_name] = model.overall_score;
      });
      setRankingData(convertedRankingData);
      
      // Generate trend data
      const generatedTrends: TrendData = {};
      mockLeaderboardData.forEach((model) => {
        generatedTrends[model.model_name] = mockTrendData[model.model_name] || 'stable';
      });
      setTrendData(generatedTrends);      
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  }, [mockLeaderboardData, mockTrendData]); // Removed leaderboardData from dependencies

  // Add debugging logs for component renders and effects
  useEffect(() => {
    console.log('🔍 DEBUG: Component mounted, starting initial data fetch');
    fetchLeaderboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debug rendered data
  useEffect(() => {
    console.log('🔍 DEBUG: Data state updated:', { 
      hasLeaderboardData: !!leaderboardData, 
      leaderboardItemCount: leaderboardData?.length || 0,
      hasRankingData: !!rankingData, 
      hasTrendData: !!trendData,
      isUsingMockData: useMockData,
      activeMetric
    });
    
    if (leaderboardData && leaderboardData.length > 0) {
      console.log('🔍 DEBUG: First leaderboard item:', leaderboardData[0]);
    }
  }, [leaderboardData, rankingData, trendData, useMockData, activeMetric]);

  const formatLeaderboardData = (data: LeaderboardData | null, metric: string) => {
    if (!data) return [];
    
    try {
      return data.map(model => ({
        name: model.model_name,
        value: model[metric as keyof ModelScore] as number || 0
      }));
    } catch (error) {
      console.error('Error formatting leaderboard data:', error);
      return [];
    }
  };
  const formatRadarData = (data: LeaderboardData | null) => {
    console.log('🔍 DEBUG: Starting formatRadarData function');
    console.log('🔍 DEBUG: Input data to formatRadarData:', data ? `${data.length} items` : 'null');
    
    if (!data) {
      console.log('🔍 DEBUG: No data provided to formatRadarData, returning empty array');
      return [];
    }
    
    try {
      // Create a map for easier access to model data
      const modelMap: Record<string, ModelScore> = {};
      data.forEach(model => {
        modelMap[model.model_name] = model;
      });
      
      // Get model names dynamically
      const modelNames = data.map(model => model.model_name);
      console.log('🔍 DEBUG: Model names extracted:', modelNames);
      
      // Create radar chart data structure
      const radarData = [
        { 
          subject: 'Overall Score',
          ...modelNames.reduce((acc, name) => ({ 
            ...acc, 
            [name]: modelMap[name]?.overall_score || 0 
          }), {})
        },
        { 
          subject: 'Coherence',
          ...modelNames.reduce((acc, name) => ({ 
            ...acc, 
            [name]: modelMap[name]?.coherence || 0 
          }), {})
        },
        { 
          subject: 'Token Overlap',
          ...modelNames.reduce((acc, name) => ({ 
            ...acc, 
            [name]: modelMap[name]?.token_overlap || 0 
          }), {})
        },
        { 
          subject: 'Length Ratio',
          ...modelNames.reduce((acc, name) => ({ 
            ...acc, 
            [name]: modelMap[name]?.length_ratio || 0 
          }), {})
        },
        { 
          subject: 'User Rating',
          ...modelNames.reduce((acc, name) => ({ 
            ...acc, 
            [name]: modelMap[name]?.user_rating || 0 
          }), {})
        }
      ];
      
      console.log('🔍 DEBUG: Formatted radar data structure:', 
        radarData.length > 0 ? 
        `Generated ${radarData.length} metrics with ${modelNames.length} models each` : 
        'Empty radar data');
      
      console.log('🔍 DEBUG: First radar data item:', radarData[0]);
      
      return radarData;
    } catch (error) {
      console.error('Error formatting radar data:', error);
      console.log('🔍 DEBUG: Error details:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  };

  const getTrendIcon = (model: string) => {
    if (!trendData || !trendData[model]) return <Minus className="ml-2" size={16} />;
    
    switch (trendData[model]) {
      case 'up':
        return <ArrowUp className="ml-2 text-green-500" size={16} />;
      case 'down':
        return <ArrowDown className="ml-2 text-red-500" size={16} />;
      default:
        return <Minus className="ml-2 text-gray-500" size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">LLM Performance Leaderboard</h1>
        
        <button 
          onClick={() => {
            setLoading(true);
            // Clear existing data
            setLeaderboardData(null);
            setRankingData(null);
            setTrendData(null);
            setUseMockData(false);
            
            // Trigger a re-fetch
            setTimeout(() => {
              fetchLeaderboardData();
            }, 300);
          }} 
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21h5v-5" />
          </svg>
          Refresh Data
        </button>
      </div>
        {useMockData && (
        <div className="p-4 mb-4 border border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 dark:border-yellow-700 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Using demonstration data because the backend API is not available. Chart visualizations are still showing with sample data.
              </p>
              <p className="text-xs mt-1 text-yellow-700 dark:text-yellow-300">
                The backend server at http://localhost:5000 may not be running. Check your connection or start the backend server.
              </p>
            </div>
            <button 
              onClick={() => {
                setLoading(true);
                // We'll force a refresh by setting the states back to null
                setLeaderboardData(null);
                setRankingData(null);
                setTrendData(null);
                setUseMockData(false);
                
                // Then trigger a re-fetch after a small delay
                setTimeout(() => {
                  fetchLeaderboardData();
                }, 300);
              }} 
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm whitespace-nowrap ml-4"
            >
              Try Backend
            </button>
          </div>
        </div>
      )}
      
      {/* Rankings Section */}
      <Card className="p-6 mb-8 backdrop-blur-sm bg-white bg-opacity-80 border shadow-lg dark:bg-gray-900 dark:border-gray-800">
        <h2 className="text-2xl font-semibold mb-4">Current Rankings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rankingData && Object.entries(rankingData)
            .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
            .map(([model, score], index) => (
              <Card key={model} className={`p-4 border ${
                index === 0 
                  ? 'bg-gradient-to-br from-yellow-50 to-amber-100 border-amber-200 dark:from-amber-900/30 dark:to-amber-800/20 dark:border-amber-700/50' 
                  : index === 1 
                    ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 dark:from-gray-800/30 dark:to-gray-700/20 dark:border-gray-600/50' 
                    : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:from-orange-900/30 dark:to-orange-800/20 dark:border-orange-700/50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold mr-2">#{index + 1}</span>
                    <span className="text-lg font-medium">{model}</span>
                    {getTrendIcon(model)}
                  </div>
                  <span className="text-xl font-bold">{score?.toFixed(2)}</span>
                </div>
              </Card>
            ))}
        </div>
      </Card>
      
      {/* Metrics Visualization */}
      <Tabs defaultValue="bar" className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          <TabsTrigger value="radar">Radar Chart</TabsTrigger>
        </TabsList>        <TabsContent value="bar" className="mt-4">
          <Card className="p-6 backdrop-blur-sm bg-white bg-opacity-80 border shadow-lg dark:bg-gray-900 dark:border-gray-800">
            {loading ? (
              <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Loading chart data...</span>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Select Metric:</h3>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setActiveMetric('overall_score')}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        activeMetric === 'overall_score' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      Overall Score
                    </button>
                    <button 
                      onClick={() => setActiveMetric('coherence')}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        activeMetric === 'coherence' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      Coherence
                    </button>
                    <button 
                      onClick={() => setActiveMetric('token_overlap')}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        activeMetric === 'token_overlap' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      Token Overlap
                    </button>
                    <button 
                      onClick={() => setActiveMetric('length_ratio')}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        activeMetric === 'length_ratio' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      Length Ratio
                    </button>
                    <button 
                      onClick={() => setActiveMetric('user_rating')}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        activeMetric === 'user_rating' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      User Rating
                    </button>
                  </div>
                </div>
                <div className="h-[400px] w-full">                  {(() => {
                    try {
                      // Ensure we have data to display
                      const chartData = formatLeaderboardData(leaderboardData, activeMetric);
                      if (!chartData || chartData.length === 0) {
                        return (
                          <div className="flex h-full items-center justify-center text-gray-500">
                            <p>No data available for visualization</p>
                          </div>
                        );
                      }
                      
                      // Check if the required properties exist in each data item
                      const isValidData = chartData.every(item => 
                        item && typeof item === 'object' && 
                        'name' in item && 
                        'value' in item && 
                        typeof item.value === 'number'
                      );
                      
                      if (!isValidData) {
                        console.error('Invalid chart data format:', chartData);
                        return (
                          <div className="flex h-full flex-col items-center justify-center text-red-500">
                            <p className="font-semibold">Data format error</p>
                            <p className="text-sm text-gray-500 mt-2">The data structure is not compatible with the chart</p>
                          </div>
                        );
                      }
                      
                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 1]} />
                            <YAxis type="category" dataKey="name" width={80} />
                            <Tooltip formatter={(value) => [(value as number).toFixed(3), 'Score']} />
                            <Legend />
                            <Bar
                              dataKey="value"
                              fill={
                                activeMetric === 'overall_score' ? '#3b82f6' :
                                activeMetric === 'coherence' ? '#10b981' :
                                activeMetric === 'token_overlap' ? '#f59e0b' :
                                activeMetric === 'length_ratio' ? '#ef4444' :
                                '#8b5cf6'
                              }
                              radius={[0, 4, 4, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      );
                    } catch (error) {
                      console.error('Error rendering bar chart:', error);
                      return (
                        <div className="flex h-full flex-col items-center justify-center text-red-500">
                          <p className="font-semibold">Error displaying chart</p>
                          <p className="text-sm text-gray-500 mt-2">There was an issue rendering this chart component</p>
                          {error instanceof Error && (
                            <p className="text-xs text-gray-400 mt-1 max-w-md text-center">
                              {error.message}
                            </p>
                          )}
                        </div>
                      );
                    }
                  })()}
                </div>
              </>
            )}
          </Card>
        </TabsContent>
          <TabsContent value="radar" className="mt-4">
          <Card className="p-6 backdrop-blur-sm bg-white bg-opacity-80 border shadow-lg dark:bg-gray-900 dark:border-gray-800">
            {loading ? (
              <div className="flex h-[500px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Loading radar chart data...</span>
              </div>
            ) : (
              <div className="h-[500px] w-full">                {(() => {
                  try {
                    console.log('🔍 DEBUG: Rendering radar chart component');
                    // Ensure we have data to display
                    const radarData = formatRadarData(leaderboardData);
                    if (!radarData || radarData.length === 0) {
                      console.log('🔍 DEBUG: No radar data available for rendering');
                      return (
                        <div className="flex h-full items-center justify-center text-gray-500">
                          <p>No data available for visualization</p>
                        </div>
                      );
                    }
                    
                    // Get model names from data for validation
                    const modelNames = leaderboardData ? leaderboardData.map(model => model.model_name) : [];
                    console.log('🔍 DEBUG: Model names for RadarChart:', modelNames);
                    
                    // Check if the required properties exist in each data item
                    const isValidData = radarData.every(item => 
                      item && typeof item === 'object' && 
                      'subject' in item && 
                      // Check that all model names are present in each item
                      modelNames.every(name => name in item)
                    );
                    
                    if (!isValidData) {
                      console.error('Invalid radar chart data format:', radarData);
                      console.log('🔍 DEBUG: Radar data validation failed');
                      return (
                        <div className="flex h-full flex-col items-center justify-center text-red-500">
                          <p className="font-semibold">Data format error</p>
                          <p className="text-sm text-gray-500 mt-2">The data structure is not compatible with the radar chart</p>
                        </div>
                      );
                    }
                    
                    console.log('🔍 DEBUG: Radar data validation passed, rendering chart');
                    
                    // Define colors for different models
                    const modelColors: Record<string, {stroke: string, fill: string}> = {
                      'ChatGPT': { stroke: '#3b82f6', fill: '#3b82f6' },
                      'Gemini': { stroke: '#ef4444', fill: '#ef4444' },
                      'Llama': { stroke: '#f59e0b', fill: '#f59e0b' },
                      // Fallback colors for any additional models
                      'default1': { stroke: '#8b5cf6', fill: '#8b5cf6' },
                      'default2': { stroke: '#10b981', fill: '#10b981' },
                      'default3': { stroke: '#6366f1', fill: '#6366f1' }
                    };                      return (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart outerRadius={150} data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis domain={[0, 1]} />
                          <Tooltip formatter={(value) => [(value as number).toFixed(3), 'Score']} />
                          {modelNames.map((modelName, index) => {
                            const color = modelColors[modelName] || 
                                          modelColors[`default${(index % 3) + 1}`] || 
                                          { stroke: '#888888', fill: '#888888' };
                            
                            return (
                              <Radar 
                                key={modelName}
                                name={modelName} 
                                dataKey={modelName} 
                                stroke={color.stroke} 
                                fill={color.fill} 
                                fillOpacity={0.4} 
                              />
                            );                          })}
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    );
                  } catch (error) {
                    console.error('Error rendering radar chart:', error);
                    return (
                      <div className="flex h-full flex-col items-center justify-center text-red-500">
                        <p className="font-semibold">Error displaying radar chart</p>
                        <p className="text-sm text-gray-500 mt-2">There was an issue rendering this chart component</p>
                        {error instanceof Error && (
                          <p className="text-xs text-gray-400 mt-1 max-w-md text-center">
                            {error.message}
                          </p>
                        )}
                      </div>
                    );
                  }
                })()}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
