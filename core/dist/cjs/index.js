var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __moduleCache = /* @__PURE__ */ new WeakMap;
var __toCommonJS = (from) => {
  var entry = __moduleCache.get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function")
    __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
      get: () => from[key],
      enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
    }));
  __moduleCache.set(from, entry);
  return entry;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};

// src/index.ts
var exports_src = {};
__export(exports_src, {
  extractFirstJson: () => extractFirstJson,
  SearchAgent: () => SearchAgent,
  JsCodeAgent: () => JsCodeAgent,
  ImageAgent: () => ImageAgent,
  FridayAgents: () => core_default,
  CodeGenAgent: () => CodeGenAgent,
  ChartAgent: () => ChartAgent,
  Agent: () => Agent
});
module.exports = __toCommonJS(exports_src);

// src/utils.ts
var import_strip_json_comments = __toESM(require("strip-json-comments"));
var cleanJson = (text) => {
  const match = text.match(/```(json|)([\s\S]*?)```/);
  return import_strip_json_comments.default(match ? match[2].trim() : text);
};
function extractFirstJson(content) {
  content = cleanJson(content);
  content = content.replace(new RegExp("```json", "g"), "");
  content = content.replace(new RegExp("```", "g"), "");
  const firstOpenBrace = content.indexOf("{");
  const lastCloseBrace = content.lastIndexOf("}");
  if (firstOpenBrace !== -1 && lastCloseBrace !== -1 && lastCloseBrace > firstOpenBrace) {
    const jsonString = content.substring(firstOpenBrace, lastCloseBrace + 1);
    try {
      const parsedJson = JSON.parse(jsonString);
      return JSON.stringify(parsedJson, null, 2);
    } catch (error) {
      console.error("Invalid JSON:", error);
      return null;
    }
  }
  return null;
}
function extractCodeBlocks(text) {
  const langRegex = /```(?:typescript|javascript)([\s\S]*?)```/i;
  const langMatch = text.match(langRegex);
  if (langMatch) {
    return langMatch[1].trim();
  }
  const plainRegex = /```([\s\S]*?)```/;
  const plainMatch = text.match(plainRegex);
  return plainMatch ? plainMatch[1].trim() : text.trim();
}

// src/agents/agent.ts
class Agent {
  ai = null;
  config = null;
  needSimplify = false;
  keywords = [];
  needsPreviousResult;
  dataOutput;
}

// src/agents/chart.ts
class ChartAgent extends Agent {
  viewType = "view";
  needSimplify = true;
  name = "chart";
  keywords = [
    "visualization",
    "charts",
    "graphs",
    "data visualization",
    "bar chart, pie chart, line chart"
  ];
  useCases = [
    "1. **Data Analysis**: Visualizing complex datasets to identify trends, patterns, and insights.",
    "2. **Reporting**: Creating visual reports for presentations to convey information clearly and effectively.",
    "3. **Decision Making**: Supporting data-driven decisions by providing visual context to numerical data."
  ];
  description = `Capable of visualizing data in various chart formats, such as bar, pie, or line charts. Ideal for making complex data more digestible and visually appealing.
useCases:
${this.useCases.join(`
`)}


Rules
- Always select the appropriate chart type based on the data and user's intent.
- Ensure that the values array is fully populated and doesn't use incomplete elements (e.g., never use "..." for labels or values).
- The generated JSON must be complete and valid without missing fields or errors.
- Ensure no negative values are used unless the data explicitly requires them (for example, profits or losses).
- Do not include comments in the JSON output.
- Always provide a full label and corresponding numeric value, ensuring the data is clear and concise.
- If formatting currency, ensure correct symbols and format are applied.

`;
  callFormat = () => `{
    "title": "short title about this chart",
    "type": "...", // bar | pie | line
    "formatCurrency": true | false,
    "formatSymbol": "Symbol of formatted value",
    "values": [
        {
            "label": "...",
            "value": 0 // pure number , not any , or string here
        }
   ],

}`;
  async onCall(result2) {
    try {
      const firstJson = extractFirstJson(result2);
      if (!firstJson)
        return null;
      const jsonData = JSON.parse(firstJson);
      this.dataOutput = jsonData;
      return jsonData.values;
    } catch (e) {
      return null;
    }
  }
}

