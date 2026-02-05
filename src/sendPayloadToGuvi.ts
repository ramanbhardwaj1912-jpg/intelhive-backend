import axios from "axios";
import type { FinalPayload, Session } from "./lib/types.js";
import buildAgentNotes from "./llm/buildAgentNotes.js";

export async function sendPayloadToGuvi(session: Session) {
  if (session.callbackSent) return;

  const agentNotes = await buildAgentNotes(session);

  const finalPayload: FinalPayload = {
    sessionId: session.sessionId,
    scamDetected: session.scamDetected,
    totalMessagesExchanged: session.messageCount,
    extractedIntelligence: session.intel,
    agentNotes: agentNotes,
  };

  console.log("Sending final payload to Guvi:", finalPayload);
  await axios.post(
    "https://hackathon.guvi.in/api/updateHoneyPotFinalResults",
    finalPayload,
    {
      timeout: 5000,
    },
  );

  session.callbackSent = true;
  session.stage = "DONE";
}
