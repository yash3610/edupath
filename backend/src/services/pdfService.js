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
