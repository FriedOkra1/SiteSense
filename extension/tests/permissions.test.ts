import { describe, expect, it } from "vitest";
import { auditPermissions } from "@shared/rules/permissions";

describe("permission audit", () => {
  it("flags low severity for benign permissions", () => {
    const audit = auditPermissions(["storage"]);
    expect(audit.overall).toBe("low");
    expect(audit.score).toBeLessThan(0.3);
  });

  it("escalates severity for high-risk permissions", () => {
    const audit = auditPermissions(["tabs", "scripting"]);
    expect(audit.overall).toBe("high");
    expect(audit.score).toBeGreaterThan(0.7);
  });

  it("adds findings for unknown host permissions", () => {
    const audit = auditPermissions(["host:https://example.com/"]);
    const finding = audit.findings.find((item) => item.permission.startsWith("host:"));
    expect(finding).toBeDefined();
    expect(finding?.severity).toBe("medium");
  });
});

