import { rateLimit } from './rateLimiter';

interface RateLimitOptions {
    limit?: number;
    windowMs?: number;
    name?: string;
}

export const withRateLimit = (
    handler: (args: {request: Request}) => Promise<Response>,
    options: RateLimitOptions = {}
) => {
    return async ({request}: {request: Request}) => {
        const rateLimitResponse = await rateLimit(request, {
            limit: options.limit || 30,
            windowMs: options.windowMs || 10 * 1000,
            name: options.name
        });

        if (rateLimitResponse) {
            return rateLimitResponse;
        }

        return handler({request});
    };
};
