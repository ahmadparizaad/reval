import { NextRequest, NextResponse } from "next/server";
import { callGemini, callLlamaAPI, callAzureOpenAI } from "@/lib/llm-config";
import axios from "axios";
import { currentUser } from '@clerk/nextjs/server'

export async function POST(request: NextRequest){
  try{
  const {prompt, models} = await request.json();
    const user = await currentUser()
  let evaluation

  if (!prompt || !models || models.length === 0) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }  const openaiResponse = await callAzureOpenAI(prompt, models[0]);
  const llamaResponse = await callLlamaAPI(prompt, models[1]);
  const geminiResponse = await callGemini(prompt, models[2]);
  // const deepseekResponse = await callDeepSeek(prompt, models[1])

  console.log(models)
  console.log('azureOpenAIResponse: ', typeof(openaiResponse));
  console.log('llamaResponse: ', typeof(llamaResponse));
  console.log('geminiResponse: ', typeof(geminiResponse));let leaderboard;
    try {      const response = await axios.post('http://localhost:5000/api/evaluate', {
        question: prompt,
        responses: {
          ChatGPT: JSON.stringify(openaiResponse),
          Gemini: JSON.stringify(geminiResponse),
          Llama: JSON.stringify(llamaResponse),
        },
        headers: {
      'X-User-ID': user?.username  // Add this header
    }
      });
      
      // Extract both evaluation and leaderboard from response
      evaluation = response.data.evaluation;
      leaderboard = response.data.leaderboard;
  
      console.log("Evaluation Results:", evaluation);
      console.log("Leaderboard Data:", leaderboard);
      
    } catch (error) {
      console.error('Error fetching scores:', error);
    }


  // const responses = await generateLLMResponses(prompt, models);

  return NextResponse.json({ geminiResponse, llamaResponse, openaiResponse, evaluation, leaderboard });
}
 catch(error) {
  console.log('Evaluation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
}};