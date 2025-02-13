"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ModelSelector } from '@/components/model-selector';
// import { ResponseCard } from '@/components/response-card';
// import { EvaluationComparison } from '@/components/evaluation-comparison';
// import { ExportButton } from '@/components/export-button';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

type Response = {
  raw: object; // Adjust the type as necessary based on the actual structure of raw data
  text: string;
};

export default function EvaluatePage() {
  const [prompt, setPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationId, setEvaluationId] = useState<string>();
  const [responses, setResponses] = useState<Response>();

  const handleEvaluate = async () => {

    if (!prompt || selectedModels.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a prompt and select at least one model.',
        variant: 'destructive',
      });
      return;
    }

    setIsEvaluating(true);
    try {
      console.log("Prompt: ", prompt)
      console.log('Selected Models: ', selectedModels);

    const res = await axios.post('/api/evaluate', ({
      prompt,
      models: selectedModels,
    }));

      if (res.status !== 200) throw new Error("Evaluation failed");

      const data = res.data;
      setResponses(data.responses);
      console.log('Response:', data.responses);  
      console.log(typeof(data.responses))
      setEvaluationId(data.evaluationId);

      toast({
        title: 'Evaluation Complete',
        description: `Generated responses from ${selectedModels.length} models.`,
      });
    } catch (error) {
      console.error('Evaluation failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate responses. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // if (status === "loading") {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <Brain className="w-8 h-8 animate-pulse" />
  //     </div>
  //   );
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Evaluate LLM Responses</h1>
        {/* {responses.length > 0 && (
          <ExportButton
            data={{
              prompt,
              responses,
              timestamp: new Date().toISOString(),
            }}
          />
        )} */}
      </div>
      
      <div className="grid gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Enter Your Prompt</h2>
          <Input
            placeholder="Enter your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[40px] mb-4 border border-gray-400"
          />
          <ModelSelector
            selectedModels={selectedModels}
            onSelectModels={setSelectedModels}
          />
          <Button
            onClick={handleEvaluate}
            disabled={!prompt || selectedModels.length === 0 || isEvaluating}
            className="mt-4"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Evaluating...
              </>
            ) : (
              'Evaluate'
            )}
          </Button>
        </Card>

        {responses && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <p>{responses.text}</p>
            </Card>
          {/* ))} */}
          </div>
          ) 
          }
           {/* <>
             <EvaluationComparison responses={responses} />
             <div className="grid gap-6 md:grid-cols-2">
               {responses.map((response, index) => (
                <ResponseCard
                  key={index}
                  evaluationId={evaluationId}
                  responseIndex={index}
                  response={response}
                />
              ))}
            </div>
          </> */}
      </div>
    </div>
  );
}