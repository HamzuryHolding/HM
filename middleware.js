// Vercel Routing Middleware: password-protects the private hm OS (/os/).
// Set OS_PASSWORD (and optionally OS_USER, default "hm") in the Vercel project's
// Environment Variables. If OS_PASSWORD is not set, /os/ is closed to everyone.
// The local dev server does not run this file.
import { next } from '@vercel/functions';

export const config = { matcher: ['/os', '/os/:path*'] };

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default function middleware(request) {
  const user = process.env.OS_USER || 'hm';
  const password = process.env.OS_PASSWORD;
  const header = request.headers.get('authorization') || '';

  if (password && header.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6));
      const split = decoded.indexOf(':');
      if (
        split > -1 &&
        safeEqual(decoded.slice(0, split), user) &&
        safeEqual(decoded.slice(split + 1), password)
      ) {
        return next({ headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
      }
    } catch {
      // Malformed header: fall through to 401.
    }
  }

  return new Response('hm OS is private.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="hm OS", charset="UTF-8"',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
