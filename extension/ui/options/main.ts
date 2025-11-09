import "../styles/tokens.css";
import "./options.css";
import browser from "webextension-polyfill";
import { isTransparencyExportResult, type TransparencyExportResult } from "@shared/messages";

const exportButton = document.getElementById("export-transparency") as HTMLButtonElement | null;
const transparencyStatusEl = document.getElementById("transparency-status");
const analysisScoreEl = document.getElementById("analysis-score");
const analysisSummaryEl = document.getElementById("analysis-summary");
const analysisExplanationEl = document.getElementById("analysis-explanation");
const analysisPositivesEl = document.getElementById("analysis-positives") as HTMLUListElement | null;
const analysisRisksEl = document.getElementById("analysis-risks") as HTMLUListElement | null;
const analysisRiskDetailsEl = document.getElementById("analysis-risk-details") as HTMLUListElement | null;
const analysisCitationsEl = document.getElementById("analysis-citations") as HTMLUListElement | null;
const analysisExtensionsEl = document.getElementById("analysis-extensions") as HTMLUListElement | null;

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

function renderSnapshotLists(target: HTMLUListElement | null, items: string[], empty: string): void {
  if (!target) return;
  target.textContent = "";
  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = empty;
    target.appendChild(li);
    return;
  }

  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    target.appendChild(li);
  }
}

function getLatestEvent(
  sessions: TransparencyExportResult["sessions"],
  type: "analysis" | "extension-audit"
): { timestamp: number; payload: any } | null {
  let latest: { timestamp: number; payload: any } | null = null;
  Object.values(sessions).forEach((events) => {
    events
      .filter((event) => event.type === type)
      .forEach((event) => {
        if (!latest || event.timestamp > latest.timestamp) {
          latest = { timestamp: event.timestamp, payload: event.payload };
        }
      });
  });
  return latest;
}

function renderAnalysisSnapshot(response: TransparencyExportResult | null): void {
  if (!response) {
    if (analysisScoreEl) analysisScoreEl.textContent = "--";
    if (analysisSummaryEl) analysisSummaryEl.textContent = "Awaiting analysis.";
    if (analysisExplanationEl) analysisExplanationEl.textContent = "No explanation recorded yet.";
    renderSnapshotLists(analysisPositivesEl, [], "No positives recorded.");
    renderSnapshotLists(analysisRisksEl, [], "No risks recorded.");
    renderSnapshotLists(analysisRiskDetailsEl, [], "No risk rationale recorded.");
    renderSnapshotLists(analysisCitationsEl, [], "No citations recorded.");
    renderSnapshotLists(analysisExtensionsEl, [], "No extension audits recorded.");
    return;
  }

  const analysisEvent = getLatestEvent(response.sessions, "analysis");
  const auditEvent = getLatestEvent(response.sessions, "extension-audit");

  const analysisPayload = analysisEvent?.payload ?? null;
  if (analysisScoreEl) {
    const score = typeof analysisPayload?.score === "number" ? analysisPayload.score : undefined;
    analysisScoreEl.textContent = score !== undefined ? `${Math.round(score * 100)}%` : "--";
  }
  if (analysisSummaryEl) {
    analysisSummaryEl.textContent =
      typeof analysisPayload?.summary === "string"
        ? analysisPayload.summary
        : "Awaiting analysis.";
  }
  if (analysisExplanationEl) {
    analysisExplanationEl.textContent =
      typeof analysisPayload?.scoreExplanation === "string"
        ? analysisPayload.scoreExplanation
        : "No explanation recorded yet.";
  }

  renderSnapshotLists(
    analysisPositivesEl,
    Array.isArray(analysisPayload?.positives) ? analysisPayload.positives : [],
    "No positives recorded."
  );
  renderSnapshotLists(
    analysisRisksEl,
    Array.isArray(analysisPayload?.risks) ? analysisPayload.risks : [],
    "No risks recorded."
  );
  renderSnapshotLists(
    analysisRiskDetailsEl,
    Array.isArray(analysisPayload?.riskDetails)
      ? analysisPayload.riskDetails.map(
          (detail: { risk?: string; reason?: string }) =>
            `${detail?.risk ?? "Risk"} — ${detail?.reason ?? "No reason provided."}`
        )
      : [],
    "No risk rationale recorded."
  );
  renderSnapshotLists(
    analysisCitationsEl,
    Array.isArray(analysisPayload?.citations)
      ? analysisPayload.citations.map(
          (citation: { quote?: string; reason?: string }) =>
            `"${citation?.quote ?? "Unspecified"}" — ${citation?.reason ?? "No reason provided."}`
        )
      : [],
    "No citations recorded."
  );
  renderSnapshotLists(
    analysisExtensionsEl,
    Array.isArray(auditEvent?.payload)
      ? auditEvent.payload.map(
          (extension: { name?: string; audit?: { overall?: string; score?: number } }) =>
            `${extension?.name ?? "Extension"} — ${
              extension?.audit?.overall?.toUpperCase() ?? "UNKNOWN"
            } ${(extension?.audit?.score ?? 0) * 100}%`
        )
      : [],
    "No extension audits recorded."
  );
}

async function fetchTransparency(): Promise<TransparencyExportResult | null> {
  try {
    const response = (await browser.runtime.sendMessage({
      type: "transparency:export"
    })) as unknown;

    if (!isTransparencyExportResult(response)) {
      setTransparencyStatus("No transparency data available.", "default");
      return null;
    }

    return response;
  } catch (error) {
    console.error("[SiteSense] Failed to request transparency data", error);
    setTransparencyStatus("Unable to load transparency data.", "danger");
    return null;
  }
}

async function exportTransparency(): Promise<void> {
  const data = await fetchTransparency();
  if (!data) {
    return;
  }

  try {
    const payload = JSON.stringify(data.sessions, null, 2);
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

if (exportButton) {
  exportButton.addEventListener("click", () => {
    void exportTransparency();
  });
}

setTransparencyStatus("No transparency export yet.");

void (async () => {
  const data = await fetchTransparency();
  renderAnalysisSnapshot(data);
})();
