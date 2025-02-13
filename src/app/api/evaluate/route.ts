import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest){
  try{
  const {prompt, models} = await request.json();

  if (!prompt || !models || models.length === 0) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  const responses = await callGemini(prompt, models[0]);
  
  async function callGemini(prompt: string, model: string) {
    try{
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  
    return {
      text: response.data.candidates?.[0]?.content?.parts?.[0]?.text || "",
      raw: response.data,
    };
  } catch(error) {
      console.log('Error calling Gemini API:', error);
      return NextResponse.json(
        {error: 'Gemini error: '},
        {status: 501}
      );
  }}
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