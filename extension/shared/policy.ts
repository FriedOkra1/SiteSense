const PRIVACY_KEYWORDS = [
  "privacy",
  "data",
  "collection",
  "sharing",
  "retention",
  "consent",
  "gdpr",
  "ccpa"
] as const;

export function sanitizePolicyText(raw: string): string {
  return raw
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

export function extractCandidatePolicyText(root: Document): string | null {
  const body = root.body;
  if (!body) {
    return null;
  }

  const rawText = body.innerText ?? body.textContent ?? "";
  const text = sanitizePolicyText(rawText);
  if (text.length < 500) {
    return null;
  }

  const lower = text.toLowerCase();
  const hasKeyword = PRIVACY_KEYWORDS.some((keyword) => lower.includes(keyword));
  if (!hasKeyword) {
    return null;
  }

  return text.slice(0, 40000);
}

