import { useState } from 'react';
import { useUserInteractions } from '@/hooks/useUserData';

export function InteractionHistory() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserInteractions(page);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Interaction History</h2>
      {data.interactions.map((interaction) => (
        <div key={interaction.id}>
          <h3>Prompt: {interaction.prompt}</h3>
          <p>Response: {interaction.response}</p>
          <div>
            <h4>Metrics:</h4>
            <ul>
              <li>Token Overlap: {interaction.metrics.token_overlap}</li>
              <li>Length Ratio: {interaction.metrics.length_ratio}</li>
              <li>Relevance Score: {interaction.metrics.relevance_score}</li>
            </ul>
          </div>
        </div>
      ))}
      
      {/* Pagination */}
      <div>
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page} of {data.pages}</span>
        <button 
          onClick={() => setPage(p => Math.min(data.pages, p + 1))}
          disabled={page === data.pages}
        >
          Next
        </button>
      </div>
    </div>
  );
} 