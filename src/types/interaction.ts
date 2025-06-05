export interface InteractionMetrics {
  token_overlap: number;
  length_ratio: number;
  relevance_score: number;
}

export interface Interaction {
  id: string;
  prompt: string;
  response: string;
  metrics: InteractionMetrics;
  created_at: string;
}

export interface PaginatedInteractions {
  interactions: Interaction[];
  page: number;
  pages: number;
  total: number;
}

export interface UserStats {
  total_interactions: number;
  average_metrics: InteractionMetrics;
} 