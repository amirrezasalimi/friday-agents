import type { ActionFunctionArgs } from "@remix-run/node";
import { createRateLimiter } from "~/shared/utils/rateLimiter";
import OpenAI from "openai";

// Check rate limit
const rateLimiter = createRateLimiter({
  limit: 50,
  windowMs: 60 * 1000, // 1 minute
  name: "chat-api",
});

export async function action({ request }: ActionFunctionArgs) {
  const rateLimitResponse = await rateLimiter.isRateLimited(request);
  if (rateLimitResponse.limited) return rateLimitResponse.response;

  try {
    const { messages, temperature,top_p } = await request.json();

    if (!messages || !temperature) {
      return Response.json({ error: "Missing parameters" }, { status: 400 });
    }

    const apiKey = process.env.LLM_KEY;
    const model = process.env.LLM_MODEL;
    const host = process.env.LLM_HOST;

    if (!apiKey || !model || !host) {
      return Response.json(
        { error: "Missing server configuration" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: host,
    });

    const completion = await openai.chat.completions.create({
      model: model,
      messages,
      temperature,
      top_p,
    });

    return Response.json(completion);
  } catch (error) {
    console.error("Chat error:", error);
    return Response.json(
      { error: "Failed to perform chat completion" },
      { status: 500 }
    );
  }
}
