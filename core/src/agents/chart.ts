import { extractFirstJson } from "../utils";
import Agent from "./agent";
export interface ChartAgentResponse {
    type: "bar" | "pie"
    values: {
        label: string
        value: number
    }[]
    labelFormat: string
}
export default class ChartAgent extends Agent {
    viewType: Agent['viewType'] = "view";
    needSimplify: boolean = false;
    name = "chart"
    useCases: string[] = [
        "1. **Data Analysis**: Visualizing complex datasets to identify trends, patterns, and insights.",
        "2. **Reporting**: Creating visual reports for presentations to convey information clearly and effectively.",
        "3. **Decision Making**: Supporting data-driven decisions by providing visual context to numerical data."
    ];
    description: string = `Capable of visualizing data in various chart formats, such as bar, pie, or line charts. Ideal for making complex data more digestible and visually appealing.\nuseCases:\n${this.useCases.join("\n")}
\n
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
    "type": "...", // bar | pie
    "formatCurrency": true | false,
    "formatSymbol": "Symbol of formatted value",
    "values": [
        {
            "label": "...",
            "value": 0 // pure number , not any , or string here
        }
   ],

}`
    async onCall(result: string): Promise<ChartAgentResponse | null> {
        try {
            const firstJson = extractFirstJson(result);
            if (!firstJson) return null;
            return JSON.parse(firstJson);
        } catch (e) {
            return null;
        }
    }
}