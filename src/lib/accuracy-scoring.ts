import { encode } from 'gpt-3-encoder';

interface Metrics {
  coherence: number;
  relevance: number;
  fluency: number;
  toxicity: number;
}

export async function calculateDetailedScore(
  prompt: string,
  response: string
): Promise<{ score: number; metrics: Metrics }> {
  // Encode prompt and response to tokens
  const promptTokens = encode(prompt);
  const responseTokens = encode(response);

  // Calculate coherence based on sentence structure and flow
  const coherence = calculateCoherence(response);

  // Calculate relevance based on prompt and response overlap
  const relevance = calculateRelevance(promptTokens, responseTokens);

  // Calculate fluency based on grammar and natural language patterns
  const fluency = calculateFluency(response);

  // Check for potential toxic or inappropriate content
  const toxicity = await checkToxicity(response);

  // Calculate overall score with weighted components
  const score =
    coherence * 0.3 + relevance * 0.3 + fluency * 0.3 + (1 - toxicity) * 0.1;

  return {
    score,
    metrics: {
      coherence,
      relevance,
      fluency,
      toxicity,
    },
  };
}

function calculateCoherence(text: string): number {
  // Simple coherence calculation based on sentence length variance
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  if (sentences.length < 2) return 0.5;

  const lengths = sentences.map((s) => s.trim().split(/\s+/).length);
  const avg = lengths.reduce((a, b) => a + b) / lengths.length;
  const variance =
    lengths.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / lengths.length;

  // Lower variance indicates more consistent sentence length
  return Math.max(0, Math.min(1, 1 - variance / 100));
}

function calculateRelevance(promptTokens: number[], responseTokens: number[]): number {
  // Calculate token overlap between prompt and response
  const promptSet = new Set(promptTokens);
  const overlap = responseTokens.filter((token) => promptSet.has(token)).length;

  // Calculate relevance score based on overlap ratio
  return Math.min(1, overlap / (promptTokens.length * 0.5));
}

function calculateFluency(text: string): number {
  // Basic fluency checks
  const words = text.trim().split(/\s+/);
  if (words.length < 3) return 0.5;

  // Check for repeated words (lower score for excessive repetition)
  const repetitionPenalty = calculateRepetitionPenalty(words);

  // Check for sentence completeness
  const completeness = text.match(/[.!?][\s"')]*([\n\r]|$)/g)?.length ?? 0;
  const completenesScore = Math.min(1, completeness / 3);

  return (completenesScore + (1 - repetitionPenalty)) / 2;
}

function calculateRepetitionPenalty(words: string[]): number {
  const frequencies = new Map<string, number>();
  words.forEach((word) => {
    frequencies.set(word, (frequencies.get(word) ?? 0) + 1);
  });

  const maxFreq = Math.max(...Array.from(frequencies.values()));
  return Math.min(1, (maxFreq - 1) / 10);
}

async function checkToxicity(text: string): Promise<number> {
  // Implement basic toxicity detection
  const toxicPatterns = [
    /hate/i,
    /offensive/i,
    /racist/i,
    /violent/i,
    /explicit/i,
  ];

  const matches = toxicPatterns.filter((pattern) => pattern.test(text)).length;
  return Math.min(1, matches / toxicPatterns.length);
}