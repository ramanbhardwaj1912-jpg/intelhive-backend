import { extractSuspiciousKeywords } from "./extractSuspiciousKeywords.js";
import type { ExtractedIntelligence } from "./types.js";

export default function extractIntel(
  text: string,
  intel: ExtractedIntelligence,
) {
  const upi = text.match(/\b[\w.-]+@upi\b/g);
  const phone = text.match(/\+91\d{10}/g);
  const link = text.match(/https?:\/\/[^\s]+/g);

  if (upi) intel.upiIds.push(...upi);
  if (phone) intel.phoneNumbers.push(...phone);
  if (link) intel.phishingLinks.push(...link);

  extractSuspiciousKeywords(text, intel);
}
