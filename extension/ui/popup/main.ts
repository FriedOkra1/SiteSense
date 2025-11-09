import "../styles/tokens.css";
import "./popup.css";
import browser from "webextension-polyfill";
import {
  isPermissionAuditResult,
  isPolicyScanResult,
  type PermissionAuditResultMessage,
  type PolicyScanResult
} from "@shared/messages";
import type { ExtensionPermissionSummary } from "@shared/rules/permissions";

const statusEl = document.getElementById("status-text");
const refreshButton = document.getElementById("refresh-button");
const transparencyLink = document.getElementById("open-transparency");
const scoreEl = document.getElementById("score-value");
const summaryEl = document.getElementById("summary-text");
const positivesList = document.getElementById("positives-list") as HTMLUListElement | null;
const risksList = document.getElementById("risks-list") as HTMLUListElement | null;
const extensionsList = document.getElementById("extensions-list");

function setStatus(
  text: string,
  accent: "default" | "processing" | "complete" | "error" = "default"
) {
  if (!statusEl) {
    return;
  }

  statusEl.textContent = text;
  statusEl.className = `status status--${accent}`;
}

function renderList(target: HTMLUListElement | null, items: string[], emptyText: string): void {
  if (!target) {
    return;
  }

  target.textContent = "";

  if (!items.length) {
    const placeholder = document.createElement("li");
    placeholder.textContent = emptyText;
    target.appendChild(placeholder);
    return;
  }

  for (const item of items.slice(0, 5)) {
    const element = document.createElement("li");
    element.textContent = item;
    target.appendChild(element);
  }
}

function renderExtensions(extensions: ExtensionPermissionSummary[]): void {
  if (!extensionsList) {
    return;
  }

  extensionsList.textContent = "";

  if (!extensions.length) {
    const empty = document.createElement("p");
    empty.className = "extensions-empty";
    empty.textContent = "No other extensions detected.";
    extensionsList.appendChild(empty);
    return;
  }

  for (const extension of extensions.slice(0, 5)) {
    const card = document.createElement("article");
    card.className = "extension-card";

    const header = document.createElement("div");
    header.className = "extension-card__header";

    const name = document.createElement("span");
    name.className = "extension-card__name";
    name.textContent = extension.name;

    const badge = document.createElement("span");
    badge.className = `extension-card__badge extension-card__badge--${extension.audit.overall}`;
    badge.textContent = `${extension.audit.overall.toUpperCase()} • ${(extension.audit.score * 100).toFixed(0)}%`;

    header.appendChild(name);
    header.appendChild(badge);

    const description = document.createElement("p");
    description.className = "extension-card__description";
    const topFinding = extension.audit.findings[0];
    description.textContent = topFinding
      ? topFinding.rationale
      : "No sensitive permissions detected.";

    card.appendChild(header);

    if (!extension.enabled) {
      const disabled = document.createElement("p");
      disabled.className = "extension-card__description";
      disabled.textContent = "Extension disabled.";
      card.appendChild(disabled);
    }

    card.appendChild(description);
    extensionsList.appendChild(card);
  }
}

function renderAnalysis(result: PolicyScanResult): void {
  if (summaryEl) {
    summaryEl.textContent = result.summary;
  }

  if (scoreEl) {
    scoreEl.textContent =
      typeof result.score === "number" ? `${Math.round(result.score * 100)}%` : "--";
  }

  renderList(positivesList, result.positives ?? [], "No strengths highlighted yet.");
  renderList(risksList, result.risks ?? [], "No risks identified yet.");
}

async function triggerActiveTabScan(): Promise<void> {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) {
      setStatus("No active tab detected.", "processing");
      return;
    }

    await browser.tabs.sendMessage(tab.id, { type: "policy:scan-trigger" });
    setStatus("Re-running policy detection…", "processing");
  } catch (error) {
    console.error("[SiteSense] Failed to trigger scan", error);
    setStatus("Unable to queue scan. Check console.", "processing");
  }
}

if (refreshButton) {
  refreshButton.addEventListener("click", () => {
    void triggerActiveTabScan();
  });
}

if (transparencyLink) {
  transparencyLink.addEventListener("click", (event) => {
    event.preventDefault();
    void browser.runtime.openOptionsPage();
  });
}

browser.runtime.onMessage.addListener((message: unknown) => {
  if (!isPolicyScanResult(message)) {
    return;
  }

  const { summary, status, score, positives, risks, error } = message;

  if (status === "processing") {
    setStatus(summary, "processing");
    return;
  }

  if (status === "error") {
    setStatus(error ?? summary, "error");
    return;
  }

  renderAnalysis(message);
  setStatus(summary, "complete");
});

browser.runtime.onMessage.addListener((message: unknown) => {
  if (!isPermissionAuditResult(message)) {
    return;
  }

  renderExtensions(message.extensions);
});

setStatus("Waiting for analysis…");
renderList(positivesList, [], "No strengths highlighted yet.");
renderList(risksList, [], "No risks identified yet.");
renderExtensions([]);

async function requestPermissionAudit(): Promise<void> {
  try {
    const response = (await browser.runtime.sendMessage({
      type: "permissions:audit"
    })) as PermissionAuditResultMessage | undefined;

    if (response && isPermissionAuditResult(response)) {
      renderExtensions(response.extensions);
    }
  } catch (error) {
    console.error("[SiteSense] Failed to load extension audits", error);
  }
}

void requestPermissionAudit();

