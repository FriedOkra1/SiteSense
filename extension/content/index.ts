import browser from "webextension-polyfill";
import {
  type PolicyScanRequest,
  isPolicyScanTrigger
} from "@shared/messages";
import { extractCandidatePolicyText } from "@shared/policy";

async function queuePolicyAnalysis(): Promise<void> {
  const content = extractCandidatePolicyText(document);

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

browser.runtime.onMessage.addListener((message: unknown) => {
  if (isPolicyScanTrigger(message)) {
    void queuePolicyAnalysis();
  }
});

