import browser from "webextension-polyfill";
import { isPolicyScanRequest, PolicyScanResult } from "@shared/messages";

browser.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    console.info("[SiteSense] Extension installed. Ready to scan privacy policies.");
  }
});

browser.runtime.onMessage.addListener(async (message, sender) => {
  if (!isPolicyScanRequest(message)) {
    return undefined;
  }

  console.debug("[SiteSense] Received policy scan request", {
    url: message.url,
    contentLength: message.content.length,
    tabId: sender.tab?.id
  });

  const response: PolicyScanResult = {
    type: "policy:scan-result",
    url: message.url,
    status: "queued",
    summary:
      "Analysis pipeline stubbed. LLM integration pending. Content received for transparent processing."
  };

  await browser.runtime.sendMessage(response);

  return response;
});

