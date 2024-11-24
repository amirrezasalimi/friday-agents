import type { ActionFunctionArgs } from "@remix-run/node";
import { createRateLimiter } from "~/shared/utils/rateLimiter";
import OpenAI from "openai";

// Check rate limit
const rateLimiter = createRateLimiter({
  limit: 30,
  windowMs: 60 * 1000, // 1 minute
  name: "search-api",
});

export async function action({ request }: ActionFunctionArgs) {
  const rateLimitResponse = await rateLimiter.isRateLimited(request);
  if (rateLimitResponse.limited) return rateLimitResponse.response;

  try {
    const { messages, temperature,top_p } = await request.json();

    if (!messages || !temperature) {
      return Response.json({ error: "Missing parameters" }, { status: 400 });
    }

    const host = process.env.LLM_ONLINE_HOST;
    const apiKey = process.env.LLM_ONLINE_KEY;
    const model = process.env.LLM_ONLINE_MODEL;

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
    console.error("Search error:", error);
    return Response.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
