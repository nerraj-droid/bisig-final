import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Lightbulb, Download, Filter } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Feedback Dashboard | AI Tools',
  description: 'Review and analyze user feedback on AI features',
};

// Mock data for demonstration - in production, this would come from the API
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

// Summary data for charts
const modelSummary = [
  { name: 'Document Intelligence', helpful: 10, unhelpful: 3, suggestions: 5 },
  { name: 'Risk Assessment', helpful: 8, unhelpful: 1, suggestions: 2 },
  { name: 'Budget Allocation', helpful: 6, unhelpful: 2, suggestions: 4 },
  { name: 'Project Prioritization', helpful: 7, unhelpful: 0, suggestions: 3 },
  { name: 'Financial Forecast', helpful: 5, unhelpful: 4, suggestions: 1 },
];

const feedbackTypeSummary = [
  { name: 'Helpful', value: 36 },
  { name: 'Unhelpful', value: 10 },
  { name: 'Suggestions', value: 15 },
];

const COLORS = ['#4ade80', '#f87171', '#60a5fa'];

export default function FeedbackDashboardPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Feedback Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and analyze user feedback for AI features to drive continuous improvement.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold flex items-center">
              <ThumbsUp className="mr-2 text-green-500" size={20} />
              <span>36</span>
            </CardTitle>
            <CardDescription>Helpful Ratings</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Users found the AI outputs helpful
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold flex items-center">
              <ThumbsDown className="mr-2 text-red-500" size={20} />
              <span>10</span>
            </CardTitle>
            <CardDescription>Needs Improvement</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Areas that users found unhelpful
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold flex items-center">
              <Lightbulb className="mr-2 text-blue-500" size={20} />
              <span>15</span>
            </CardTitle>
            <CardDescription>User Suggestions</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Valuable improvement ideas from users
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-model">By Model</TabsTrigger>
          <TabsTrigger value="details">Feedback Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Distribution</CardTitle>
              <CardDescription>
                Distribution of feedback types across all AI models
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-full max-w-xl">
                <PieChart width={400} height={300}>
                  <Pie
                    data={feedbackTypeSummary}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {feedbackTypeSummary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} feedbacks`, 'Count']} />
                  <Legend />
                </PieChart>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Feedback Trends</CardTitle>
              <CardDescription>
                Weekly feedback statistics for the past month
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-full overflow-x-auto">
                <BarChart
                  width={600}
                  height={300}
                  data={[
                    { name: 'Week 1', helpful: 5, unhelpful: 3, suggestions: 2 },
                    { name: 'Week 2', helpful: 8, unhelpful: 2, suggestions: 4 },
                    { name: 'Week 3', helpful: 12, unhelpful: 3, suggestions: 5 },
                    { name: 'Week 4', helpful: 11, unhelpful: 2, suggestions: 4 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="helpful" name="Helpful" fill="#4ade80" />
                  <Bar dataKey="unhelpful" name="Unhelpful" fill="#f87171" />
                  <Bar dataKey="suggestions" name="Suggestions" fill="#60a5fa" />
                </BarChart>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="by-model" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback by AI Model</CardTitle>
              <CardDescription>
                Comparison of feedback across different AI features
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-full overflow-x-auto">
                <BarChart
                  width={600}
                  height={300}
                  data={modelSummary}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="helpful" name="Helpful" fill="#4ade80" />
                  <Bar dataKey="unhelpful" name="Unhelpful" fill="#f87171" />
                  <Bar dataKey="suggestions" name="Suggestions" fill="#60a5fa" />
                </BarChart>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Models</CardTitle>
                <CardDescription>
                  Models with the highest positive feedback ratio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span>Project Prioritization</span>
                    </div>
                    <span className="font-medium">100% helpful</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span>Risk Assessment</span>
                    </div>
                    <span className="font-medium">89% helpful</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span>Document Intelligence</span>
                    </div>
                    <span className="font-medium">77% helpful</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Models Needing Improvement</CardTitle>
                <CardDescription>
                  Models with the highest negative feedback ratio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span>Financial Forecast</span>
                    </div>
                    <span className="font-medium">40% unhelpful</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                      <span>Budget Allocation</span>
                    </div>
                    <span className="font-medium">20% unhelpful</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter size={14} />
                <span>Filter</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Download size={14} />
                <span>Export</span>
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {FEEDBACK_DATA.length} feedback entries
            </div>
          </div>
          
          <Card>
            <CardContent className="pt-6">
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 