import { NextResponse, type NextRequest } from "next/server";

// Password gate for /present/* — hidden presenter pages used in live sales
// calls (the page and its video under public/present/). Not linked from the
// site, noindex, excluded from the sitemap; this gate is what actually keeps
// them private.
//
// Fails closed: if PRESENTER_PASSWORD isn't set in the environment, every
// request is refused rather than served unprotected.

const REALM = 'Basic realm="Tioga AI presenter", charset="UTF-8"';

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": REALM, "Cache-Control": "no-store" },
  });
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function middleware(req: NextRequest) {
  const expected = process.env.PRESENTER_PASSWORD;
  if (!expected) {
    return new NextResponse("Not available.", { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const header = req.headers.get("authorization") ?? "";
  if (!header.startsWith("Basic ")) return unauthorized();

  let decoded = "";
  try {
    decoded = atob(header.slice(6));
  } catch {
    return unauthorized();
  }
  // Any username is accepted; only the password is checked.
  const password = decoded.slice(decoded.indexOf(":") + 1);
  if (!safeEqual(password, expected)) return unauthorized();

  const res = NextResponse.next();
  res.headers.set("Cache-Control", "private, no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/present", "/present/:path*"],
};
