import browser, { type Runtime } from "webextension-polyfill";
import {
  isPermissionAuditRequest,
  isTransparencyExportRequest,
  isPolicyScanRequest,
  PolicyScanResult
} from "@shared/messages";
import { requestPolicyAnalysis, MissingApiKeyError } from "@shared/api/client";
import { TransparencyLedger } from "@shared/transparency";
import { evaluateInstalledExtensions } from "@background/permissions";

const transparencyLedger = new TransparencyLedger();

browser.runtime.onInstalled.addListener((details: Runtime.OnInstalledDetailsType) => {
  const { reason } = details;
  if (reason === "install") {
    console.info("[SiteSense] Extension installed. Ready to scan privacy policies.");
  }
});

browser.runtime.onMessage.addListener(async (message: unknown, sender: Runtime.MessageSender) => {
  if (isPermissionAuditRequest(message)) {
    const audit = await evaluateInstalledExtensions();
    const response = {
      type: "permissions:audit-result",
      extensions: audit
    } as const;
    await browser.runtime.sendMessage(response);
    return response;
  }

  if (isTransparencyExportRequest(message)) {
    const response = {
      type: "transparency:export-result",
      sessions: transparencyLedger.export()
    } as const;
    await browser.runtime.sendMessage(response);
    return response;
  }

  if (!isPolicyScanRequest(message)) {
    return undefined;
  }

  console.debug("[SiteSense] Received policy scan request", {
    url: message.url,
    contentLength: message.content.length,
    tabId: sender.tab?.id
  });

  const sessionId = `${message.url}::${Date.now()}`;
  const session = transparencyLedger.get(sessionId);

  await browser.runtime.sendMessage({
    type: "policy:scan-result",
    url: message.url,
    status: "processing",
    summary: "Policy content queued for analysis…",
    sessionId
  } satisfies PolicyScanResult);

  try {
    const result = await requestPolicyAnalysis(
      { url: message.url, content: message.content },
      session
    );

    const response: PolicyScanResult = {
      type: "policy:scan-result",
      url: message.url,
      status: "complete",
      summary: result.summary,
      score: result.score,
      positives: result.positives,
      risks: result.risks,
      sessionId
    };

    await browser.runtime.sendMessage(response);
    return response;
  } catch (error) {
    session.logError(error);

    const errorResponse: PolicyScanResult = {
      type: "policy:scan-result",
      url: message.url,
      status: "error",
      summary:
        error instanceof MissingApiKeyError
          ? "Add an API key in the options page to enable analysis."
          : "Analysis failed. Check transparency log for details.",
      sessionId,
      error: error instanceof Error ? error.message : String(error)
    };

    await browser.runtime.sendMessage(errorResponse);
    return errorResponse;
  }
});

