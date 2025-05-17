'use client';

import { useState } from 'react';
import { useUserInteractions, useUserStats } from '@/hooks/useUserData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@clerk/nextjs';

type SortField = 'created_at' | 'token_overlap' | 'length_ratio' | 'relevance_score';
type SortOrder = 'asc' | 'desc';

export default function HistoryPage() {
  const { user } = useUser();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [order, setOrder] = useState<SortOrder>('desc');
  const perPage = 10;

  const { data: interactions, isLoading: interactionsLoading } = useUserInteractions(
    page,
    perPage,
    sortBy,
    order
  );
  const { data: stats, isLoading: statsLoading } = useUserStats();

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground">Please sign in to view your history.</p>
        </Card>
      </div>
    );
  }

  if (interactionsLoading || statsLoading) {
    return <LoadingSkeleton />;
  }

  if (!interactions || !stats) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-muted-foreground">Failed to load data. Please try again later.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid gap-6">
        {/* Stats Overview */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Your Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">Total Interactions</h3>
              <p className="text-2xl font-bold">{stats.total_interactions}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">Average Token Overlap</h3>
              <p className="text-2xl font-bold">{stats.average_metrics.token_overlap.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">Average Relevance</h3>
              <p className="text-2xl font-bold">{stats.average_metrics.relevance_score.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        {/* Sorting Controls */}
        <div className="flex gap-4 items-center">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortField)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date</SelectItem>
              <SelectItem value="token_overlap">Token Overlap</SelectItem>
              <SelectItem value="length_ratio">Length Ratio</SelectItem>
              <SelectItem value="relevance_score">Relevance Score</SelectItem>
            </SelectContent>
          </Select>

          <Select value={order} onValueChange={(value) => setOrder(value as SortOrder)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Interactions List */}
        <div className="grid gap-4">
          {interactions.interactions.map((interaction) => (
            <Card key={interaction.id} className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Prompt</h3>
                  <p className="text-muted-foreground">{interaction.prompt}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Response</h3>
                  <p className="text-muted-foreground">{interaction.response}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Token Overlap</h4>
                    <p className="font-semibold">{interaction.metrics.token_overlap.toFixed(2)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Length Ratio</h4>
                    <p className="font-semibold">{interaction.metrics.length_ratio.toFixed(2)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Relevance Score</h4>
                    <p className="font-semibold">{interaction.metrics.relevance_score.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {interactions.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(interactions.pages, p + 1))}
            disabled={page === interactions.pages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid gap-6">
        <Card className="p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </Card>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
} 