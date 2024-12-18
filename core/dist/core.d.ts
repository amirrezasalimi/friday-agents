import type Agent from "./agents/core/agent";
import type { FinalResponse } from "./types";
import { OpenAI } from "openai";
interface Options {
    agents: Agent[];
    maxAgentRetry: number;
    maxLLmRetry?: number;
    baseLLm: {
        model: string;
        endpoint: string;
        apikey: string;
    };
    debug?: boolean;
    onChooseAgents: (reason: string, agents: string[]) => void;
    onUsingAgent: (name: string) => void;
    onAgentFinished: (name: string, result: any) => void;
    onAgentFailed: (name: string, error: string) => void;
    onFinish: (data: FinalResponse) => void;
}
declare class FridayAgents {
    private options;
    baseLLm: OpenAI;
    private readonly debug;
    constructor(options: Options);
    private debugLog;
    private withRetry;
    run({ messages, user, date, cutoff_date, }: {
        user?: {
            name: string;
            age: number;
        };
        date?: string;
        cutoff_date?: string;
        messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    }): Promise<unknown>;
    private generateSystemPrompt;
    private generateCombinedPrompt;
    private combineMessages;
    private extractXMLContent;
    private parseXMLResponse;
    private getOpenAIResponseWithParsing;
    private handleNoToolResponse;
    private executeAgents;
    private simplifyResponse;
    private generateAgentPrompt;
}
export default FridayAgents;
