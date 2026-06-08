import nodemailer from "nodemailer";

function transporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: Number(process.env.SMTP_PORT || 1025),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
}

export async function sendEmail({ to, subject, html }) {
  if (!process.env.SMTP_HOST) {
    console.log(`[email skipped] ${subject} -> ${to}`);
    return { skipped: true };
  }

  return transporter().sendMail({
    from: process.env.MAIL_FROM || "EduPath <no-reply@edupath.local>",
    to,
    subject,
    html,
  });
}
