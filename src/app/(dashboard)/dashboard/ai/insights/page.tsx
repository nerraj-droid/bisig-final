"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { BrainCircuit, LineChart, BarChart3, PieChart, Lightbulb, TrendingUp, Zap, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { InsightVisualizer } from '@/components/ai/InsightVisualizer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart as RechartsLineChart, Line } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Type definition that matches InsightVisualizer component
interface InsightData {
  id: string;
  title: string;
  description: string;
  type: 'budget' | 'project' | 'risk' | 'trend';
  priority: 'low' | 'medium' | 'high';
  data: any;
  performance: {
    accuracy: number;
    confidence: number;
    usage: number;
  };
  createdAt: string;
}

// Unified insights data that will be shared across all tabs
const insightData: InsightData[] = [
  {
    id: '1',
    title: 'Budget Allocation Optimization',
    description: 'Optimal budget distribution based on project priorities and historical performance',
    type: 'budget',
    priority: 'high',
    data: [
      { category: 'Infrastructure', current: 35, optimal: 42, difference: 7 },
      { category: 'Health', current: 25, optimal: 28, difference: 3 },
      { category: 'Education', current: 20, optimal: 15, difference: -5 },
      { category: 'Social Welfare', current: 15, optimal: 12, difference: -3 },
      { category: 'Administration', current: 5, optimal: 3, difference: -2 }
    ],
    performance: {
      accuracy: 92,
      confidence: 89,
      usage: 76
    },
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Project Completion Risk Analysis',
    description: 'Risk assessment for current projects based on progress and resource allocation',
    type: 'risk',
    priority: 'medium',
    data: [
      { name: 'Road Repair', risk: 0.2, budget: 120000, progress: 0.7 },
      { name: 'Health Center', risk: 0.6, budget: 350000, progress: 0.3 },
      { name: 'School Building', risk: 0.4, budget: 200000, progress: 0.5 },
      { name: 'Water System', risk: 0.8, budget: 180000, progress: 0.2 },
      { name: 'Community Hall', risk: 0.3, budget: 150000, progress: 0.6 }
    ],
    performance: {
      accuracy: 87,
      confidence: 83,
      usage: 92
    },
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Expenditure Trend Analysis',
    description: 'Historical spending patterns and future projections',
    type: 'trend',
    priority: 'low',
    data: {
      historical: [
        { month: 'Jan', expenditure: 120000 },
        { month: 'Feb', expenditure: 135000 },
        { month: 'Mar', expenditure: 110000 },
        { month: 'Apr', expenditure: 140000 },
        { month: 'May', expenditure: 160000 },
        { month: 'Jun', expenditure: 180000 }
      ],
      projected: [
        { month: 'Jul', expenditure: 185000 },
        { month: 'Aug', expenditure: 195000 },
        { month: 'Sep', expenditure: 210000 },
        { month: 'Oct', expenditure: 200000 },
        { month: 'Nov', expenditure: 225000 },
        { month: 'Dec', expenditure: 250000 }
      ]
    },
    performance: {
      accuracy: 91,
      confidence: 85,
      usage: 88
    },
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Project Implementation Efficiency',
    description: 'Multi-dimensional analysis of project implementation factors',
    type: 'project',
    priority: 'high',
    data: [
      { subject: 'Budget Utilization', project: 'Road Repair', fullMark: 100, value: 78 },
      { subject: 'Timeline Adherence', project: 'Road Repair', fullMark: 100, value: 86 },
      { subject: 'Resource Allocation', project: 'Road Repair', fullMark: 100, value: 90 },
      { subject: 'Quality Control', project: 'Road Repair', fullMark: 100, value: 70 },
      { subject: 'Risk Management', project: 'Road Repair', fullMark: 100, value: 65 },
      { subject: 'Stakeholder Satisfaction', project: 'Road Repair', fullMark: 100, value: 85 },
      
      { subject: 'Budget Utilization', project: 'Health Center', fullMark: 100, value: 60 },
      { subject: 'Timeline Adherence', project: 'Health Center', fullMark: 100, value: 55 },
      { subject: 'Resource Allocation', project: 'Health Center', fullMark: 100, value: 70 },
      { subject: 'Quality Control', project: 'Health Center', fullMark: 100, value: 82 },
      { subject: 'Risk Management', project: 'Health Center', fullMark: 100, value: 75 },
      { subject: 'Stakeholder Satisfaction', project: 'Health Center', fullMark: 100, value: 68 }
    ],
    performance: {
      accuracy: 89,
      confidence: 91,
      usage: 81
    },
    createdAt: new Date().toISOString()
  }
];

