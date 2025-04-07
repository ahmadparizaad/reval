"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ModelSelector } from '@/components/model-selector';
// import { ResponseCard } from '@/components/response-card';
// import { EvaluationComparison } from '@/components/evaluation-comparison';
// import { ExportButton } from '@/components/export-button';
import { ArrowUp, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import MarkdownRenderer from '@/components/markdown';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import React from 'react';

type Response = {
  prompt: string;
  geminiResponse: {
    raw: object; // Adjust the type as necessary based on the actual structure of raw data
    text: string;
  };
  openaiResponse: {
    raw: object; // Adjust the type as necessary based on the actual structure of raw data
    text: string;
  };
  llamaResponse: {
    raw: object; // Adjust the type as necessary based on the actual structure of raw data
    text: string;
  };
};

export default function EvaluatePage() {
  const [prompt, setPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [previousResponses, setPreviousResponses] = useState<Response[]>([]);

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
      console.log(selectedModels);
      console.log("Selected models",selectedModels);
      const res = await axios.post('/api/evaluate', {
        prompt,
        models: selectedModels,
      });

      if (res.status !== 200) throw new Error("Evaluation failed");

      const data = res.data;

      setPreviousResponses((prev) => [
        ...prev,
        {
          prompt,
          geminiResponse: data.geminiResponse,
          openaiResponse: data.openaiResponse,
          llamaResponse: data.llamaResponse,
        },
      ]);
      console.log('geminiResponse: ', data.geminiResponse);
      console.log('openaiResponse: ', data.openaiResponse);
      console.log('deepsseekResponse: ', data.deepseekResponse);
      setPrompt('');

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
    <div className="container mx-auto px-4 py-8 flex flex-col min-h-screen">
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

      <div className="grid grid-cols-3 gap-6">
          <h3 className="text-lg font-semibold flex items-center mt-4">
            <img src="/openai.svg" className="w-8 h-8 mr-1" />
            OpenAI
          </h3>

          <h3 className="text-lg font-semibold flex items-center mt-4">
            <img src="/llama.svg" className="w-6 h-6 mr-1" />
            Llama
          </h3>

          <h3 className="text-lg font-semibold flex items-center">
          <img src="/gemini.svg" className="w-6 h-6 mr-1" />
            Gemini
          </h3>

        </div>

        <div className="w-full mb-16 px-5">
          {previousResponses.map((response, index) => (
            <React.Fragment key={index}>
            <div className="flex justify-start ml-3 mt-5">
              <Card className="px-5 my-4 py-1 w-fit rounded-full bg-gray-200">
                {response.openaiResponse && (
                  <>
                  <MarkdownRenderer content={response.prompt} />
                  <div>
                    Score :
                  </div>
                  </>
                )}
              </Card>
            </div>
            <div className="grid grid-cols-3 gap-6 w-full">
            <Card className="p-6 w-full">
              {response.geminiResponse && (
                <MarkdownRenderer content={response.geminiResponse.text} />

              )}              
            </Card>

            <Card className="p-6 w-full">
              {response.llamaResponse && (
                <MarkdownRenderer content={response.llamaResponse.text} />

              )}

            </Card>

            <Card className="p-6 w-full">
            {response.geminiResponse && (              
            <Markdown>{response.geminiResponse.text}</Markdown>
            )}
            </Card>
            </div>
            </React.Fragment>
          ))}
        </div>
      
        <Card 
          className="p-4 rounded-xl fixed bottom-0 mb-2 mx-2 left-0 right-0 bg-white shadow-2xl"
        >
  <div className="flex items-center relative w-full px-4">
    {/* Input Field */}
    <div className="relative flex w-full">
      <Input
        placeholder="Enter your prompt here..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="pr-12 h-12 rounded-full shadow-md flex-grow"
      />
      <Button
        onClick={handleEvaluate}
        disabled={!prompt || selectedModels.length === 0 || isEvaluating}
        className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full p-0 bg-gray-800 hover:bg-gray-600"
        variant="ghost"
      >
        {isEvaluating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-5 w-5 text-white" />}
      </Button>
    </div>

    {/* Model Selector Dropdown */}
    <ModelSelector selectedModels={selectedModels} onSelectModels={setSelectedModels} />
  </div>
</Card>



        
    </div>
  );
}