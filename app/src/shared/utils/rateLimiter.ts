import { NextRequest, NextResponse } from 'next/server';
import { caching } from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';
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
    private cache: any;
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
        
        this.cache = await caching(fsStore.create({
            store: fsStore,
            options: {
                path: tmpDir,
                ttl: Math.ceil(this.windowMs / 1000),
                subdirs: true,
            },
        }));

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

        let info: RateLimitInfo | null = await this.cache?.get(cacheKey);
        
        if (!info || now >= info.resetTime) {
            info = {
                count: 0,
                resetTime: now + this.windowMs
            };
        }

        info.count++;
        
        // Store the updated info with TTL
        const ttl = Math.ceil((info.resetTime - now) / 1000);
        await this.cache?.set(cacheKey, info, { ttl });

        const remaining = Math.max(0, this.limit - info.count);
        const limited = info.count > this.limit;

        return {
            limited,
            remaining,
            resetTime: info.resetTime
        };
    }

    async destroy(): Promise<void> {
        if (this.initialized) {
            await this.cache?.reset();
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