// Performance data
const performanceData = [
  { name: 'Jan', accuracy: 72, speed: 85, adoption: 62 },
  { name: 'Feb', accuracy: 75, speed: 88, adoption: 68 },
  { name: 'Mar', accuracy: 78, speed: 87, adoption: 75 },
  { name: 'Apr', accuracy: 82, speed: 89, adoption: 78 },
  { name: 'May', accuracy: 87, speed: 90, adoption: 84 },
  { name: 'Jun', accuracy: 90, speed: 92, adoption: 88 },
];

// Recommendations derived from insights data
const recommendations = insightData.map(insight => {
  let recommendation = {
    id: insight.id,
    title: '',
    description: '',
    impact: insight.priority,
    difficulty: 'medium',
    category: insight.type,
    metrics: { roi: 0, risk: 0, confidence: 0 }
  };

  // Generate recommendation based on insight type
  if (insight.type === 'budget') {
    // Check if data is an array with the expected properties
    const budgetData = insight.data as Array<{ category: string, current: number, optimal: number, difference: number }>;
    const positiveChanges = budgetData.filter(d => d.difference > 0);
    if (positiveChanges.length > 0) {
      const topChange = positiveChanges[0];
      recommendation.title = `${topChange.category} Budget Increase Recommended`;
      recommendation.description = `Increase ${topChange.category} budget by ${topChange.difference}% to optimize resource allocation`;
      recommendation.metrics.roi = 15 + Math.round(topChange.difference * 2.5);
      recommendation.metrics.risk = 10 + Math.round(topChange.difference * 0.7);
      recommendation.metrics.confidence = insight.performance.confidence;
    }
  } else if (insight.type === 'risk') {
    // Check if data is an array with the expected properties
    const riskData = insight.data as Array<{ name: string, risk: number, budget: number, progress: number }>;
    const highRiskProjects = riskData.filter(d => d.risk > 0.5);
    if (highRiskProjects.length > 0) {
      const riskiestProject = highRiskProjects[0];
      recommendation.title = `${riskiestProject.name} Risk Mitigation Required`;
      recommendation.description = `Project has ${Math.round(riskiestProject.risk * 100)}% risk level with only ${Math.round(riskiestProject.progress * 100)}% completion`;
      recommendation.metrics.roi = 0;
      recommendation.metrics.risk = Math.round(riskiestProject.risk * 100);
      recommendation.metrics.confidence = insight.performance.confidence;
      recommendation.difficulty = 'high';
    }
  } else if (insight.type === 'trend') {
    recommendation.title = 'Q4 Budget Planning Adjustment';
    recommendation.description = 'Adjust Q4 budget allocation based on projected 38% increase in expenditures';
    recommendation.metrics.roi = 22;
    recommendation.metrics.risk = 18;
    recommendation.metrics.confidence = insight.performance.confidence;
  } else if (insight.type === 'project') {
    recommendation.title = 'Resource Reallocation Opportunity';
    recommendation.description = 'Shift resources from Road Repair to Health Center to improve implementation efficiency';
    recommendation.metrics.roi = 17;
    recommendation.metrics.risk = 25;
    recommendation.metrics.confidence = insight.performance.confidence;
  }

  return recommendation;
}).filter(r => r.title !== ''); // Remove any empty recommendations

