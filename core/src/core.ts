import type Agent from "./agents/agent";
import type { FinalResponse, ReasoningAndTools } from "./types";
import { OpenAI } from 'openai';
import { extractFirstJson } from "./utils";

interface Options {
    agents: Agent[]
    maxAgentRetry: number
    baseLLm: {
        model: string
        endpoint: string
        apikey: string
    }
    onChooseAgents: (reason: string, agents: string[]) => void
    onUsingAgent: (name: string) => void
    onAgentFinished: (name: string, result: any) => void
    onAgentFailed: (name: string, error: string) => void
    onFinish: (data: FinalResponse) => void
}


class FridayAgents {
    private options: Options;
    baseLLmOi: OpenAI
    constructor(options: Options) {
        this.options = options;
        this.baseLLmOi = new OpenAI({
            apiKey: this.options.baseLLm.apikey,
            baseURL: this.options.baseLLm.endpoint,
        })
    }

    async run({ prompt, messages, user }: {
        user?: {
            name: string
            age: number
        },
        date?: string
        prompt: string,
        messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
    }) {
        return new Promise(async (resolve, reject) => {
            try {
                const tools = this.options.agents.map(agent => `${agent.name}:\n${agent.description}`).join("\n\n");
                const systemPrompt = this.generateSystemPrompt(user);
                const pureMessages = this.combineMessages(systemPrompt, messages, prompt);
                const combinedPrompt = this.generateCombinedPrompt(tools, prompt);
                const combinedMessages = this.combineMessages(systemPrompt, messages, combinedPrompt);

                const response = await this.getOpenAIResponse(this.baseLLmOi, combinedMessages);
                const parsedResponse = this.parseResponse(response);
                this.options.onChooseAgents?.(parsedResponse.tool_reasoning, parsedResponse.tools);

                if (parsedResponse.tools.includes('no-tool') || !parsedResponse.tools.length) {
                    await this.handleNoToolResponse(this.baseLLmOi, combinedMessages, prompt);
                } else {
                    await this.executeAgents(parsedResponse.tools, pureMessages, prompt);
                }

                resolve(true);
            } catch (error) {
                console.error("Error in FridayAgents run:", error);
                reject(error);
            }
        });
    }

    private generateSystemPrompt(user?: { name: string; age: number }): string {
        return `
${user ? `Understand the user intent,
You are a super helpful assistant. Adjust your tone based on the user's preference:
User Name: ${user.name}\nAge: ${user.age}\n` : ''}

- Be friendly and casual for informal queries.
- Be formal and concise for professional or technical tasks.
`;
    }

    private generateCombinedPrompt(tools: string, prompt: string): string {
        return `
Your data cutoff: April 2023.
Available tools:
${tools}

Rules:
- Based on the user's query, determine if the prompt is clear enough to provide an answer.
- If the query is unclear or if more explanation is needed, respond with the tools array containing ["no-tool"].
- If a tool is needed, determine which available tools are necessary to accomplish the tasks.
- If the Prompt wasn't clear enough about which tools we have to use, just return ["no-tool"] in tools array.
- We don't always need tools to answer questions.
- Always Return valid JSON format, no extra talk.
- For general information that could be answered without any tools, just return ["no-tool"] in tools array. (unless it doesn't mention any date).
- Strive for accuracy and precision in your tool selection and reasoning.

User's Prompt:
${prompt}

Expected Response:
{
    "tool_reasoning": "Provide reasoning for the selected tools or indicate no tools are needed.",
    "tools": ["..."] // Respond with ["no-tool"] if the prompt is unclear or needs more explanation.
}
`;
    }

