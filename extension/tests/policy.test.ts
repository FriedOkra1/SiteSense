import { describe, expect, it } from "vitest";
import { extractCandidatePolicyText, sanitizePolicyText } from "@shared/policy";

function createDocument(html: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

describe("policy extraction utilities", () => {
  it("sanitizes policy text by collapsing whitespace", () => {
    const raw = "Privacy\n\tPolicy\n\rDetails";
    expect(sanitizePolicyText(raw)).toBe("Privacy Policy Details");
  });

  it("returns null when document lacks privacy keywords", () => {
    const doc = createDocument("<body><p>Welcome to our website.</p></body>");
    expect(extractCandidatePolicyText(doc)).toBeNull();
  });

  it("returns trimmed text when a privacy policy is detected", () => {
    const paragraph = "We collect data and respect GDPR obligations with clear retention policies.";
    const doc = createDocument(`
      <body>
        <h1>Privacy Policy</h1>
        <p>${paragraph.repeat(10)}</p>
      </body>
    `);
    const extracted = extractCandidatePolicyText(doc);
    expect(extracted).toBeTruthy();
    expect(extracted).toContain("GDPR");
  });

  it("limits extracted text to 40,000 characters", () => {
    const repeated = "privacy ".repeat(5000);
    const doc = createDocument(`<body><p>${repeated}</p></body>`);
    const extracted = extractCandidatePolicyText(doc);
    expect(extracted).toBeTruthy();
    expect(extracted!.length).toBeLessThanOrEqual(40000);
  });
});

