"use client";

import React from "react";
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    LineChart as RechartsLineChart,
    Line,
} from "recharts";

interface DataPoint {
    name: string;
    value: number;
    [key: string]: any;
}

interface ChartSeries {
    name: string;
    dataKey: string;
    valueFormatter?: (value: number) => string;
    color: string;
}

// Pie Chart Component
interface PieChartProps {
    data: DataPoint[];
    colors?: string[];
    height?: number;
    width?: number;
    hideLabels?: boolean;
}

export const PieChart = ({
    data,
    colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
    height = 300,
    width = 500,
    hideLabels = false,
}: PieChartProps) => {
    const RADIAN = Math.PI / 180;

    // Create a safe copy of data with name and value properties
    const safeData = data.map(item => ({
        name: item.name || "Unnamed",
        value: typeof item.value === "number" ? item.value : 0
    }));

    const renderCustomizedLabel = (props: any) => {
        if (hideLabels) return null;

        const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="#fff"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                fontSize={12}
            >
                {`${name}: ${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div style={{ width, height }}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                    <Pie
                        data={safeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={width < 300 ? width / 2 - 20 : 120}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {safeData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={colors[index % colors.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => [`${value}`, '']}
                        labelFormatter={(label) => `${label}`}
                    />
                    <Legend />
                </RechartsPieChart>
            </ResponsiveContainer>
        </div>
    );
};

// Bar Chart Component
interface BarChartProps {
    data: any[];
    xAxis: string;
    series: ChartSeries[];
    height?: number;
    width?: number;
    stacked?: boolean;
}

export const BarChart = ({
    data,
    xAxis,
    series,
    height = 400,
    width = 600,
    stacked = false,
}: BarChartProps) => {
    return (
        <div style={{ width, height }}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={xAxis} />
                    <YAxis />
                    <Tooltip
                        formatter={(value: number, name: string) => {
                            const serie = series.find(s => s.name === name);
                            if (serie?.valueFormatter) {
                                return [serie.valueFormatter(value), name];
                            }
                            return [value, name];
                        }}
                    />
                    <Legend />
                    {series.map((s, index) => (
                        <Bar
                            key={s.dataKey}
                            dataKey={s.dataKey}
                            name={s.name}
                            fill={s.color}
                            stackId={stacked ? "stack" : undefined}
                        />
                    ))}
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
};

// Line Chart Component
interface LineChartProps {
    data: any[];
    xAxis: string;
    series: ChartSeries[];
    height?: number;
    width?: number;
}

export const LineChart = ({
    data,
    xAxis,
    series,
    height = 400,
    width = 600,
}: LineChartProps) => {
    return (
        <div style={{ width, height }}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={xAxis} />
                    <YAxis />
                    <Tooltip
                        formatter={(value: number, name: string) => {
                            const serie = series.find(s => s.name === name);
                            if (serie?.valueFormatter) {
                                return [serie.valueFormatter(value), name];
                            }
                            return [value, name];
                        }}
                    />
                    <Legend />
                    {series.map((s) => (
                        <Line
                            key={s.dataKey}
                            type="monotone"
                            dataKey={s.dataKey}
                            name={s.name}
                            stroke={s.color}
                            activeDot={{ r: 8 }}
                        />
                    ))}
                </RechartsLineChart>
            </ResponsiveContainer>
        </div>
    );
}; 