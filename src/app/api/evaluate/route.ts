import { NextRequest, NextResponse } from "next/server";
import {  callGemini, callOpenAI, callLlamaAPI } from "@/lib/llm-config";

export async function POST(request: NextRequest){
  try{
  const {prompt, models} = await request.json();

  if (!prompt || !models || models.length === 0) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  const openaiResponse = await callOpenAI(prompt, models[0]);
  const llamaResponse = await callLlamaAPI(prompt, models[1]);
  const geminiResponse = await callGemini(prompt, models[2]);
  // const deepseekResponse = await callDeepSeek(prompt, models[1])

  console.log(models)
  
  // const responses = await generateLLMResponses(prompt, models);

  return NextResponse.json({ geminiResponse, openaiResponse, llamaResponse });
}
 catch(error) {
  console.log('Evaluation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
}};