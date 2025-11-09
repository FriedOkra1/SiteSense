# Release Checklist

## Pre-Release
- [ ] `npm install` – ensure dependencies are up to date.
- [ ] `npm run test` – unit tests passing.
- [ ] `npm run typecheck` – no TypeScript errors.
- [ ] `npm run build:chrome` and `npm run build:firefox` – builds succeed without warnings.
- [ ] Verify popup/options UI manually in both browsers following `docs/testing.md`.

## Packaging
- [ ] `artifacts/sitesense-chrome.zip` – upload to Chrome Web Store dashboard.
- [ ] `artifacts/sitesense-firefox.zip` – upload to AMO developer hub.
- [ ] `artifacts/checksums.txt` – publish alongside release for integrity verification.

## Store Metadata Reminders
- Title: **SiteSense – Transparent Privacy Insights**
- Short description: “Real-time privacy ratings and extension permission audits with full transparency.”
- Long description highlights:
  - LLM-driven policy summaries (no personal data transmitted).
  - Deterministic permission scoring and transparency log exports.
  - Open-source code link (https://github.com/… once repo public).
- Required assets:
  - 128x128 icon (`dist/*/icons/icon-128.png`).
  - Screenshots of popup, options page, transparency export.
- Privacy disclosures:
  - No user data collected.
  - External calls only send sanitized policy text and require user-supplied API key.

## Post-Release
- [ ] Tag repository release and attach both ZIP bundles and checksum file.
- [ ] Update landing site download links to point to latest store listings.
- [ ] Announce release channels (blog, community) with emphasis on transparency commitments.

