import "../styles/tokens.css";
import "./options.css";
import browser from "webextension-polyfill";
import { isTransparencyExportResult } from "@shared/messages";
import { clearApiKey, getApiKey, setApiKey } from "@shared/storage";

const form = document.getElementById("api-form") as HTMLFormElement | null;
const textarea = document.getElementById("api-key") as HTMLTextAreaElement | null;
const formStatusEl = document.getElementById("form-status");
const clearButton = document.getElementById("clear-key") as HTMLButtonElement | null;
const exportButton = document.getElementById("export-transparency") as HTMLButtonElement | null;
const transparencyStatusEl = document.getElementById("transparency-status");
const envKey = (import.meta.env.VITE_LLM_API_KEY ?? "").trim();

function setFormStatus(message: string, tone: "default" | "success" | "danger" = "default") {
  if (!formStatusEl) {
    return;
  }

  formStatusEl.textContent = message;
  formStatusEl.className = `status status--${tone}`;
}

function setTransparencyStatus(
  message: string,
  tone: "default" | "success" | "danger" = "default"
): void {
  if (!transparencyStatusEl) {
    return;
  }

  transparencyStatusEl.textContent = message;
  transparencyStatusEl.className = `status status--${tone}`;
}

async function hydrateForm(): Promise<void> {
  if (!textarea) {
    return;
  }

  try {
    const key = await getApiKey();
    textarea.value = typeof key === "string" ? key : "";

    if (key) {
      setFormStatus("API key loaded from secure storage.", "success");
    } else if (envKey) {
      setFormStatus("Using API key provided via .env configuration.", "success");
    } else {
      setFormStatus("No API key stored yet.", "default");
    }
  } catch (error) {
    console.error("[SiteSense] Failed to load API key", error);
    setFormStatus("Unable to load existing key. Check console.", "danger");
  }
}

async function saveKey(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  if (!textarea) {
    return;
  }

  const key = textarea.value.trim();

  if (!key) {
    setFormStatus("Please enter an API key before saving.", "danger");
    return;
  }

  try {
    await setApiKey(key);
    setFormStatus("API key stored locally. It never leaves your browser.", "success");
  } catch (error) {
    console.error("[SiteSense] Failed to save API key", error);
    setFormStatus("Unable to store API key. Check console for details.", "danger");
  }
}

async function clearKey(): Promise<void> {
  if (!textarea) {
    return;
  }

  try {
    await clearApiKey();
    textarea.value = "";
    if (envKey) {
      setFormStatus("API key removed locally. .env configuration will still be used.", "success");
    } else {
      setFormStatus("API key removed from this device.", "success");
    }
  } catch (error) {
    console.error("[SiteSense] Failed to remove API key", error);
    setFormStatus("Unable to remove key. Check console.", "danger");
  }
}

async function exportTransparency(): Promise<void> {
  try {
    const response = (await browser.runtime.sendMessage({
      type: "transparency:export"
    })) as unknown;

    if (!isTransparencyExportResult(response)) {
      setTransparencyStatus("No transparency data available.", "default");
      return;
    }

    const payload = JSON.stringify(response.sessions, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `sitesense-transparency-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setTransparencyStatus("Transparency log exported.", "success");
  } catch (error) {
    console.error("[SiteSense] Failed to export transparency log", error);
    setTransparencyStatus("Unable to export transparency log.", "danger");
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

if (exportButton) {
  exportButton.addEventListener("click", () => {
    void exportTransparency();
  });
}

setTransparencyStatus("No transparency export yet.");
void hydrateForm();

