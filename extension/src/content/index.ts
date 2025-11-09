import browser from "webextension-polyfill";
import type { PolicyScanRequest, PolicyScanTrigger } from "@shared/messages";

function extractPolicyText(): string | null {
  const body = document.body;
  if (!body) {
    return null;
  }

  const textContent = body.innerText ?? "";
  const trimmed = textContent.trim();

  if (!trimmed || trimmed.length < 500) {
    return null;
  }

  const privacyKeywords = ["privacy", "data", "collection", "sharing", "retention"];
  const hasKeyword = privacyKeywords.some((keyword) =>
    trimmed.toLowerCase().includes(keyword)
  );

  return hasKeyword ? trimmed.slice(0, 20000) : null;
}

async function queuePolicyAnalysis(): Promise<void> {
  const content = extractPolicyText();

  if (!content) {
    return;
  }

  const message: PolicyScanRequest = {
    type: "policy:scan",
    url: window.location.href,
    content
  };

  try {
    await browser.runtime.sendMessage(message);
  } catch (error) {
    console.error("[SiteSense] Failed to queue policy analysis", error);
  }
}

void queuePolicyAnalysis();

browser.runtime.onMessage.addListener((message: PolicyScanTrigger) => {
  if (message?.type === "policy:scan-trigger") {
    void queuePolicyAnalysis();
  }
});