// src/agents/js-code.ts
var import_strip_comments = __toESM(require("strip-comments"));

class JsCodeAgent extends Agent {
  viewType = "text";
  needSimplify = true;
  name = "run-js-code";
  keywords = ["js-code-runner", "javascript", "js-code-execution"];
  description = `
# JavaScript Code Execution Agent

This agent specializes in executing JavaScript code snippets with the following capabilities:

## Features
- Executes modern JavaScript (ES6+) code snippets
- Provides immediate feedback with execution results
- Handles both synchronous and asynchronous code
- Supports standard JavaScript built-ins and globals

## Limitations
- No external package imports or requires
- No DOM/Browser APIs available
- No file system access
- Maximum execution time of 5 seconds
- Memory usage limited to prevent abuse

## Code Format Requirements
1. Code must be wrapped in an arrow function: () => { ... }
2. Must return a value or use console.log for output
3. Uses ES6+ syntax only
4. No external dependencies or imports
5. Must be pure JavaScript (no TypeScript, JSX, etc.)

## Example Usage
\`\`\`javascript
() => {
    const numbers = [1, 2, 3, 4, 5];
    const sum = numbers.reduce((a, b) => a + b, 0);
    return \`Sum of numbers: \${sum}\`;
}
\`\`\`
`;
  callFormat = () => "() => { /* your code here */ return result; }";
  validateCode(code2) {
    if (!code2.includes("=>"))
      return false;
    if (!code2.includes("return") && !code2.includes("console.log"))
      return false;
    if (code2.includes("require(") || code2.includes("import "))
      return false;
    return true;
  }
  formatError(error) {
    return `Error during execution:
${error.name}: ${error.message}`;
  }
  async onCall(result) {
    try {
      const fnCode = import_strip_comments.default(extractCodeBlocks(result));
      if (!this.validateCode(fnCode)) {
        return "Invalid code format. Code must be an arrow function that returns a value or uses console.log";
      }
      const CustomEval = (code) => {
        const transpiler = new Bun.Transpiler({
          loader: "js",
          target: "browser"
        });
        const timeoutCode = `
                    let executionTimeout;
                    const timeoutPromise = new Promise((_, reject) => {
                        executionTimeout = setTimeout(() => {
                            reject(new Error('Execution timeout - exceeded 5 seconds'));
                        }, 5000);
                    });
                    
                    const result = Promise.race([
                        Promise.resolve(${code}),
                        timeoutPromise
                    ]);
                    
                    clearTimeout(executionTimeout);
                    return result;
                `;
        return eval(transpiler.transformSync(`eval((${timeoutCode}))`));
      };
      const functionExpression = CustomEval(fnCode);
      const res = await functionExpression();
      return typeof res === "undefined" ? "Code executed successfully but returned no value" : `Code Run Output:
${JSON.stringify(res, null, 2)}`;
    } catch (error) {
      return this.formatError(error);
    }
  }
}

// src/agents/search.ts
var import_openai = __toESM(require("openai"));
class SearchAgent extends Agent {
  viewType = "text";
  needSimplify = true;
  name = "search";
  keywords = ["google", "real-time", "recent-events", "historical", "news", "research", "trends", "live", "market"];
  description = `This agent is used to search for real-time & updated information or historical data from online sources / internet,
such as Google. It is versatile for retrieving the most up-to-date information, like current events or breaking news,
as well as archived or past data or current, making it suitable for research, trends analysis, and historical references.
Note: If user asked about current / recent events, this agent can be used to provide relevant information, such as breaking news, live updates, or real-time updates.
`;
  callFormat() {
    return '{ "query": "simple search query..." }';
  }
  async onCall(result2) {
    let jsonData = null;
    try {
      jsonData = JSON.parse(extractFirstJson(result2) ?? "");
    } catch (e) {
      return null;
    }
    if (!jsonData?.query)
      return null;
    const query = jsonData?.query;
    if (query) {
      const prompt = `please answer to this query very useful, it's better to be in readme & structured format. query: 
${query}`;
      const oai = new import_openai.default({
        apiKey: this.config?.api_key,
        baseURL: this.config?.endpoint,
        dangerouslyAllowBrowser: true
      });
      const res2 = await oai.chat.completions.create({
        model: this.config?.model ?? "",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4
      });
      if (res2.choices.length) {
        return res2.choices[0].message.content;
      }
    }
    return null;
  }
}

