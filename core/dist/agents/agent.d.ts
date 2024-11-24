import type OpenAI from "openai";
interface AiCreateOptions {
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    temperature?: number;
    top_p?: number;
}
interface AgentOptions {
    ai: {
        create: (params: AiCreateOptions) => Promise<OpenAI.Chat.Completions.ChatCompletion>;
    };
}
export default abstract class Agent<C = {}, DataOutput = {}> {
    ai: AgentOptions['ai'] | null;
    config: C | null;
    abstract viewType: "text" | "view";
    needSimplify: boolean;
    abstract name: string;
    abstract description: string;
    keywords?: string[];
    abstract callFormat(): string;
    abstract onCall(result: string): Promise<any>;
    needsPreviousResult?: boolean;
    dataOutput?: DataOutput;
}
export {};
