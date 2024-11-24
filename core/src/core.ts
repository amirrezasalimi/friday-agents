import type Agent from "./agents/agent";
import type { FinalResponse } from "./types";
import { OpenAI } from "openai";
import { extractFirstJson } from "./utils";

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
interface ReasoningAgentResponse {
  tool_reasoning: string;
  tools: string[];
  message?: string;
}

class FridayAgents {
  private options: Options;
  baseLLm: OpenAI;
  private readonly debug: boolean;

  constructor(options: Options) {
    this.options = options;
    this.debug = options.debug || false;
    this.baseLLm = new OpenAI({
      apiKey: this.options.baseLLm.apikey,
      baseURL: this.options.baseLLm.endpoint,
      dangerouslyAllowBrowser: true,
    });
  }

  private debugLog(
    type: "info" | "error" | "warning" | "success",
    message: string,
    data?: any
  ) {
    if (!this.debug) return;

    const colors = {
      info: "\x1b[36m", // Cyan
      error: "\x1b[31m", // Red
      warning: "\x1b[33m", // Yellow
      success: "\x1b[32m", // Green
    };
    const reset = "\x1b[0m";
    const timestamp = new Date().toISOString();
    const prefix = `${
      colors[type]
    }[${timestamp}] [${type.toUpperCase()}]${reset}`;

    console.log(`${prefix} ${message}`);
    if (data) {
      console.log(`${colors[type]}[DATA]${reset}`, data);
    }
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const maxRetries = this.options.maxLLmRetry || 3;
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.debugLog(
          "error",
          `${operationName} failed, attempt ${attempt + 1}/${maxRetries}`,
          error
        );
        if (attempt === maxRetries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simple 1s delay between retries
      }
    }

