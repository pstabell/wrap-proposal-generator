import type { NextConfig } from "next";

// Content-Security-Policy (added 2026-11-18). THE ONE PLACE this site's script policy lives.
//
// The browser will only run scripts from the sources listed in script-src. Today this site loads every script
// from its own origin, so the list is 'self' only:
//   'self'           Next.js chunks under /_next/static, and /lead-gate.js (our own lead form, loaded in
//                    app/layout.tsx with next/script; it only calls our own /api/lead and /api/enroll).
//   'unsafe-inline'  the inline bootstrap scripts Next.js writes into every page (nonces are a later step).
// No outside script host is allowed, because none is used: PDFs and Word files are built on the server and
// downloaded, and there is no analytics, map, captcha, payment or chat tag.
//
// ADDING AN OUTSIDE SCRIPT (analytics, a captcha, a chat widget, ...)? Add its exact host to script-src HERE,
// with a line above saying what it is for, or the browser will block it. Workers are governed by script-src
// too (worker-src is unset): a worker made from a blob: URL needs blob: added here.
//
// object-src 'none'       no <object>/<embed> plugins (the site uses none).
// base-uri 'self'         an injected <base> tag cannot re-point relative script URLs.
// frame-ancestors 'self'  only this site may frame its own pages. It is not designed to be embedded: the
//                         product page on agenient.com links to it, it does not frame it.
// connect-src, img-src, style-src, font-src, frame-src and default-src are deliberately NOT set in this version.
const CONTENT_SECURITY_POLICY = [
  "script-src 'self' 'unsafe-inline'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
].join("; ");

const nextConfig: NextConfig = {
  // Sent on every route (pages and API).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY }],
      },
    ];
  },
};

export default nextConfig;
