import type { Session } from "../lib/types.js";

export const sessions = new Map<string, Session>();

export function getSession(
  sessionId: string,
  metadata?: Session["metadata"],
): Session {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      sessionId,
      scamDetected: false,
      stage: "DETECT",
      messages: [],
      messageCount: 0,
      intel: {
        bankAccounts: [],
        upiIds: [],
        phishingLinks: [],
        phoneNumbers: [],
        suspiciousKeywords: [],
      },
      callbackSent: false,
      metadata: metadata || {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  return sessions.get(sessionId)!;
}
