import { extractCodeBlocks } from "../utils";
import Agent from "./agent";
import strip from "strip-comments";

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
        const CustomEval = (code: string) => {
            const transpiler = new Bun.Transpiler({
                loader: "js"
            });
            return eval(transpiler.transformSync(`eval((${code}))`));
        }

        const functionExpression = CustomEval(fnCode)
        const res = functionExpression();
        return `Code Run Output:\n ${res}`
    }
}