// src/agents/code-gen.ts
class CodeGenAgent extends Agent {
  viewType = "text";
  needSimplify = false;
  name = "code";
  keywords = [
    "code-generation",
    "development",
    "algorithms",
    "documentation"
  ];
  description = `This agent specializes in generating high-quality, production-ready code based on natural language descriptions.
It can create complete functions, classes, or entire modules in various programming languages or frameworks.
The generated code follows best practices, includes proper error handling, and comes with appropriate documentation.
`;
  callFormat() {
    return `{
    "prompt": "Description of the code you want to generate",
    "language": "programming language (optional)",
    "context": "any additional context or requirements (optional)"
}`;
  }
  async onCall(result2) {
    let request = null;
    try {
      request = JSON.parse(extractFirstJson(result2) ?? "");
    } catch (e) {
      return null;
    }
    if (!request?.prompt)
      return null;
    const systemPrompt = `You are an expert code generator. Generate clean, efficient, and well-documented code based on the user's requirements.
Follow these guidelines:
- Include necessary imports and dependencies
- Add clear comments explaining complex logic
- Implement proper error handling
- Follow language-specific best practices and conventions
- Ensure the code is production-ready and maintainable

${request.language ? `Use ${request.language} programming language.` : ""}
${request.context ? `Additional context: ${request.context}` : ""}`;
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: request.prompt }
    ];
    const response = await this.ai?.create({
      messages,
      temperature: 0.2
    });
    if (response?.choices[0]?.message?.content) {
      return response.choices[0].message.content;
    }
    return null;
  }
}

