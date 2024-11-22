import OpenAI from "openai"

export interface ReasoningAndTools {
    reasoning: string
    tools: string[]
}

export interface FinalResponse {
    agentsMessages?: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
    
    usedAgents: {
        name: string
        usedSeconds: number
        result: any
        data: any
    }[]
    finalResponse: {
        type: 'view' | 'text'
        viewName?: string
        text?: string
        data?: any
        agentDataOutput?: any
    }
}