import Agent from "./agent";
export interface SearchAgentConfig {
    endpoint: string;
    model: string;
    api_key: string;
}
export default class SearchAgent extends Agent<SearchAgentConfig> {
    viewType: Agent['viewType'];
    needSimplify: boolean;
    name: string;
    keywords?: string[];
    description: string;
    callFormat(): string;
    onCall(result: string): Promise<string | null>;
}
