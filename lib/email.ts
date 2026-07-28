import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
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
    to: "sukir.kumaresan@tioga.ai, sukir.kumaresan@gmail.com",
    replyTo: email,
    subject: `[${urgencyEmoji} ${classification.urgency.toUpperCase()}] New Inquiry: ${classification.service} — ${name}${company ? ` (${company})` : ""}`,
    html,
  });
}

interface MigrationAssessment {
  complexityScore: number;
  scoreReasoning: string;
  timelineRange: string;
  topRisks: { title: string; detail: string }[];
  recommendedApproach: { approach: string; reasoning: string };
  nextSteps: string[];
}

export async function sendMigrationAssessmentCopy({
  to,
  version,
  modules,
  dataVolume,
  target,
  assessment,
}: {
  to: string;
  version: string;
  modules: string;
  dataVolume: string;
  target: string;
  assessment: MigrationAssessment;
}) {
  const riskRows = assessment.topRisks
    .map(
      (r) => `
      <div style="padding: 12px 0; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0 0 4px; font-weight: 600; color: #b45309;">${r.title}</p>
        <p style="margin: 0; font-size: 13px; color: #334155;">${r.detail}</p>
      </div>`
    )
    .join("");

  const nextSteps = assessment.nextSteps.map((s) => `<li style="margin-bottom: 4px;">${s}</li>`).join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #00D4FF, #0066CC); padding: 20px 24px; border-radius: 8px; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 20px;">Your Migration Readiness Assessment</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px;">${version} → ${target}</p>
      </div>

      <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 8px;"><strong>Modules in scope:</strong> ${modules}</p>
        <p style="margin: 0 0 8px;"><strong>Data volume:</strong> ${dataVolume}</p>
        <p style="margin: 0 0 8px;"><strong>Complexity score:</strong> ${assessment.complexityScore}/10</p>
        <p style="margin: 0 0 8px;"><strong>Estimated timeline:</strong> ${assessment.timelineRange}</p>
        <p style="margin: 0; color: #334155;">${assessment.scoreReasoning}</p>
      </div>

      <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
        <h2 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin: 0 0 8px;">Top Risks</h2>
        ${riskRows}
      </div>

      <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
        <h2 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin: 0 0 8px;">Recommended Approach: ${assessment.recommendedApproach.approach}</h2>
        <p style="margin: 0 0 12px; color: #334155;">${assessment.recommendedApproach.reasoning}</p>
        <h2 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin: 0 0 8px;">Next Steps</h2>
        <ul style="margin: 0; padding-left: 18px; color: #334155;">${nextSteps}</ul>
      </div>

      <p style="text-align: center; font-size: 12px; color: #94a3b8; margin: 0;">
        This is a sample assessment generated by the Tioga AI demo. Reply to this
        email if you'd like to talk through a real one.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Tioga AI" <${process.env.SMTP_USER}>`,
    to,
    replyTo: "sukir.kumaresan@tioga.ai",
    subject: `Your ${version} → ${target} migration readiness assessment`,
    html,
  });
}
