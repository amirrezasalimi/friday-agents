import type OpenAI from "openai";
import AgentServer from "./agent-server";

/**
 * Represents a message item to be injected into the conversation.
 */
interface InjectPromptItem {
  position: number; // The position in the conversation where the message is injected.
  role: "user" | "assistant" | "system"; // The role of the message sender.
  content: string; // The content of the message.
  at_end?: boolean; // Optional flag to indicate if the message should be added at the end.
}

/**
 * Options for creating AI completions.
 */
interface AiCreateOptions {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]; // Array of messages for the AI to process.
  temperature?: number; // Controls the randomness of the output.
  top_p?: number; // Alternative to temperature for controlling diversity.
}

/**
 * Options for the agent's AI capabilities.
 */
interface AgentOptions {
  ai: {
    create: (
      params: AiCreateOptions
    ) => Promise<OpenAI.Chat.Completions.ChatCompletion>; // Method to create AI completions.
  };
}

/**
 * Abstract class representing an agent that interacts with AI.
 * @template C - Type for configuration.
 * @template DataOutput - Type for output data.
 */
export default abstract class Agent<C = {}, DataOutput = {}> {
  public ai: AgentOptions["ai"] | null = null;
  public config: C | null = null;
  configDoc: null | Record<
    keyof C,
    {
      type: "string" | "number" | "boolean" | "object";
      description: string;
      required?: boolean;
      value?: any;
    }
  > = null;

  abstract viewType: "text" | "view";
  needSimplify: boolean;
  name: string;
  description: string;
  keywords?: string[];

  abstract callFormat(): string;

  abstract onCall(result: string): Promise<any>;

  dataOutput?: DataOutput;

  sharedAgentData?: any; // Optional, add '?' to make it optional

  injectMessages?(): Promise<InjectPromptItem[]>; // Optional, add '?' to make it optional

  renderUI?(): string; // Optional, add '?' to make it optional

  uiActions?: Record<string, (...args: any) => void>; // Optional, add '?' to make it optional

  agentServer?: AgentServer; // Optional, add '?' to make it optional
}
