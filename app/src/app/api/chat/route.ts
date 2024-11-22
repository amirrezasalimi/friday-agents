import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
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
        const baseURL = process.env.LLM_HOST;

        if (!apiKey || !model || !baseURL) {
            return NextResponse.json(
                { error: 'Missing server configuration' },
                { status: 500 }
            );
        }

        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: baseURL
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
