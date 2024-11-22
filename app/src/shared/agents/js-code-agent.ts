import { Agent } from "@friday-agents/core";
import strip from "strip-comments";

export function extractCodeBlocks(text: string): string {
    // First try to find typescript/javascript block
    const langRegex = /```(?:typescript|javascript)([\s\S]*?)```/i;
    const langMatch = text.match(langRegex);

    if (langMatch) {
        return langMatch[1].trim();
    }

    // If no typescript/javascript block found, look for plain block
    const plainRegex = /```([\s\S]*?)```/;
    const plainMatch = text.match(plainRegex);

    // Return the code block content or original text
    return plainMatch ? plainMatch[1].trim() : text.trim();
}


export default class JsCodeAgent extends Agent {
    viewType: Agent['viewType'] = "text";
    needSimplify: boolean = true;
    name = "run-js-code"
    description: string = `
- This agent is designed to generate and execute JavaScript code automatically.
- It is not intended for providing advice, tutorials, or educational content.
- This agent does not support initializing projects or teaching practices.
- It strictly focuses on generating And executing pure JavaScript, without dependencies on frameworks like React or others.
- Made to Generate And Execute Small codes.

# Code Gen Rules
- Your generated code should alwayse be in the ()=>{ return x } format.
- you only should generate pure es6 codes.
- do not import or require any packages, as you don't have access.
- Alwayse return Or console.log the Outputs.
`;

    callFormat = () => '() => { return ""; }'

    async onCall(result: string): Promise<string> {
        const fnCode = strip(extractCodeBlocks(result));
        try {
            // Simple eval that executes the function expression
            const functionExpression = eval(`(${fnCode})`);
            const res = functionExpression();
            return `Code Run Output:\n ${res}`;
        } catch (error) {
            return `Error executing code: ${error}`;
        }
    }
}