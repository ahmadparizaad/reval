"use client";
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserStats } from '@/types/user';

export default function UserStatsCard() {
  const { user } = useUser();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/user/stats', {
        headers: { 'X-User-ID': user!.id }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading stats...</div>;
  if (!stats) return null;

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Your Statistics</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.total_interactions}
          </div>
          <div className="text-sm text-gray-600">Total Interactions</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {(stats.average_metrics.relevance_score * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600">Avg Relevance</div>
        </div>
      </div>
      
      <div className="mt-4 space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Token Overlap</span>
            <span>{(stats.average_metrics.token_overlap * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${stats.average_metrics.token_overlap * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Length Ratio</span>
            <span>{(stats.average_metrics.length_ratio * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${stats.average_metrics.length_ratio * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}