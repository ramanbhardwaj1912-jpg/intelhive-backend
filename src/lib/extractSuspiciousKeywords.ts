import { SUSPICIOUS_PATTERNS } from "./category.js";

export function extractSuspiciousKeywords(
  text: string,
  intel: { suspiciousKeywords: string[] },
) {
  const lower = text.toLowerCase();
  const found = new Set(intel.suspiciousKeywords);

  for (const [category, patterns] of Object.entries(SUSPICIOUS_PATTERNS)) {
    for (const pattern of patterns) {
      if (lower.includes(pattern)) {
        found.add(`${category}:${pattern}`);
      }
    }
  }

  intel.suspiciousKeywords = Array.from(found);
}
