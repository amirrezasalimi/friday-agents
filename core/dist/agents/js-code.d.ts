import Agent from "./agent";
export default class JsCodeAgent extends Agent {
    viewType: Agent['viewType'];
    needSimplify: boolean;
    name: string;
    keywords?: string[];
    description: string;
    callFormat: () => string;
    private validateCode;
    private formatError;
    onCall(result: string): Promise<string>;
}
