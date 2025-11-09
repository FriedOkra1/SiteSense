export type PolicyScanRequest = {
  type: "policy:scan";
  url: string;
  content: string;
};

export type PolicyScanResult = {
  type: "policy:scan-result";
  url: string;
  summary: string;
  status: "queued" | "processing" | "complete";
};

export type PolicyScanTrigger = {
  type: "policy:scan-trigger";
};

export type RuntimeMessage =
  | PolicyScanRequest
  | PolicyScanResult
  | PolicyScanTrigger;

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