// src/agents/image/brainFusion_text2image.ts
class Text2ImageAPI {
  url;
  authHeaders;
  constructor(url, apiKey, secretKey) {
    this.url = url;
    this.authHeaders = new Headers({
      "X-Key": `Key ${apiKey}`,
      "X-Secret": `Secret ${secretKey}`
    });
  }
  async getModel() {
    try {
      const response = await fetch(`${this.url}key/api/v1/models`, {
        method: "GET",
        headers: this.authHeaders
      });
      if (!response.ok) {
        throw new Error(`Failed to retrieve model: ${response.statusText}`);
      }
      let data = [];
      data = await response.json();
      return data[0].id;
    } catch (error) {
      console.error("Error getting model:", error);
      throw error;
    }
  }
  async generate(prompt, model, images = 1, width = 1024, height = 1024) {
    try {
      const params = {
        type: "GENERATE",
        numImages: images,
        width,
        height,
        generateParams: {
          query: prompt
        }
      };
      const formData = new FormData;
      formData.append("model_id", model);
      formData.append("params", new Blob([JSON.stringify(params)], { type: "application/json" }));
      const response = await fetch(`${this.url}key/api/v1/text2image/run`, {
        method: "POST",
        headers: this.authHeaders,
        body: formData
      });
      if (!response.ok) {
        throw new Error(`Failed to generate image: ${response.statusText}`);
      }
      const data = await response.json();
      return data.uuid;
    } catch (error) {
      console.error("Error generating image:", error);
      throw error;
    }
  }
  async checkGeneration(requestId, attempts = 15, delay = 1e4) {
    try {
      for (let i = 0;i < attempts; i++) {
        const response = await fetch(`${this.url}key/api/v1/text2image/status/${requestId}`, {
          method: "GET",
          headers: this.authHeaders
        });
        if (!response.ok) {
          throw new Error(`Failed to retrieve status: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.status === "DONE") {
          return data.images;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      throw new Error("Generation timed out");
    } catch (error) {
      console.error("Error checking generation:", error);
      throw error;
    }
  }
}

// src/agents/image/index.ts
class ImageAgent extends Agent {
  viewType = "view";
  needSimplify = false;
  name = "image";
  description = `This Agent Made to generate any images user asked.`;
  callFormat = () => `{
    "prompt": "detailed prompt to generate image based on users request"
}`;
  imagesSaveDir = "";
  constructor(imagesSaveDir = "../images") {
    super();
    this.imagesSaveDir = imagesSaveDir;
  }
  async onCall(result2) {
    if (!this.config?.apiKey || !this.config.secretKey) {
      throw "Missing apiKey or secret key";
    }
    let jsonData = null;
    try {
      jsonData = JSON.parse(extractFirstJson(result2) ?? "");
    } catch (e) {
      return null;
    }
    if (!jsonData?.prompt) {
      throw new Error("prompt shouldn't be empty.");
    }
    const api = new Text2ImageAPI("https://api-key.fusionbrain.ai/", this.config?.apiKey, this.config?.secretKey);
    const modelId = await api.getModel();
    const uuid = await api.generate(jsonData.prompt, modelId, 1, 512, 512);
    const images = await api.checkGeneration(uuid);
    this.dataOutput = images;
    return true;
  }
}

// src/core.ts
var import_openai2 = require("openai");

class FridayAgents {
  options;
  baseLLm;
  debug;
  constructor(options) {
    this.options = options;
    this.debug = options.debug || false;
    this.baseLLm = new import_openai2.OpenAI({
      apiKey: this.options.baseLLm.apikey,
      baseURL: this.options.baseLLm.endpoint,
      dangerouslyAllowBrowser: true
    });
  }
  debugLog(type, message, data) {
    if (!this.debug)
      return;
    const colors = {
      info: "\x1B[36m",
      error: "\x1B[31m",
      warning: "\x1B[33m",
      success: "\x1B[32m"
    };
    const reset = "\x1B[0m";
    const timestamp = new Date().toISOString();
    const prefix = `${colors[type]}[${timestamp}] [${type.toUpperCase()}]${reset}`;
    console.log(`${prefix} ${message}`);
    if (data) {
      console.log(`${colors[type]}[DATA]${reset}`, data);
    }
  }
  async withRetry(operation, operationName) {
    const maxRetries = this.options.maxLLmRetry || 3;
    let lastError;
    for (let attempt = 0;attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.debugLog("error", `${operationName} failed, attempt ${attempt + 1}/${maxRetries}`, error);
        if (attempt === maxRetries - 1)
          throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    throw lastError;
  }
  async run({
    messages,
    user,
    date,
    cutoff_date
  }) {
    return new Promise(async (resolve, reject) => {
      try {
        this.debugLog("info", "Starting FridayAgents run", {
          user,
          date,
          cutoff_date
        });
        const tools = this.options.agents.map((agent) => `${agent.name}:
${agent.description}`).join(`

`);
        const systemPrompt = this.generateSystemPrompt(user, date, cutoff_date);
        this.debugLog("info", "Generated system prompt", { systemPrompt });
        const pureMessages = this.combineMessages(systemPrompt, messages);
        const toolsAndKeywords = this.options.agents.reduce((acc, agent) => {
          acc[agent.name] = agent.keywords || [];
          return acc;
        }, {});
        const combinedPrompt = this.generateCombinedPrompt(toolsAndKeywords, messages);
        this.debugLog("info", "Generated combined prompt", { combinedPrompt });
        const combinedMessages = this.combineMessages(systemPrompt, messages, combinedPrompt);
        this.debugLog("info", "Sending request to OpenAI");
        const parsedResponse = await this.getOpenAIResponseWithParsing(combinedMessages);
        this.debugLog("success", "Received and parsed response from OpenAI", parsedResponse);
        this.options.onChooseAgents?.(parsedResponse.tool_reasoning, parsedResponse.tools);
        if (parsedResponse.tools.includes("no-tool") || !parsedResponse.tools.length) {
          this.debugLog("info", "No tools required, handling direct response");
          await this.handleNoToolResponse(parsedResponse);
        } else {
          this.debugLog("info", "Executing agents", {
            tools: parsedResponse.tools
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
  generateSystemPrompt(user, date, cutoff_date) {
    return `
${user ? `Understand the user intent,
You are a super helpful assistant. Adjust your tone based on the user's preference:
User Name: ${user.name}
Age: ${user.age}
` : ""}

${date ? `Today's Date: ${date}` : ""}
${cutoff_date ? `Data Cutoff Date: ${cutoff_date}` : ""}

- Be friendly and casual for informal queries.
- Be formal and concise for professional or technical tasks.
`;
  }
  generateCombinedPrompt(tools, messages) {
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
${Object.entries(tools).map(([name, keywords]) => `- ${name}${keywords?.length ? ` :
keywords: ${keywords.join(", ")}.` : "."}`).join(`

`)}

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
  combineMessages(systemPrompt, messages, combinedPrompt) {
    const baseMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];
    if (combinedPrompt) {
      baseMessages.push({ role: "user", content: combinedPrompt });
    }
    return baseMessages;
  }
  extractXMLContent(content) {
    const match = content.match(/<response>([\s\S]*?)<\/response>/);
    return match ? match[1].trim() : null;
  }
  parseXMLResponse(xmlContent) {
    const toolReasoningMatch = xmlContent.match(/<tool_reasoning>([\s\S]*?)<\/tool_reasoning>/);
    const toolsMatch = xmlContent.match(/<tools>([\s\S]*?)<\/tools>/);
    const messageMatch = xmlContent.match(/<message>([\s\S]*?)<\/message>/);
    if (!toolReasoningMatch || !toolsMatch || !messageMatch) {
      throw new Error("Missing required XML elements");
    }
    const toolTags = toolsMatch[1].match(/<tool>([^<]+)<\/tool>/g) || [];
    const tools = toolTags.map((tag) => tag.replace(/<\/?tool>/g, "").trim());
    return {
      tool_reasoning: toolReasoningMatch[1].trim(),
      tools: tools.length ? tools : ["no-tool"],
      message: messageMatch[1].trim()
    };
  }
  async getOpenAIResponseWithParsing(messages) {
    return this.withRetry(async () => {
      const response = await this.baseLLm.chat.completions.create({
        messages,
        model: this.options.baseLLm.model,
        temperature: 0.3,
        top_p: 0.2
      });
      if (!response.choices?.length) {
        throw new Error("No choices in OpenAI response");
      }
      try {
        const content = response.choices[0].message.content ?? "";
        const xmlContent = this.extractXMLContent(content);
        if (!xmlContent) {
          if (content.toLowerCase().includes("no-tool")) {
            return {
              message: content,
              tools: ["no-tool"],
              tool_reasoning: "Direct response from AI"
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
  async handleNoToolResponse(reasoning) {
    const finalResponse = {
      finalResponse: {
        text: reasoning.message || "I apologize, but I couldn't generate a response for your query.",
        type: "text"
      },
      usedAgents: []
    };
    await this.options.onFinish?.(finalResponse);
  }
  async executeAgents(tools, messages) {
    let lastAgentResponse = "";
    let lastAgent;
    let agentsInfo = {};
    const agentsMessages = [];
    for (let i = 0;i < tools.length; i++) {
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
      let agentCallResult = null;
      const startTime = Date.now();
      agentsInfo[toolName] = {
        data: null,
        result: null,
        usedSeconds: 0
      };
      while (retryCount < this.options.maxAgentRetry) {
        try {
          const agentPrompt = this.generateAgentPrompt(agent, lastAgent?.name ?? null, toolName, lastAgentResponse);
          this.debugLog("info", "Generated agent prompt", { agentPrompt });
          const newMessages = [
            ...messages,
            { role: "user", content: agentPrompt }
          ];
          agent.ai = {
            create: async (params) => {
              this.debugLog("info", "Creating OpenAI completion for agent", params);
              return await this.withRetry(() => this.baseLLm.chat.completions.create({
                ...params,
                model: this.options.baseLLm.model
              }), "OpenAI create request");
            }
          };
          const agentResponse = await this.baseLLm.chat.completions.create({
            messages: newMessages,
            model: this.options.baseLLm.model,
            temperature: 0.2
          });
          this.debugLog("success", "Received agent response", agentResponse);
          const agentStep1Result = agentResponse.choices[0].message.content || "";
          agentCallResult = await agent.onCall(agentStep1Result);
          this.debugLog("success", `Agent ${toolName} execution completed`, {
            result: agentCallResult
          });
          const usedSeconds = (Date.now() - startTime) / 1000;
          agentsInfo[toolName] = {
            result: agentCallResult,
            usedSeconds,
            data: agent.dataOutput
          };
          const normalizedAgentResult = typeof agentCallResult == "string" ? agentCallResult : JSON.stringify(agentCallResult);
          const agentPromptMessage = { role: "user", content: agentPrompt };
          const agentCallResultMessage = {
            role: "user",
            content: `[Agent ${toolName}]
Agent Step 1 Output:
${agentStep1Result}
Agent Call Result:
${normalizedAgentResult}`
          };
          messages.push(agentPromptMessage);
          messages.push(agentCallResultMessage);
          agentsMessages.push(agentPromptMessage);
          agentsMessages.push(agentCallResultMessage);
          break;
        } catch (error) {
          this.debugLog("error", `Error executing agent ${toolName} (attempt ${retryCount + 1}/${this.options.maxAgentRetry})`, error);
          console.error(`Error executing agent ${toolName}:`, error);
          retryCount++;
          if (error instanceof Error && retryCount == this.options.maxAgentRetry) {
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
        console.error(`Failed to execute agent ${toolName} after ${this.options.maxAgentRetry} attempts`);
      }
    }
    if (lastAgent && lastAgent.needSimplify) {
      const content = typeof lastAgentResponse == "string" ? lastAgentResponse : JSON.stringify(lastAgentResponse);
      lastAgentResponse = await this.simplifyResponse(content);
    }
    const finalAgent = agentsInfo[lastAgent.name];
    const finalResponse = {
      agentsMessages,
      finalResponse: {
        type: lastAgent?.viewType ?? "text",
        data: finalAgent?.data,
        text: typeof lastAgentResponse == "string" ? lastAgentResponse : null
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
  async simplifyResponse(message) {
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
    const simplifierMessages = [
      {
        role: "user",
        content: simplificationPrompt
      }
    ];
    const simplifiedResponse = await this.withRetry(async () => {
      const response = await this.baseLLm.chat.completions.create({
        messages: simplifierMessages,
        model: this.options.baseLLm.model,
        temperature: 0.4
      });
      const content = response.choices[0].message.content || "";
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }
      return content;
    }, "OpenAI simplify request");
    return simplifiedResponse;
  }
  generateAgentPrompt(agent, lastAgent, toolName, lastAgentResponse) {
    const contextSection = lastAgentResponse ? `Previous Step Result:
Tool: ${lastAgent}
Output: ${lastAgentResponse}

Note: Consider this previous result if it contains information relevant to your task.` : "";
    const formatExample = agent.callFormat();
    const formatFields = formatExample.match(/"(\w+)":/g)?.map((field) => field.replace(/[":]/g, "")) || [];
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
${formatFields.map((field) => `• ${field}: [Information needed for this field]`).join(`
`)}

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
var core_default = FridayAgents;