export default function AIInsightsPage() {
  const [activeRecommendation, setActiveRecommendation] = useState(recommendations[0]);
  const [selectedInsight, setSelectedInsight] = useState<string>(insightData[0].id);

  // Function to get badge variant for impact and difficulty
  const getImpactBadge = (impact) => {
    switch (impact) {
      case 'high':
        return <Badge variant="destructive">High Impact</Badge>;
      case 'medium':
        return <Badge variant="default">Medium Impact</Badge>;
      case 'low':
        return <Badge variant="outline">Low Impact</Badge>;
      default:
        return null;
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'high':
        return <Badge variant="destructive">High Difficulty</Badge>;
      case 'medium':
        return <Badge variant="default">Medium Difficulty</Badge>;
      case 'low':
        return <Badge variant="outline">Low Difficulty</Badge>;
      default:
        return null;
    }
  };

  // Function to get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'budget':
        return <PieChart className="h-5 w-5 text-blue-500" />;
      case 'risk':
        return <LineChart className="h-5 w-5 text-green-500" />;
      case 'project':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-purple-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-purple-500" />;
    }
  };

  // Function to aggregate performance metrics from all insights
  const getAggregatePerformance = () => {
    const metrics = insightData.reduce((acc, insight) => {
      acc.accuracy.push(insight.performance.accuracy);
      acc.confidence.push(insight.performance.confidence);
      acc.usage.push(insight.performance.usage);
      return acc;
    }, { accuracy: [] as number[], confidence: [] as number[], usage: [] as number[] });

    return {
      accuracy: Math.round(metrics.accuracy.reduce((sum, val) => sum + val, 0) / metrics.accuracy.length),
      confidence: Math.round(metrics.confidence.reduce((sum, val) => sum + val, 0) / metrics.confidence.length),
      usage: Math.round(metrics.usage.reduce((sum, val) => sum + val, 0) / metrics.usage.length)
    };
  };

  const performance = getAggregatePerformance();

  return (
    <div className="container p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BrainCircuit className="h-8 w-8 text-primary" />
          AI Insights
        </h1>
        <p className="text-muted-foreground">
          Advanced visualizations and analytics for AI-generated insights
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="visualizer" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="visualizer">Insight Visualizer</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="visualizer" className="space-y-6 mt-6">
          <InsightVisualizer 
            insightData={insightData} 
            selectedInsightId={selectedInsight} 
            onSelectInsight={setSelectedInsight} 
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Performance metrics cards */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">AI Performance Metrics</CardTitle>
                  <CardDescription>Key performance indicators for AI subsystems</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Accuracy</span>
                      <span className="text-sm text-muted-foreground">{performance.accuracy}%</span>
                    </div>
                    <Progress value={performance.accuracy} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Confidence</span>
                      <span className="text-sm text-muted-foreground">{performance.confidence}%</span>
                    </div>
                    <Progress value={performance.confidence} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">User Adoption</span>
                      <span className="text-sm text-muted-foreground">{performance.usage}%</span>
                    </div>
                    <Progress value={performance.usage} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Overall Health</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((performance.accuracy + performance.confidence + performance.usage) / 3)}%
                      </span>
                    </div>
                    <Progress value={Math.round((performance.accuracy + performance.confidence + performance.usage) / 3)} className="h-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Model Improvements</CardTitle>
                  <CardDescription>6-month performance growth</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm font-medium">Accuracy</span>
                      </div>
                      <Badge variant="outline" className="bg-green-50">+18%</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm font-medium">Speed</span>
                      </div>
                      <Badge variant="outline" className="bg-green-50">+7%</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm font-medium">Adoption</span>
                      </div>
                      <Badge variant="outline" className="bg-green-50">+26%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main charts */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <CardTitle className="text-xl">Performance Trends</CardTitle>
                      <CardDescription>6-month performance metrics for AI systems</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Accuracy</Badge>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Speed</Badge>
                      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Adoption</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={performanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} name="Accuracy %" />
                      <Line type="monotone" dataKey="speed" stroke="#22c55e" strokeWidth={2} name="Speed %" />
                      <Line type="monotone" dataKey="adoption" stroke="#a855f7" strokeWidth={2} name="Adoption %" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
                <CardContent className="border-t pt-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Performance Insights:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>All key metrics show consistent improvement over the past 6 months</li>
                      <li>User adoption has seen the most dramatic increase (+26%)</li>
                      <li>Accuracy remains the highest performing metric at {performance.accuracy}%</li>
                      <li>Continued training with user feedback has improved model performance</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Recommendations List */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">AI Recommendations</CardTitle>
                  <CardDescription>Smart suggestions based on data analysis</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4 mt-4">
                    {recommendations.map(recommendation => (
                      <div 
                        key={recommendation.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          activeRecommendation.id === recommendation.id 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setActiveRecommendation(recommendation)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {getCategoryIcon(recommendation.category)}
                          <span className="font-medium text-sm">{recommendation.title}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {getImpactBadge(recommendation.impact)}
                          <span className="text-xs text-muted-foreground">
                            {recommendation.metrics.confidence}% confidence
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recommendation Details */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(activeRecommendation.category)}
                      <CardTitle>{activeRecommendation.title}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      {getImpactBadge(activeRecommendation.impact)}
                      {getDifficultyBadge(activeRecommendation.difficulty)}
                    </div>
                  </div>
                  <CardDescription>{activeRecommendation.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg border p-3 text-center">
                        <div className="text-lg font-bold text-green-600">{activeRecommendation.metrics.roi}%</div>
                        <div className="text-xs text-muted-foreground">Potential ROI</div>
                      </div>
                      <div className="rounded-lg border p-3 text-center">
                        <div className="text-lg font-bold text-orange-600">{activeRecommendation.metrics.risk}%</div>
                        <div className="text-xs text-muted-foreground">Implementation Risk</div>
                      </div>
                      <div className="rounded-lg border p-3 text-center">
                        <div className="text-lg font-bold text-blue-600">{activeRecommendation.metrics.confidence}%</div>
                        <div className="text-xs text-muted-foreground">AI Confidence</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="font-medium">Implementation Steps:</h3>
                      <div className="space-y-2">
                        {activeRecommendation.category === 'budget' && (
                          <>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span>Review current budget allocation</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span>Identify administrative expenses that can be reduced</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-muted-foreground" />
                              <span>Create revised budget proposal</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-muted-foreground" />
                              <span>Submit for approval and implement changes</span>
                            </div>
                          </>
                        )}
                        {activeRecommendation.category === 'risk' && (
                          <>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span>Review current project timeline</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span>Identify risk factors and potential delays</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-muted-foreground" />
                              <span>Develop risk mitigation strategies</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-muted-foreground" />
                              <span>Adjust timeline and resource allocation</span>
                            </div>
                          </>
                        )}
                        {activeRecommendation.category === 'project' && (
                          <>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span>Evaluate current resource allocation</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span>Identify opportunities for reallocation</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-muted-foreground" />
                              <span>Create resource reallocation plan</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-muted-foreground" />
                              <span>Implement changes and monitor results</span>
                            </div>
                          </>
                        )}
                        {activeRecommendation.category === 'trend' && (
                          <>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span>Analyze historical and projected expenditure patterns</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span>Identify areas requiring budget adjustments</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-muted-foreground" />
                              <span>Prepare Q4 budget adjustment proposal</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-muted-foreground" />
                              <span>Present changes to stakeholders for approval</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardContent className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-sm text-muted-foreground">
                        Generated from {insightData.find(i => i.id === activeRecommendation.id)?.title}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Ignore</Button>
                      <Button size="sm">Implement</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 