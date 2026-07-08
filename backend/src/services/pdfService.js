import PDFDocument from "pdfkit";

export function generateCertificatePdf({ studentName, courseTitle, certificateCode }) {
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 48 });
  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));
  doc.fontSize(34).text("EduPath Certificate", { align: "center" });
  doc.moveDown(1.5);
  doc.fontSize(18).text("This certifies that", { align: "center" });
  doc.moveDown();
  doc.fontSize(30).text(studentName || "Student", { align: "center" });
  doc.moveDown();
  doc.fontSize(18).text(`successfully completed ${courseTitle || "Course"}`, { align: "center" });
  doc.moveDown(2);
  doc.fontSize(12).text(`Certificate ID: ${certificateCode}`, { align: "center" });
  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

const colors = {
  ink: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
  soft: "#f8fafc",
  primary: "#2563eb",
  primaryDark: "#1e3a8a",
  success: "#16a34a",
  danger: "#dc2626",
  warning: "#d97706",
};

function titleCase(value) {
  return String(value || "Submitted")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDuration(seconds) {
  const total = Number(seconds || 0);
  if (!total) return "-";
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return secs ? `${mins}m ${secs}s` : `${mins}m`;
}

function drawCard(doc, x, y, width, height, { fill = "#ffffff", stroke = colors.line } = {}) {
  doc.save().roundedRect(x, y, width, height, 10).fillAndStroke(fill, stroke).restore();
}

function drawMetric(doc, x, y, width, label, value, accent = colors.primary) {
  drawCard(doc, x, y, width, 78);
  doc.fillColor(colors.muted).font("Helvetica").fontSize(9).text(label.toUpperCase(), x + 16, y + 16, { width: width - 32 });
  doc.fillColor(accent).font("Helvetica-Bold").fontSize(20).text(String(value ?? "-"), x + 16, y + 36, { width: width - 32 });
}

export function generateQuizResultPdf({
  studentName,
  quizTitle,
  score,
  percentage,
  status,
  attemptNumber,
  totalMarks,
  passingMarks,
  correctCount,
  wrongCount,
  unansweredCount,
  timeTaken,
  submittedAt,
}) {
  const doc = new PDFDocument({ size: "A4", margin: 0 });
  const chunks = [];
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 48;
  const statusText = titleCase(status);
  const percent = Math.max(0, Math.min(100, Math.round(Number(percentage || 0))));
  const passed = status === "passed" || percent >= 100 || String(status || "").toLowerCase() === "passed";
  const statusColor = passed ? colors.success : status === "failed" ? colors.danger : colors.warning;
  const maxMarks = Number(totalMarks || 0);
  const scoreText = maxMarks ? `${Number(score || 0)}/${maxMarks}` : String(Number(score || 0));

  doc.on("data", (chunk) => chunks.push(chunk));

  doc.rect(0, 0, pageWidth, pageHeight).fill("#ffffff");
  doc.rect(0, 0, pageWidth, 168).fill(colors.primaryDark);
  doc.circle(pageWidth - 70, 48, 115).fill("#3154b8");
  doc.circle(pageWidth - 12, 122, 78).fill("#3b82f6");

  doc.fillColor("#dbeafe").font("Helvetica-Bold").fontSize(11).text("EDUPATH LMS", margin, 36);
  doc.fillColor("#ffffff").fontSize(30).text("Quiz Result Report", margin, 58, { width: 310 });
  doc.fillColor("#bfdbfe").font("Helvetica").fontSize(12).text("Generated assessment summary", margin, 96);

  doc.save().roundedRect(pageWidth - 190, 46, 126, 42, 21).fill("#ffffff").restore();
  doc.fillColor(statusColor).font("Helvetica-Bold").fontSize(12).text(statusText, pageWidth - 166, 60, { width: 78, align: "center" });

  const summaryY = 132;
  drawCard(doc, margin, summaryY, pageWidth - margin * 2, 158, { fill: "#ffffff", stroke: "#dbeafe" });
  doc.fillColor(colors.muted).font("Helvetica").fontSize(10).text("STUDENT", margin + 24, summaryY + 26);
  doc.fillColor(colors.ink).font("Helvetica-Bold").fontSize(16).text(studentName || "Student", margin + 24, summaryY + 43, { width: 230 });
  doc.fillColor(colors.muted).font("Helvetica").fontSize(10).text("QUIZ", margin + 24, summaryY + 78);
  doc.fillColor(colors.ink).font("Helvetica-Bold").fontSize(15).text(quizTitle || "Quiz", margin + 24, summaryY + 95, { width: 300 });

  const metaY = summaryY + 124;
  doc.fillColor(colors.muted).font("Helvetica").fontSize(9).text("ATTEMPT", margin + 24, metaY);
  doc.fillColor(colors.ink).font("Helvetica-Bold").fontSize(11).text(`#${attemptNumber || 1}`, margin + 24, metaY + 14, { width: 70 });
  doc.fillColor(colors.muted).font("Helvetica").fontSize(9).text("SUBMITTED", margin + 120, metaY);
  doc.fillColor(colors.ink).font("Helvetica-Bold").fontSize(11).text(formatDate(submittedAt), margin + 120, metaY + 14, { width: 210 });

  const circleRadius = 42;
  const circleX = pageWidth - margin - 24 - circleRadius;
  const circleY = summaryY + 79;
  doc.save().circle(circleX, circleY, circleRadius).lineWidth(8).stroke("#e5e7eb").restore();
  doc.save().circle(circleX, circleY, circleRadius).lineWidth(8).stroke(statusColor).restore();
  doc.fillColor(colors.ink).font("Helvetica-Bold").fontSize(22).text(`${percent}%`, circleX - circleRadius, circleY - 14, { width: circleRadius * 2, align: "center" });
  doc.fillColor(colors.muted).font("Helvetica").fontSize(8).text("SCORE", circleX - circleRadius, circleY + 13, { width: circleRadius * 2, align: "center" });

  const metricsY = 318;
  const metricWidth = (pageWidth - margin * 2 - 36) / 4;
  drawMetric(doc, margin, metricsY, metricWidth, "Score", scoreText, colors.primary);
  drawMetric(doc, margin + metricWidth + 12, metricsY, metricWidth, "Passing Marks", passingMarks ?? "-", colors.warning);
  drawMetric(doc, margin + (metricWidth + 12) * 2, metricsY, metricWidth, "Time Taken", formatDuration(timeTaken), colors.primaryDark);
  drawMetric(doc, margin + (metricWidth + 12) * 3, metricsY, metricWidth, "Status", statusText, statusColor);

  const detailsY = 426;
  drawCard(doc, margin, detailsY, pageWidth - margin * 2, 180, { fill: colors.soft });
  doc.fillColor(colors.ink).font("Helvetica-Bold").fontSize(16).text("Performance Breakdown", margin + 22, detailsY + 22);
  doc.fillColor(colors.muted).font("Helvetica").fontSize(10).text("Question outcome distribution from the submitted attempt.", margin + 22, detailsY + 44);

  const barX = margin + 22;
  const barY = detailsY + 82;
  const barWidth = pageWidth - margin * 2 - 44;
  doc.roundedRect(barX, barY, barWidth, 12, 6).fill("#e5e7eb");
  doc.roundedRect(barX, barY, Math.max(8, (barWidth * percent) / 100), 12, 6).fill(statusColor);
  doc.fillColor(colors.muted).fontSize(9).text("0%", barX, barY + 20);
  doc.text("100%", barX + barWidth - 26, barY + 20);

  const breakdownY = detailsY + 124;
  const itemWidth = (barWidth - 24) / 3;
  drawMetric(doc, barX, breakdownY, itemWidth, "Correct", correctCount ?? 0, colors.success);
  drawMetric(doc, barX + itemWidth + 12, breakdownY, itemWidth, "Wrong", wrongCount ?? 0, colors.danger);
  drawMetric(doc, barX + (itemWidth + 12) * 2, breakdownY, itemWidth, "Unanswered", unansweredCount ?? 0, colors.muted);

  const noteY = 650;
  doc.fillColor(colors.muted).font("Helvetica").fontSize(10).text(
    "This report was generated by EduPath LMS. Scores are calculated securely on the backend from the submitted quiz attempt.",
    margin,
    noteY,
    { width: pageWidth - margin * 2, align: "center" }
  );
  doc.moveTo(margin, pageHeight - 54).lineTo(pageWidth - margin, pageHeight - 54).lineWidth(1).stroke(colors.line);
  doc.fillColor(colors.muted).fontSize(9).text("EduPath LMS", margin, pageHeight - 38);
  doc.text(`Report ID: quiz-result-${attemptNumber || 1}`, margin, pageHeight - 38, { width: pageWidth - margin * 2, align: "right" });

  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
