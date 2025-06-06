/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const defaultAzureModel = "openai/gpt-4.1";

export async function callAzureOpenAI(prompt: string, model?: string) {
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is not set.");
  }
  
  try {
    const openai = new OpenAI({
      baseURL: endpoint,
      apiKey: token,
    });

    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 1.0,
      top_p: 1.0,
      model: defaultAzureModel,
    });

    return {
      text: response.choices[0].message.content || "",
      raw: response,
    };
  } catch (error) {
    console.log('Error calling Azure OpenAI API:', error);
    return {
      text: "",
      error: `Azure OpenAI error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
export async function callGemini(prompt: string, model: string) {
    try{
      const geminiModel = 'gemini-2.0-flash';
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

// export async function callOpenAI(prompt:string, model:string){
//   try{
//     const openai = new OpenAI();
//     const completion = await openai.chat.completions.create({
//       model: model,
//       messages: [
//           { role: "system", content: "You are a helpful assistant." },
//           {
//               role: "user",
//               content: prompt,
//           },
//       ],
//       store: true,
//   });
//   return {
//     text: completion.choices[0].message
//   }

//   } catch(error) {
//     console.log('Error calling OpenAI API:', error);
//     return NextResponse.json(
//       {error: 'OpenAI error: '},
//       {status: 501}
//     );
//   }
// }

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
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

// export async function callLlamaAPI(prompt: string, model: string) {
//   try {
//   const openai = new OpenAI({
//     baseURL: 'https://openrouter.ai/api/v1',
//     apiKey: process.env.LLAMA_API_KEY,
//   });
//   console.log(model)
//   const completion = await openai.chat.completions.create({
//   messages: [
//   {role: "user", content: prompt}],
//   model: "llama3.1-8b",
//   });

//   console.log(completion.choices[0].message.content);
//   return {
//   text: completion.choices[0].message.content
//     }
// } catch(error) {
//   console.log('Error calling Llama API:', error);
//   return NextResponse.json(
//     {error: 'Llama error: '},
//     {status: 501}
//   );
// }
// }

export async function callLlamaAPI(prompt: string, model: string) {
  try {
    const llamaModel = "meta-llama/llama-3.3-70b-instruct:free";
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: llamaModel,
        messages: [{ role: "user", content: `${prompt}` }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_LLAMA_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.SITE_URL || "", // Optional
          "X-Title": process.env.SITE_NAME || "", // Optional
        },
      }
    );

    return {
      text: response.data.choices?.[0]?.message?.content || "",
      raw: response.data,
    };
  } catch (error) {
    console.log("Error calling Llama API:", error);
    return NextResponse.json({ error: "Llama error" }, { status: 501 });
  }
}
