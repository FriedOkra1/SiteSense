export interface PrivacyPromptInput {
  url: string;
  content: string;
}

export interface PrivacyPromptPayload {
  model: string;
  input: {
    instructions: string;
    policy_excerpt: string;
    url: string;
    response_schema: {
      type: "json_schema";
      json_schema: {
        name: string;
        schema: Record<string, unknown>;
      };
    };
  };
}

const BASE_INSTRUCTIONS = [
  "You are SiteSense, an open-source privacy reviewer.",
  "Analyze the provided privacy policy excerpt strictly for collection, sharing, retention, user control, and transparency signals.",
  "Return structured JSON following the schema. Do not include any additional text or commentary."
].join(" ");

const RESPONSE_SCHEMA = {
  type: "object",
  required: ["summary", "score", "positives", "risks", "citations"],
  properties: {
    summary: {
      type: "string",
      description: "One sentence summary of the site's privacy posture."
    },
    score: {
      type: "number",
      minimum: 0,
      maximum: 1,
      description: "Normalized privacy score between 0 (unsafe) and 1 (excellent)."
    },
    positives: {
      type: "array",
      items: {
        type: "string"
      },
      description: "Notable positive privacy commitments."
    },
    risks: {
      type: "array",
      items: {
        type: "string"
      },
      description: "Key risks or missing information."
    },
    citations: {
      type: "array",
      items: {
        type: "object",
        required: ["quote", "reason"],
        properties: {
          quote: {
            type: "string",
            description: "Direct excerpt from the policy."
          },
          reason: {
            type: "string",
            description: "Why this excerpt matters to the score."
          }
        }
      },
      description: "Evidence references backing the summary."
    }
  },
  additionalProperties: false
};

export function buildPrivacyPrompt(input: PrivacyPromptInput): PrivacyPromptPayload {
  return {
    model: "gpt-4.1-mini",
    input: {
      instructions: BASE_INSTRUCTIONS,
      url: input.url,
      policy_excerpt: input.content,
      response_schema: {
        type: "json_schema",
        json_schema: {
          name: "sitesense_privacy_report",
          schema: RESPONSE_SCHEMA
        }
      }
    }
  };
}

