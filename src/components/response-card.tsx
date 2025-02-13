"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ResponseCardProps {
  evaluationId?: string;
  responseIndex?: number;
  response: {
    model: string;
    response: string;
    accuracyScore: number;
  };
}

export function ResponseCard({ evaluationId, responseIndex, response }: ResponseCardProps) {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [copying, setCopying] = useState(false);

  const handleFeedback = async (type: 'positive' | 'negative') => {
    if (!evaluationId || responseIndex === undefined) return;

    setFeedback(type);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          evaluationId,
          responseIndex,
          feedback: type,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit feedback');

      toast({
        title: 'Feedback submitted',
        description: 'Thank you for your feedback!',
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response.response);
      setCopying(true);
      toast({
        title: 'Copied to clipboard',
        description: 'Response has been copied to your clipboard.',
      });
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{response.model}</h3>
        <div className="px-2 py-1 bg-primary/10 rounded-full text-sm">
          Score: {(response.accuracyScore * 100).toFixed(1)}%
        </div>
      </div>
      
      <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
        {response.response}
      </p>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFeedback('positive')}
            className={feedback === 'positive' ? 'bg-green-100 dark:bg-green-900' : ''}
          >
            <ThumbsUp className="w-4 h-4 mr-1" />
            Helpful
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFeedback('negative')}
            className={feedback === 'negative' ? 'bg-red-100 dark:bg-red-900' : ''}
          >
            <ThumbsDown className="w-4 h-4 mr-1" />
            Not Helpful
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
        >
          {copying ? (
            <Check className="w-4 h-4 mr-1" />
          ) : (
            <Copy className="w-4 h-4 mr-1" />
          )}
          {copying ? 'Copied!' : 'Copy'}
        </Button>
      </div>
    </Card>
  );
}