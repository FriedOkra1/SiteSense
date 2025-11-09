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
  sessionId?: string;
  error?: string;
};

import type { ExtensionPermissionSummary } from "@shared/rules/permissions";
import type { TransparencyEvent } from "@shared/transparency";

export type PolicyScanTrigger = {
  type: "policy:scan-trigger";
};

export type PermissionAuditRequest = {
  type: "permissions:audit";
};

export type PermissionAuditResultMessage = {
  type: "permissions:audit-result";
  extensions: ExtensionPermissionSummary[];
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
  | PermissionAuditRequest
  | PermissionAuditResultMessage
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

export function isPermissionAuditRequest(message: unknown): message is PermissionAuditRequest {
  return (
    typeof message === "object" &&
    message !== null &&
    (message as Record<string, unknown>).type === "permissions:audit"
  );
}

export function isPermissionAuditResult(
  message: unknown
): message is PermissionAuditResultMessage {
  return (
    typeof message === "object" &&
    message !== null &&
    (message as Record<string, unknown>).type === "permissions:audit-result"
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

