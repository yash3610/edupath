import nodemailer from "nodemailer";

function transporter() {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST || (user?.includes("@gmail.com") ? "smtp.gmail.com" : "localhost");
  const port = Number(process.env.SMTP_PORT || (host === "smtp.gmail.com" ? 465 : 1025));
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass } : undefined,
  });
}

export async function sendEmail({ to, subject, html }) {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  if (!process.env.SMTP_HOST && !user) {
    console.log(`[email skipped] ${subject} -> ${to}`);
    return { skipped: true };
  }

  return transporter().sendMail({
    from: process.env.MAIL_FROM || user || "EduPath <no-reply@edupath.local>",
    to,
    subject,
    html,
  });
}
