"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PieChart, BarChart3, Brain, ChevronDown, ChevronUp, Download, RefreshCw, Lightbulb, Info, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PieChart as ReChartPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface SectorAllocation {
    sector: string;
    recommendedPercentage: number;
    recommendedAmount: number;
    reasoning: string;
}

interface BudgetAllocationPrediction {
    confidence: number;
    timestamp: string;
    source: string;
    sectorAllocations: SectorAllocation[];
    overallRecommendation: string;
}

interface BudgetAllocationAdvisorProps {
    aipId: string;
    currentAllocations?: { sector: string; amount: number }[];
    totalBudget: number;
    className?: string;
}

const SECTOR_COLORS: Record<string, string> = {
    "Infrastructure": "#3b82f6", // blue
    "Health": "#ef4444", // red
    "Education": "#22c55e", // green
    "Social Services": "#eab308", // yellow
    "Environmental": "#14b8a6", // teal
    "Agriculture": "#a855f7", // purple
    "Livelihood": "#f97316", // orange
    "Technology": "#06b6d4", // cyan
    "Sports & Culture": "#ec4899", // pink
    "Uncategorized": "#9ca3af", // gray
};

// Get color for sector, with fallback
const getSectorColor = (sector: string): string => {
    return SECTOR_COLORS[sector] || "#9ca3af";
};

export function BudgetAllocationAdvisor({ aipId, currentAllocations, totalBudget, className = "" }: BudgetAllocationAdvisorProps) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [prediction, setPrediction] = useState<BudgetAllocationPrediction | null>(null);
    const [expanded, setExpanded] = useState(false);
    const [pieData, setPieData] = useState<any[]>([]);

    // Fetch allocation recommendations
    const fetchRecommendations = async () => {
        if (!session || !aipId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/ai/models/budget-allocation?aipId=${aipId}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch budget allocation recommendations");
            }

            const data = await response.json();
            setPrediction(data.prediction);

            // Prepare pie chart data
            if (data.prediction?.sectorAllocations) {
                const chartData = data.prediction.sectorAllocations.map((item: SectorAllocation) => ({
                    name: item.sector,
                    value: parseFloat(item.recommendedPercentage.toFixed(1)),
                }));
                setPieData(chartData);
            }
        } catch (err) {
            console.error("Error fetching budget allocations:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchRecommendations();
    }, [session, aipId]);

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <div className="flex items-center">
                        <Brain className="mr-2 h-5 w-5 text-primary" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                    <Skeleton className="h-3 w-[300px]" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <div className="flex gap-4">
                            <Skeleton className="h-40 w-40 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Brain className="mr-2 h-5 w-5 text-primary" />
                        Budget Allocation Advisor
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={fetchRecommendations}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!prediction) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Brain className="mr-2 h-5 w-5 text-primary" />
                        Budget Allocation Advisor
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertTitle>No Recommendations Available</AlertTitle>
                        <AlertDescription>
                            We couldn't generate budget allocation recommendations for this AIP.
                            This may be due to insufficient data or an unsupported configuration.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Brain className="mr-2 h-5 w-5 text-primary" />
                    Budget Allocation Advisor
                    <Badge variant="outline" className="ml-2">
                        {(prediction.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                </CardTitle>
                <CardDescription>
                    AI-powered budget allocation recommendations based on historical data and sector analysis
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Overview and Visualization */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-medium mb-2">Recommendation</h3>
                        <Alert>
                            <Lightbulb className="h-4 w-4 text-primary" />
                            <AlertDescription>
                                {prediction.overallRecommendation}
                            </AlertDescription>
                        </Alert>

                        <div className="mt-4">
                            <h4 className="text-sm font-medium mb-1">Top Recommended Sectors</h4>
                            <div className="space-y-2">
                                {prediction.sectorAllocations.slice(0, 3).map((allocation) => (
                                    <div key={allocation.sector} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: getSectorColor(allocation.sector) }}
                                            />
                                            <span>{allocation.sector}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{allocation.recommendedPercentage.toFixed(1)}%</span>
                                            <span className="text-xs text-muted-foreground">
                                                ({formatCurrency(allocation.recommendedAmount)})
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={220}>
                            <ReChartPieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={getSectorColor(entry.name)}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => [`${value}%`, 'Allocation']}
                                />
                            </ReChartPieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Detailed Allocations */}
                <Collapsible open={expanded} onOpenChange={setExpanded}>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">Detailed Allocations</h3>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                                {expanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                                <span className="ml-1">{expanded ? "Show Less" : "Show More"}</span>
                            </Button>
                        </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sector</TableHead>
                                    <TableHead className="text-right">Allocation %</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Reasoning</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {prediction.sectorAllocations.map((allocation) => (
                                    <TableRow key={allocation.sector}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: getSectorColor(allocation.sector) }}
                                                />
                                                {allocation.sector}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {allocation.recommendedPercentage.toFixed(1)}%
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(allocation.recommendedAmount)}
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {allocation.reasoning}
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
            <CardFooter className="flex justify-between">
                <div className="text-xs text-muted-foreground">
                    <Info className="h-3 w-3 inline mr-1" />
                    Based on analysis of historical data and sector performance
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchRecommendations}>
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                        <Download className="mr-2 h-3 w-3" />
                        Export
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
} 