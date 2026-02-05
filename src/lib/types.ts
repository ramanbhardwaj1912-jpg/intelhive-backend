export type Message = {
  sender: "scammer" | "user";
  text: string;
  timestamp: number;
};

export type IncomingRequest = {
  sessionId: string;
  message: Message;
  conversationHistory: Message[];

  metadata?: {
    channel: "SMS" | "WhatsApp" | "Email" | "Chat";
    language: string;
    locale: string;
  };
};

export type ExtractedIntelligence = {
  bankAccounts: string[];
  upiIds: string[];
  phishingLinks: string[];
  phoneNumbers: string[];
  suspiciousKeywords: string[];
};

export type Session = {
  sessionId: string;
  scamDetected: boolean;
  stage: "DETECT" | "ENGAGE" | "DONE";
  messages: Message[];
  messageCount: number;
  intel: ExtractedIntelligence;
  callbackSent: boolean;
  metadata?: {
    channel?: "SMS" | "WhatsApp" | "Email" | "Chat";
    language?: string;
    locale?: string;
  };
  createdAt: number;
  updatedAt: number;
};

export type FinalPayload = {
  sessionId: string;
  scamDetected: boolean;
  totalMessagesExchanged: number;
  extractedIntelligence: ExtractedIntelligence;
  agentNotes: string;
};

export type ScamDetectionResponse = {
  intent: "scam" | "legitimate" | "uncertain";
  confidence: number;
};
