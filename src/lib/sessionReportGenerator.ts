import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaceData } from "./emosenseTypes";

export interface SessionReportItem {
  turn: number;
  time: string;
  speaker: string;
  emotion: string;
  valence: number;
  arousal: number;
  snippet: string;
}

export interface SessionReportPayload {
  userName?: string;
  userId?: string;
  messages: Array<{
    id?: string;
    role: "user" | "assistant";
    content: string;
    emotion?: string | null;
    risk_level?: string | null;
    created_at?: string;
  }>;
  currentFaceData?: FaceData | null;
  sessionStartTime?: Date;
}

const BRAND = { r: 124, g: 58, b: 237 };     // Deep Purple #7c3aed
const SECONDARY = { r: 79, g: 70, b: 229 };  // Indigo #4f46e5
const ACCENT = { r: 6, g: 182, b: 212 };     // Cyan #06b6d4
const EMERALD = { r: 16, g: 185, b: 129 };   // Emerald #10b981
const AMBER = { r: 245, g: 158, b: 11 };     // Amber #f59e0b
const ROSE = { r: 244, g: 63, b: 94 };       // Rose #f43f5e
const DARK = { r: 15, g: 23, b: 42 };        // Slate-900 #0f172a
const MUTED = { r: 100, g: 116, b: 139 };    // Slate-500 #64748b

