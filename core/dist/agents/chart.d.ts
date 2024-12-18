import Agent from "./core/agent";
interface ChartData {
    title: string;
    type: "bar" | "pie" | "line";
    values: {
        label: string;
        value: number;
    }[];
    formatCurrency?: boolean;
    formatSymbol?: string;
}
export default class ChartAgent extends Agent<{}, ChartData> {
    viewType: Agent['viewType'];
    needSimplify: boolean;
    name: string;
    keywords: string[];
    useCases: string[];
    description: string;
    callFormat: () => string;
    onCall(result: string): Promise<{
        label: string;
        value: number;
    }[]>;
}
export {};
