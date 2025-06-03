export interface UserInteraction {
  id: number;
  prompt: string;
  response: string;
  created_at: string;
  metrics: {
    token_overlap: number;
    length_ratio: number;
    relevance_score: number;
  };
}

export interface UserHistoryResponse {
  interactions: UserInteraction[];
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    total: number;
  };
}

export interface UserStats {
  total_interactions: number;
  average_metrics: {
    token_overlap: number;
    length_ratio: number;
    relevance_score: number;
  };
}