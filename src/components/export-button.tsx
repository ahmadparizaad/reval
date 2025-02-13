"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface ExportButtonProps {
  data: {
    prompt: string;
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
    timestamp: string;
  };
}

export function ExportButton({ data }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Format the data for export
      const formattedData = {
        evaluationDate: new Date(data.timestamp).toISOString(),
        prompt: data.prompt,
        models: data.responses.map((r) => ({
          name: r.model,
          response: r.response,
          scores: {
            overall: r.accuracyScore,
            coherence: r.metrics.coherence,
            relevance: r.metrics.relevance,
            fluency: r.metrics.fluency,
            toxicity: r.metrics.toxicity,
          },
        })),
      };

      // Create and download the file
      const blob = new Blob([JSON.stringify(formattedData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluation-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={exporting}
    >
      {exporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Export Results
    </Button>
  );
}