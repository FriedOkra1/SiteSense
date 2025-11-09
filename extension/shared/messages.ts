export type PolicyScanRequest = {
  type: "policy:scan";
  url: string;
  content: string;
};

export type PolicyScanResult = {
  type: "policy:scan-result";
  url: string;
  summary: string;
  status: "queued" | "processing" | "complete" | "error";
  score?: number;
  positives?: string[];
  risks?: string[];
  scoreExplanation?: string;
  positiveDetails?: Array<{ positive: string; reason: string }>;
  riskDetails?: Array<{ risk: string; reason: string }>;
  citations?: Array<{ quote: string; reason: string }>;
  sessionId?: string;
  error?: string;
};

import type { TransparencyEvent } from "@shared/transparency";

export type PolicyScanTrigger = {
  type: "policy:scan-trigger";
};

export type TransparencyExportRequest = {
  type: "transparency:export";
};

export type TransparencyExportResult = {
  type: "transparency:export-result";
  sessions: Record<string, TransparencyEvent[]>;
};

export type RuntimeMessage =
  | PolicyScanRequest
  | PolicyScanResult
  | PolicyScanTrigger
  | TransparencyExportRequest
  | TransparencyExportResult;

export function isPolicyScanRequest(message: unknown): message is PolicyScanRequest {
  return (
    typeof message === "object" &&
    message !== null &&
    (message as Record<string, unknown>).type === "policy:scan" &&
    typeof (message as Record<string, unknown>).url === "string" &&
    typeof (message as Record<string, unknown>).content === "string"
  );
}

export function isPolicyScanResult(message: unknown): message is PolicyScanResult {
  return (
    typeof message === "object" &&
    message !== null &&
    (message as Record<string, unknown>).type === "policy:scan-result"
  );
}

export function isPolicyScanTrigger(message: unknown): message is PolicyScanTrigger {
  return (
    typeof message === "object" &&
    message !== null &&
    (message as Record<string, unknown>).type === "policy:scan-trigger"
  );
}

export function isTransparencyExportRequest(
  message: unknown
): message is TransparencyExportRequest {
  return (
    typeof message === "object" &&
    message !== null &&
    (message as Record<string, unknown>).type === "transparency:export"
  );
}

export function isTransparencyExportResult(
  message: unknown
): message is TransparencyExportResult {
  return (
    typeof message === "object" &&
    message !== null &&
    (message as Record<string, unknown>).type === "transparency:export-result"
  );
}

