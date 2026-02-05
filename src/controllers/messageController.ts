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

  console.log("Request hit: ", body);
  console.log("Session before processing: ", session);

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
        session.messageCount >= 15 ||
        session.intel.upiIds.length > 0 ||
        session.intel.phishingLinks.length > 0
      ) {
        // Mark session as DONE and send payload to Guvi API
        session.stage = "DONE";
        await sendPayloadToGuvi(session);
      }

      console.log("Session after processing: ", session);
      return res.json({ status: "success", reply });
    }
  } catch (err: any) {
    return res.status(500).json({
      status: "error",
      message: JSON.parse(err.message).error.message,
      xd: "RANDI",
    });
  }

  res.json({ status: "success", reply: "Can you explain?" });
}
