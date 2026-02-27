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
    const fileName = file.name.toLowerCase();

    // Detect type by extension (more reliable than MIME type across browsers)
    const isPDF = fileName.endsWith(".pdf");
    const isDocx = fileName.endsWith(".docx") || fileName.endsWith(".doc");
    const isText = fileName.endsWith(".txt") || fileName.endsWith(".md") ||
                   fileName.endsWith(".csv") || fileName.endsWith(".rtf");

    let text = "";

    if (isPDF) {
      const { extractText } = await import("unpdf");
      const { text: extracted } = await extractText(new Uint8Array(bytes), { mergePages: true });
      text = extracted;
    } else if (isDocx) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
      text = result.value;
    } else if (isText) {
      text = Buffer.from(bytes).toString("utf-8");
    } else {
      return new Response(
        JSON.stringify({ error: "Unsupported file type. Please upload a PDF, DOCX, TXT, MD, or CSV file." }),
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return new Response(
        JSON.stringify({ error: "Could not extract text. The file may be empty or a scanned image PDF." }),
        { status: 400 }
      );
    }

    return new Response(JSON.stringify({ text: text.slice(0, 10000) }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Extract text error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: `Failed to process file: ${message}` }), { status: 500 });
  }
}
