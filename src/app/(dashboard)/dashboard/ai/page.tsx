"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  BrainCircuit, 
  FileText,
  Activity,
  ThumbsUp,
  ThumbsDown,
  LineChart,
  Lightbulb
} from 'lucide-react';

// Import all AI-related components
import { DocumentIntelligence } from '@/components/aip/DocumentIntelligence';
import { PerformanceDashboard } from '@/components/ai/PerformanceDashboard';
import { InsightVisualizer } from '@/components/ai/InsightVisualizer';

// Sample insights data (this would be moved from the insights page)
const insightData = [
  {
    id: '1',
    title: 'Budget Allocation Efficiency',
    description: 'Analysis of current budget allocation across sectors',
    type: 'budget' as const,
    priority: 'high' as const,
    data: [
      { name: 'Infrastructure', value: 35, fill: '#8884d8' },
      { name: 'Health', value: 25, fill: '#83a6ed' },
      { name: 'Education', value: 20, fill: '#8dd1e1' },
      { name: 'Social Services', value: 10, fill: '#82ca9d' },
      { name: 'Agriculture', value: 10, fill: '#a4de6c' }
    ],
    performance: {
      accuracy: 92,
      confidence: 89,
      usage: 78
    },
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Risk Assessment Matrix',
    description: 'Project risk analysis by probability and impact',
    type: 'risk' as const,
    priority: 'medium' as const,
    data: [
      { project: 'Road Construction', x: 65, y: 75, z: 'High Risk' },
      { project: 'Health Center', x: 45, y: 35, z: 'Medium Risk' },
      { project: 'School Renovation', x: 30, y: 60, z: 'Medium Risk' },
      { project: 'Water System', x: 80, y: 40, z: 'Medium Risk' },
      { project: 'Community Center', x: 22, y: 30, z: 'Low Risk' }
    ],
    performance: {
      accuracy: 87,
      confidence: 82,
      usage: 76
    },
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Monthly Expenditure Trends',
    description: 'Expenditure patterns over the past 6 months',
    type: 'trend' as const,
    priority: 'low' as const,
    data: [
      { month: 'Jan', amount: 1200000 },
      { month: 'Feb', amount: 1350000 },
      { month: 'Mar', amount: 1450000 },
      { month: 'Apr', amount: 1500000 },
      { month: 'May', amount: 1620000 },
      { month: 'Jun', amount: 1750000 }
    ],
    performance: {
      accuracy: 94,
      confidence: 91,
      usage: 85
    },
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Project Implementation Efficiency',
    description: 'Multi-dimensional analysis of project implementation factors',
    type: 'project' as const,
    priority: 'high' as const,
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

// Mock data for the feedback dashboard
const FEEDBACK_DATA = [
  { id: 1, modelId: 'document-intelligence', feedbackType: 'helpful', timestamp: '2025-05-05T12:32:00Z', feedbackText: 'The summary was very accurate and helped me understand the document quickly.' },
  { id: 2, modelId: 'document-intelligence', feedbackType: 'unhelpful', timestamp: '2025-05-05T14:15:00Z', feedbackText: 'Could not parse my PDF properly.' },
  { id: 3, modelId: 'risk-assessment', feedbackType: 'helpful', timestamp: '2025-05-04T09:45:00Z', feedbackText: 'The risk factors identified were spot on.' },
  { id: 4, modelId: 'budget-allocation', feedbackType: 'suggestion', timestamp: '2025-05-04T11:20:00Z', feedbackText: 'Would be nice to see historical comparisons alongside recommendations.' },
  { id: 5, modelId: 'document-intelligence', feedbackType: 'suggestion', timestamp: '2025-05-03T16:40:00Z', feedbackText: 'Add support for spreadsheet analysis too.' },
  { id: 6, modelId: 'project-prioritization', feedbackType: 'helpful', timestamp: '2025-05-03T10:10:00Z', feedbackText: 'Helped us decide which project to focus on first.' },
  { id: 7, modelId: 'financial-forecast', feedbackType: 'unhelpful', timestamp: '2025-05-02T15:30:00Z', feedbackText: 'The projections seemed too optimistic compared to our historical data.' },
  { id: 8, modelId: 'document-intelligence', feedbackType: 'helpful', timestamp: '2025-05-02T13:50:00Z', feedbackText: 'Entity extraction worked great for our contracts.' },
];

export default function AIDashboardPage() {
  return (
    <div className="container p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BrainCircuit className="h-8 w-8 text-primary" />
          AI Dashboard
        </h1>
        <p className="text-muted-foreground">
          Comprehensive management interface for all AI-powered features
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span>AI Insights</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Document Intelligence</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Performance Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4" />
            <span>Feedback Dashboard</span>
          </TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6 mt-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold">AI Insights</h2>
            <p className="text-muted-foreground">
              Advanced visualizations and analytics for AI-generated insights
            </p>
          </div>
          <InsightVisualizer 
            insightData={insightData} 
          />
        </TabsContent>

        {/* Document Intelligence Tab */}
        <TabsContent value="documents" className="space-y-6 mt-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold">Document Intelligence</h2>
            <p className="text-muted-foreground">
              Extract insights, summarize content, and get recommendations from project documents
            </p>
          </div>
          <DocumentIntelligence />
        </TabsContent>

        {/* Performance Analytics Tab */}
        <TabsContent value="performance" className="space-y-6 mt-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold">Performance Analytics</h2>
            <p className="text-muted-foreground">
              Track, analyze, and benchmark AI model performance across your system
            </p>
          </div>
          <PerformanceDashboard />
        </TabsContent>

        {/* Feedback Dashboard Tab */}
        <TabsContent value="feedback" className="space-y-6 mt-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold">Feedback Dashboard</h2>
            <p className="text-muted-foreground">
              Monitor and analyze user feedback for AI features to drive continuous improvement
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border p-4 rounded-lg text-center">
              <div className="text-2xl font-bold flex items-center justify-center">
                <ThumbsUp className="mr-2 text-green-500" size={20} />
                <span>36</span>
              </div>
              <p className="text-sm text-muted-foreground">Helpful Ratings</p>
            </div>
            <div className="border p-4 rounded-lg text-center">
              <div className="text-2xl font-bold flex items-center justify-center">
                <ThumbsDown className="mr-2 text-red-500" size={20} />
                <span>10</span>
              </div>
              <p className="text-sm text-muted-foreground">Needs Improvement</p>
            </div>
            <div className="border p-4 rounded-lg text-center">
              <div className="text-2xl font-bold flex items-center justify-center">
                <Lightbulb className="mr-2 text-blue-500" size={20} />
                <span>15</span>
              </div>
              <p className="text-sm text-muted-foreground">User Suggestions</p>
            </div>
          </div>
          <div className="space-y-4">
            {FEEDBACK_DATA.map((feedback) => (
              <div key={feedback.id} className="p-4 border rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      {feedback.feedbackType === 'helpful' && (
                        <ThumbsUp size={16} className="text-green-500" />
                      )}
                      {feedback.feedbackType === 'unhelpful' && (
                        <ThumbsDown size={16} className="text-red-500" />
                      )}
                      {feedback.feedbackType === 'suggestion' && (
                        <Lightbulb size={16} className="text-blue-500" />
                      )}
                      <span className="font-medium capitalize">{feedback.feedbackType}</span>
                    </div>
                    <p className="text-sm mt-1">{feedback.feedbackText}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {feedback.modelId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(feedback.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 