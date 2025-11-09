import browser, { type Management } from "webextension-polyfill";
import {
  auditPermissions,
  type ExtensionPermissionSummary
} from "@shared/rules/permissions";

function collectPermissions(info: Management.ExtensionInfo): string[] {
  const apiPermissions = info.permissions ?? [];
  const hostPermissions = (info.hostPermissions ?? []).map((host) => `host:${host}`);
  return [...apiPermissions, ...hostPermissions];
}

export async function evaluateInstalledExtensions(): Promise<ExtensionPermissionSummary[]> {
  const installed = await browser.management.getAll();
  return installed
    .filter((extension) => extension.type === "extension" && extension.id !== browser.runtime.id)
    .map((extension) => {
      const permissions = collectPermissions(extension);
      const audit = auditPermissions(permissions);

      return {
        id: extension.id ?? "unknown",
        name: extension.name ?? "Unknown extension",
        enabled: extension.enabled ?? false,
        version: extension.version ?? "unknown",
        audit
      };
    });
}

