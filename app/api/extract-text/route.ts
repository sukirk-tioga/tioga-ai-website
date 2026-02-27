import { rateLimit } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = rateLimit(`extract:${ip}`, 30);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided." }), { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type;
    const fileName = file.name.toLowerCase();

    let text = "";

    if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
      // Dynamically import to avoid edge runtime issues
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfModule = await import("pdf-parse") as any;
      const pdfParse = pdfModule.default ?? pdfModule;
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } else if (
      mimeType.startsWith("text/") ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".csv") ||
      fileName.endsWith(".md")
    ) {
      text = buffer.toString("utf-8");
    } else {
      return new Response(JSON.stringify({ error: "Unsupported file type. Please upload a PDF or text file." }), { status: 400 });
    }

    if (!text.trim()) {
      return new Response(JSON.stringify({ error: "Could not extract text from file." }), { status: 400 });
    }

    return new Response(JSON.stringify({ text: text.slice(0, 10000) }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Extract text error:", err);
    return new Response(JSON.stringify({ error: "Failed to process file." }), { status: 500 });
  }
}
