import OpenAI from "openai";
import Agent from "./core/agent";
import { extractFirstJson } from "../utils";

export interface SearchAgentConfig {
    endpoint: string
    model: string
    api_key: string
}
export default class SearchAgent extends Agent<SearchAgentConfig> {
    viewType: Agent['viewType'] = "text"; // The output will be presented in text format
    needSimplify: boolean = true; // Flag to determine if the search results need to be simplified
    name: string = "search"; // Agent's name for easy identification
    keywords?: string[] = ["google","real-time","recent-events", "historical", "news", "research", "trends","live","market"];
    description: string = `This agent is used to search for real-time & updated information or historical data from online sources / internet,
such as Google. It is versatile for retrieving the most up-to-date information, like current events or breaking news,
as well as archived or past data or current, making it suitable for research, trends analysis, and historical references.
Note: If user asked about current / recent events, this agent can be used to provide relevant information, such as breaking news, live updates, or real-time updates.
`;


    // Returns the expected call format for the agent, indicating how to make search queries
    callFormat(): string {
        return '{ "query": "simple search query..." }';
    }

    // This method is triggered when the agent receives a search query and processes the result
    async onCall(result: string): Promise<string | null> {
        
        let jsonData: {
            query: string
        } | null = null;
        try {
            jsonData = JSON.parse(extractFirstJson(result) ?? "")
        } catch (e) {
            return null;
        }
        if (!jsonData?.query) return null;

        const query = jsonData?.query;
        if (query) {
            const prompt = `please answer to this query very useful, it's better to be in readme & structured format. query: \n${query}`;
            const oai = new OpenAI({
                apiKey: this.config?.api_key,
                baseURL: this.config?.endpoint,
                dangerouslyAllowBrowser: true
            })
            const res = await oai.chat.completions.create({
                model: this.config?.model ?? "",
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    }
                ],
                temperature: 0.4
            })
            if (res.choices.length) {
                return res.choices[0].message.content;
            }
        }
        return null;
    }
}
