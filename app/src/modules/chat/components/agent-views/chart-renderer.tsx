'use client';

import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChartData, CHART_COLORS } from './types';

const formatValue = (value: number, data: ChartData) => {
    if (data.formatCurrency) {
        const symbolToCode: { [key: string]: string } = {
            '$': 'USD',
            '€': 'EUR',
            '£': 'GBP',
            '¥': 'JPY'
        };

        const currencyCode = symbolToCode[data.formatSymbol || '$'] || data.formatSymbol || 'USD';
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode
        }).format(value);
    }
    return value;
};

export const ChartRenderer = ({ data }: { data: ChartData }) => {
    if (!data?.type) {
        return null;
    }

    const formatter = (value: any) => formatValue(Number(value), data);

    if (data.type === 'bar') {
        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.values}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip formatter={formatter} />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        );
    }

    if (data.type === 'line') {
        return (
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.values}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip formatter={formatter} />
                    <Legend />
                    <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data.values}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={(entry) => `${entry.label}: ${formatValue(entry.value, data)}`}
                >
                    {data.values.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={formatter} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};
