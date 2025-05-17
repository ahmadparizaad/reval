import { useUserData, useUserStats } from '@/hooks/useUserData';

export function UserProfile() {
  const { data: userData, isLoading: userLoading } = useUserData();
  const { data: stats, isLoading: statsLoading } = useUserStats();

  if (userLoading || statsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Profile</h2>
      <p>Username: {userData.username}</p>
      <p>Email: {userData.email}</p>
      <p>Total Interactions: {stats.total_interactions}</p>
      <h3>Average Metrics</h3>
      <ul>
        <li>Token Overlap: {stats.average_metrics.token_overlap.toFixed(2)}</li>
        <li>Length Ratio: {stats.average_metrics.length_ratio.toFixed(2)}</li>
        <li>Relevance Score: {stats.average_metrics.relevance_score.toFixed(2)}</li>
      </ul>
    </div>
  );
} 