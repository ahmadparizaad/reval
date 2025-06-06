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
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, ArrowDown, Minus, Loader2 } from 'lucide-react';

// Add interface for historical data
interface HistoricalDataPoint {
  date: string;
  ChatGPT: number;
  Gemini: number;
  Llama: number;
  timestamp?: number;
}

// Add to your existing interfaces
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
        const stringifiedData = JSON.stringify(data, (key, value) => {
          if (key === '') return value;
          if (typeof value === 'object' && value !== null) {
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

export default function LeaderboardPage() {
  // Mock data to use as fallback
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

  const mockTrendData = React.useMemo<TrendData>(() => ({
    ChatGPT: 'up',
    Gemini: 'stable',
    Llama: 'up'
  }), []);

  // Add mock historical data
  const mockHistoricalData = React.useMemo<HistoricalDataPoint[]>(() => {
    const data: HistoricalDataPoint[] = [];
    const now = new Date();
    
    // Generate 30 days of historical data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Simulate some realistic trends
      const baseDay = 29 - i;
      const chatGPTBase = 0.75 + (Math.sin(baseDay * 0.1) * 0.1) + (baseDay * 0.003);
      const geminiBase = 0.70 + (Math.cos(baseDay * 0.12) * 0.08) + (baseDay * 0.004);
      const llamaBase = 0.65 + (Math.sin(baseDay * 0.08) * 0.07) + (baseDay * 0.005);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ChatGPT: Math.min(1, Math.max(0, chatGPTBase + (Math.random() - 0.5) * 0.05)),
        Gemini: Math.min(1, Math.max(0, geminiBase + (Math.random() - 0.5) * 0.05)),
        Llama: Math.min(1, Math.max(0, llamaBase + (Math.random() - 0.5) * 0.05)),
        timestamp: date.getTime()
      });
    }
    
    return data;
  }, []);

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('overall_score');
  const [useMockData, setUseMockData] = useState(false);

//   const metricDescriptions = {
//   overall_score: "Composite score across all evaluation criteria",
//   coherence: "Logical flow and consistency of responses",
//   token_overlap: "Similarity and redundancy analysis", 
//   length_ratio: "Response length appropriateness",
//   user_rating: "Average user satisfaction rating"
// };

  // Add function to fetch historical data
  const fetchHistoricalData = React.useCallback(async () => {
    try {
      debugLog('API', 'Fetching historical trend data...');
      const response = await axios.get('/api/trends');
      
      if (response.data && Array.isArray(response.data)) {
        setHistoricalData(response.data);
        debugLog('API', 'Historical data fetched successfully', response.data.length);
      } else {
        console.warn('No historical data available, using mock data');
        setHistoricalData(mockHistoricalData);
      }
    } catch (error) {
      console.warn('Error fetching historical data, using mock data', error);
      setHistoricalData(mockHistoricalData);
    }
  }, [mockHistoricalData]);

  // Update your existing fetchLeaderboardData function
  const fetchLeaderboardData = React.useCallback(async () => {
    try {
      debugLog('API', 'Starting data fetch process for leaderboard...');
      debugLog('API', 'Fetching leaderboard data from API endpoint');
      const leaderboardRes = await axios.get('/api/leaderboard');
      debugLog('API', 'Received leaderboard data response', leaderboardRes.data);
      
      // Your existing leaderboard fetching logic...
      if (leaderboardRes.data.leaderboardData) {
        setLeaderboardData(leaderboardRes.data.leaderboardData);
        setUseMockData(leaderboardRes.data.isMockData || false);
      } else {
        setLeaderboardData(mockLeaderboardData);
        setUseMockData(true);
      }

      // Fetch historical data
      await fetchHistoricalData();

      // Your existing ranking data logic...
      try {
        const rankingRes = await axios.get('/api/ranking');
        if (rankingRes.data.rankingData && rankingRes.data.trendsData) {
          setRankingData(rankingRes.data.rankingData);
          setTrendData(rankingRes.data.trendsData);
        }
      } catch (error) {
        console.warn('Error fetching ranking data, generating mock data', error);
        const generatedRanking: RankingData = {};
        const generatedTrends: TrendData = {};
        
        mockLeaderboardData.forEach((model, index) => {
          generatedRanking[model.model_name] = model.overall_score;
          generatedTrends[model.model_name] = index % 3 === 0 ? 'up' : (index % 3 === 1 ? 'down' : 'stable');
        });
        
        setRankingData(generatedRanking);
        setTrendData(generatedTrends);
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      setLeaderboardData(mockLeaderboardData);
      setHistoricalData(mockHistoricalData);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  }, [mockLeaderboardData, mockTrendData, mockHistoricalData, fetchHistoricalData]);

  // Your existing useEffect and other functions remain the same...
  useEffect(() => {
    console.log('🔍 DEBUG: Component mounted, starting initial data fetch');
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  // Add TrendChart component
  const TrendChart = React.memo(() => {
    if (!historicalData || historicalData.length === 0) {
      return (
        <div className="flex h-full items-center justify-center text-gray-500">
          <p>No historical data available for trends</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval="preserveStartEnd"
            fontSize={12}
          />
          <YAxis 
            domain={[0, 1]}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <RechartsTooltip 
            formatter={(value, name) => [
              (value as number).toFixed(3), 
              name as string
            ]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Line 
            dataKey="ChatGPT" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#3b82f6' }}
          />
          <Line 
            dataKey="Gemini" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#ef4444' }}
          />
          <Line 
            dataKey="Llama" 
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#f59e0b' }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  });

  TrendChart.displayName = 'TrendChart';

    // Add this after your existing TrendChart component, before the formatting functions
  
  const ComparisonMatrix = React.memo(() => {
    if (!leaderboardData || leaderboardData.length === 0) {
      return (
        <div className="flex h-full items-center justify-center text-gray-500">
          <p>No data available for model comparison</p>
        </div>
      );
    }
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaderboardData.map((model, index) => (
          <Card key={model.model_name} className={`p-6 transition-all duration-200 hover:shadow-lg ${
            index === 0 
              ? 'ring-2 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20' 
              : 'hover:ring-2 hover:ring-blue-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/20'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {model.model_name}
              </h3>
              {index === 0 && (
                <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  🏆 Best
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {/* Overall Score */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Overall Score:
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${model.overall_score * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {(model.overall_score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
  
              {/* Coherence */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Coherence:
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${model.coherence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {(model.coherence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
  
              {/* Token Overlap */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Token Overlap:
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${model.token_overlap * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {(model.token_overlap * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
  
              {/* Length Ratio */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Length Ratio:
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${model.length_ratio * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {(model.length_ratio * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
  
              {/* User Rating */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  User Rating:
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (model.user_rating * 5)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {(model.user_rating * 5).toFixed(1)}/5
                  </span>
                </div>
              </div>
  
              {/* Evaluation Count */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Evaluations:
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {model.evaluation_count.toLocaleString()}
                </span>
              </div>
  
              {/* Performance Badge */}
              <div className="flex justify-center pt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  model.overall_score >= 0.8
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : model.overall_score >= 0.7
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {model.overall_score >= 0.8 ? 'Excellent' : 
                   model.overall_score >= 0.7 ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  });
  
  ComparisonMatrix.displayName = 'ComparisonMatrix';

  // Your existing formatting functions...
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
    // Your existing formatRadarData function...
    if (!data) return [];
    
    try {
      const modelMap: Record<string, ModelScore> = {};
      data.forEach(model => {
        modelMap[model.model_name] = model;
      });
      
      const modelNames = data.map(model => model.model_name);
      
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
      
      return radarData;
    } catch (error) {
      console.error('Error formatting radar data:', error);
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
            setLeaderboardData(null);
            setRankingData(null);
            setTrendData(null);
            setHistoricalData(null);
            setUseMockData(false);
            
            setTimeout(() => {
              fetchLeaderboardData();
            }, 300);
          }} 
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm flex items-center gap-1"
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

      {/* {useMockData && (
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
                setLeaderboardData(null);
                setRankingData(null);
                setTrendData(null);
                setHistoricalData(null);
                setUseMockData(false);
                
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
      )} */}
      
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          <TabsTrigger value="radar">Radar Chart</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Model Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bar" className="mt-4">
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
                <div className="h-[600px] w-full">                  {(() => {
                    try {
                      const chartData = formatLeaderboardData(leaderboardData, activeMetric);
                      if (!chartData || chartData.length === 0) {
                        return (
                          <div className="flex h-full items-center justify-center text-gray-500">
                            <p>No data available for visualization</p>
                          </div>
                        );
                      }
                      
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
                            margin={{ top: 20, right: 30, left: 20, bottom: 80 }} // Increased bottom margin
                            barCategoryGap="10%" // Add spacing between bars (makes them narrower)
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              angle={-45}
                              textAnchor="end" 
                              height={100} // Increased height for rotated labels
                              interval={0}
                              fontSize={12} // Adjust font size if needed
                            />
                            <YAxis 
                              type="number" 
                              domain={[0, 1]} 
                              tickFormatter={(value) => value.toFixed(2)} // Better formatting
                            />
                            <RechartsTooltip formatter={(value) => [(value as number).toFixed(3), 'Score']} />
                            <Legend />
                            <Bar
                              dataKey="value"
                              maxBarSize={100} // Limit maximum bar width
                              fill={
                                activeMetric === 'overall_score' ? '#3b82f6' :
                                activeMetric === 'coherence' ? '#10b981' :
                                activeMetric === 'token_overlap' ? '#f59e0b' :
                                activeMetric === 'length_ratio' ? '#ef4444' :
                                '#8b5cf6'
                              }
                              radius={[4, 4, 0, 0]}
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
                          <RechartsTooltip formatter={(value) => [(value as number).toFixed(3), 'Score']} />
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
        
        <TabsContent value="trends" className="mt-4">
          <Card className="p-6 backdrop-blur-sm bg-white bg-opacity-80 border shadow-lg dark:bg-gray-900 dark:border-gray-800">
            <h3 className="text-xl font-semibold mb-4">Performance Trends Over Time</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Track how each model&apos;s performance has evolved over the past 30 days
            </p>
            {loading ? (
              <div className="flex h-[500px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Loading trend data...</span>
              </div>
            ) : (
              <div className="h-[500px] w-full">
                <TrendChart />
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <Card className="p-6 backdrop-blur-sm bg-white bg-opacity-80 border shadow-lg dark:bg-gray-900 dark:border-gray-800">
            <h3 className="text-xl font-semibold mb-4">Model Comparison Matrix</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Compare all models side-by-side across different performance metrics
            </p>
            {loading ? (
              <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Loading comparison data...</span>
              </div>
            ) : (
              <ComparisonMatrix />
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
