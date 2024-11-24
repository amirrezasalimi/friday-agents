import Agent from "./agent";
export interface CodeGenAgentConfig {
    model: string;
}
export default class CodeGenAgent extends Agent<CodeGenAgentConfig> {
    viewType: Agent['viewType'];
    needSimplify: boolean;
    name: string;
    keywords: string[];
    description: string;
    callFormat(): string;
    onCall(result: string): Promise<string | null>;
}
