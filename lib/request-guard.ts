import { NextRequest, NextResponse } from 'next/server';

/**
 * Lightweight protections for the public WRAP API routes (security fix
 * 2026-10-13). These routes back a public, sign-in-free tool, so they cannot
 * require a session. Instead they:
 *   1. only answer same-origin browser requests (Origin / Sec-Fetch-Site),
 *   2. rate-limit per client IP.
 *
 * The rate limiter is in-memory, so it is per serverless instance. It is a
 * stopgap: it stops a single script hammering a warm instance, not a
 * distributed attacker.
 */

function hostOf(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return null;
  }
}

/** Returns a 403 response unless the request comes from this site's own pages. */
export function requireSameOrigin(req: NextRequest): NextResponse | null {
  const host = (req.headers.get('x-forwarded-host') || req.headers.get('host') || '').toLowerCase();
  const originHost = hostOf(req.headers.get('origin'));

  if (originHost) {
    if (host && originHost === host) return null;
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Some browsers omit Origin on same-origin requests; fall back to the
  // fetch-metadata header, then the Referer.
  const site = req.headers.get('sec-fetch-site');
  if (site === 'same-origin') return null;

  const refererHost = hostOf(req.headers.get('referer'));
  if (refererHost && host && refererHost === host) return null;

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

/**
 * Fixed-window limiter. Returns a 429 response when `name` has been called
 * more than `limit` times from this IP inside `windowMs`.
 */
export function rateLimit(
  req: NextRequest,
  name: string,
  limit: number,
  windowMs: number,
): NextResponse | null {
  const now = Date.now();
  const key = `${name}:${clientIp(req)}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    bucket.count += 1;
    if (bucket.count > limit) {
      const retry = Math.ceil((bucket.resetAt - now) / 1000);
      return NextResponse.json(
        { error: 'Too many requests. Please wait a few minutes and try again.' },
        { status: 429, headers: { 'Retry-After': String(retry) } },
      );
    }
  }

  // Keep the map from growing without bound on a long-lived instance.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }
  return null;
}

/** Same-origin check followed by the rate limit. */
export function guardPublicRoute(
  req: NextRequest,
  name: string,
  limit: number,
  windowMs: number,
): NextResponse | null {
  return requireSameOrigin(req) || rateLimit(req, name, limit, windowMs);
}

export const MAX_PDF_BYTES = 10 * 1024 * 1024;

/** True when the bytes start with the PDF magic number "%PDF-". */
export function looksLikePdf(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 5 &&
    bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d
  );
}

/**
 * Host of this project's Vercel Blob store, derived from the read-write
 * token (format vercel_blob_rw_<storeId>_<secret>). Null if not derivable.
 */
export function blobStoreHost(): string | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN || '';
  const m = token.match(/^vercel_blob_rw_([A-Za-z0-9]+)_/);
  return m ? `${m[1].toLowerCase()}.public.blob.vercel-storage.com` : null;
}

/** Only URLs in our own Blob store may be fetched server-side. */
export function isOwnBlobUrl(raw: unknown): raw is string {
  if (typeof raw !== 'string' || raw.length > 2048) return false;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  const host = url.host.toLowerCase();
  const own = blobStoreHost();
  if (own) return host === own;
  return host.endsWith('.public.blob.vercel-storage.com');
}
