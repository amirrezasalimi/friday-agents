import type { ActionFunctionArgs } from "@remix-run/node";
import { createRateLimiter } from "~/shared/utils/rateLimiter";
import Replicate from "replicate";

  // Check rate limit - lower limit for image generation as it's more resource-intensive
  const rateLimiter = createRateLimiter({
    limit: 5,
    windowMs: 60 * 60 * 1000, // 1 minute
    name: "generate-image-api",
  });
  
export async function action({ request }: ActionFunctionArgs) {

  const rateLimitResponse = await rateLimiter.isRateLimited(request);
  if (rateLimitResponse.limited) return rateLimitResponse.response;

  try {
    const { prompt } = await request.json();

    const apiToken = process.env.REPLICATE_API_TOKEN;
    const model = process.env.REPLICATE_IMAGE_MODEL as any;
    if (!prompt || !apiToken || !model) {
      return Response.json(
        { error: "Missing required parameters" },
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
      num_inference_steps: 4,
    };

    const outputs = (await replicate.run(model, { input })) as ReadableStream[];
    if (Array.isArray(outputs)) {
      const processedOutputs = await Promise.all(
        outputs.map(async (output) => {
          if ("blob" in output && typeof output.blob === "function") {
            const blob = await output.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const base64String = Buffer.from(arrayBuffer).toString("base64");
            return `data:image/png;base64,${base64String}`;
          }
          throw new Error("blob not found in replicate output");
        })
      );
      return Response.json({ urls: processedOutputs });
    } else {
      throw new Error("Invalid output format from Replicate");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return Response.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
