import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, MessageCircle, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Feedback Dashboard | AI Tools',
  description: 'Review and analyze user feedback on AI features',
};

export default function AIFeedbackPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI Feedback Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and analyze user feedback on AI features</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Coming Soon</div>
            <p className="text-xs text-muted-foreground">
              AI feedback collection system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Coming Soon</div>
            <p className="text-xs text-muted-foreground">
              User satisfaction analytics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Performance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Coming Soon</div>
            <p className="text-xs text-muted-foreground">
              AI model performance metrics
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Feature Under Development</CardTitle>
            <CardDescription>
              The AI Feedback Dashboard is currently being developed and will be available soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 space-y-2">
              <p>Planned features include:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Real-time feedback collection from AI interactions</li>
                <li>Sentiment analysis and categorization</li>
                <li>Performance metrics and trending analysis</li>
                <li>Actionable insights for AI model improvement</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 