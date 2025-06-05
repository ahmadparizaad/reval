import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Card } from '@/components/ui/card';

type Evaluation = {
  coherence: number;
  token_overlap: number;
  length_ratio: number;
  overall_score: number;
};

type MetricsLineChartProps = {
  evaluations: {
    ChatGPT: Evaluation;
    Gemini: Evaluation;
    Llama: Evaluation;
  };
};

export function MetricsLineChart({ evaluations }: MetricsLineChartProps) {
  // Transform data for the chart - only overall scores
  const chartData = [
    {
      name: 'ChatGPT',
      score: evaluations.ChatGPT.overall_score,
    },
    {
      name: 'Gemini',
      score: evaluations.Gemini.overall_score,
    },
    {
      name: 'Llama',
      score: evaluations.Llama.overall_score,
    }
  ];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-800 dark:text-gray-200">{label}</p>
          <p className="text-sm">
            Score: {payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full p-6 mt-4 mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Model Performance Comparison</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis 
              dataKey="name" 
              stroke="#6B7280"
              tick={{ fill: '#6B7280' }}
            />
            <YAxis 
              domain={[0, 1]} 
              stroke="#6B7280"
              tick={{ fill: '#6B7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#8884d8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorScore)"
              dot={{ r: 4, fill: '#8884d8', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#8884d8', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
} 