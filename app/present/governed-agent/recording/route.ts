import { get } from "@vercel/blob";

// Streams the presenter recording from a PRIVATE Vercel Blob store. It lives
// there, not in public/, because this repo is public on GitHub. Access control
// is middleware.ts's password gate on /present/*; this route never exposes a
// blob URL to the browser. The Range header is forwarded so the <video>
// element can seek (and Safari will play it at all).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PATHNAME = "presenter/governed-agent-snowflake-2026-09-23.mp4";

export async function GET(req: Request) {
  const range = req.headers.get("range");
  let result: Awaited<ReturnType<typeof get>>;
  try {
    result = await get(PATHNAME, {
      access: "private",
      headers: range ? { Range: range } : undefined,
    });
  } catch {
    // No private store connected (or no credentials) yet.
    return new Response("Recording not configured.", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  if (!result || !result.stream) {
    return new Response("Not found.", { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const headers = new Headers({
    "Content-Type": "video/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store",
  });
  for (const key of ["content-length", "content-range", "etag", "last-modified"]) {
    const value = result.headers.get(key);
    if (value) headers.set(key, value);
  }
  const status = result.headers.get("content-range") ? 206 : 200;
  return new Response(result.stream as ReadableStream, { status, headers });
}