const EMOTION_VALENCE_MAP: Record<string, { valence: number; arousal: number }> = {
  happy: { valence: 0.85, arousal: 0.55 },
  joy: { valence: 0.90, arousal: 0.60 },
  surprised: { valence: 0.35, arousal: 0.80 },
  neutral: { valence: 0.05, arousal: -0.05 },
  calm: { valence: 0.25, arousal: -0.20 },
  tense: { valence: -0.58, arousal: 0.75 },
  fearful: { valence: -0.65, arousal: 0.85 },
  anxious: { valence: -0.60, arousal: 0.80 },
  stress: { valence: -0.58, arousal: 0.78 },
  sad: { valence: -0.78, arousal: -0.40 },
  crisis: { valence: -0.92, arousal: 0.85 },
  angry: { valence: -0.75, arousal: 0.85 },
  disgusted: { valence: -0.70, arousal: 0.30 },
};

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${Math.max(1, seconds)}s`;
}

export function generateSessionPdfReport(payload: SessionReportPayload): {
  doc: jsPDF;
  filename: string;
} {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  const now = new Date();
  const startTime = payload.sessionStartTime || new Date(now.getTime() - 15 * 60 * 1000);
  const durationMs = Math.max(1000, now.getTime() - startTime.getTime());
  const formattedDuration = formatDuration(durationMs);

  const validMsgs = payload.messages.filter((m) => m.content && m.content.trim().length > 0);
  const user = payload.userName || "Guest Explorer";
  const reportId = `ES-REP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
  const filename = `EmoSense_Session_Report_${now.toISOString().split("T")[0]}_${reportId.slice(-4)}.pdf`;

  // Parse turns into structured points
  const points: SessionReportItem[] = validMsgs.map((m, idx) => {
    const isLatest = idx === validMsgs.length - 1;
    const faceValence = isLatest && payload.currentFaceData?.valence != null ? payload.currentFaceData.valence : null;
    const emo = (m.emotion || payload.currentFaceData?.dominantEmotion || "neutral").toLowerCase();
    const defaults = EMOTION_VALENCE_MAP[emo] || { valence: 0, arousal: 0 };
    const val = faceValence != null ? faceValence : defaults.valence;

    const timeStr = m.created_at
      ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      : `T+${idx * 2}m`;

    return {
      turn: idx + 1,
      time: timeStr,
      speaker: m.role === "user" ? "User" : "EmoSense AI",
      emotion: emo,
      valence: +val.toFixed(2),
      arousal: +defaults.arousal.toFixed(2),
      snippet: m.content.trim().slice(0, 90) + (m.content.length > 90 ? "..." : ""),
    };
  });

  // Fallback point if conversation just started
  if (points.length === 0) {
    const defaultEmo = (payload.currentFaceData?.dominantEmotion || "neutral").toLowerCase();
    points.push({
      turn: 1,
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      speaker: "System",
      emotion: defaultEmo,
      valence: payload.currentFaceData?.valence ?? 0.05,
      arousal: payload.currentFaceData?.arousal ?? 0,
      snippet: "Session initiated with baseline facial tracking",
    });
  }

  const initialAffect = points[0];
  const finalAffect = points[points.length - 1];
  const netShift = +(finalAffect.valence - initialAffect.valence).toFixed(2);

  // Compute emotion frequencies
  const emotionCounts = points.reduce<Record<string, number>>((acc, p) => {
    acc[p.emotion] = (acc[p.emotion] ?? 0) + 1;
    return acc;
  }, {});

  const emotionRows = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([emo, count]) => {
      const pct = Math.round((count / points.length) * 100);
      const val = EMOTION_VALENCE_MAP[emo]?.valence ?? 0;
      const affectClass = val > 0.3 ? "Positive Affect" : val < -0.3 ? "Distress / Dysphoric" : "Equanimous / Steady";
      return [
        emo.charAt(0).toUpperCase() + emo.slice(1),
        String(count),
        `${pct}%`,
        val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2),
        affectClass,
      ];
    });

  // ==========================================
  // PAGE 1: HEADER & CLINICAL AFFECT SUMMARY
  // ==========================================
  // Gradient Banner
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.rect(0, 0, W, 84, "F");

  // Accent Line
  doc.setFillColor(ACCENT.r, ACCENT.g, ACCENT.b);
  doc.rect(0, 84, W, 4, "F");

  // Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("EmoSense AI", 36, 36);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Clinical Affect & Multimodal Trajectory Report", 36, 52);

  doc.setFontSize(8.5);
  doc.setTextColor(220, 220, 240);
  doc.text("Empathetic Companion & Real-Time Emotion Analytics Session", 36, 68);

  // Right-aligned Metadata
  doc.setFontSize(8.5);
  doc.text(`Report ID: ${reportId}`, W - 36, 36, { align: "right" });
  doc.text(`Date: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, W - 36, 50, { align: "right" });
  doc.text(`Duration: ${formattedDuration} · ${points.length} Turns`, W - 36, 64, { align: "right" });

  let y = 110;

  // Overview Table
  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3.5, textColor: [DARK.r, DARK.g, DARK.b] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 105, textColor: [MUTED.r, MUTED.g, MUTED.b] },
      1: { cellWidth: 155 },
      2: { fontStyle: "bold", cellWidth: 105, textColor: [MUTED.r, MUTED.g, MUTED.b] },
      3: { cellWidth: 155 },
    },
    body: [
      ["Participant / User", user, "Safety Protocol Tier", netShift < -0.4 ? "High Observation" : "Standard Companion Care"],
      ["Session Duration", formattedDuration, "Total Conversational Turns", `${points.length} dialogue turns`],
      ["Tracking Fidelity", payload.currentFaceData?.faceDetected ? "Active 68-Landmark FACS Vision" : "Synthetic Adaptive Baseline", "Dominant Affect", `${finalAffect.emotion.toUpperCase()} (${(emotionCounts[finalAffect.emotion] || 1)} turns)`],
    ],
  });

  y = (doc as any).lastAutoTable.finalY + 16;

  // 3-Card Summary Blocks (Initial, Current, Net Shift)
  const cardW = (W - 72 - 24) / 3;
  const cardH = 58;

  // Card 1: Initial State
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(36, y, cardW, cardH, 6, 6, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("INITIAL EMOTIONAL STATE", 46, y + 16);
  doc.setFontSize(13);
  doc.setTextColor(DARK.r, DARK.g, DARK.b);
  doc.text(initialAffect.emotion.toUpperCase(), 46, y + 36);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text(`Valence: ${initialAffect.valence >= 0 ? "+" : ""}${initialAffect.valence.toFixed(2)}`, 46, y + 49);

  // Card 2: Current Affect
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(36 + cardW + 12, y, cardW, cardH, 6, 6, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("CURRENT / FINAL AFFECT", 46 + cardW + 12, y + 16);
  doc.setFontSize(13);
  doc.setTextColor(DARK.r, DARK.g, DARK.b);
  doc.text(finalAffect.emotion.toUpperCase(), 46 + cardW + 12, y + 36);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text(`Valence: ${finalAffect.valence >= 0 ? "+" : ""}${finalAffect.valence.toFixed(2)}`, 46 + cardW + 12, y + 49);

  // Card 3: Net Trajectory Shift
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(36 + (cardW + 12) * 2, y, cardW, cardH, 6, 6, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text("NET TRAJECTORY SHIFT", 46 + (cardW + 12) * 2, y + 16);
  doc.setFontSize(13);
  if (netShift >= 0) {
    doc.setTextColor(EMERALD.r, EMERALD.g, EMERALD.b);
    doc.text(`+${netShift.toFixed(2)}  UPLIFT`, 46 + (cardW + 12) * 2, y + 36);
  } else {
    doc.setTextColor(AMBER.r, AMBER.g, AMBER.b);
    doc.text(`${netShift.toFixed(2)}  ATTUNEMENT`, 46 + (cardW + 12) * 2, y + 36);
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text(netShift >= 0 ? "Favorable emotional de-escalation" : "Emotional validation provided", 46 + (cardW + 12) * 2, y + 49);

  y += cardH + 20;

  // Section: Emotion Distribution
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(DARK.r, DARK.g, DARK.b);
  doc.text("1. Affect & Emotion Frequency Distribution", 36, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    theme: "striped",
    margin: { left: 36, right: 36 },
    headStyles: {
      fillColor: [BRAND.r, BRAND.g, BRAND.b],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    styles: { fontSize: 8.5, cellPadding: 4.5 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 110 },
      1: { cellWidth: 65, halign: "center" },
      2: { cellWidth: 65, halign: "center" },
      3: { cellWidth: 75, halign: "center" },
      4: { cellWidth: 175 },
    },
    head: [["Emotion State", "Occurrences", "Percentage", "Valence Reference", "Affect Classification"]],
    body: emotionRows,
  });

  y = (doc as any).lastAutoTable.finalY + 18;

  // Section: Conversational Arc Milestones
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(DARK.r, DARK.g, DARK.b);
  doc.text("2. Conversational Arc & Dialog Milestones", 36, y);
  y += 8;

  const milestoneRows = points.slice(0, 10).map((p) => [
    `#${p.turn}`,
    p.time,
    p.speaker,
    p.emotion.toUpperCase(),
    p.valence >= 0 ? `+${p.valence.toFixed(2)}` : p.valence.toFixed(2),
    p.snippet,
  ]);

  autoTable(doc, {
    startY: y,
    theme: "grid",
    margin: { left: 36, right: 36 },
    headStyles: {
      fillColor: [SECONDARY.r, SECONDARY.g, SECONDARY.b],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    styles: { fontSize: 8, cellPadding: 3.5, overflow: "linebreak" },
    columnStyles: {
      0: { cellWidth: 28, halign: "center" },
      1: { cellWidth: 56, halign: "center" },
      2: { cellWidth: 70, fontStyle: "bold" },
      3: { cellWidth: 62, halign: "center" },
      4: { cellWidth: 48, halign: "center" },
      5: { cellWidth: 226 },
    },
    head: [["Turn", "Timestamp", "Speaker", "Emotion", "Valence", "Dialogue Snippet"]],
    body: milestoneRows,
  });

  y = (doc as any).lastAutoTable.finalY + 16;

  // Check if we need Page 2
  if (y > H - 180) {
    doc.addPage();
    y = 50;
  }

  // Section: Coping Interventions & Clinical Insights
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(DARK.r, DARK.g, DARK.b);
  doc.text("3. Suggested Coping Interventions & Somatic Practices", 36, y);
  y += 14;

  const interventions = [
    "Box Breathing (Sama Vritti): Inhale 4s, Hold 4s, Exhale 4s, Hold 4s for autonomic nervous system stabilization.",
    "5-4-3-2-1 Sensory Grounding: Acknowledge 5 sight anchors, 4 physical touch sensations, 3 sounds, 2 scents, and 1 taste.",
    "Cognitive Cognitive Reframing: Distinguish between immediate circumstantial stress and persistent cognitive beliefs.",
    "Expressive Emotional Journaling: Track recurring emotional triggers in the EmoSense Mood Journal to spot patterns over time.",
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(DARK.r, DARK.g, DARK.b);
  interventions.forEach((item) => {
    doc.setFillColor(ACCENT.r, ACCENT.g, ACCENT.b);
    doc.circle(42, y - 3, 2.5, "F");
    doc.text(item, 52, y);
    y += 14;
  });

  y += 6;

  // Section: Emergency Crisis Support Directory
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(ROSE.r, ROSE.g, ROSE.b);
  doc.text("4. 24/7 Immediate Crisis Support Hotlines (India & International)", 36, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    theme: "plain",
    margin: { left: 36, right: 36 },
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: [ROSE.r, ROSE.g, ROSE.b], textColor: 255 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 140, textColor: [DARK.r, DARK.g, DARK.b] },
      1: { cellWidth: 150, textColor: [DARK.r, DARK.g, DARK.b] },
      2: { cellWidth: 200, textColor: [MUTED.r, MUTED.g, MUTED.b] },
    },
    body: [
      ["Tele-MANAS (Govt. of India)", "14416 / 1800 891 4416", "24/7 Free Comprehensive Mental Health Helpline"],
      ["National Emergency Services", "112", "All-in-One Emergency SOS Hotline (India)"],
      ["Vandrevala Foundation", "+91 9999 666 555", "24/7 Free Psychological Counseling & Crisis Support"],
      ["KIRAN Mental Health Helpline", "1800-599-0019", "Ministry of Social Justice & Empowerment"],
    ],
  });

  // Footer Disclaimer at bottom of page
  const footerY = H - 32;
  doc.setDrawColor(226, 232, 240);
  doc.line(36, footerY - 14, W - 36, footerY - 14);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.2);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text(
    "Disclaimer: EmoSense AI is an educational affective companion and emotional support tool. It does not provide medical diagnosis, clinical treatment, or psychiatric prescriptions.",
    36,
    footerY - 4
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(
    "Page 1 of 1  ·  Generated by EmoSense AI Companion  ·  Confidential & Non-Diagnostic",
    W / 2,
    footerY + 7,
    { align: "center" }
  );

  return { doc, filename };
}

