# Testing & Browser Validation

## Automated Checks
- `npm test` – runs Vitest unit tests for policy extraction and permission scoring.
- `npm run typecheck` – validates TypeScript across background, content, shared, and UI modules.
- `npm run build:chrome` / `npm run build:firefox` – ensures production bundles emit without errors for both manifest variants.
- Coverage output is generated to `coverage/` when `npm test -- --coverage` is used.
- To exercise the live LLM path during tests or manual runs, edit `.env` and set `VITE_LLM_ENDPOINT` and `VITE_LLM_API_KEY`.

## Manual Chrome Validation
1. Run `npm run build:chrome`.
2. Open `chrome://extensions`, enable **Developer mode**, and click **Load unpacked**.
3. Select `dist/chrome`.
4. Verify:
   - Popup renders hero summary, lists, and extension audit data.
   - “Re-run analysis” triggers a new processing status.
   - Options page accepts API key and exports transparency log JSON.

## Manual Firefox Validation
1. Run `npm run build:firefox`.
2. Open `about:debugging#/runtime/this-firefox` and choose **Load Temporary Add-on…**.
3. Select `dist/firefox/manifest.json`.
4. Confirm parity with Chrome checks, paying attention to permission audit results and transparency export.

## Additional Checks
- Confirm `dist` output includes expected icons (`icons/icon-*.png`) and HTML entry points.
- Review exported transparency JSON to ensure prompts and responses are captured without policy text leakage.

