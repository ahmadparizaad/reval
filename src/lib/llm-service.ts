import axios from 'axios';
import { calculateDetailedScore } from './accuracy-scoring';

interface LLMResponse {
  model: string;
  response: string;
  accuracyScore: number;
  metrics: {
    coherence: number;
    relevance: number;
    fluency: number;
    toxicity: number;
  };
}

export async function generateLLMResponses(prompt: string, models: string[]): Promise<LLMResponse[]> {
  const responses: LLMResponse[] = [];

  for (const model of models) {
    try {
      let response;
      
      switch (model) {
        case 'gpt-4':
          response = await callOpenAI(prompt, model);
          break;
        case 'claude-2':
          response = await callClaude(prompt);
          break;
        case 'gemini-1.5-flash':
          response = await callGemini(prompt, model);
          break;
        case 'palm':
          response = await callPaLM(prompt);
          break;
        default:
          throw new Error(`Unsupported model: ${model}`);
      }

      const { score, metrics } = await calculateDetailedScore(prompt, response.text);

      responses.push({
        model,
        response: response.text,
        accuracyScore: score,
        metrics,
      });
    } catch (error) {
      console.error(`Error with ${model}:`, error);
      responses.push({
        model,
        response: `Error: Failed to generate response from ${model}`,
        accuracyScore: 0,
        metrics: {
          coherence: 0,
          relevance: 0,
          fluency: 0,
          toxicity: 0,
        },
      });
    }
  }

  return responses;
}

async function callOpenAI(prompt: string, model: string) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      stream: true,
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return {
    text: response.data.choices[0].message.content,
    raw: response.data,
  };
}

async function callGemini(prompt: string, model: string) {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      temperature: 0.7,
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
}

async function callClaude(prompt: string) {
  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-2',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );

  return {
    text: response.data.content[0].text,
    raw: response.data,
  };
}

async function callPaLM(prompt: string) {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText`,
    {
      prompt: { text: prompt },
      temperature: 0.7,
      candidate_count: 1,
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.PALM_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return {
    text: response.data.candidates[0].output,
    raw: response.data,
  };
}