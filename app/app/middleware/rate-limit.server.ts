import { createHash } from 'crypto';
interface RateLimitConfig {
  sessionLimit: number;
  ipLimit: number;
  windowMs: number;
}

const ipRequests = new Map<string, { count: number; resetTime: number }>();
const sessionRequests = new Map<string, { count: number; resetTime: number }>();

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return '127.0.0.1';
}

function getSessionId(request: Request): string {
  // You might want to use a proper session management system
  const userAgent = request.headers.get('user-agent') || '';
  const ip = getClientIp(request);
  return createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
}

function isRateLimited(
  map: Map<string, { count: number; resetTime: number }>,
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const record = map.get(key);

  if (!record || now > record.resetTime) {
    map.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= limit) {
    return true;
  }

  record.count++;
  return false;
}

export function rateLimit(
  request: Request,
  config: RateLimitConfig = {
    sessionLimit: 30,
    ipLimit: 300,
    windowMs: 10 * 1000,
  }
): Response | null {
  const ip = getClientIp(request);
  const sessionId = getSessionId(request);

  if (
    isRateLimited(ipRequests, ip, config.ipLimit, config.windowMs) ||
    isRateLimited(sessionRequests, sessionId, config.sessionLimit, config.windowMs)
  ) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  return null;
}
