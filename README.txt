SiteSense
=========

SiteSense is a browser extension that evaluates the privacy policies of websites and the permission requests of installed browser extensions. It provides transparent, explainable privacy ratings using Claude-powered analysis while collecting and storing no user data.

Features
--------

- Real-time privacy policy analysis for any website you visit
- Extension permission auditing with risk assessment
- Claude-powered scoring with detailed explanations
- Full transparency ledger showing every analysis step
- Exportable audit logs for compliance and review
- Cross-browser support (Chrome and Firefox)
- No tracking, no telemetry, no persistent storage

How It Works
------------

SiteSense automatically detects privacy policies on visited websites, extracts and sanitizes the text locally, then sends only the anonymized content to Claude for structured analysis. The extension displays a privacy score, summary, strengths, risks, and detailed citations. All analysis steps are logged in a transparency ledger that you can inspect or export at any time.

The extension also audits installed browser extensions, evaluating their permission requests against governance rules and displaying risk assessments alongside website privacy scores.

Installation
------------

Chrome: Install from the Chrome Web Store
Firefox: Install from Firefox Add-ons

For development builds, see SETUP.md.

Transparency
------------

Every analysis is fully transparent. The extension shows you exactly what data was analyzed, what was sent to Claude, the complete response received, and how the final score was calculated. You can export the full transparency log as JSON for independent audits or compliance reporting.

Privacy
-------

SiteSense operates with zero user tracking. No accounts, no telemetry, no persistent storage. Only publicly available website text is processed, and all processing is local except for the anonymized API call to Claude. Results are cleared after each session.

Open Source
-----------

All code, prompt templates, scoring logic, and documentation are publicly available. Community contributions, audits, and pull requests are welcome.

License
-------

[License information]
