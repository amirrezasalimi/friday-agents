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

        const host = process.env.LLM_ONLINE_HOST;
        const apiKey = process.env.LLM_ONLINE_KEY;
        const model = process.env.LLM_ONLINE_MODEL;

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
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Failed to perform search' },
            { status: 500 }
        );
    }
}