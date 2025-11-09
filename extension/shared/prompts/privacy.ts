export interface PrivacyPromptInput {
  url: string;
  content: string;
}

export type MessageContent =
  | {
      type: "input_text";
      text: string;
    };

export interface PromptMessage {
  role: "system" | "user";
  content: MessageContent[];
}

export interface JsonSchemaFormatConfig {
  type: "json_schema";
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
}

export interface PrivacyPromptPayload {
  model: string;
  text: {
    format: JsonSchemaFormatConfig;
  };
  input: PromptMessage[];
}

const BASE_INSTRUCTIONS = [
  "You are SiteSense, an open-source privacy reviewer.",
  "Analyze the provided privacy policy excerpt strictly for collection, sharing, retention, user control, and transparency signals.",
  "Return structured JSON following the schema. Do not include any additional text or commentary."
].join(" ");

const RESPONSE_SCHEMA = {
  type: "object",
  required: ["summary", "score", "positives", "risks"],
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
    score_explanation: {
      type: "string",
      description: "Reasoning that justifies the assigned score."
    },
    positive_details: {
      type: "array",
      items: {
        type: "object",
        required: ["reason"],
        properties: {
          positive: {
            type: "string",
            description: "The positive finding being elaborated."
          },
          reason: {
            type: "string",
            description: "Explanation supporting the positive finding."
          }
        },
        additionalProperties: false
      },
      description: "Detailed explanations for each positive finding."
    },
    risk_details: {
      type: "array",
      items: {
        type: "object",
        required: ["reason"],
        properties: {
          risk: {
            type: "string",
            description: "The risk that is being described."
          },
          reason: {
            type: "string",
            description: "Explanation supporting the identified risk."
          }
        },
        additionalProperties: false
      },
      description: "Detailed explanations for each risk."
    },
    citations: {
      type: "array",
      items: {
        type: "object",
        required: ["quote", "reason"],
        properties: {
          quote: {
            type: "string",
            description: "Direct evidence from the policy that supports the finding."
          },
          reason: {
            type: "string",
            description: "Explanation of how the quote supports the finding."
          }
        },
        additionalProperties: false
      },
      description: "Supporting evidence drawn from the policy text."
    }
  },
  additionalProperties: false
};

export function buildPrivacyPrompt(input: PrivacyPromptInput): PrivacyPromptPayload {
  const userText = [
    `Analyze the following website privacy information.`,
    `URL: ${input.url}`,
    ``,
    `Policy Excerpt:`,
    input.content
  ].join("\n");

  return {
    model: "gpt-4.1-mini",
    text: {
      format: {
        type: "json_schema",
        name: "sitesense_privacy_report",
        schema: RESPONSE_SCHEMA,
        strict: true
      }
    },
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: BASE_INSTRUCTIONS
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: userText
          }
        ]
      }
    ]
  };
}

