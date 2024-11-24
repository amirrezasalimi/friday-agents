export interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: number;
    meta?: Partial<{
      outputType: "text" | "view";
      status: "working" | "error"| "done" | "idle";
      currentAgent: string;
      agentsReasoning: string;
      agents: string[];
      usedSeconds: number;
      data: any;
      error?: string;
      retryCount: number;
      maxRetryExceeded: boolean;
    }>
    hidden?: boolean
  }
  