"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ModelSelector } from '@/components/model-selector';
// import { ResponseCard } from '@/components/response-card';
// import { EvaluationComparison } from '@/components/evaluation-comparison';
// import { ExportButton } from '@/components/export-button';
import { ArrowUp, Loader2, Star } from 'lucide-react';
import MarkdownRenderer from '@/components/markdown';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import React from 'react';

type Evaluation = {
  coherence: number;
  token_overlap: number;
  length_ratio: number;
  overall_score: number;
};

type Response = {
  prompt: string;
  geminiResponse: {
    raw: object;
    text: string;
  };
  openaiResponse: {
    raw: object;
    text: string;
  };
  llamaResponse: {
    raw: object;
    text: string;
  };
  evaluation: {
    ChatGPT: Evaluation;
    Gemini: Evaluation;
    Llama: Evaluation;
  };
  userRatings?: {
    ChatGPT: number | null;
    Gemini: number | null;
    Llama: number | null;
  };
};

// Star Rating component
const StarRating = ({ 
  rating, 
  setRating,
  disabled = false
}: { 
  rating: number | null; 
  setRating: (rating: number) => void;
  disabled?: boolean;
}) => {
  return (
    <div className="flex mt-3">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 cursor-pointer ${
            (rating || 0) >= star 
              ? 'text-yellow-500 fill-yellow-500' 
              : 'text-gray-300'
          }`}
          onClick={() => !disabled && setRating(star)}
        />
      ))}
    </div>
  );
};

export default function EvaluatePage() {
  const [prompt, setPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [previousResponses, setPreviousResponses] = useState<Response[]>([]);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  const handleRating = (index: number, model: 'ChatGPT' | 'Gemini' | 'Llama', rating: number) => {
    setPreviousResponses(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        userRatings: {
          ChatGPT: updated[index].userRatings?.ChatGPT ?? null,
          Gemini: updated[index].userRatings?.Gemini ?? null,
          Llama: updated[index].userRatings?.Llama ?? null,
          [model]: rating
        }
      };
      return updated;
    });
  };
  
  const isAllRated = (response: Response) => {
    return (
      response.userRatings?.ChatGPT !== null && 
      response.userRatings?.Gemini !== null && 
      response.userRatings?.Llama !== null
    );
  };
  
  const hasPendingFeedback = () => {
    return previousResponses.some(
      response => !isAllRated(response)
    );
  };

  const submitFeedback = async (index: number) => {
    const response = previousResponses[index];
    
    if (!isAllRated(response)) {
      toast({
        title: 'Missing Ratings',
        description: 'Please rate all three model responses before submitting.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSendingFeedback(true);
    try {
      // Create safe scores object with fallback values
      const scores = {
        ChatGPT: {
          coherence: response.evaluation?.ChatGPT?.coherence ?? 0.7,
          token_overlap: response.evaluation?.ChatGPT?.token_overlap ?? 0.6,
          length_ratio: response.evaluation?.ChatGPT?.length_ratio ?? 0.7,
          overall_score: response.evaluation?.ChatGPT?.overall_score ?? 0.7
        },
        Gemini: {
          coherence: response.evaluation?.Gemini?.coherence ?? 0.7,
          token_overlap: response.evaluation?.Gemini?.token_overlap ?? 0.6,
          length_ratio: response.evaluation?.Gemini?.length_ratio ?? 0.7,
          overall_score: response.evaluation?.Gemini?.overall_score ?? 0.7
        },
        Llama: {
          coherence: response.evaluation?.Llama?.coherence ?? 0.7, 
          token_overlap: response.evaluation?.Llama?.token_overlap ?? 0.6,
          length_ratio: response.evaluation?.Llama?.length_ratio ?? 0.7,
          overall_score: response.evaluation?.Llama?.overall_score ?? 0.7
        }
      };
      
      await axios.post('http://localhost:5000/api/feedback', {
        feedback: {
          ChatGPT: response.userRatings?.ChatGPT,
          Gemini: response.userRatings?.Gemini,
          Llama: response.userRatings?.Llama
        },
        scores
      });
      
      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback!',
      });
      
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const handleEvaluate = async () => {
    if (!prompt || selectedModels.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a prompt and select at least one model.',
        variant: 'destructive',
      });
      return;
    }
    
    // Check for pending feedback
    if (hasPendingFeedback()) {
      toast({
        title: 'Pending Feedback',
        description: 'Please provide ratings for all responses before submitting a new prompt.',
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
          evaluation: data.evaluation,
          userRatings: {
            ChatGPT: null,
            Gemini: null,
            Llama: null
          }
        },
      ]);
      console.log('geminiResponse: ', data.geminiResponse);
      console.log('openaiResponse: ', data.openaiResponse);
      console.log('llamaResponse: ', data.llamaResponse);
      console.log('evaluation: ', data.evaluation);
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
                  </>
                )}
              </Card>
            </div>
            <div className="grid grid-cols-3 gap-6 w-full">
              <Card className="p-6 w-full">
                {response.openaiResponse && (
                  <>
                    <MarkdownRenderer content={response.openaiResponse.text} />
                    <br />
                    <div className={`text-sm mt-2 ${response.evaluation?.ChatGPT.overall_score > 0.4 ? 'text-green-600' : 'text-red-500'}`}>
                      <strong>Score:</strong> {response.evaluation?.ChatGPT.overall_score.toFixed(2)}<br />
                      <strong>Coherence:</strong> {response.evaluation?.ChatGPT.coherence.toFixed(2)}<br />
                      <strong>Token Overlap:</strong> {response.evaluation?.ChatGPT.token_overlap.toFixed(2)}<br />
                      <strong>Length Ratio:</strong> {response.evaluation?.ChatGPT.length_ratio.toFixed(2)}
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Your Rating:</p>
                      <StarRating 
                        rating={response.userRatings?.ChatGPT || 0}
                        setRating={(rating) => handleRating(index, 'ChatGPT', rating)}
                      />
                    </div>
                  </>
                )}
              </Card>

              <Card className="p-6 w-full">
                {response.llamaResponse && (
                  <>
                    <MarkdownRenderer content={response.llamaResponse.text} />
                    <br />
                    <div className={`text-sm mt-2 ${response.evaluation?.Llama.overall_score > 0.4 ? 'text-green-600' : 'text-red-500'}`}>
                      <strong>Score:</strong> {response.evaluation?.Llama.overall_score.toFixed(2)}<br />
                      <strong>Coherence:</strong> {response.evaluation?.Llama.coherence.toFixed(2)}<br />
                      <strong>Token Overlap:</strong> {response.evaluation?.Llama.token_overlap.toFixed(2)}<br />
                      <strong>Length Ratio:</strong> {response.evaluation?.Llama.length_ratio.toFixed(2)}
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Your Rating:</p>
                      <StarRating 
                        rating={response.userRatings?.Llama || 0}
                        setRating={(rating) => handleRating(index, 'Llama', rating)}
                      />
                    </div>
                  </>
                )}
              </Card>

              <Card className="p-6 w-full">
                {response.geminiResponse && (
                  <>
                    <MarkdownRenderer content={response.geminiResponse.text} />
                    <br />
                    <div className={`text-sm mt-2 ${response.evaluation?.Gemini.overall_score > 0.4 ? 'text-green-600' : 'text-red-500'}`}>
                      <strong>Score:</strong> {response.evaluation?.Gemini.overall_score.toFixed(2)}<br />
                      <strong>Coherence:</strong> {response.evaluation?.Gemini.coherence.toFixed(2)}<br />
                      <strong>Token Overlap:</strong> {response.evaluation?.Gemini.token_overlap.toFixed(2)}<br />
                      <strong>Length Ratio:</strong> {response.evaluation?.Gemini.length_ratio.toFixed(2)}
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Your Rating:</p>
                      <StarRating 
                        rating={response.userRatings?.Gemini || 0}
                        setRating={(rating) => handleRating(index, 'Gemini', rating)}
                      />
                    </div>
                  </>
                )}
              </Card>
            </div>
            
            <div className="flex justify-center mt-4 mb-8">
              <Button
                onClick={() => submitFeedback(index)}
                disabled={!isAllRated(response) || isSendingFeedback}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSendingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </Button>
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
        disabled={!prompt || selectedModels.length === 0 || isEvaluating || hasPendingFeedback()}
        className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full p-0 bg-gray-800 hover:bg-gray-600"
        variant="ghost"
        title={hasPendingFeedback() ? "Please rate all responses before submitting a new prompt" : ""}
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