import { NextRequest, NextResponse } from 'next/server';
import Keyv from 'keyv';
import KeyvFile from 'keyv-file';
import path from 'path';
import fs from 'fs/promises';

interface RateLimitConfig {
    limit: number;
    windowMs: number;
    name?: string;
}

interface RateLimitInfo {
    count: number;
    resetTime: number;
}

class RateLimiter {
    private static instances: Map<string, RateLimiter> = new Map();
    private cache: Keyv | null = null;
    private readonly limit: number;
    private readonly windowMs: number;
    private readonly name: string;
    private initialized: boolean = false;

    private constructor(config: RateLimitConfig) {
        this.limit = config.limit;
        this.windowMs = config.windowMs;
        this.name = config.name || 'default';
    }

    private async ensureDirectory(dir: string) {
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    private async initializeCache() {
        if (this.initialized) return;

        const tmpDir = path.join(process.cwd(), 'tmp', 'rate-limit-cache');
        await this.ensureDirectory(tmpDir);
        
        this.cache = new Keyv({
            store: new KeyvFile({
                filename: path.join(tmpDir, `${this.name}.json`), // Store each limiter in its own file
                expiredCheckDelay: 24 * 60 * 60 * 1000, // Check for expired items every 24 hours
            }),
            ttl: this.windowMs, // Set TTL in milliseconds
        });

        this.initialized = true;
    }

    static getInstance(config: RateLimitConfig): RateLimiter {
        const name = config.name || 'default';
        if (!RateLimiter.instances.has(name)) {
            RateLimiter.instances.set(name, new RateLimiter(config));
        }
        return RateLimiter.instances.get(name)!;
    }

    private getClientIp(request: NextRequest): string {
        // @ts-ignore
        return request?.["ip"] || 
               request.headers.get('x-forwarded-for')?.split(',')[0] || 
               'unknown';
    }

    async isRateLimited(request: NextRequest): Promise<{
        limited: boolean;
        remaining: number;
        resetTime: number;
    }> {
        await this.initializeCache();

        const ip = this.getClientIp(request);
        const cacheKey = `${this.name}:${ip}`;
        const now = Date.now();

        let info: RateLimitInfo | null = await this.cache?.get(cacheKey) || null;
        
        if (!info || now >= info.resetTime) {
            info = {
                count: 0,
                resetTime: now + this.windowMs
            };
        }

        info.count++;
        
        // Store the updated info
        await this.cache?.set(cacheKey, info);

        const remaining = Math.max(0, this.limit - info.count);
        const limited = info.count > this.limit;

        return {
            limited,
            remaining,
            resetTime: info.resetTime
        };
    }

    async destroy(): Promise<void> {
        if (this.initialized && this.cache) {
            await this.cache.clear();
            this.initialized = false;
        }
        RateLimiter.instances.delete(this.name);
    }
}

export const createRateLimiter = (config: RateLimitConfig) => {
    return RateLimiter.getInstance(config);
};

export const rateLimit = async (
    request: NextRequest,
    config: RateLimitConfig
): Promise<NextResponse | null> => {
    const limiter = createRateLimiter(config);
    const { limited, remaining, resetTime } = await limiter.isRateLimited(request);

    if (limited) {
        return new NextResponse(
            JSON.stringify({
                error: 'Too many requests',
                retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'X-RateLimit-Limit': config.limit.toString(),
                    'X-RateLimit-Remaining': remaining.toString(),
                    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
                    'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
                }
            }
        );
    }

    return null;
};
