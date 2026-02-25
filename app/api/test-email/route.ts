import nodemailer from "nodemailer";

export const runtime = "nodejs";

export async function GET() {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Tioga AI" <${process.env.SMTP_USER}>`,
      to: "sukir.kumaresan@gmail.com",
      subject: "Test: Tioga AI contact form email",
      text: "Email delivery is working correctly!",
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e: unknown) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
  }
}
