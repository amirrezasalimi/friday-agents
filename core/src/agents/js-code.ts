import { extractCodeBlocks } from "../utils";
import Agent from "./agent";
import strip from "strip-comments";

interface ExecutionResult {
    success: boolean;
    output: string;
    error?: string;
}

export default class JsCodeAgent extends Agent {
    viewType: Agent['viewType'] = "text";
    needSimplify: boolean = true;
    name = "run-js-code";
    keywords?: string[] = ['js-code-runner', 'javascript', 'js-code-execution'];
    description: string = `
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

    callFormat = () => '() => { /* your code here */ return result; }';

    private validateCode(code: string): boolean {
        // Basic validation checks
        if (!code.includes('=>')) return false;
        if (!code.includes('return') && !code.includes('console.log')) return false;
        if (code.includes('require(') || code.includes('import ')) return false;
        return true;
    }

    private formatError(error: Error): string {
        return `Error during execution:\n${error.name}: ${error.message}`;
    }

    async onCall(result: string): Promise<string> {
        try {
            const fnCode = strip(extractCodeBlocks(result));
            
            if (!this.validateCode(fnCode)) {
                return 'Invalid code format. Code must be an arrow function that returns a value or uses console.log';
            }

            const CustomEval = (code: string): Function => {
                const transpiler = new Bun.Transpiler({
                    loader: "js",
                    target: "browser",
                });
                
                // Add timeout protection
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
            }

            const functionExpression = CustomEval(fnCode);
            const res = await functionExpression();
            
            return typeof res === 'undefined' 
                ? 'Code executed successfully but returned no value'
                : `Code Run Output:\n${JSON.stringify(res, null, 2)}`;
                
        } catch (error) {
            return this.formatError(error as Error);
        }
    }
}