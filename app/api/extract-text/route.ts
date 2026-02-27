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
    const fileName = file.name.toLowerCase();
    const mimeType = file.type;

    let text = "";

    if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      
      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => item.str ?? "")
          .join(" ");
        pages.push(pageText);
      }
      text = pages.join("\n\n");
    } else if (
      mimeType.startsWith("text/") ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".csv") ||
      fileName.endsWith(".md")
    ) {
      text = buffer.toString("utf-8");
    } else {
      return new Response(
        JSON.stringify({ error: "Unsupported file type. Please upload a PDF or text file." }),
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return new Response(
        JSON.stringify({ error: "Could not extract text from file. The file may be empty or image-based." }),
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
