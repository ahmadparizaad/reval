import { NextRequest, NextResponse } from "next/server";
import { callGemini, callOpenAI } from "@/lib/llm-config";

export async function POST(request: NextRequest){
  try{
  const {prompt, models} = await request.json();

  if (!prompt || !models || models.length === 0) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // const responses = await callGemini(prompt, models[0]);
  console.log(models)
  const responses = await callOpenAI(prompt, models[1]);
  
  
  // const responses = await generateLLMResponses(prompt, models);

  return NextResponse.json({ responses });
}
 catch(error) {
  console.log('Evaluation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
}};