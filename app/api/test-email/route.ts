import nodemailer from "nodemailer";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
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
    await transporter.verify();
    await transporter.sendMail({
      from: `"Tioga AI" <${process.env.SMTP_USER}>`,
      to: "hello@tioga.ai",
      subject: "Test email from Tioga AI",
      text: "SMTP is working correctly!",
    });
    return new Response(JSON.stringify({ 
      success: true, 
      user: process.env.SMTP_USER,
      passLength: process.env.SMTP_PASS?.length 
    }), { status: 200 });
  } catch (err: unknown) {
    const error = err as Error & { code?: string; response?: string };
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      code: error.code,
      response: error.response,
      user: process.env.SMTP_USER,
      passLength: process.env.SMTP_PASS?.length
    }), { status: 500 });
  }
}
