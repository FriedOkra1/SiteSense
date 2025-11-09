import "../styles/tokens.css";
import "./popup.css";
import browser from "webextension-polyfill";
import { isPolicyScanResult, type PolicyScanResult } from "@shared/messages";

const siteNameEl = document.getElementById("site-name");
const statusEl = document.getElementById("status-text");
const refreshButton = document.getElementById("refresh-button");
const transparencyLink = document.getElementById("open-transparency");
const scoreEl = document.getElementById("score-value");
const summaryEl = document.getElementById("summary-text");
const positivesList = document.getElementById("positives-list") as HTMLUListElement | null;
const risksList = document.getElementById("risks-list") as HTMLUListElement | null;
const scoreExplanationEl = document.getElementById("score-explanation");
const riskDetailsList = document.getElementById("risk-details-list") as HTMLUListElement | null;
const positiveDetailsList = document.getElementById("positive-details-list") as HTMLUListElement | null;
const citationsList = document.getElementById("citations-list") as HTMLUListElement | null;

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

function renderAnalysis(result: PolicyScanResult): void {
  updateSiteName(result.url);

  if (summaryEl) {
    summaryEl.textContent = result.summary;
  }

  if (scoreEl) {
    scoreEl.textContent =
      typeof result.score === "number" ? `${Math.round(result.score * 100)}%` : "--";
  }

  renderList(positivesList, result.positives ?? [], "No strengths highlighted yet.");
  renderList(risksList, result.risks ?? [], "No risks identified yet.");

  if (scoreExplanationEl) {
    scoreExplanationEl.textContent = result.scoreExplanation ?? "No explanation provided.";
  }

  renderDetailList(
    riskDetailsList,
    result.riskDetails?.map((item) => `${item.risk}: ${item.reason}`) ?? [],
    "No risk rationale provided."
  );

  renderDetailList(
    positiveDetailsList,
    result.positiveDetails?.map((item) => `${item.positive}: ${item.reason}`) ?? [],
    "No positive rationale provided."
  );

  renderDetailList(
    citationsList,
    result.citations?.map((citation) => `"${citation.quote}" — ${citation.reason}`) ?? [],
    "No citations supplied."
  );
}

function renderDetailList(
  target: HTMLUListElement | null,
  items: string[],
  emptyText: string
): void {
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

  const { summary, status, score, positives, risks, error, url } = message;

  if (url) {
    updateSiteName(url);
  }

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

setStatus("Claude is preparing a snapshot…");
renderList(positivesList, [], "No strengths highlighted yet.");
renderList(risksList, [], "No risks identified yet.");
if (scoreExplanationEl) {
  scoreExplanationEl.textContent = "Awaiting Claude's analysis.";
}
renderDetailList(riskDetailsList, [], "No risk rationale provided.");
renderDetailList(positiveDetailsList, [], "No positive rationale provided.");
renderDetailList(citationsList, [], "No citations supplied.");

function updateSiteName(url: string | undefined): void {
  if (!siteNameEl || !url) {
    return;
  }

  const name = formatSiteName(url);
  siteNameEl.textContent = `Reviewing: ${name}`;
}

function formatSiteName(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./i, "");
  } catch {
    return url.replace(/^https?:\/\//i, "").split("/")[0] || "current site";
  }
}