export function printSessionSummaryReport(payload: SessionReportPayload): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const now = new Date();
  const startTime = payload.sessionStartTime || new Date(now.getTime() - 15 * 60 * 1000);
  const durationMs = Math.max(1000, now.getTime() - startTime.getTime());
  const formattedDuration = formatDuration(durationMs);

  const validMsgs = payload.messages.filter((m) => m.content && m.content.trim().length > 0);
  const user = payload.userName || "Guest Explorer";
  const reportId = `ES-REP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

  const points: SessionReportItem[] = validMsgs.map((m, idx) => {
    const isLatest = idx === validMsgs.length - 1;
    const faceValence = isLatest && payload.currentFaceData?.valence != null ? payload.currentFaceData.valence : null;
    const emo = (m.emotion || payload.currentFaceData?.dominantEmotion || "neutral").toLowerCase();
    const defaults = EMOTION_VALENCE_MAP[emo] || { valence: 0, arousal: 0 };
    const val = faceValence != null ? faceValence : defaults.valence;

    const timeStr = m.created_at
      ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      : `T+${idx * 2}m`;

    return {
      turn: idx + 1,
      time: timeStr,
      speaker: m.role === "user" ? "User" : "EmoSense AI",
      emotion: emo,
      valence: +val.toFixed(2),
      arousal: +defaults.arousal.toFixed(2),
      snippet: m.content.trim().slice(0, 100) + (m.content.length > 100 ? "..." : ""),
    };
  });

  if (points.length === 0) {
    const defaultEmo = (payload.currentFaceData?.dominantEmotion || "neutral").toLowerCase();
    points.push({
      turn: 1,
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      speaker: "System",
      emotion: defaultEmo,
      valence: payload.currentFaceData?.valence ?? 0.05,
      arousal: payload.currentFaceData?.arousal ?? 0,
      snippet: "Session initiated with baseline facial tracking",
    });
  }

  const initialAffect = points[0];
  const finalAffect = points[points.length - 1];
  const netShift = +(finalAffect.valence - initialAffect.valence).toFixed(2);

  const emotionCounts = points.reduce<Record<string, number>>((acc, p) => {
    acc[p.emotion] = (acc[p.emotion] ?? 0) + 1;
    return acc;
  }, {});

  const emotionRows = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([emo, count]) => {
      const pct = Math.round((count / points.length) * 100);
      const val = EMOTION_VALENCE_MAP[emo]?.valence ?? 0;
      const affectClass = val > 0.3 ? "Positive Affect" : val < -0.3 ? "Distress / Dysphoric" : "Equanimous / Steady";
      return `<tr>
        <td style="font-weight: 600; text-transform: capitalize;">${emo}</td>
        <td style="text-align: center;">${count}</td>
        <td style="text-align: center;">${pct}%</td>
        <td style="text-align: center; font-family: monospace;">${val >= 0 ? "+" : ""}${val.toFixed(2)}</td>
        <td>${affectClass}</td>
      </tr>`;
    })
    .join("");

  const milestoneRows = points
    .map(
      (p) => `<tr>
      <td style="text-align: center; font-weight: bold;">#${p.turn}</td>
      <td style="text-align: center; color: #64748b;">${p.time}</td>
      <td style="font-weight: 600; color: ${p.speaker === "User" ? "#7c3aed" : "#0f172a"};">${p.speaker}</td>
      <td style="text-align: center; text-transform: uppercase; font-size: 11px;">${p.emotion}</td>
      <td style="text-align: center; font-family: monospace; font-weight: bold; color: ${p.valence >= 0 ? "#10b981" : "#f59e0b"};">
        ${p.valence >= 0 ? "+" : ""}${p.valence.toFixed(2)}
      </td>
      <td style="color: #334155;">${p.snippet}</td>
    </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>EmoSense AI — Affect & Session Clinical Report (${reportId})</title>
  <style>
    @page { size: A4; margin: 16mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 24px;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
    }
    .header-banner {
      background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
      color: white;
      padding: 20px 24px;
      border-radius: 10px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-title { font-size: 22px; font-weight: 800; margin: 0; }
    .header-sub { font-size: 12px; opacity: 0.9; margin-top: 4px; }
    .meta-box { text-align: right; font-size: 11px; opacity: 0.95; }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
      background: #f8fafc;
      padding: 14px 18px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      font-size: 12px;
    }
    .meta-item b { display: block; font-size: 10px; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-bottom: 24px;
    }
    .metric-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 16px;
    }
    .metric-title { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
    .metric-val { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 2px; }
    .metric-sub { font-size: 11px; color: #64748b; }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 20px;
    }
    th {
      background: #7c3aed;
      color: white;
      text-align: left;
      padding: 8px 10px;
      font-weight: 600;
    }
    td {
      padding: 7px 10px;
      border-bottom: 1px solid #f1f5f9;
    }
    tr:nth-child(even) td { background: #f8fafc; }
    .helpline-box {
      background: #fff1f2;
      border: 1px solid #fecdd3;
      border-radius: 8px;
      padding: 14px 16px;
      margin-top: 20px;
    }
    .helpline-title { font-size: 12px; font-weight: 700; color: #e11d48; margin-bottom: 8px; }
    .helpline-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 11px; }
    .disclaimer {
      font-size: 10px;
      color: #94a3b8;
      font-style: italic;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      margin-top: 24px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header-banner">
    <div>
      <div class="header-title">EmoSense AI</div>
      <div class="header-sub">Clinical Affect & Multimodal Trajectory Report</div>
    </div>
    <div class="meta-box">
      <div><strong>Report ID:</strong> ${reportId}</div>
      <div><strong>Date:</strong> ${now.toLocaleDateString()} ${now.toLocaleTimeString()}</div>
      <div><strong>Duration:</strong> ${formattedDuration} · ${points.length} turns</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item"><b>Participant / User</b>${user}</div>
    <div class="meta-item"><b>Session Duration</b>${formattedDuration}</div>
    <div class="meta-item"><b>Tracking Fidelity</b>${payload.currentFaceData?.faceDetected ? "Active 68-Landmark FACS" : "Synthetic Adaptive Baseline"}</div>
    <div class="meta-item"><b>Safety Protocol Tier</b>${netShift < -0.4 ? "High Observation" : "Standard Companion Care"}</div>
  </div>

  <div class="cards-grid">
    <div class="metric-card">
      <div class="metric-title">Initial Emotional State</div>
      <div class="metric-val" style="text-transform: capitalize;">${initialAffect.emotion}</div>
      <div class="metric-sub">Valence: ${initialAffect.valence >= 0 ? "+" : ""}${initialAffect.valence.toFixed(2)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Current / Final Affect</div>
      <div class="metric-val" style="text-transform: capitalize;">${finalAffect.emotion}</div>
      <div class="metric-sub">Valence: ${finalAffect.valence >= 0 ? "+" : ""}${finalAffect.valence.toFixed(2)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Net Trajectory Shift</div>
      <div class="metric-val" style="color: ${netShift >= 0 ? "#10b981" : "#f59e0b"};">
        ${netShift >= 0 ? `+${netShift.toFixed(2)}` : netShift.toFixed(2)} ${netShift >= 0 ? "UPLIFT" : "ATTUNED"}
      </div>
      <div class="metric-sub">${netShift >= 0 ? "Favorable de-escalation" : "Emotional validation provided"}</div>
    </div>
  </div>

  <div class="section-title">1. Affect & Emotion Frequency Distribution</div>
  <table>
    <thead>
      <tr>
        <th>Emotion State</th>
        <th style="text-align: center;">Occurrences</th>
        <th style="text-align: center;">Percentage</th>
        <th style="text-align: center;">Valence Reference</th>
        <th>Affect Classification</th>
      </tr>
    </thead>
    <tbody>
      ${emotionRows}
    </tbody>
  </table>

  <div class="section-title">2. Conversational Arc & Dialog Milestones</div>
  <table>
    <thead>
      <tr>
        <th style="text-align: center; width: 40px;">Turn</th>
        <th style="text-align: center; width: 80px;">Time</th>
        <th style="width: 100px;">Speaker</th>
        <th style="text-align: center; width: 80px;">Emotion</th>
        <th style="text-align: center; width: 60px;">Valence</th>
        <th>Dialogue Snippet</th>
      </tr>
    </thead>
    <tbody>
      ${milestoneRows}
    </tbody>
  </table>

  <div class="section-title">3. Suggested Coping Interventions & Somatic Practices</div>
  <ul style="font-size: 11px; color: #334155; padding-left: 20px; line-height: 1.6;">
    <li><b>Box Breathing (Sama Vritti):</b> Inhale 4s, Hold 4s, Exhale 4s, Hold 4s for autonomic nervous system stabilization.</li>
    <li><b>5-4-3-2-1 Sensory Grounding:</b> Acknowledge 5 sight anchors, 4 physical touch sensations, 3 sounds, 2 scents, and 1 taste.</li>
    <li><b>Cognitive Reframing:</b> Distinguish between immediate circumstantial stress and persistent cognitive beliefs.</li>
    <li><b>Expressive Emotional Journaling:</b> Track recurring emotional triggers in the EmoSense Mood Journal.</li>
  </ul>

  <div class="helpline-box">
    <div class="helpline-title">🚨 24/7 Immediate Crisis Support Hotlines (India & International)</div>
    <div class="helpline-grid">
      <div><b>Tele-MANAS (Govt. of India):</b> 14416 / 1800 891 4416 (24/7 Free)</div>
      <div><b>National Emergency Services:</b> 112 (SOS All-in-One)</div>
      <div><b>Vandrevala Foundation:</b> +91 9999 666 555 (Free Counseling)</div>
      <div><b>KIRAN Mental Health:</b> 1800-599-0019 (Govt. of India)</div>
    </div>
  </div>

  <div class="disclaimer">
    Disclaimer: EmoSense AI is an educational affective companion and emotional support tool. It does not provide medical diagnosis, clinical treatment, or psychiatric prescriptions.
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}

export const printSessionReportHtml = printSessionSummaryReport;
