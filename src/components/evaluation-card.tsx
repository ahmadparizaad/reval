"use client";

import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Brain, Calendar } from "lucide-react";

interface EvaluationCardProps {
  evaluation: {
    _id: string;
    prompt: string;
    responses: Array<{
      model: string;
      response: string;
      accuracyScore: number;
    }>;
    createdAt: string;
  };
}

export function EvaluationCard({ evaluation }: EvaluationCardProps) {
  const averageScore =
    evaluation.responses.reduce((acc, r) => acc + r.accuracyScore, 0) /
    evaluation.responses.length;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Prompt</h3>
          <p className="text-muted-foreground">{evaluation.prompt}</p>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 mr-1" />
          {format(new Date(evaluation.createdAt), "MMM d, yyyy")}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {evaluation.responses.map((response, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-muted/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{response.model}</span>
              <span className="text-sm px-2 py-1 rounded-full bg-primary/10">
                {(response.accuracyScore * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {response.response}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        <div className="flex items-center">
          <Brain className="w-4 h-4 mr-2" />
          <span className="text-sm text-muted-foreground">
            {evaluation.responses.length} models compared
          </span>
        </div>
        <div className="text-sm">
          Average Score:{" "}
          <span className="font-medium">
            {(averageScore * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </Card>
  );
}