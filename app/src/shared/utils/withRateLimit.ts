import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from './rateLimiter';

interface RateLimitOptions {
    limit?: number;
    windowMs?: number;
    name?: string;
}

export const withRateLimit = (
    handler: (request: NextRequest) => Promise<NextResponse>,
    options: RateLimitOptions = {}
) => {
    return async (request: NextRequest) => {
        const rateLimitResponse = await rateLimit(request, {
            limit: options.limit || 30,
            windowMs: options.windowMs || 10 * 1000,
            name: options.name
        });

        if (rateLimitResponse) {
            return rateLimitResponse;
        }

        return handler(request);
    };
};
