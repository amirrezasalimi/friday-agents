import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { withRateLimit } from '@/shared/utils/withRateLimit';

async function handler(request: NextRequest) {
    try {
        const { prompt, } = await request.json();

        const apiToken = process.env.REPLICATE_API_TOKEN;
        const model = process.env.REPLICATE_IMAGE_MODEL as any;
        if (!prompt || !apiToken || !model) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const replicate = new Replicate({
            auth: apiToken,
        });

        const input = {
            prompt,
            go_fast: false,
            megapixels: "1",
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "png",
            output_quality: 100,
            num_inference_steps: 4
        };

        const outputs = (await replicate.run(model, { input })) as ReadableStream[];
        if (Array.isArray(outputs)) {
            const processedOutputs = await Promise.all(outputs.map(async (output) => {
                if ("blob" in output && typeof output.blob === "function") {
                    const blob = await output.blob();
                    const arrayBuffer = await blob.arrayBuffer();
                    const base64String = Buffer.from(arrayBuffer).toString('base64');
                    return `data:image/png;base64,${base64String}`;
                }
                throw new Error("blob not found in replicate output");
            }));
            return NextResponse.json({ urls: processedOutputs });
        } else {
            throw new Error("Invalid output format from Replicate");
        }
    } catch (error) {
        console.error('Error generating image:', error);
        return NextResponse.json(
            { error: 'Failed to generate image' },
            { status: 500 }
        );
    }
}

export const POST = withRateLimit(handler, {
    limit: 3,  // Lower limit for image generation as it's more resource-intensive
    windowMs: 60 * 60 * 1000,  // 60m
    name: 'image-generation-api'
});
