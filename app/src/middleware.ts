import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@daveyplate/next-rate-limit'

export function middleware(request: NextRequest) {
    const response = NextResponse.next()

    const rateLimitResponse = rateLimit({
        request,
        response,
        sessionLimit: 30,    // 30 requests per session
        ipLimit: 300,        // 300 requests per IP
        windowMs: 10 * 1000  // 10 seconds window
    })

    if (rateLimitResponse) return rateLimitResponse

    return response
}

// Apply middleware to all API routes
export const config = {
    matcher: '/api/:path*'
}
