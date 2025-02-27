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

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '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'
});

export async function callDeepSeek(prompt: string, model: string) {
  console.log(model)
  const completion = await openai.chat.completions.create({
  messages: [
  {role: "user", content: prompt}],
  model: "deepseek/deepseek-r1:free",
  });

  console.log(completion.choices[0].message.content);
  return {
  text: completion.choices[0].message.content
    }
}



// import { LlamaAPI } from 'llama-api';



export async function callLlamaAPI(prompt: string, model: string) {
  const openai = new OpenAI({
    baseURL: 'https://api.llama-api.com',
    apiKey: process.env.LLAMA_API_KEY,
  });
  console.log(model)
  const completion = await openai.chat.completions.create({
  messages: [
  {role: "user", content: prompt}],
  model: "llama3.1-70b",
  });


  console.log(completion.choices[0].message.content);
  return {
  text: completion.choices[0].message.content
    }
}

