import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/shared/utils/withRateLimit';
import OpenAI from 'openai';

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
        const host = process.env.LLM_HOST;

        if (!apiKey || !model || !host) {
            return NextResponse.json(
                { error: 'Missing server configuration' },
                { status: 500 }
            );
        }

        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: host
        });

        const completion = await openai.chat.completions.create({
            model: model,
            messages,
            temperature
        });
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
