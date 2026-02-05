import type { Request, Response } from "express";
import type { IncomingRequest, Session } from "../lib/types.js";
import { getSession } from "../store/sessionStore.js";
import extractIntel from "../lib/extractIntel.js";
import { detectScam } from "../llm/detectScam.js";
import { sendPayloadToGuvi } from "../sendPayloadToGuvi.js";
import agentReply from "../llm/agentReply.js";

export default async function intelHiveController(req: Request, res: Response) {
  const body = req.body as IncomingRequest;
  const session: Session = getSession(body.sessionId, body?.metadata);

  // Initialize session messages if empty
  if (session.messages.length == 0 && body.conversationHistory.length > 0) {
    session.messages = body.conversationHistory;
    session.messageCount = body.conversationHistory.length;
  }

  // Append new message to session
  session.messages.push(body.message);
  session.messageCount++;
  session.updatedAt = Date.now();

  // Extract Intel and update session.intel
  if (body.message.sender === "scammer") {
    extractIntel(body.message.text, session.intel); // Pass the session.intel object to be mutated
  }

  // Detect Scam if not already detected
  try {
    if (!session.scamDetected) {
      const result = await detectScam(body.message.text, session.messages);

      // Update session based on detection result
      if (result.intent === "scam" && result.confidence >= 0.8) {
        session.scamDetected = true;
        session.stage = "ENGAGE";

        // Append the Intel extracted from conversation history
        for (const msg of body.conversationHistory) {
          if (msg.sender === "scammer") {
            extractIntel(msg.text, session.intel); // Pass the session.intel object to be mutated
          }
        }

        console.log(
          "Scam detected with high confidence. Session updated to ENGAGE stage.",
        );

        console.log("Extracted Intel so far:", session);
      }
    }
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      message: JSON.parse(error.message).error.message,
    });
  }

  try {
    // Scam is Detected, now act like a confused user
    if (session.scamDetected && session.stage === "ENGAGE") {
      const reply = await agentReply(session.messages, session.metadata);

      // Append agent reply to session
      session.messages.push({
        sender: "user",
        text: reply,
        timestamp: Date.now(),
      });

      // Update message count
      session.messageCount++;

      // End Session
      if (
        session.intel.upiIds.length > 0 ||
        session.intel.phishingLinks.length > 0
      ) {
        // Mark session as DONE and send payload to Guvi API
        session.stage = "DONE";
        console.log("Session marked as DONE. Sending payload to Guvi..");
        await sendPayloadToGuvi(session);
      }

      return res.json({ status: "success", reply });
    }
  } catch (err: any) {
    return res.status(500).json({
      status: "error",
      message: JSON.parse(err.message).error.message,
    });
  }

  res.json({ status: "success", reply: "Can you explain?" });
}
