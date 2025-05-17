"use client";
/* eslint-disable @next/next/no-img-element */

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
import { MetricsLineChart } from '@/components/metrics-line-chart';

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
  userRatings: {
    ChatGPT: number | null;
    Gemini: number | null;
    Llama: number | null;
  };
  feedbackSubmitted: boolean;
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
      
      // Mark feedback as submitted
      setPreviousResponses(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          feedbackSubmitted: true
        };
        return updated;
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
          },
          feedbackSubmitted: false
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
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-50 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b dark:border-gray-700 mb-2 w-full shadow-sm">
        <div className="grid grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
          <h3 className="text-lg font-semibold flex items-center mt-4 ml-4">
            <img src="/openai.svg" className="w-6 h-6 mr-1" alt="OpenAI logo" />
            OpenAI
          </h3>

          <h3 className="text-lg font-semibold flex items-center mt-4 ml-4">
            <img src="/llama.svg" className="w-6 h-6 mr-1" alt="Llama logo" />
            Llama
          </h3>

          <h3 className="text-lg font-semibold flex items-center">
            <img src="/gemini.svg" className="w-6 h-6 mr-1" alt="Gemini logo" />
            Gemini
          </h3>
        </div>
      </div>

        <div className="w-full mb-16 px-5 max-w-7xl mx-auto">
          {previousResponses.map((response, index) => (
            <React.Fragment key={index}>
            <div className="flex justify-start ml-3 mt-5 mb-2">
              <Card className="px-5 my-4 py-3 w-fit max-w-5xl rounded-3xl bg-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700 border-gray-300 shadow-md">
                {response.openaiResponse && (
                  <>
                  <MarkdownRenderer content={response.prompt} />
                  </>
                )}
              </Card>
            </div>
            <div className="grid grid-cols-3 gap-6 w-full">                <Card 
                className={`p-6 w-full h-fit backdrop-blur-sm bg-opacity-80 border border-opacity-20 shadow-lg transition-all duration-300 ${
                  response.evaluation?.ChatGPT.overall_score > 0.7 
                    ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-300 dark:from-green-900/30 dark:to-green-800/40 dark:border-green-700/50' 
                    : response.evaluation?.ChatGPT.overall_score > 0.4 
                      ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-900/30 dark:to-amber-800/40 dark:border-yellow-700/50' 
                      : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-900/30 dark:to-red-800/40 dark:border-red-700/50'
                }`}
              >
                {response.openaiResponse && (
                  <>
                    <MarkdownRenderer content={response.openaiResponse.text} />
                    <br />
                    <div className="text-sm mt-2 font-medium">
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
              </Card>                <Card 
                className={`p-6 w-full h-fit backdrop-blur-sm bg-opacity-80 border border-opacity-20 shadow-lg transition-all duration-300 ${
                  response.evaluation?.Llama.overall_score > 0.7 
                    ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-300 dark:from-green-900/30 dark:to-green-800/40 dark:border-green-700/50' 
                    : response.evaluation?.Llama.overall_score > 0.4 
                      ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-900/30 dark:to-amber-800/40 dark:border-yellow-700/50' 
                      : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-900/30 dark:to-red-800/40 dark:border-red-700/50'
                }`}
              >
                {response.llamaResponse && (
                  <>
                    <MarkdownRenderer content={response.llamaResponse.text} />
                    <br />
                    <div className="text-sm mt-2 font-medium">
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
              <Card 
                className={`p-6 w-full h-fit backdrop-blur-sm bg-opacity-80 border border-opacity-20 shadow-lg transition-all duration-300 ${
                  response.evaluation?.Gemini.overall_score > 0.7 
                    ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-300 dark:from-green-900/30 dark:to-green-800/40 dark:border-green-700/50' 
                    : response.evaluation?.Gemini.overall_score > 0.4 
                      ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-900/30 dark:to-amber-800/40 dark:border-yellow-700/50' 
                      : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-900/30 dark:to-red-800/40 dark:border-red-700/50'
                }`}
              >
                {response.geminiResponse && (
                  <>
                    <MarkdownRenderer content={response.geminiResponse.text} />
                    <br />
                    <div className="text-sm mt-2 font-medium">
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
            {/* Add the metrics line chart here */}
            <div className="w-full px-4">
              <MetricsLineChart evaluations={response.evaluation} />
            </div>
              {!response.feedbackSubmitted && (
              <div className="flex justify-center mt-4 mb-8">
                <Button
                  onClick={() => submitFeedback(index)}
                  disabled={!isAllRated(response) || isSendingFeedback}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSendingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            )}
            {response.feedbackSubmitted && (
              <div className="flex justify-center mt-4 mb-8">
                <div className="text-green-600 font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                  Feedback submitted successfully
                </div>
              </div>
            )}
            </React.Fragment>
          ))}
        </div>
        <Card 
          className="p-4 rounded-xl fixed bottom-0 mb-2 mx-2 left-0 right-0 bg-white dark:bg-gray-900 shadow-2xl dark:border-gray-800"
        >
  <div className="flex items-center relative w-full px-4">
    {/* Input Field */}
    <div className="relative flex w-full">
      <Input
        placeholder="Enter your prompt here..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="pr-12 h-12 rounded-full shadow-md flex-grow border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
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