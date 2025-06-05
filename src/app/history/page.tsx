"use client";
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserInteraction, UserHistoryResponse } from '@/types/user';

export default function HistoryPage() {
  const { user, isLoaded } = useUser();
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    per_page: 10,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchHistory = async (page: number = 1) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/user/history?page=${page}&per_page=10`, {
        headers: {
          'X-User-ID': user?.id.toString()
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      
      const data: UserHistoryResponse = await response.json();
      setInteractions(data.interactions);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchHistory();
    }
  }, [isLoaded, user]);

  const handlePageChange = (page: number) => {
    fetchHistory(page);
  };

  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading your chat history...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p>You need to be signed in to view your chat history.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Chat History</h1>
        <p className="text-gray-600">
          Total interactions: {pagination.total}
        </p>
      </div>

      {interactions.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl mb-4">No chat history yet</h2>
          <p className="text-gray-600">Start evaluating LLM responses to see your history here.</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {interactions.map((interaction) => (
              <div key={interaction.id} className="bg-white border rounded-lg p-6 shadow-sm">
                <div className="mb-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">Q</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{interaction.prompt}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-medium">A</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700">{interaction.response}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Relevance:</span>
                      <div className="flex items-center gap-1">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${interaction.metrics.relevance_score * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">
                          {(interaction.metrics.relevance_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Token Overlap:</span>
                      <span className="font-medium">
                        {(interaction.metrics.token_overlap * 100).toFixed(0)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Length Ratio:</span>
                      <span className="font-medium">
                        {(interaction.metrics.length_ratio * 100).toFixed(0)}%
                      </span>
                    </div>
                    
                    <div className="ml-auto text-gray-400">
                      {new Date(interaction.created_at).toLocaleDateString()} at{' '}
                      {new Date(interaction.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 border rounded-md ${
                      currentPage === page 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.pages}
                  className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