    throw lastError;
  }

  async run({
    messages,
    user,
    date,
    cutoff_date,
  }: {
    user?: {
      name: string;
      age: number;
    };
    date?: string;
    cutoff_date?: string;
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  }) {
    return new Promise(async (resolve, reject) => {
      try {
        this.debugLog("info", "Starting FridayAgents run", {
          user,
          date,
          cutoff_date,
        });
        const tools = this.options.agents
          .map((agent) => `${agent.name}:\n${agent.description}`)
          .join("\n\n");
        const systemPrompt = this.generateSystemPrompt(user, date, cutoff_date);
        this.debugLog("info", "Generated system prompt", { systemPrompt });

        const pureMessages = this.combineMessages(systemPrompt, messages);
        const toolsAndKeywords = this.options.agents.reduce((acc, agent) => {
          acc[agent.name] = agent.keywords || [];
          return acc;
        }, {} as Record<string, string[]>);

        const combinedPrompt = this.generateCombinedPrompt(
          toolsAndKeywords,
          messages
        );
        this.debugLog("info", "Generated combined prompt", { combinedPrompt });

        const combinedMessages = this.combineMessages(
          systemPrompt,
          messages,
          combinedPrompt
        );
        this.debugLog("info", "Sending request to OpenAI");

        const parsedResponse = await this.getOpenAIResponseWithParsing(
          combinedMessages
        );
        this.debugLog(
          "success",
          "Received and parsed response from OpenAI",
          parsedResponse
        );

        this.options.onChooseAgents?.(
          parsedResponse.tool_reasoning,
          parsedResponse.tools
        );

        if (
          parsedResponse.tools.includes("no-tool") ||
          !parsedResponse.tools.length
        ) {
          this.debugLog("info", "No tools required, handling direct response");
          await this.handleNoToolResponse(parsedResponse);
        } else {
          this.debugLog("info", "Executing agents", {
            tools: parsedResponse.tools,
          });
          await this.executeAgents(parsedResponse.tools, pureMessages);
        }

        this.debugLog("success", "FridayAgents run completed successfully");
        resolve(true);
      } catch (error) {
        this.debugLog("error", "Error in FridayAgents run", error);
        console.error("Error in FridayAgents run:", error);
        reject(error);
      }
    });
  }

  private generateSystemPrompt(
    user?: { name: string; age: number },
    date?: string,
    cutoff_date?: string
  ): string {
    return `
${
  user
    ? `Understand the user intent,
You are a super helpful assistant. Adjust your tone based on the user's preference:
User Name: ${user.name}\nAge: ${user.age}\n`
    : ""
}

${date ? `Today's Date: ${date}` : ""}
${cutoff_date ? `Data Cutoff Date: ${cutoff_date}` : ""}

- Be friendly and casual for informal queries.
- Be formal and concise for professional or technical tasks.
`;
  }

  private generateCombinedPrompt(
    tools: Record<string, string[]>,
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
  ): string {
    return `
You are a highly capable AI assistant with access to specialized tools. Your role is to either provide direct assistance or determine which tools are needed to best help the user.

Core Instructions:
1. Analyze the user's intent carefully - what are they really trying to achieve?
2. For direct questions or casual conversation:
   - Respond naturally and engagingly in the "message" element
   - Set tools to "no-tool"
   - Be conversational, friendly, and helpful
   - Include relevant examples or analogies when appropriate
   - Feel free to ask clarifying questions in your message if needed

3. For tasks requiring tools:
   - Choose the most appropriate tool(s) for the job
   - Explain your reasoning clearly
   - Only select tools that are absolutely necessary
   - If multiple tools are needed, list them in order of use
   - If you are not sure, set tools to "no-tool" and explain you cannot help

4. Response Style Guide:
   - Be conversational and natural, not robotic
   - Show personality while maintaining professionalism
   - Use appropriate emojis or markdown formatting when it adds value
   - Match the user's tone and energy level
   - Feel free to be creative and engaging in your responses

5. Make sure to wrap your response in proper XML tags.
6. Pay attention to user prompt.

Remember: You're not just a tool selector - you're a helpful assistant first. When no tools are needed, focus on providing valuable, engaging responses that truly help the user.

User Prompt:
${messages[messages.length - 1].content}
--

Important Notes:
1. Always respond using the following XML format, no other responses or texts in prefix or suffix.
2. only attention to last user message.
3. You have to use multiple tools if the task is complex and requires multiple steps.
Available Tools and Agents ( and their related keywords ):
${Object.entries(tools)
  .map(
    ([name, keywords]) =>
      `- ${name}${
        keywords?.length ? ` :\nkeywords: ${keywords.join(", ")}.` : "."
      }`
  )
  .join("\n\n")}

Valid Response Format:
<response>
    <tool_reasoning>Your thought process for tool selection</tool_reasoning>
    <tools>
        <tool>tool_name</tool>
        <!-- available tools: ${Object.keys(tools).join(", ")} -->
        <!-- use sequence of tools based on needed stuff in user prompt -->
    </tools>
    <message>Your helpful and engaging response here!</message>
</response>
`;
  }

  private combineMessages(
    systemPrompt: string,
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    combinedPrompt?: string
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const baseMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    if (combinedPrompt) {
      baseMessages.push({ role: "user", content: combinedPrompt });
    }

    return baseMessages;
  }

  private extractXMLContent(content: string): string | null {
    const match = content.match(/<response>([\s\S]*?)<\/response>/);
    return match ? match[1].trim() : null;
  }

  private parseXMLResponse(xmlContent: string): ReasoningAgentResponse {
    // Extract individual elements
    const toolReasoningMatch = xmlContent.match(
      /<tool_reasoning>([\s\S]*?)<\/tool_reasoning>/
    );
    const toolsMatch = xmlContent.match(/<tools>([\s\S]*?)<\/tools>/);
    const messageMatch = xmlContent.match(/<message>([\s\S]*?)<\/message>/);

    if (!toolReasoningMatch || !toolsMatch || !messageMatch) {
      throw new Error("Missing required XML elements");
    }

    // Extract tools from the tools section
    const toolTags = toolsMatch[1].match(/<tool>([^<]+)<\/tool>/g) || [];
    const tools = toolTags.map((tag) => tag.replace(/<\/?tool>/g, "").trim());

    return {
      tool_reasoning: toolReasoningMatch[1].trim(),
      tools: tools.length ? tools : ["no-tool"],
      message: messageMatch[1].trim(),
    };
  }

  private async getOpenAIResponseWithParsing(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
  ): Promise<ReasoningAgentResponse> {
    return this.withRetry(async () => {
      const response = await this.baseLLm.chat.completions.create({
        messages: messages,
        model: this.options.baseLLm.model,
        temperature: 0.3,
        top_p: 0.2,
      });

      if (!response.choices?.length) {
        throw new Error("No choices in OpenAI response");
      }

      try {
        const content = response.choices[0].message.content ?? "";
        const xmlContent = this.extractXMLContent(content);

        if (!xmlContent) {
          // Fallback for direct responses
          if (content.toLowerCase().includes("no-tool")) {
            return {
              message: content,
              tools: ["no-tool"],
              tool_reasoning: "Direct response from AI",
            };
          }
          throw new Error("Invalid XML response format");
        }

        return this.parseXMLResponse(xmlContent);
      } catch (e) {
        if (e instanceof Error) {
          throw new Error(`Failed to parse XML response: ${e.message}`);
        }
        throw e;
      }
    }, "OpenAI request and parsing");
  }

  private async handleNoToolResponse(reasoning: ReasoningAgentResponse) {
    const finalResponse: FinalResponse = {
      finalResponse: {
        text:
          reasoning.message ||
          "I apologize, but I couldn't generate a response for your query.",
        type: "text",
      },
      usedAgents: [],
    };

    await this.options.onFinish?.(finalResponse);
  }

  private async executeAgents(
    tools: string[],
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
  ) {
    let lastAgentResponse: string = "";
    let lastAgent: Agent | undefined;

    let agentsInfo: Record<
      string,
      {
        usedSeconds: number;
        result: any;
        data: any;
        error?: string;
      }
    > = {};

    const agentsMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      [];
    for (let i = 0; i < tools.length; i++) {
      const toolName = tools[i];
      const agent = this.options.agents.find((a) => a.name === toolName);
      if (!agent) {
        this.debugLog("warning", `Agent ${toolName} not found`);
        console.warn(`Agent ${toolName} not found`);
        continue;
      }

      this.debugLog("info", `Starting execution of agent: ${toolName}`);
      await this.options.onUsingAgent?.(toolName);

      let retryCount = 0;
      let agentCallResult: string | null = null;
      const startTime = Date.now();
      agentsInfo[toolName] = {
        data: null,
        result: null,
        usedSeconds: 0,
      };
      while (retryCount < this.options.maxAgentRetry) {
        try {
          const agentPrompt = this.generateAgentPrompt(
            agent,
            lastAgent?.name ?? null,
            toolName,
            lastAgentResponse
          );
          this.debugLog("info", "Generated agent prompt", { agentPrompt });

          const newMessages: any = [
            ...messages,
            { role: "user", content: agentPrompt },
          ];
          agent.ai = {
            create: async (params) => {
              this.debugLog(
                "info",
                "Creating OpenAI completion for agent",
                params
              );
              return await this.withRetry(
                () =>
                  this.baseLLm.chat.completions.create({
                    ...params,
                    model: this.options.baseLLm.model,
                  }),
                "OpenAI create request"
              );
            },
          };

          const agentResponse = await this.baseLLm.chat.completions.create({
            messages: newMessages,
            model: this.options.baseLLm.model,
            temperature: 0.2,
          });

          this.debugLog("success", "Received agent response", agentResponse);

          const agentStep1Result =
            agentResponse.choices[0].message.content || "";
          agentCallResult = await agent.onCall(agentStep1Result);
          this.debugLog("success", `Agent ${toolName} execution completed`, {
            result: agentCallResult,
          });

          const usedSeconds = (Date.now() - startTime) / 1000;
          agentsInfo[toolName] = {
            result: agentCallResult,
            usedSeconds,
            data: agent.dataOutput,
          };

          const normalizedAgentResult =
            typeof agentCallResult == "string"
              ? agentCallResult
              : JSON.stringify(agentCallResult);
          const agentPromptMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam =
            { role: "user", content: agentPrompt };
          const agentCallResultMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam =
            {
              role: "user",
              content: `[Agent ${toolName}]\nAgent Step 1 Output:\n${agentStep1Result}\nAgent Call Result:\n${normalizedAgentResult}`,
            };
          messages.push(agentPromptMessage);
          messages.push(agentCallResultMessage);

          agentsMessages.push(agentPromptMessage);
          agentsMessages.push(agentCallResultMessage);
          break;
        } catch (error) {
          this.debugLog(
            "error",
            `Error executing agent ${toolName} (attempt ${retryCount + 1}/${
              this.options.maxAgentRetry
            })`,
            error
          );
          console.error(`Error executing agent ${toolName}:`, error);
          retryCount++;
          if (
            error instanceof Error &&
            retryCount == this.options.maxAgentRetry
          ) {
            if (agentsInfo[toolName]) {
              agentsInfo[toolName].error = error.message;
              this.options.onAgentFailed(toolName, error.message);
              return;
            }
          }
        }
      }
      lastAgent = agent;
      if (agentCallResult !== null) {
        await this.options.onAgentFinished?.(toolName, agentCallResult);
        lastAgentResponse = agentCallResult;
      } else {
        console.error(
          `Failed to execute agent ${toolName} after ${this.options.maxAgentRetry} attempts`
        );
      }
    }

    if (lastAgent && lastAgent.needSimplify) {
      const content =
        typeof lastAgentResponse == "string"
          ? lastAgentResponse
          : JSON.stringify(lastAgentResponse);
      lastAgentResponse = await this.simplifyResponse(content);
    }

    const finalAgent = agentsInfo[lastAgent.name];

    const finalResponse: FinalResponse = {
      agentsMessages: agentsMessages,
      finalResponse: {
        type: lastAgent?.viewType ?? "text",
        data: finalAgent?.data,
        text: typeof lastAgentResponse == "string" ? lastAgentResponse : null,
      },
      usedAgents: Object.entries(agentsInfo).map(([agent, info]) => ({
        name: agent,
        result: info.result,
        usedSeconds: info.usedSeconds,
        data: info.data,
      })),
    };

    await this.options.onFinish?.(finalResponse);
  }

  private async simplifyResponse(message: string): Promise<string> {
    const simplificationPrompt = `You are a helpful assistant that makes complex information easy to understand.

Your task is to simplify and format the message to be more user-friendly.

Guidelines:
1. Focus on the actual results and findings
2. Use clear, simple language
3. Format the response in a readable way using markdown.
4. If the response includes technical details:
   • Explain them in simpler terms
   • Keep technical details if they're important, but explain what they mean
5. If the response includes steps or processes:
   • Summarize them clearly
   • Focus on what the user needs to know

Important:
• Keep the essential information
• Remove unnecessary technical jargon
• Make it conversational but informative
• Include any important warnings or notes
• If there are actionable items, make them clear

Message:
${message}
`;

    const simplifierMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      [
        {
          role: "user",
          content: simplificationPrompt,
        },
      ];

    const simplifiedResponse = await this.withRetry(async () => {
      const response = await this.baseLLm.chat.completions.create({
        messages: simplifierMessages,
        model: this.options.baseLLm.model,
        temperature: 0.4,
      });
      const content = response.choices[0].message.content || "";
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }
      return content;
    }, "OpenAI simplify request");

    return simplifiedResponse;
  }

  private generateAgentPrompt(
    agent: Agent,
    lastAgent: string | null,
    toolName: string,
    lastAgentResponse: string
  ): string {
    const contextSection = lastAgentResponse
      ? `Previous Step Result:
Tool: ${lastAgent}
Output: ${lastAgentResponse}

Note: Consider this previous result if it contains information relevant to your task.`
      : "";

    const formatExample = agent.callFormat();
    const formatFields =
      formatExample
        .match(/"(\w+)":/g)
        ?.map((field) => field.replace(/[":]/g, "")) || [];

    return `You are the "${toolName}" specialist in our AI system. Your role is to analyze the conversation and extract or generate the necessary information in a specific format.

${agent.description}

${contextSection}

Instructions:
1. Analyze the entire conversation context, including:
   • The user's original request
   • Any previous tool outputs (if relevant)
   • The current conversation flow

2. For each required field in your response format:
   • Extract relevant information from the conversation
   • Generate appropriate values if needed
   • Ensure values make sense in the current context

Required Fields:
${formatFields
  .map((field) => `• ${field}: [Information needed for this field]`)
  .join("\n")}

Response Format:
${formatExample}

Important:
• Your response must be valid JSON matching the format exactly
• Focus on extracting information that's most relevant to your specific function
• Use conversation context intelligently - previous results may or may not be relevant
• Be precise but creative in interpreting user intent
• If certain information is unclear, make reasonable assumptions based on context`;
  }
}

export default FridayAgents;
