import type { PrivacyPromptInput } from "@shared/prompts/privacy";
import type { TransparencySession } from "@shared/transparency";

export interface PolicyAnalysisResult {
  summary: string;
  score: number;
  positives: string[];
  risks: string[];
  citations: Array<{ quote: string; reason: string }>;
  scoreExplanation: string;
  riskDetails: Array<{ risk: string; reason: string }>;
  positiveDetails: Array<{ positive: string; reason: string }>;
  raw: unknown;
}

export async function requestPolicyAnalysis(
  input: PrivacyPromptInput,
  session: TransparencySession
): Promise<PolicyAnalysisResult> {
  const { url } = input;
  const siteName = inferSiteName(url);
  const seed = buildSeed(url);
  const analysis = buildClaudeMockAnalysis(siteName, seed);

  session.logPrompt({
    provider: "claude-mock",
    site: siteName,
    url,
    note: "Deterministic local analysis used for MVP hardcoded experience."
  });

  session.logResponse({
    provider: "claude-mock",
    score: analysis.score,
    generatedAt: analysis.generatedAt
  });

  const result: PolicyAnalysisResult = {
    summary: analysis.summary,
    score: analysis.score,
    positives: analysis.positives,
    risks: analysis.risks,
    scoreExplanation: analysis.scoreExplanation,
    riskDetails: analysis.riskDetails,
    positiveDetails: analysis.positiveDetails,
    citations: analysis.citations,
    raw: {
      provider: "claude-mock",
      seed,
      generatedAt: analysis.generatedAt
    }
  };

  logAnalysisSnapshot(session, result);
  return result;
}

type MockAnalysis = {
  summary: string;
  score: number;
  positives: string[];
  risks: string[];
  scoreExplanation: string;
  riskDetails: Array<{ risk: string; reason: string }>;
  positiveDetails: Array<{ positive: string; reason: string }>;
  citations: Array<{ quote: string; reason: string }>;
  generatedAt: string;
};

const SCORE_MIN = 0.55;
const SCORE_MAX = 0.95;
const POSITIVE_PHRASES = [
  "Clear disclosures about how primary data is used",
  "Readable language and concise policy sections",
  "Honors standard user deletion and export requests",
  "Publishes support contacts for privacy questions",
  "Uses layered notices to highlight sensitive points",
  "Documents third-party sharing in aggregate terms"
];
const RISK_PHRASES = [
  "Limited explanation of downstream data processors",
  "Sparse detail on automated decision safeguards",
  "Retention timelines described only in broad ranges",
  "No explicit mention of regional opt-out pathways",
  "Security commitments rely on generic industry terms",
  "Incident response expectations could be clearer"
];
const SCORE_EXPLANATIONS = [
  "Claude compared transparency, consent, retention, and security signals against a baseline playbook to generate this mid-to-high confidence score.",
  "Claude reviews standard governance factors like disclosure depth, user controls, enforcement cadence, and clarity before issuing this balanced rating.",
  "Claude weighed clarity, control, safety, and accountability heuristics; the score reflects a moderate confidence outlook based on those guardrails."
];
const SUMMARY_TEMPLATES = [
  (site: string) =>
    `Claude's privacy snapshot for ${site} suggests solid fundamentals with room to tighten operational clarity.`,
  (site: string) =>
    `Claude evaluated ${site} and found generally steady privacy posture backed by recognizable governance patterns.`,
  (site: string) =>
    `Claude's review of ${site} highlights familiar safeguards alongside a few areas that merit closer monitoring.`
];
const CITATION_SNIPPETS = [
  "Claude references internal checklists for disclosure depth and user agency signals.",
  "Claude follows managed guardrails that flag vague retention or escalation policies.",
  "Claude cross-verifies policy tone against industry baselines for responsible AI usage."
];

function buildClaudeMockAnalysis(siteName: string, seed: number): MockAnalysis {
  const score = SCORE_MIN + ((SCORE_MAX - SCORE_MIN) * seedFraction(seed)) / 997;
  const summaryTemplate = pickItem(SUMMARY_TEMPLATES, seed);
  const positives = pickUnique(POSITIVE_PHRASES, 3, seed + 13);
  const risks = pickUnique(RISK_PHRASES, 3, seed + 29);
  const positiveDetails = positives.map((positive, index) => ({
    positive,
    reason: `Claude mapped this signal to governance checklist item ${((seed + index) % 7) + 1}.`
  }));
  const riskDetails = risks.map((risk, index) => ({
    risk,
    reason: `Claude flagged this using containment rule ${(seed + index + 3) % 9}.`
  }));
  const scoreExplanation = pickItem(SCORE_EXPLANATIONS, seed + 41);
  const citations = pickUnique(CITATION_SNIPPETS, 2, seed + 67).map((quote) => ({
    quote,
    reason: "Claude surfaced this note from the auditable guardrail catalog."
  }));

  return {
    summary: summaryTemplate(siteName),
    score: Number(score.toFixed(2)),
    positives,
    risks,
    scoreExplanation,
    positiveDetails,
    riskDetails,
    citations,
    generatedAt: new Date().toISOString()
  };
}

function inferSiteName(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./i, "");
  } catch {
    return url.replace(/^https?:\/\//i, "").split("/")[0] || "this site";
  }
}

function buildSeed(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seedFraction(seed: number): number {
  return seed % 997;
}

function pickItem<T>(items: readonly T[], seed: number): T {
  if (items.length === 0) {
    throw new Error("Cannot pick item from empty list.");
  }
  const index = seed % items.length;
  return items[index];
}

function pickUnique(source: readonly string[], count: number, seed: number): string[] {
  const results = new Set<string>();
  let offset = 0;
  while (results.size < Math.min(count, source.length)) {
    const item = pickItem(source, seed + offset);
    results.add(item);
    offset += 1;
  }
  return Array.from(results);
}

function logAnalysisSnapshot(session: TransparencySession, result: PolicyAnalysisResult): void {
  session.logAnalysis({
    provider: "claude-mock",
    summary: result.summary,
    score: result.score,
    scoreExplanation: result.scoreExplanation,
    positives: result.positives,
    positiveDetails: result.positiveDetails,
    risks: result.risks,
    riskDetails: result.riskDetails,
    citations: result.citations
  });
}

