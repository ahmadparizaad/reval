"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DiffText } from "@/components/diff-text";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ComparisonProps {
  responses: Array<{
    model: string;
    response: string;
    accuracyScore: number;
    metrics: {
      coherence: number;
      relevance: number;
      fluency: number;
      toxicity: number;
    };
  }>;
}

export function EvaluationComparison({ responses }: ComparisonProps) {
  const bestResponse = responses.reduce((prev, current) =>
    current.accuracyScore > prev.accuracyScore ? current : prev
  );

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Response Comparison</h3>
      
      <div className="grid gap-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead className="text-right">Coherence</TableHead>
              <TableHead className="text-right">Relevance</TableHead>
              <TableHead className="text-right">Fluency</TableHead>
              <TableHead className="text-right">Toxicity</TableHead>
              <TableHead className="text-right">Overall Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map((response) => (
              <TableRow key={response.model}>
                <TableCell className="font-medium">{response.model}</TableCell>
                <TableCell className="text-right">
                  {(response.metrics.coherence * 100).toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  {(response.metrics.relevance * 100).toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  {(response.metrics.fluency * 100).toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  {(response.metrics.toxicity * 100).toFixed(1)}%
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {(response.accuracyScore * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div>
          <h4 className="text-sm font-semibold mb-2">Differences from Best Response</h4>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            {responses
              .filter((r) => r.model !== bestResponse.model)
              .map((response) => (
                <div key={response.model} className="mb-6">
                  <h5 className="text-sm font-medium mb-2">{response.model}</h5>
                  <DiffText
                    original={bestResponse.response}
                    modified={response.response}
                  />
                  <Separator className="my-4" />
                </div>
              ))}
          </ScrollArea>
        </div>
      </div>
    </Card>
  );
}