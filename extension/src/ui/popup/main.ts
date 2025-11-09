import "../styles/tokens.css";
import "./popup.css";
import browser from "webextension-polyfill";
import type { PolicyScanResult } from "@shared/messages";

const statusEl = document.getElementById("status-text");
const refreshButton = document.getElementById("refresh-button");
const transparencyLink = document.getElementById("open-transparency");

function setStatus(text: string, accent: "default" | "processing" | "complete" = "default") {
  if (!statusEl) {
    return;
  }

  statusEl.textContent = text;
  statusEl.className = `status status--${accent}`;
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

browser.runtime.onMessage.addListener((message: PolicyScanResult) => {
  if (message?.type !== "policy:scan-result") {
    return;
  }

  const { summary, status } = message;
  const accent = status === "complete" ? "complete" : "processing";
  setStatus(summary, accent);
});

setStatus("Waiting for analysis…");

