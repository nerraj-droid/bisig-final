"use client"

import { useState, useRef, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from "sonner"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts'
import { 
  AlertCircle, 
  BarChart2, 
  ChevronDown, 
  Download, 
  FileDown, 
  Grid3X3, 
  Lightbulb, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon,
  Radar as RadarIcon,
  Share2,
  TrendingUp,
  Zap
} from 'lucide-react'

// Sample data types
interface InsightData {
  id: string;
  title: string;
  description: string;
  type: 'budget' | 'project' | 'risk' | 'trend';
  priority: 'low' | 'medium' | 'high';
  data: any;
  performance?: {
    accuracy: number;
    confidence: number;
    usage: number;
  };
  createdAt: string;
}

interface VisualizationConfig {
  type: 'bar' | 'line' | 'pie' | 'radar' | 'treemap' | 'scatter';
  options: any;
}

export interface InsightVisualizerProps {
  insightData?: InsightData[];
  selectedInsightId?: string;
  onSelectInsight?: (id: string) => void;
}

// Sample data for demonstrations
const sampleInsights: InsightData[] = [
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
    createdAt: new Date().toISOString()
  }
];

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

/**
 * InsightVisualizer Component
 * Enhanced visualization component for AI-generated insights
 */
export function InsightVisualizer({ 
  insightData = sampleInsights,
  selectedInsightId,
  onSelectInsight
}: InsightVisualizerProps) {
  const [insights] = useState<InsightData[]>(insightData);
  const [internalSelectedInsightId, setInternalSelectedInsightId] = useState<string>(
    selectedInsightId || insights[0]?.id || ''
  );
  const [visualizationType, setVisualizationType] = useState<string>('default');
  const [loading, setLoading] = useState(false);
  
  // Visualization ref for exporting as image
  const visualizationRef = useRef<HTMLDivElement>(null);

  // Use selectedInsightId from props if provided, otherwise use internal state
  const effectiveSelectedInsightId = selectedInsightId !== undefined ? selectedInsightId : internalSelectedInsightId;
  
  // Handle insight selection with fallback to internal state if no external handler provided
  const handleSelectInsight = (id: string) => {
    if (onSelectInsight) {
      onSelectInsight(id);
    } else {
      setInternalSelectedInsightId(id);
    }
  };

  // Get current insight based on selected ID
  const currentInsight = useMemo(() => {
    return insights.find(insight => insight.id === effectiveSelectedInsightId) || insights[0];
  }, [insights, effectiveSelectedInsightId]);
  
  // Function to get appropriate visualization based on insight type and selected visualization
  const renderVisualization = () => {
    if (loading) {
      return <Skeleton className="w-full h-80" />;
    }

    // For budget insights
    if (currentInsight.type === 'budget') {
      if (visualizationType === 'bar' || visualizationType === 'default') {
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={currentInsight.data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis label={{ value: 'Budget %', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" fill="#8884d8" name="Current Allocation %" />
              <Bar dataKey="optimal" fill="#82ca9d" name="Optimal Allocation %" />
            </BarChart>
          </ResponsiveContainer>
        );
      } else if (visualizationType === 'pie') {
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={currentInsight.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="optimal"
              >
                {currentInsight.data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Optimal Allocation']} />
            </PieChart>
          </ResponsiveContainer>
        );
      } else if (visualizationType === 'treemap') {
        const transformedData = {
          name: 'Budget',
          children: currentInsight.data.map((item: any) => ({
            name: item.category,
            size: item.optimal,
            difference: item.difference
          }))
        };
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <Treemap
              data={[transformedData]}
              dataKey="size"
              aspectRatio={4/3}
              stroke="#fff"
              fill="#8884d8"
              content={<CustomizedContent colors={COLORS} />}
            />
          </ResponsiveContainer>
        );
      }
    }
    
    // For risk insights
    else if (currentInsight.type === 'risk') {
      if (visualizationType === 'scatter' || visualizationType === 'default') {
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid />
              <XAxis type="number" dataKey="progress" name="Progress" unit="%" domain={[0, 1]} tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`} />
              <YAxis type="number" dataKey="risk" name="Risk Level" unit="" domain={[0, 1]} tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`} />
              <ZAxis type="number" dataKey="budget" name="Budget" unit=" PHP" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name, props) => {
                if (name === 'Risk Level') return [`${(Number(value) * 100).toFixed(0)}%`, name];
                if (name === 'Progress') return [`${(Number(value) * 100).toFixed(0)}%`, name];
                return [`${value.toLocaleString()} PHP`, name];
              }} />
              <Legend />
              <Scatter name="Projects" data={currentInsight.data} fill="#8884d8" shape="circle" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      } else if (visualizationType === 'bar') {
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={currentInsight.data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Risk Level', angle: -90, position: 'insideLeft' }} domain={[0, 1]} tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`} />
              <Tooltip formatter={(value) => [`${(Number(value) * 100).toFixed(0)}%`, 'Risk Level']} />
              <Legend />
              <Bar dataKey="risk" fill="#FF8042" name="Risk Level" />
            </BarChart>
          </ResponsiveContainer>
        );
      }
    }
    
    // For trend insights
    else if (currentInsight.type === 'trend') {
      // Create a simpler data format that clearly separates historical from projected
      const historicalData = currentInsight.data.historical.map((item: any) => ({
        month: item.month,
        value: item.expenditure,
        type: 'Historical'
      }));
      
      const projectedData = currentInsight.data.projected.map((item: any) => ({
        month: item.month,
        value: item.expenditure,
        type: 'Projected'
      }));
      
      // Combine for rendering
      const combinedData = [...historicalData, ...projectedData];
      
      if (visualizationType === 'line' || visualizationType === 'default') {
        // Create separate lines for historical and projected data to avoid custom dot rendering
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                type="category"
                allowDuplicatedCategory={false}
              />
              <YAxis />
              <Tooltip formatter={(value) => [`₱${Number(value).toLocaleString()}`, 'Expenditure']} />
              <Legend />
              
              {/* Historical line */}
              <Line 
                data={historicalData}
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                name="Historical"
                strokeWidth={2}
              />
              
              {/* Projected line */}
              <Line 
                data={projectedData}
                type="monotone" 
                dataKey="value" 
                stroke="#FF8042" 
                name="Projected"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      } else if (visualizationType === 'bar') {
        // Use separate bars for historical and projected data
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                type="category"
                allowDuplicatedCategory={false}
              />
              <YAxis />
              <Tooltip formatter={(value) => [`₱${Number(value).toLocaleString()}`, 'Expenditure']} />
              <Legend />
              
              {/* Historical data bar */}
              <Bar 
                data={historicalData}
                dataKey="value" 
                name="Historical" 
                fill="#8884d8" 
              />
              
              {/* Projected data bar */}
              <Bar 
                data={projectedData}
                dataKey="value" 
                name="Projected" 
                fill="#FF8042" 
              />
            </BarChart>
          </ResponsiveContainer>
        );
      }
    }
    
    // For project insights
    else if (currentInsight.type === 'project') {
      if (visualizationType === 'radar' || visualizationType === 'default') {
        // Group data by project
        const projects = Array.from(new Set(currentInsight.data.map((item: any) => item.project)));
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={
              // Filter to only include the first project's data for subjects
              currentInsight.data.filter((item: any) => item.project === projects[0])
            }>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              
              {projects.map((project, index) => (
                <Radar 
                  key={String(project)} 
                  name={String(project)} 
                  dataKey="value" 
                  stroke={COLORS[index % COLORS.length]} 
                  fill={COLORS[index % COLORS.length]} 
                  fillOpacity={0.6}
                />
              ))}
              
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );
      } else if (visualizationType === 'bar') {
        // Transform data for grouped bar chart
        const subjects = Array.from(new Set(currentInsight.data.map((item: any) => item.subject)));
        const projects = Array.from(new Set(currentInsight.data.map((item: any) => item.project)));
        
        const transformedData = subjects.map(subject => {
          const result: any = { subject };
          projects.forEach((project, index) => {
            const item = currentInsight.data.find((d: any) => d.subject === subject && d.project === project);
            if (item) {
              // Use fixed property names with index to avoid dynamic string keys
              result[`project_${index}`] = item.value;
              // Store the project name separately for the legend
              result[`projectName_${index}`] = String(project);
            }
          });
          return result;
        });
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={transformedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip formatter={(value, name, props) => {
                // Ensure name is a string before calling split
                const nameStr = String(name);
                // Extract the project index from the dataKey (e.g., "project_0")
                const index = nameStr.split('_')[1];
                // Get the actual project name for display
                const projectName = props.payload[`projectName_${index}`];
                return [value, projectName];
              }} />
              <Legend formatter={(value, entry) => {
                // Ensure value is a string before calling split
                const valueStr = String(value);
                // Extract the project index from the dataKey
                const parts = valueStr.split('_');
                if (parts[0] === 'project' && parts.length > 1) {
                  const index = parts[1];
                  // Return the first item's corresponding project name for the legend
                  return transformedData[0][`projectName_${index}`] || valueStr;
                }
                return valueStr;
              }} />
              {projects.map((_, index) => (
                <Bar 
                  key={`project_${index}`} 
                  dataKey={`project_${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      }
    }
    
    // Default fallback visualization
    return (
      <div className="flex items-center justify-center h-80 border rounded-md">
        <div className="text-center text-muted-foreground">
          <BarChart2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a visualization type to display insights</p>
        </div>
      </div>
    );
  };

  // Get available visualization types for the current insight
  const getAvailableVisualizations = () => {
    if (!currentInsight) {
      return [{ value: 'default', label: 'Default Visualization' }];
    }
    
    switch (currentInsight.type) {
      case 'budget':
        return [
          { value: 'default', label: 'Bar Chart (Default)' },
          { value: 'pie', label: 'Pie Chart' },
          { value: 'treemap', label: 'Treemap' }
        ];
      case 'risk':
        return [
          { value: 'default', label: 'Scatter Plot (Default)' },
          { value: 'bar', label: 'Bar Chart' }
        ];
      case 'trend':
        return [
          { value: 'default', label: 'Line Chart (Default)' },
          { value: 'bar', label: 'Bar Chart' }
        ];
      case 'project':
        return [
          { value: 'default', label: 'Radar Chart (Default)' },
          { value: 'bar', label: 'Bar Chart' }
        ];
      default:
        return [
          { value: 'default', label: 'Default Visualization' }
        ];
    }
  };

  // Priority badge renderer
  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="default">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return null;
    }
  };

  // Get icon for insight type
  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'budget':
        return <PieChartIcon className="h-4 w-4 mr-1" />;
      case 'risk':
        return <AlertCircle className="h-4 w-4 mr-1" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4 mr-1" />;
      case 'project':
        return <Grid3X3 className="h-4 w-4 mr-1" />;
      default:
        return <Lightbulb className="h-4 w-4 mr-1" />;
    }
  };

  // Export visualization as image
  const exportAsImage = async () => {
    if (!visualizationRef.current) return;
    
    try {
      setLoading(true);
      
      // Export visualization using native browser capabilities
      const exportVisualization = async () => {
        try {
          if (!visualizationRef.current) return null;
          
          const svg = visualizationRef.current.querySelector('svg');
          if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            // Set canvas dimensions
            canvas.width = svg.clientWidth;
            canvas.height = svg.clientHeight;
            
            // Create a data URL
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            
            return new Promise<string>((resolve, reject) => {
              img.onload = () => {
                if (ctx) {
                  ctx.drawImage(img, 0, 0);
                  const dataUrl = canvas.toDataURL('image/png');
                  URL.revokeObjectURL(url);
                  resolve(dataUrl);
                } else {
                  reject(new Error("Could not get canvas context"));
                }
              };
              img.onerror = reject;
              img.src = url;
            });
          }
          return null;
        } catch (err) {
          console.error("Export failed:", err);
          return null;
        }
      };
      
      const dataUrl = await exportVisualization();
      
      if (dataUrl) {
        // Create link and trigger download
        const link = document.createElement('a');
        link.download = `${currentInsight.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = dataUrl;
        link.click();
        
        toast.success("Visualization has been exported as an image.");
      } else {
        throw new Error("Failed to export image");
      }
    } catch (error) {
      console.error('Error exporting image:', error);
      toast.error("There was an error exporting the visualization.");
    } finally {
      setLoading(false);
    }
  };

  // Share visualization
  const shareVisualization = async () => {
    // Could implement actual sharing functionality with a share API
    // For now just copy a message to clipboard
    try {
      await navigator.clipboard.writeText(
        `Check out this insight: ${currentInsight.title} - ${currentInsight.description}`
      );
      
      toast.success("Link copied to clipboard. Ready to share!");
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error("There was an error sharing the visualization.");
    }
  };

  // Download data
  const downloadData = () => {
    try {
      // Convert the data to JSON string
      const dataStr = JSON.stringify(currentInsight.data, null, 2);
      
      // Create a blob and download
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `${currentInsight.title.replace(/\s+/g, '-').toLowerCase()}-data.json`;
      link.href = url;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      
      toast.success("Data has been downloaded as JSON.");
    } catch (error) {
      console.error('Error downloading data:', error);
      toast.error("There was an error downloading the data.");
    }
  };

  // Render the actual component
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">AI Insight Visualizer</h2>
          <p className="text-muted-foreground">
            Interactive visualizations to explore AI-generated insights
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Insight selection sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Available Insights</CardTitle>
              <CardDescription>
                Select an insight to visualize
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.map(insight => (
                  <div 
                    key={insight.id} 
                    className={`
                      p-3 rounded-md cursor-pointer transition-colors
                      ${effectiveSelectedInsightId === insight.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted'}
                    `}
                    onClick={() => {
                      handleSelectInsight(insight.id);
                      setVisualizationType('default');
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm font-medium">
                        {getInsightTypeIcon(insight.type)}
                        {insight.title}
                      </div>
                      {renderPriorityBadge(insight.priority)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {insight.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <div className="text-xs text-muted-foreground">
                {insights.length} insights available
              </div>
              <Button variant="outline" size="sm">
                <Zap className="h-4 w-4 mr-1" />
                Generate More
              </Button>
            </CardFooter>
          </Card>

          {/* Visualization controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Visualization Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Visualization Type
                </label>
                <Select 
                  value={visualizationType} 
                  onValueChange={setVisualizationType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visualization type" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableVisualizations().map(viz => (
                      <SelectItem key={viz.value} value={viz.value}>
                        {viz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={shareVisualization}
                  disabled={loading}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Visualization
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={exportAsImage}
                  disabled={loading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as Image
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={downloadData}
                  disabled={loading}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Download Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main visualization area */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{currentInsight.title}</CardTitle>
                  <CardDescription>{currentInsight.description}</CardDescription>
                </div>
                {renderPriorityBadge(currentInsight.priority)}
              </div>
            </CardHeader>
            <CardContent ref={visualizationRef}>
              {renderVisualization()}
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="w-full">
                <div className="text-sm mb-4">
                  <strong>Key Insights:</strong>
                  {currentInsight.type === 'budget' && (
                    <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
                      <li>Infrastructure spending should be increased by 7% for optimal resource allocation</li>
                      <li>Education and Social Welfare budgets can be reduced while maintaining service quality</li>
                      <li>Administrative costs should be minimized to focus on direct community services</li>
                    </ul>
                  )}
                  {currentInsight.type === 'risk' && (
                    <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
                      <li>Water System project has the highest risk level (80%) and needs immediate attention</li>
                      <li>Health Center project has significant risk (60%) combined with low progress (30%)</li>
                      <li>Road Repair project is progressing well with minimal risk</li>
                    </ul>
                  )}
                  {currentInsight.type === 'trend' && (
                    <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
                      <li>Monthly expenditure shows consistent growth, with projected 38% increase by year-end</li>
                      <li>Seasonal fluctuations align with project implementation schedules</li>
                      <li>Budget planning should account for accelerated spending in Q4</li>
                    </ul>
                  )}
                  {currentInsight.type === 'project' && (
                    <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
                      <li>Road Repair shows strong performance across most dimensions, particularly in Resource Allocation</li>
                      <li>Health Center needs improvement in Timeline Adherence (55%) and Budget Utilization (60%)</li>
                      <li>Both projects could benefit from enhanced Risk Management practices</li>
                    </ul>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <div>
                    Generated on {new Date(currentInsight.createdAt).toLocaleString()}
                  </div>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Get More AI Analysis
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Custom content for Treemap
const CustomizedContent = (props: any) => {
  const { root, depth, x, y, width, height, index, colors, name, difference } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? colors[Math.floor(index / 2) % colors.length] : 'none',
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {depth === 1 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 7}
            textAnchor="middle"
            fill="#fff"
            fontSize={14}
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 7}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
          >
            {`${props.value}%`}
          </text>
          {props.difference && (
            <text
              x={x + width / 2}
              y={y + height / 2 + 20}
              textAnchor="middle"
              fill={props.difference > 0 ? '#4caf50' : '#f44336'}
              fontSize={10}
            >
              {`${props.difference > 0 ? '+' : ''}${props.difference}%`}
            </text>
          )}
        </>
      )}
    </g>
  );
}; 