    private combineMessages(systemPrompt: string, messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[], combinedPrompt: string): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
        return [
            {
                role: "system",
                content: systemPrompt,
            },
            ...messages,
            {
                role: "user",
                content: combinedPrompt
            }
        ];
    }

    private async getOpenAIResponse(oai: OpenAI, messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]): Promise<OpenAI.Chat.Completions.ChatCompletion> {
        return await this.baseLLmOi.chat.completions.create({
            messages: messages,
            model: this.options.baseLLm.model,
            temperature: 0.2,
            top_p: 0.2
        });
    }

    private parseResponse(response: OpenAI.Chat.Completions.ChatCompletion): { tool_reasoning: string; tools: string[] } {
        if (response.choices?.length) {
            const content = extractFirstJson(response.choices[0].message.content ?? "");
            if (!content) {
                throw new Error("Invalid JSON in response");
            }
            const parsedResponse = JSON.parse(content) as {
                tool_reasoning: string,
                tools: string[]
            };

            if (!parsedResponse.tools.length) {
                parsedResponse.tools = ['no-tool'];
            }

            return parsedResponse;
        }
        throw new Error("No choices in OpenAI response");
    }

    private async handleNoToolResponse(oai: OpenAI, messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[], prompt: string) {
        const noToolResponse = await this.baseLLmOi.chat.completions.create({
            messages: [...messages, { role: "user", content: prompt }],
            model: this.options.baseLLm.model,
            temperature: 0.7
        });

        const finalResponse: FinalResponse = {
            finalResponse: {
                text: noToolResponse.choices[0].message.content || "",
                type: "text"
            },
            usedAgents: []
        };

        await this.options.onFinish?.(finalResponse);
    }


    private async executeAgents(tools: string[], messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[], prompt: string) {
        let lastAgentResponse: string = "";
        let lastAgent: Agent | undefined;

        let agentsInfo: Record<string, {
            usedSeconds: number,
            result: any
            data: any
            error?: string
        }> = {};


        for (let i = 0; i < tools.length; i++) {
            const toolName = tools[i];
            const agent = this.options.agents.find(a => a.name === toolName);
            if (!agent) {
                console.warn(`Agent ${toolName} not found`);
                continue;
            }

            await this.options.onUsingAgent?.(toolName);

            let retryCount = 0;
            let agentCallResult: string | null = null;
            const startTime = Date.now();
            agentsInfo[toolName] = {
                data: null,
                result: null,
                usedSeconds: 0,
            }
            while (retryCount < this.options.maxAgentRetry) {
                try {
                    const agentPrompt = this.generateAgentPrompt(agent, toolName, lastAgentResponse);
                    const newMessages: any = [...messages, { role: "user", content: agentPrompt }];

                    const agentResponse = await this.baseLLmOi.chat.completions.create({
                        messages: newMessages,
                        model: this.options.baseLLm.model,
                        temperature: 0.2
                    });
                    const agentStep1Result = agentResponse.choices[0].message.content || "";
                    agentCallResult = await agent.onCall(agentStep1Result);
                    const usedSeconds = (Date.now() - startTime) / 1000;
                    agentsInfo[toolName] = {
                        result: agentCallResult,
                        usedSeconds,
                        data: agent.dataOutput
                    }
                    messages.push({ role: "user", content: agentPrompt })
                    messages.push({ role: "user", content: `[Agent ${toolName}]\nAgent Step 1 Output:\n${agentStep1Result}\nAgent Call Result:\n${agentCallResult}` });
                    break;
                } catch (error) {
                    console.error(`Error executing agent ${toolName}:`, error);
                    retryCount++;
                    if (error instanceof Error && retryCount == this.options.maxAgentRetry) {
                        if (agentsInfo[toolName]) {
                            agentsInfo[toolName].error = error.message;
                            this.options.onAgentFailed(toolName, error.message);
                        }
                    }
                }
            }

            if (agentCallResult !== null) {
                await this.options.onAgentFinished?.(toolName, agentCallResult);
                lastAgentResponse = agentCallResult;
                lastAgent = agent;
            } else {
                console.error(`Failed to execute agent ${toolName} after ${this.options.maxAgentRetry} attempts`);
            }
        }

        if (lastAgent && lastAgent.viewType === "text" && lastAgent.needSimplify) {
            lastAgentResponse = await this.simplifyResponse(lastAgent.name, messages);
        }

        const finalResponse: FinalResponse = {
            finalResponse: {
                type: lastAgent?.viewType ?? "text",
                data: lastAgentResponse,
                text: ""
            },
            usedAgents: Object.entries(agentsInfo).map(([agent, info]) => ({
                name: agent,
                result: info.result,
                usedSeconds: info.usedSeconds,
                data: info.data
            }))
        };

        await this.options.onFinish?.(finalResponse);
    }

    private async simplifyResponse(agentName: string, messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]): Promise<string> {
        const simplificationPrompt = `breifly in md format, describe the process you did to get answer, in summuary, and make sure only include Agent Call Result, not step 1`
        const somplifierMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [...messages, { role: "user", content: simplificationPrompt }];
        const simplifiedResponse = await this.baseLLmOi.chat.completions.create({
            messages: somplifierMessages,
            model: this.options.baseLLm.model,
            temperature: 0.3
        });
        return simplifiedResponse.choices[0].message.content || "";
    }



    private generateAgentPrompt(agent: Agent, toolName: string, lastAgentResponse: string): string {
        return `
Current Step: ${toolName},
${lastAgentResponse ? `[${toolName}] response:\n${lastAgentResponse}\n---\n` : ''}
Now with ${toolName}, you have to generate the response in this specific format I want.

${agent.description}
--
Please provide your response based on the expected format and instructions.
Expected Response:
${agent.callFormat()}
`;
    }

}

export default FridayAgents;