"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BrainCircuit, BarChart3, PieChart, LineChart, Lightbulb, AlertTriangle, AlertCircle, Info, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AIRecommendation {
    message: string;
    type: 'info' | 'suggestion' | 'warning' | 'critical' | 'error';
    data?: Record<string, any>;
}

interface AIPSummary {
    id: string;
    title: string;
    fiscalYear: string;
    totalBudget: number;
    totalExpenses: number;
    status: string;
}

export default function AIPInsightsPage() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("recommendations");
    const [aips, setAips] = useState<AIPSummary[]>([]);
    const [selectedAipId, setSelectedAipId] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<Record<string, AIRecommendation[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Authentication check
    useEffect(() => {
        if (sessionStatus === "unauthenticated") {
            router.push("/login");
        }
    }, [sessionStatus, router]);

    // Fetch AIPs for selection
    useEffect(() => {
        if (sessionStatus === "authenticated") {
            const fetchAIPs = async () => {
                try {
                    const response = await fetch("/api/finance/aip");

                    if (!response.ok) {
                        throw new Error("Failed to fetch AIP list");
                    }

                    const data = await response.json();
                    const formattedData = data.map((aip: any) => ({
                        id: aip.id,
                        title: aip.title,
                        fiscalYear: aip.fiscalYear.year,
                        totalBudget: aip.totalAmount,
                        totalExpenses: 0, // This would need to be calculated or fetched
                        status: aip.status
                    }));

                    setAips(formattedData);

                    // Select first AIP by default if available
                    if (formattedData.length > 0 && !selectedAipId) {
                        setSelectedAipId(formattedData[0].id);
                    }
                } catch (err) {
                    console.error("Error fetching AIP list:", err);
                    setError(err instanceof Error ? err.message : "Failed to load AIP data");
                }
            };

            fetchAIPs();
        }
    }, [sessionStatus, selectedAipId]);

    // Fetch recommendations when an AIP is selected
    useEffect(() => {
        if (selectedAipId) {
            const fetchRecommendations = async () => {
                setLoading(true);
                setError(null);

                try {
                    const queryParams = new URLSearchParams();
                    queryParams.append("aipId", selectedAipId);

                    const response = await fetch(`/api/ai/advisor?${queryParams.toString()}`);

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to fetch recommendations");
                    }

                    const data = await response.json();
                    setRecommendations(data.recommendations);
                } catch (err) {
                    console.error("Error fetching AI recommendations:", err);
                    setError(err instanceof Error ? err.message : "An unknown error occurred");
                } finally {
                    setLoading(false);
                }
            };

            fetchRecommendations();
        }
    }, [selectedAipId]);

    const getRecommendationIcon = (type: string) => {
        switch (type) {
            case 'critical':
                return <AlertCircle className="h-5 w-5 text-destructive" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'suggestion':
                return <Lightbulb className="h-5 w-5 text-blue-500" />;
            case 'info':
                return <Info className="h-5 w-5 text-muted-foreground" />;
            default:
                return <Info className="h-5 w-5" />;
        }
    };

    const getBadgeVariant = (type: string) => {
        switch (type) {
            case 'critical':
                return "destructive";
            case 'warning':
                return "warning";
            case 'suggestion':
                return "default";
            case 'info':
                return "secondary";
            default:
                return "outline";
        }
    };

    if (sessionStatus === "loading") {
        return (
            <div className="container p-6">
                <div className="flex items-center mb-6">
                    <Skeleton className="h-10 w-40" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Skeleton className="h-36" />
                        <Skeleton className="h-36" />
                    </div>
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    const totalRecommendations = Object.values(recommendations).reduce((total, group) => total + group.length, 0);

    return (
        <div className="container p-6">
            {/* Header */}
            <div className="flex items-center mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    className="mr-2"
                    asChild
                >
                    <Link href="/dashboard/finance/aip">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to AIP List
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <BrainCircuit className="h-8 w-8 text-primary" />
                        AI Insights & Recommendations
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Intelligent analysis and recommendations for your Annual Investment Programs
                    </p>
                </div>

                <div className="w-full md:w-80">
                    <Select
                        value={selectedAipId || ""}
                        onValueChange={setSelectedAipId}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select an AIP" />
                        </SelectTrigger>
                        <SelectContent>
                            {aips.map((aip) => (
                                <SelectItem key={aip.id} value={aip.id}>
                                    {aip.title} - FY {aip.fiscalYear}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="w-full md:w-auto">
                        <TabsTrigger value="recommendations">
                            Recommendations
                            {totalRecommendations > 0 && (
                                <Badge variant="outline" className="ml-1">{totalRecommendations}</Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="insights">Future Insights</TabsTrigger>
                    </TabsList>

                    <TabsContent value="recommendations" className="space-y-6">
                        {totalRecommendations === 0 ? (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center justify-center py-6 text-center">
                                        <BrainCircuit className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                                        <h3 className="text-xl font-medium">No recommendations available</h3>
                                        <p className="text-muted-foreground mt-2 max-w-md">
                                            The AI advisor doesn't have any suggestions for this Annual Investment Program at this time.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {recommendations.budget && recommendations.budget.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center">
                                                    <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                                                    Budget Recommendations
                                                </CardTitle>
                                                <CardDescription>
                                                    Optimize your budget allocation and utilization
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {recommendations.budget.map((rec, index) => (
                                                    <Alert key={`budget-${index}`} variant={rec.type === 'critical' ? 'destructive' : 'default'}>
                                                        {getRecommendationIcon(rec.type)}
                                                        <AlertTitle className="flex items-center">
                                                            <span className="capitalize">{rec.type}</span>
                                                            {rec.data && Object.keys(rec.data).map(key => (
                                                                <Badge
                                                                    key={key}
                                                                    variant={getBadgeVariant(rec.type)}
                                                                    className="ml-2"
                                                                >
                                                                    {rec.data?.[key]}
                                                                </Badge>
                                                            ))}
                                                        </AlertTitle>
                                                        <AlertDescription>{rec.message}</AlertDescription>
                                                    </Alert>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {recommendations.project && recommendations.project.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center">
                                                    <PieChart className="h-5 w-5 mr-2 text-primary" />
                                                    Project Recommendations
                                                </CardTitle>
                                                <CardDescription>
                                                    Improve project planning and implementation
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {recommendations.project.map((rec, index) => (
                                                    <Alert key={`project-${index}`} variant={rec.type === 'critical' ? 'destructive' : 'default'}>
                                                        {getRecommendationIcon(rec.type)}
                                                        <AlertTitle className="flex items-center">
                                                            <span className="capitalize">{rec.type}</span>
                                                            {rec.data && Object.keys(rec.data).map(key => (
                                                                <Badge
                                                                    key={key}
                                                                    variant={getBadgeVariant(rec.type)}
                                                                    className="ml-2"
                                                                >
                                                                    {rec.data?.[key]}
                                                                </Badge>
                                                            ))}
                                                        </AlertTitle>
                                                        <AlertDescription>{rec.message}</AlertDescription>
                                                    </Alert>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>

                                {recommendations.risk && recommendations.risk.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                                                Risk Assessment
                                            </CardTitle>
                                            <CardDescription>
                                                Identify and mitigate potential risks in your AIP implementation
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {recommendations.risk.map((rec, index) => (
                                                <Alert key={`risk-${index}`} variant={rec.type === 'critical' ? 'destructive' : 'default'}>
                                                    {getRecommendationIcon(rec.type)}
                                                    <AlertTitle className="flex items-center">
                                                        <span className="capitalize">{rec.type}</span>
                                                        {rec.data && Object.keys(rec.data).map(key => (
                                                            <Badge
                                                                key={key}
                                                                variant={getBadgeVariant(rec.type)}
                                                                className="ml-2"
                                                            >
                                                                {rec.data?.[key]}
                                                            </Badge>
                                                        ))}
                                                    </AlertTitle>
                                                    <AlertDescription>{rec.message}</AlertDescription>
                                                </Alert>
                                            ))}
                                        </CardContent>
                                        <CardFooter>
                                            <Button variant="outline" size="sm" className="w-full">
                                                <Download className="mr-2 h-4 w-4" />
                                                Download Risk Assessment Report
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                )}
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        <Alert variant="default" className="bg-muted">
                            <Info className="h-4 w-4" />
                            <AlertTitle>AI Analytics Module</AlertTitle>
                            <AlertDescription>
                                Advanced analytics capabilities will be available in the upcoming release as part of the AI integration Phase 6.2.
                            </AlertDescription>
                        </Alert>

                        <Card>
                            <CardHeader>
                                <CardTitle>Advanced Analytics Dashboard</CardTitle>
                                <CardDescription>Coming in the next update</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                                <LineChart className="h-20 w-20 text-muted-foreground mb-4 opacity-40" />
                                <h3 className="text-xl font-medium">Analytics Module Under Development</h3>
                                <p className="text-muted-foreground mt-2 max-w-lg">
                                    This module will provide sophisticated data analysis including trend detection, anomaly identification, and performance comparison with historical data.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-3xl">
                                    <div className="border rounded-lg p-4 text-center">
                                        <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-70" />
                                        <h4 className="font-medium">Performance Analytics</h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Compare project outcomes with similar barangays
                                        </p>
                                    </div>
                                    <div className="border rounded-lg p-4 text-center">
                                        <LineChart className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-70" />
                                        <h4 className="font-medium">Trend Analysis</h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Identify spending patterns and project progress trends
                                        </p>
                                    </div>
                                    <div className="border rounded-lg p-4 text-center">
                                        <PieChart className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-70" />
                                        <h4 className="font-medium">Budget Optimization</h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Discover optimal resource allocation strategies
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="insights" className="space-y-6">
                        <Alert variant="default" className="bg-muted">
                            <Info className="h-4 w-4" />
                            <AlertTitle>Future Insights Module</AlertTitle>
                            <AlertDescription>
                                Predictive insights capabilities will be available in the upcoming release as part of the AI integration Phase 6.3.
                            </AlertDescription>
                        </Alert>

                        <Card>
                            <CardHeader>
                                <CardTitle>Predictive Insights Dashboard</CardTitle>
                                <CardDescription>Coming in the next update</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                                <BrainCircuit className="h-20 w-20 text-muted-foreground mb-4 opacity-40" />
                                <h3 className="text-xl font-medium">Predictive Module Under Development</h3>
                                <p className="text-muted-foreground mt-2 max-w-lg">
                                    This module will leverage machine learning to provide predictive insights about project outcomes, budget utilization forecasts, and potential implementation challenges.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-2xl">
                                    <Card className="border">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">Budget Forecasting</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                Predict future budget trends and identify potential underspending or overspending before they occur.
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">Project Timeline Prediction</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                Forecast project completion times based on current progress and historical patterns.
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">Risk Prediction</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                Identify projects at risk of delays or budget overruns before issues materialize.
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">Impact Assessment</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                Predict the community impact of different investment options to optimize resource allocation.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
} 