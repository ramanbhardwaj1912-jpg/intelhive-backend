import { detectScamPrompt } from "../lib/prompts.js";
import type { Message, ScamDetectionResponse } from "../lib/types.js";
import { geminiClient } from "./geminiClient.js";

export async function detectScam(message: string, history: Message[]) {
  const prompt = detectScamPrompt(message, history);

  const response = await geminiClient.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      temperature: 0,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini LLM");
  }

  let parsedResponse: ScamDetectionResponse;

  try {
    parsedResponse = JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON from LLM: ${text}`);
  }

  return parsedResponse;
}
