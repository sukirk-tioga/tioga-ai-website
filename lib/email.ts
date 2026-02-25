import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface Classification {
  service: string;
  urgency: string;
  complexity: string;
  summary: string;
  nextStep: string;
  responseTime: string;
  fitScore: number;
}

export async function sendInquiryEmail({
  name,
  email,
  company,
  description,
  classification,
}: {
  name: string;
  email: string;
  company: string;
  description: string;
  classification: Classification;
}) {
  const urgencyEmoji = {
    low: "🟢",
    medium: "🟡",
    high: "🟠",
    critical: "🔴",
  }[classification.urgency] ?? "⚪";

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #00D4FF, #0066CC); padding: 20px 24px; border-radius: 8px; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 20px;">New Inquiry — Tioga AI</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px;">Respond ${classification.responseTime}</p>
      </div>

      <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
        <h2 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin: 0 0 12px;">Contact Details</h2>
        <p style="margin: 4px 0;"><strong>Name:</strong> ${name}</p>
        <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p style="margin: 4px 0;"><strong>Company:</strong> ${company || "Not provided"}</p>
      </div>

      <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
        <h2 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin: 0 0 12px;">Project Description</h2>
        <p style="margin: 0; color: #334155; line-height: 1.6;">${description}</p>
      </div>

      <div style="background: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
        <h2 style="font-size: 14px; text-transform: uppercase; color: #00D4FF; margin: 0 0 16px;">🤖 AI Classification</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 13px; width: 40%;">Service Match</td>
            <td style="padding: 6px 0; color: white; font-size: 13px; font-weight: 600;">${classification.service}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Urgency</td>
            <td style="padding: 6px 0; color: white; font-size: 13px;">${urgencyEmoji} ${classification.urgency.charAt(0).toUpperCase() + classification.urgency.slice(1)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Project Size</td>
            <td style="padding: 6px 0; color: white; font-size: 13px;">${classification.complexity}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Fit Score</td>
            <td style="padding: 6px 0; color: white; font-size: 13px;">${classification.fitScore}/10</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Summary</td>
            <td style="padding: 6px 0; color: white; font-size: 13px;">${classification.summary}</td>
          </tr>
        </table>
        <div style="margin-top: 16px; padding: 12px; background: #00D4FF15; border-radius: 6px; border: 1px solid #00D4FF30;">
          <p style="margin: 0; font-size: 13px; color: #00D4FF; font-weight: 600;">Recommended Next Step</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: #cbd5e1;">${classification.nextStep}</p>
        </div>
      </div>

      <p style="text-align: center; font-size: 12px; color: #94a3b8; margin: 0;">Sent by Tioga AI Smart Contact Form</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Tioga AI" <${process.env.SMTP_USER}>`,
    to: "sukir.kumaresan@tioga.ai",
    replyTo: email,
    subject: `[${urgencyEmoji} ${classification.urgency.toUpperCase()}] New Inquiry: ${classification.service} — ${name}${company ? ` (${company})` : ""}`,
    html,
  });
}
