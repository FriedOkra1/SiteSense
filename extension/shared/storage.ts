import browser from "webextension-polyfill";

export const STORAGE_KEYS = {
  apiKey: "sitesense:api-key"
} as const;

export async function getApiKey(): Promise<string | null> {
  const stored = await browser.storage.local.get(STORAGE_KEYS.apiKey);
  const key = stored[STORAGE_KEYS.apiKey];
  return typeof key === "string" && key.trim().length > 0 ? key.trim() : null;
}

export async function setApiKey(key: string): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEYS.apiKey]: key });
}

export async function clearApiKey(): Promise<void> {
  await browser.storage.local.remove(STORAGE_KEYS.apiKey);
}

