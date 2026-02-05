import { buildAgentNotesPrompt } from "../lib/prompts.js";
import type { Session } from "../lib/types.js";
import { geminiClient } from "./geminiClient.js";
import { openai } from "./openaiClient.js";

export default async function buildAgentNotes(
  session: Session,
): Promise<string> {
  let notes = "";

  const agentNotesPrompt = buildAgentNotesPrompt(session);

  const response = await geminiClient.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: agentNotesPrompt }] }],
    config: {
      temperature: 0.2,
    },
  });

  const text = response.text;

  return text || notes;
}
