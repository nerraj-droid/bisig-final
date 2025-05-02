"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ArrowRight, BrainCircuit, AlertTriangle, InfoIcon, Lightbulb, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AIRecommendation {
    message: string;
    type: 'info' | 'suggestion' | 'warning' | 'critical' | 'error';
    data?: Record<string, any>;
}

interface AIAdvisorProps {
    aipId?: string;
    className?: string;
}

export function AIAdvisor({ aipId, className = "" }: AIAdvisorProps) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<Record<string, AIRecommendation[]>>({});
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!session) return;

            setLoading(true);
            setError(null);

            try {
                const queryParams = new URLSearchParams();
                if (aipId) queryParams.append("aipId", aipId);

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
    }, [session, aipId]);

    const getRecommendationIcon = (type: string) => {
        switch (type) {
            case 'critical':
                return <AlertCircle className="h-5 w-5 text-destructive" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'suggestion':
                return <Lightbulb className="h-5 w-5 text-blue-500" />;
            case 'info':
                return <InfoIcon className="h-5 w-5 text-muted-foreground" />;
            default:
                return <InfoIcon className="h-5 w-5" />;
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

    const getTotalRecommendations = () => {
        return Object.values(recommendations).reduce((total, group) => total + group.length, 0);
    };

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <div className="flex items-center">
                        <BrainCircuit className="mr-2 h-5 w-5" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                    <Skeleton className="h-3 w-[300px]" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
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
                        <BrainCircuit className="mr-2 h-5 w-5" />
                        AI Advisor
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    const totalCount = getTotalRecommendations();

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <BrainCircuit className="mr-2 h-5 w-5" />
                    AI Advisor
                    {totalCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {totalCount} recommendation{totalCount !== 1 ? 's' : ''}
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription>
                    Smart recommendations to optimize your AIP planning and implementation
                </CardDescription>
            </CardHeader>

            <CardContent>
                {totalCount === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <BrainCircuit className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                        <h3 className="text-lg font-medium">No recommendations available</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            The AI advisor doesn't have any suggestions at this time.
                        </p>
                    </div>
                ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="all">
                                All
                                <Badge variant="outline" className="ml-1">{totalCount}</Badge>
                            </TabsTrigger>
                            {recommendations.budget && recommendations.budget.length > 0 && (
                                <TabsTrigger value="budget">
                                    Budget
                                    <Badge variant="outline" className="ml-1">{recommendations.budget.length}</Badge>
                                </TabsTrigger>
                            )}
                            {recommendations.project && recommendations.project.length > 0 && (
                                <TabsTrigger value="project">
                                    Projects
                                    <Badge variant="outline" className="ml-1">{recommendations.project.length}</Badge>
                                </TabsTrigger>
                            )}
                            {recommendations.risk && recommendations.risk.length > 0 && (
                                <TabsTrigger value="risk">
                                    Risks
                                    <Badge variant="outline" className="ml-1">{recommendations.risk.length}</Badge>
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value="all" className="space-y-4">
                            {Object.entries(recommendations).map(([category, items]) => (
                                items.length > 0 && (
                                    <div key={category} className="space-y-3">
                                        <h3 className="text-sm font-medium capitalize">{category} Recommendations</h3>
                                        {items.map((rec, index) => (
                                            <Alert key={`${category}-${index}`} variant={rec.type === 'critical' ? 'destructive' : 'default'}>
                                                {getRecommendationIcon(rec.type)}
                                                <AlertTitle className="flex items-center">
                                                    <span className="capitalize">{rec.type}</span>
                                                    {rec.data && Object.keys(rec.data).map(key => (
                                                        <Badge
                                                            key={key}
                                                            variant={getBadgeVariant(rec.type)}
                                                            className="ml-2"
                                                        >
                                                            {rec.data[key]}
                                                        </Badge>
                                                    ))}
                                                </AlertTitle>
                                                <AlertDescription>{rec.message}</AlertDescription>
                                            </Alert>
                                        ))}
                                    </div>
                                )
                            ))}
                        </TabsContent>

                        <TabsContent value="budget" className="space-y-3">
                            {recommendations.budget && recommendations.budget.map((rec, index) => (
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
                                                {rec.data[key]}
                                            </Badge>
                                        ))}
                                    </AlertTitle>
                                    <AlertDescription>{rec.message}</AlertDescription>
                                </Alert>
                            ))}
                        </TabsContent>

                        <TabsContent value="project" className="space-y-3">
                            {recommendations.project && recommendations.project.map((rec, index) => (
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
                                                {rec.data[key]}
                                            </Badge>
                                        ))}
                                    </AlertTitle>
                                    <AlertDescription>{rec.message}</AlertDescription>
                                </Alert>
                            ))}
                        </TabsContent>

                        <TabsContent value="risk" className="space-y-3">
                            {recommendations.risk && recommendations.risk.map((rec, index) => (
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
                                                {rec.data[key]}
                                            </Badge>
                                        ))}
                                    </AlertTitle>
                                    <AlertDescription>{rec.message}</AlertDescription>
                                </Alert>
                            ))}
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>

            <CardFooter className="flex justify-between">
                <p className="text-xs text-muted-foreground">
                    Powered by AI Advisor v1.0
                </p>
                {totalCount > 0 && (
                    <Button variant="outline" size="sm" className="gap-1">
                        View Details
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
} 