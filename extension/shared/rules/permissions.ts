export type PermissionSeverity = "low" | "medium" | "high";

export interface PermissionFinding {
  permission: string;
  severity: PermissionSeverity;
  rationale: string;
}

export interface PermissionAuditResult {
  overall: PermissionSeverity;
  score: number;
  findings: PermissionFinding[];
}

export interface ExtensionPermissionSummary {
  id: string;
  name: string;
  enabled: boolean;
  version: string;
  audit: PermissionAuditResult;
}

interface PermissionRule {
  severity: PermissionSeverity;
  rationale: string;
  weight: number;
}

const PERMISSION_RULES: Record<string, PermissionRule> = {
  activeTab: {
    severity: "medium",
    rationale: "Can read and modify the current tab after a user gesture.",
    weight: 0.4
  },
  tabs: {
    severity: "high",
    rationale: "Access to all browsing history and open tabs reveals sensitive context.",
    weight: 0.9
  },
  scripting: {
    severity: "high",
    rationale: "Allows executing arbitrary scripts in pages, enabling content manipulation.",
    weight: 0.85
  },
  management: {
    severity: "high",
    rationale: "Can inspect and control other installed extensions. Requires clear justification.",
    weight: 0.8
  },
  storage: {
    severity: "low",
    rationale: "Used for local extension storage; low risk when used transparently.",
    weight: 0.1
  },
  "webRequestBlocking": {
    severity: "high",
    rationale: "Can block or modify network requests, including confidential data.",
    weight: 0.95
  },
  "history": {
    severity: "high",
    rationale: "Direct access to full browsing history reveals personal behavior.",
    weight: 1
  },
  "cookies": {
    severity: "high",
    rationale: "Read and modify cookies which may include session tokens.",
    weight: 0.9
  },
  "notifications": {
    severity: "medium",
    rationale: "Can push notifications; low privacy impact but user facing.",
    weight: 0.2
  },
  "clipboardWrite": {
    severity: "medium",
    rationale: "Can write to clipboard; risk of overwriting sensitive data.",
    weight: 0.35
  },
  "clipboardRead": {
    severity: "high",
    rationale: "Can read clipboard contents, potentially capturing secrets.",
    weight: 0.9
  },
  "downloads": {
    severity: "medium",
    rationale: "Can initiate downloads and access downloaded files metadata.",
    weight: 0.4
  },
  "downloads.open": {
    severity: "high",
    rationale: "Allows opening downloaded files which could expose local data.",
    weight: 0.7
  }
};

const SEVERITY_WEIGHT: Record<PermissionSeverity, number> = {
  low: 0.2,
  medium: 0.6,
  high: 1
};

function classifyScore(score: number): PermissionSeverity {
  if (score >= 0.75) return "high";
  if (score >= 0.35) return "medium";
  return "low";
}

export function auditPermissions(permissions: string[]): PermissionAuditResult {
  const findings: PermissionFinding[] = [];
  let cumulativeWeight = 0;

  const uniquePermissions = Array.from(new Set(permissions));

  for (const permission of uniquePermissions) {
    const rule = PERMISSION_RULES[permission];
    if (!rule) {
      findings.push({
        permission,
        severity: "medium",
        rationale: "Unknown permission. Review documentation to confirm impact."
      });
      cumulativeWeight += 0.3;
      continue;
    }

    findings.push({
      permission,
      severity: rule.severity,
      rationale: rule.rationale
    });
    cumulativeWeight += rule.weight;
  }

  const normalizedScore = Math.min(1, cumulativeWeight / (uniquePermissions.length || 1));
  const overallSeverity = classifyScore(normalizedScore);

  return {
    overall: overallSeverity,
    score: Number(normalizedScore.toFixed(2)),
    findings
  };
}

