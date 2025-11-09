SiteSense Browser Setup
=======================

These steps walk through running the SiteSense extension locally in Chrome and Firefox using the `extension/` workspace and the existing build scripts.

Prerequisites
-------------

- Node.js 18 or newer
- npm 9+
- Git for cloning the repository

1. Clone and Install Dependencies
---------------------------------

```
git clone https://github.com/FriedOkra1/SiteSense.git
cd SiteSense/extension
npm install
```

2. Build the Extension
----------------------

Chrome build:

```
npm run build:chrome
```

Firefox build:

```
npm run build:firefox
```

Outputs appear under `extension/dist/chrome/` and `extension/dist/firefox/`.

3. Load in Chrome
-----------------

1. Open `chrome://extensions/`.
2. Enable **Developer mode** in the top right.
3. Click **Load unpacked**.
4. Select `SiteSense/extension/dist/chrome`.
5. The extension appears with the SiteSense icon; pin it for quick access.

For live edit loops, you can also run `npm run dev:chrome` from `extension/` and load the generated `.output/` directory (the dev server rebuilds on save).

4. Load in Firefox
------------------

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Choose the `SiteSense/extension/dist/firefox/manifest.json` file.
4. The extension loads for the current session; it disappears after Firefox restarts, so repeat the load when needed.

To iterate quickly, run `npm run dev:firefox` and point the loader at the generated `.output-firefox/manifest.json`. Firefox auto-refreshes when files change.

5. Develop Against the Landing Site (Optional)
----------------------------------------------

The separate landing site lives under `landing/`. To preview it:

```
cd ../landing
npm install
npm run dev
```

Open the local URL printed in the console to view the marketing site.

Troubleshooting Tips
--------------------

- If builds fail, remove the `node_modules` folder, run `npm install`, and retry.
- Chrome extensions cache aggressively; after rebuilding, hit the refresh icon on the extension card inside `chrome://extensions/`.
- Firefox temporary add-ons reload only when manually replaced; re-run the load step after each rebuild.

