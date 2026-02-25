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

  const results: Record<string, unknown> = {};

  // Test 1: send to real account
  try {
    await transporter.sendMail({
      from: `"Tioga AI" <${process.env.SMTP_USER}>`,
      to: "sukir.kumaresan@tioga.ai",
      subject: "Test 1: direct to sukir.kumaresan@tioga.ai",
      text: "If you got this, direct delivery works.",
    });
    results.test1_direct = "sent";
  } catch (e: unknown) {
    results.test1_direct = (e as Error).message;
  }

  // Test 2: send to alias
  try {
    await transporter.sendMail({
      from: `"Tioga AI" <${process.env.SMTP_USER}>`,
      to: "hello@tioga.ai",
      subject: "Test 2: to hello@tioga.ai alias",
      text: "If you got this, alias delivery works.",
    });
    results.test2_alias = "sent";
  } catch (e: unknown) {
    results.test2_alias = (e as Error).message;
  }

  return new Response(JSON.stringify(results, null, 2), { status: 200 });
}
