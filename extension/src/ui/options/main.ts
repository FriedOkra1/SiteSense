import "../styles/tokens.css";
import "./options.css";
import browser from "webextension-polyfill";
import { STORAGE_KEYS } from "@shared/storage";

const form = document.getElementById("api-form") as HTMLFormElement | null;
const textarea = document.getElementById("api-key") as HTMLTextAreaElement | null;
const statusEl = document.getElementById("form-status");
const clearButton = document.getElementById("clear-key") as HTMLButtonElement | null;

function setStatus(message: string, tone: "default" | "success" | "danger" = "default") {
  if (!statusEl) {
    return;
  }

  statusEl.textContent = message;
  statusEl.className = `status status--${tone}`;
}

async function hydrateForm(): Promise<void> {
  if (!textarea) {
    return;
  }

  try {
    const stored = await browser.storage.local.get(STORAGE_KEYS.apiKey);
    const key = stored[STORAGE_KEYS.apiKey];
    textarea.value = typeof key === "string" ? key : "";
    setStatus(key ? "API key loaded from secure storage." : "No API key stored yet.");
  } catch (error) {
    console.error("[SiteSense] Failed to load API key", error);
    setStatus("Unable to load existing key. Check console.", "danger");
  }
}

async function saveKey(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  if (!textarea) {
    return;
  }

  const key = textarea.value.trim();

  if (!key) {
    setStatus("Please enter an API key before saving.", "danger");
    return;
  }

  try {
    await browser.storage.local.set({ [STORAGE_KEYS.apiKey]: key });
    setStatus("API key stored locally. It never leaves your browser.", "success");
  } catch (error) {
    console.error("[SiteSense] Failed to save API key", error);
    setStatus("Unable to store API key. Check console for details.", "danger");
  }
}

async function clearKey(): Promise<void> {
  if (!textarea) {
    return;
  }

  try {
    await browser.storage.local.remove(STORAGE_KEYS.apiKey);
    textarea.value = "";
    setStatus("API key removed from this device.", "success");
  } catch (error) {
    console.error("[SiteSense] Failed to remove API key", error);
    setStatus("Unable to remove key. Check console.", "danger");
  }
}

if (form) {
  form.addEventListener("submit", (event) => {
    void saveKey(event);
  });
}

if (clearButton) {
  clearButton.addEventListener("click", () => {
    void clearKey();
  });
}

void hydrateForm();

