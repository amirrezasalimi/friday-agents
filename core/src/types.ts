export interface ReasoningAndTools {
    reasoning: string
    tools: string[]
}

export interface FinalResponse {
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