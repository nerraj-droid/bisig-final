"use client"

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, BrainCircuit, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { InsightVisualizer } from '@/components/ai/InsightVisualizer';
import { generateAIPInsights, InsightData } from '@/lib/ai/aip-insights';

export default function AIPInsightsPage() {
  const params = useParams();
  const aipId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aip, setAip] = useState<any>(null);
  const [insightData, setInsightData] = useState<InsightData[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<string>('');

  // Fetch AIP data when component mounts
  useEffect(() => {
    const fetchAIPData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/finance/aip/${aipId}`);

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "AIP record not found"
              : "Failed to fetch AIP data"
          );
        }

        const data = await response.json();
        setAip(data);
        
        // Generate insights from AIP data
        const insights = generateAIPInsights(data);
        setInsightData(insights);
        
        // Set first insight as selected by default
        if (insights.length > 0) {
          setSelectedInsight(insights[0].id);
        }
      } catch (err: any) {
        console.error("Error fetching AIP details:", err);
        setError(err.message || "Failed to load AIP data");
      } finally {
        setLoading(false);
      }
    };

    if (aipId) {
      fetchAIPData();
    }
  }, [aipId]);

  if (loading) {
    return (
      <div className="container p-6 space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-2" asChild>
            <Link href={`/dashboard/finance/aip/${aipId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to AIP Details
            </Link>
          </Button>
        </div>
        
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-2" asChild>
            <Link href={`/dashboard/finance/aip/${aipId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to AIP Details
            </Link>
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container p-6 space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2" asChild>
          <Link href={`/dashboard/finance/aip/${aipId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to AIP Details
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BrainCircuit className="h-8 w-8 text-primary" />
          {aip.title} - AI Insights
        </h1>
        <p className="text-muted-foreground">
          AI-powered insights and analytics for the {aip.fiscalYear.year} Annual Investment Program
        </p>
      </div>

      <Separator />

      {insightData.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Insights Available</CardTitle>
            <CardDescription>
              There isn't enough data in this AIP to generate meaningful insights yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Try adding more projects, milestones, and expenses to enable AI-powered insights.
            </p>
          </CardContent>
        </Card>
      ) : (
        <InsightVisualizer 
          insightData={insightData} 
          selectedInsightId={selectedInsight}
          onSelectInsight={setSelectedInsight}
        />
      )}
    </div>
  );
} 