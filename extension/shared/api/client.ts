import { buildPrivacyPrompt, type PrivacyPromptInput } from "@shared/prompts/privacy";
import { getApiKey } from "@shared/storage";
import type { TransparencySession } from "@shared/transparency";

export interface PolicyAnalysisResult {
  summary: string;
  score: number;
  positives: string[];
  risks: string[];
  citations: Array<{ quote: string; reason: string }>;
  raw: unknown;
}

export class MissingApiKeyError extends Error {
  constructor() {
    super(
      "An API key is required to perform policy analysis. Add one via the options page or .env configuration."
    );
    this.name = "MissingApiKeyError";
  }
}

export async function requestPolicyAnalysis(
  input: PrivacyPromptInput,
  session: TransparencySession
): Promise<PolicyAnalysisResult> {
  const storedKey = await getApiKey();
  const envKey = import.meta.env.VITE_LLM_API_KEY?.trim();
  const apiKey = storedKey ?? (envKey && envKey.length > 0 ? envKey : null);

  if (!apiKey) {
    throw new MissingApiKeyError();
  }

  const payload = buildPrivacyPrompt(input);
  session.logPrompt({ ...payload, input: { ...payload.input, policy_excerpt: "[redacted]" } });

  const endpoint = import.meta.env.VITE_LLM_ENDPOINT;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`
  };

  if (endpoint) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      session.logError(`LLM request failed: ${response.status} ${errorText}`);
      throw new Error(`LLM request failed with status ${response.status}`);
    }

    const result = await response.json();
    session.logResponse(result);

    return {
      summary: result?.summary ?? "LLM response missing summary.",
      score: typeof result?.score === "number" ? result.score : 0.5,
      positives: Array.isArray(result?.positives) ? result.positives : [],
      risks: Array.isArray(result?.risks) ? result.risks : [],
      citations: Array.isArray(result?.citations) ? result.citations : [],
      raw: result
    };
  }

  const simulated: PolicyAnalysisResult = {
    summary: "Simulated analysis pending real LLM endpoint integration.",
    score: 0.5,
    positives: ["Open source transparency", "No persistent storage"],
    risks: ["LLM endpoint not configured"],
    citations: [],
    raw: { warning: "LLM endpoint not configured. Returning simulated result." }
  };

  session.logResponse(simulated.raw);

  return simulated;
}

