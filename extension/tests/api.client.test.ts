import { afterEach, describe, expect, it, vi } from "vitest";
import { requestPolicyAnalysis } from "@shared/api/client";
import { TransparencySession } from "@shared/transparency";

describe("requestPolicyAnalysis", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a deterministic Claude-branded snapshot for a URL", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const session = new TransparencySession("deterministic-session");
    const first = await requestPolicyAnalysis(
      { url: "https://example.com/policy", content: "Example privacy policy text" },
      session
    );
    const second = await requestPolicyAnalysis(
      { url: "https://example.com/policy", content: "Any other text is ignored" },
      session
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(first.summary).toContain("Claude");
    expect(first.summary).toContain("example.com");
    expect(first.score).toBeGreaterThanOrEqual(0.55);
    expect(first.score).toBeLessThanOrEqual(0.95);
    expect(first.score).toBe(second.score);
    expect(first.positives.length).toBeGreaterThan(0);
    expect(first.risks.length).toBeGreaterThan(0);
    expect(first.positiveDetails[0]?.positive).toBe(first.positives[0]);
    expect(first.riskDetails[0]?.risk).toBe(first.risks[0]);
  });

  it("records prompt, response, and analysis events for transparency", async () => {
    const session = new TransparencySession("logging-session");
    await requestPolicyAnalysis(
      { url: "https://news.example.org", content: "Another policy snippet" },
      session
    );

    const events = session.snapshot();
    const providers = events
      .map((event) =>
        typeof event.payload === "object" && event.payload !== null
          ? (event.payload as { provider?: string }).provider
          : undefined
      )
      .filter(Boolean);

    expect(events.filter((event) => event.type === "prompt")).toHaveLength(1);
    expect(events.filter((event) => event.type === "response")).toHaveLength(1);
    expect(events.filter((event) => event.type === "analysis")).toHaveLength(1);
    expect(providers.every((provider) => provider === "claude-mock")).toBe(true);
  });
});
