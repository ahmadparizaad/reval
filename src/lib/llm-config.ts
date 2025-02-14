import axios from "axios";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function callGemini(prompt: string, model: string) {
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

export async function callOpenAI(prompt:string, model:string){
  try{
    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
          { role: "system", content: "You are a helpful assistant." },
          {
              role: "user",
              content: prompt,
          },
      ],
      store: true,
  });
  return {
    text: completion.choices[0].message
  }

  } catch(error) {
    console.log('Error calling OpenAI API:', error);
    return NextResponse.json(
      {error: 'OpenAI error: '},
      {status: 501}
    );
  }
}
