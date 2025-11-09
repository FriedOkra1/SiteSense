const NAME = "SiteSense";
const DESCRIPTION =
  "Transparent privacy insights for websites and extensions. No tracking. No secrets.";

export default function manifestFactory({ mode }: { mode: string }): chrome.runtime.Manifest {
  const isFirefox = mode === "firefox";

  const permissions: chrome.runtime.ManifestPermissions[] = [
    "storage",
    "tabs",
    "activeTab",
    "scripting",
    "management"
  ];

  const base = {
    name: NAME,
    description: DESCRIPTION,
    version: "0.1.0",
    icons: {
      16: "icons/icon-16.png",
      32: "icons/icon-32.png",
      48: "icons/icon-48.png",
      128: "icons/icon-128.png"
    },
    options_ui: {
      page: "options.html",
      open_in_tab: true
    },
    permissions,
    content_scripts: [
      {
        matches: ["<all_urls>"],
        js: ["content/index.ts"],
        run_at: "document_idle"
      }
    ]
  };

  if (isFirefox) {
    return {
      ...base,
      manifest_version: 2,
      background: {
        scripts: ["background/index.ts"],
        persistent: false
      },
      permissions: [...permissions, "<all_urls>"],
      browser_action: {
        default_title: NAME,
        default_popup: "popup.html"
      },
      web_accessible_resources: ["assets/*"],
      browser_specific_settings: {
        gecko: {
          id: "sitesense@sitesense.dev",
          strict_min_version: "102.0"
        }
      }
    } as unknown as chrome.runtime.Manifest;
  }

  return {
    ...base,
    manifest_version: 3,
    action: {
      default_title: NAME,
      default_popup: "popup.html"
    },
    host_permissions: ["<all_urls>"],
    web_accessible_resources: [
      {
        resources: ["assets/*"],
        matches: ["<all_urls>"]
      }
    ],
    background: {
      service_worker: "background/index.ts",
      type: "module"
    }
  } as unknown as chrome.runtime.Manifest;
}

