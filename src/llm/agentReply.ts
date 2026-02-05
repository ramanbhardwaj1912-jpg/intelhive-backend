import type { Message, Session } from "../lib/types.js";
import { agentReplyPrompt } from "../lib/prompts.js";
import { geminiClient } from "./geminiClient.js";

export default async function agentReply(
  messages: Message[],
  metadata?: Session["metadata"],
): Promise<string> {
  const response = await geminiClient.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      { role: "user", parts: [{ text: agentReplyPrompt(messages, metadata) }] },
    ],
    config: {
      temperature: 0.6,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini LLM");
  }

  return text;
}
