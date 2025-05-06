"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Activity, AlertTriangle, BarChart2, Clock, TrendingUp, TrendingDown, Check, RefreshCw } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { format, subDays } from 'date-fns'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

// Define types for our data
interface SystemPerformanceSummary {
  totalOperations: number;
  totalSuccessful: number;
  totalFailed: number;
  modelsCount: number;
  modelPerformance: ModelPerformanceSummary[];
  timeRange: {
    start: string;
    end: string;
  };
}

interface ModelPerformanceSummary {
  modelId: string;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageExecutionTimeMs: number;
  minExecutionTimeMs: number;
  maxExecutionTimeMs: number;
  averageConfidenceScore?: number;
  successRate: number;
  lastExecutionTimestamp: string;
}

// Demo data for initial render
const demoData: SystemPerformanceSummary = {
  totalOperations: 1458,
  totalSuccessful: 1380,
  totalFailed: 78,
  modelsCount: 3,
  modelPerformance: [
    {
      modelId: "document-intelligence",
      totalOperations: 532,
      successfulOperations: 512,
      failedOperations: 20,
      averageExecutionTimeMs: 245,
      minExecutionTimeMs: 120,
      maxExecutionTimeMs: 890,
      averageConfidenceScore: 0.87,
      successRate: 0.96,
      lastExecutionTimestamp: new Date().toISOString()
    },
    {
      modelId: "advisor",
      totalOperations: 612,
      successfulOperations: 580,
      failedOperations: 32,
      averageExecutionTimeMs: 180,
      minExecutionTimeMs: 90,
      maxExecutionTimeMs: 450,
      averageConfidenceScore: 0.92,
      successRate: 0.95,
      lastExecutionTimestamp: new Date().toISOString()
    },
    {
      modelId: "recommendation-engine",
      totalOperations: 314,
      successfulOperations: 288,
      failedOperations: 26,
      averageExecutionTimeMs: 320,
      minExecutionTimeMs: 150,
      maxExecutionTimeMs: 780,
      averageConfidenceScore: 0.79,
      successRate: 0.92,
      lastExecutionTimestamp: new Date().toISOString()
    }
  ],
  timeRange: {
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  }
};

// Colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function PerformanceDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SystemPerformanceSummary>(demoData);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformanceData = async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');
      
      const response = await fetch(
        `/api/ai/performance?action=system-summary&startDate=${startDate}&endDate=${endDate}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch performance data');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching performance data:', err);
      setError('Failed to load performance metrics. Please try again later.');
      // Keep the demo data
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when date range changes
  useEffect(() => {
    fetchPerformanceData();
  }, [dateRange]);

  // Prepare data for charts
  const modelSuccessData = data.modelPerformance.map((model) => ({
    name: model.modelId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    successRate: Number((model.successRate * 100).toFixed(2)),
    operations: model.totalOperations
  }));

  const executionTimeData = data.modelPerformance.map((model) => ({
    name: model.modelId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    average: model.averageExecutionTimeMs,
    min: model.minExecutionTimeMs,
    max: model.maxExecutionTimeMs
  }));

  const successRatePieData = [
    { name: 'Successful', value: data.totalSuccessful },
    { name: 'Failed', value: data.totalFailed }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Performance Overview</h2>
          <p className="text-muted-foreground">
            {data.timeRange.start} to {data.timeRange.end}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          <DateRangePicker onChange={setDateRange} />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchPerformanceData}
            disabled={loading}
          >
            {loading ? <Skeleton className="h-4 w-4 rounded-full" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOperations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {data.modelsCount} models
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((data.totalSuccessful / data.totalOperations) * 100).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.totalSuccessful.toLocaleString()} successful operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Execution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.modelPerformance.reduce((sum, model) => sum + model.averageExecutionTimeMs, 0) / 
                data.modelPerformance.length}ms
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all models
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            {data.modelPerformance.length > 0 ? (
              <>
                <div className="text-xl font-bold">
                  {data.modelPerformance[0].modelId
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(data.modelPerformance[0].successRate * 100).toFixed(2)}% success rate
                </p>
              </>
            ) : (
              <div className="text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Success Rate by Model</CardTitle>
            <CardDescription>
              Comparison of success rates across different models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={modelSuccessData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Success Rate']} />
                  <Legend />
                  <Bar dataKey="successRate" fill="#0088FE" name="Success Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Execution Time (ms)</CardTitle>
            <CardDescription>
              Average, minimum, and maximum execution times
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={executionTimeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="min" fill="#00C49F" name="Minimum" />
                  <Bar dataKey="average" fill="#FFBB28" name="Average" />
                  <Bar dataKey="max" fill="#FF8042" name="Maximum" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operation Volume</CardTitle>
            <CardDescription>
              Number of operations by model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={modelSuccessData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Operations', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="operations" fill="#8884d8" name="Total Operations" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success vs Failure</CardTitle>
            <CardDescription>
              Distribution of successful and failed operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={successRatePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {successRatePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#00C49F' : '#FF8042'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Operations']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Details */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance Details</CardTitle>
          <CardDescription>
            Detailed metrics for each AI model in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={data.modelPerformance[0]?.modelId || "no-data"}>
            <TabsList className="mb-4">
              {data.modelPerformance.map((model) => (
                <TabsTrigger key={model.modelId} value={model.modelId}>
                  {model.modelId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </TabsTrigger>
              ))}
              {data.modelPerformance.length === 0 && (
                <TabsTrigger value="no-data">No Data</TabsTrigger>
              )}
            </TabsList>
            
            {data.modelPerformance.map((model) => (
              <TabsContent key={model.modelId} value={model.modelId} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="text-2xl font-bold mr-2">
                          {(model.successRate * 100).toFixed(2)}%
                        </div>
                        {model.successRate >= 0.95 ? (
                          <TrendingUp className="text-green-500 h-4 w-4" />
                        ) : model.successRate >= 0.9 ? (
                          <Activity className="text-yellow-500 h-4 w-4" />
                        ) : (
                          <TrendingDown className="text-red-500 h-4 w-4" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {model.successfulOperations} of {model.totalOperations} operations successful
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Execution Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {model.averageExecutionTimeMs}ms
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Range: {model.minExecutionTimeMs}ms - {model.maxExecutionTimeMs}ms
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Confidence Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {model.averageConfidenceScore ? (
                        <>
                          <div className="text-2xl font-bold">
                            {(model.averageConfidenceScore * 100).toFixed(2)}%
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Average confidence across operations
                          </p>
                        </>
                      ) : (
                        <div className="text-muted-foreground">
                          No confidence data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Last operation: {new Date(model.lastExecutionTimestamp).toLocaleString()}</p>
                </div>
              </TabsContent>
            ))}
            
            {data.modelPerformance.length === 0 && (
              <TabsContent value="no-data">
                <div className="text-center py-6 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p>No performance data available for the selected time period</p>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 