import OpenAI from "openai";
import Agent from "./agent";
import { extractFirstJson } from "../utils";

export interface CodeGenAgentConfig {
    model: string;
}

interface CodeGenRequest {
    prompt: string;
    language?: string;
    context?: string;
}

export default class CodeGenAgent extends Agent<CodeGenAgentConfig> {
    viewType: Agent['viewType'] = "text";
    needSimplify: boolean = false;
    name: string = "developer";
    description: string = `This agent specializes in generating high-quality, production-ready code based on natural language descriptions.
It can create complete functions, classes, or entire modules in various programming languages.
The generated code follows best practices, includes proper error handling, and comes with appropriate documentation.
`;

    callFormat(): string {
        return `{
    "prompt": "Description of the code you want to generate",
    "language": "programming language (optional)",
    "context": "any additional context or requirements (optional)"
}`;
    }

    async onCall(result: string): Promise<string | null> {
        let request: CodeGenRequest | null = null;
        try {
            request = JSON.parse(extractFirstJson(result) ?? "");
        } catch (e) {
            return null;
        }

        if (!request?.prompt) return null;

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
            { role: "system" as const, content: systemPrompt },
            { role: "user" as const, content: request.prompt }
        ];

        const response = await this.ai?.create({
            messages,
            temperature: 0.2, // Lower temperature for more focused and consistent code generation
        });

        if (response?.choices[0]?.message?.content) {
            return response.choices[0].message.content;
        }

        return null;
    }
}
