import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/shared/utils/withRateLimit';

async function handler(request: NextRequest) {
    try {
        const {
            messages,
            temperature,
        } = await request.json();

        if (!messages || !temperature) {
            return NextResponse.json(
                { error: 'Missing parameters' },
                { status: 400 }
            );
        }

        const apiKey = process.env.LLM_KEY;
        const model = process.env.LLM_MODEL;
        const endpoint = process.env.LLM_HOST;

        if (!apiKey || !model || !endpoint) {
            return NextResponse.json(
                { error: 'Missing server configuration' },
                { status: 500 }
            );
        }

        const response = await fetch(`${endpoint}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: model,
                messages,
                temperature
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const completion = await response.json();
        return NextResponse.json(completion);
    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json(
            { error: 'Failed to perform chat completion' },
            { status: 500 }
        );
    }
}

export const POST = withRateLimit(handler, {
    limit: 20,
    windowMs: 10 * 1000,
    name: 'chat-api'
});
