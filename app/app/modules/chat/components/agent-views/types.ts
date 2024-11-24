export interface ChartData {
    title: string;
    type: "bar" | "pie" | "line";
    values: {
        label: string;
        value: number;
    }[];
    formatCurrency?: boolean;
    formatSymbol?: string;
}

export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
