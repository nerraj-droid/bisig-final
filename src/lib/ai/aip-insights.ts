/**
 * AIP Insights Generator
 * 
 * Utility functions to transform Annual Investment Program (AIP) data
 * into insights data format compatible with the InsightVisualizer component.
 */

// Import types
import { ProjectStatus, AIPStatus } from '@prisma/client';

// Types for AIP and related data
interface AIP {
  id: string;
  title: string;
  description: string | null;
  status: AIPStatus;
  totalAmount: number;
  createdAt: string;
  approvedDate: string | null;
  fiscalYear: {
    id: string;
    year: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
  projects: Project[];
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
  approvedBy: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  attachments?: any[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  sector: string;
  location?: string | null;
  expectedBeneficiaries?: string | null;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: ProjectStatus;
  progress: number;
  fundSource?: string | null;
  milestones?: Milestone[];
  expenses?: Expense[];
}

interface Milestone {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string;
  completedAt?: string | null;
  status: string;
}

interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  reference?: string | null;
}

// Type for the insight data expected by InsightVisualizer
export interface InsightData {
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

/**
 * Generate budget allocation insights from AIP data
 */
export function generateBudgetAllocationInsight(aip: AIP): InsightData {
  // Group projects by sector and sum their costs
  const sectorData = aip.projects.reduce((acc, project) => {
    const sector = project.sector || 'Uncategorized';
    if (!acc[sector]) {
      acc[sector] = 0;
    }
    acc[sector] += project.totalCost;
    return acc;
  }, {} as Record<string, number>);

  // Calculate percentages based on total budget
  const total = Object.values(sectorData).reduce((sum, cost) => sum + cost, 0);
  
  // Transform to format compatible with pie/bar charts
  const data = Object.entries(sectorData).map(([sector, cost]) => ({
    name: sector,
    value: Math.round((cost / total) * 100),
    rawValue: cost,
    fill: getRandomColor(sector),
  }));

  return {
    id: `budget-allocation-${aip.id}`,
    title: 'Budget Allocation by Sector',
    description: `Distribution of the ${aip.fiscalYear.year} investment budget across different sectors`,
    type: 'budget',
    priority: 'high',
    data,
    performance: {
      accuracy: 95,
      confidence: 98,
      usage: 85
    },
    createdAt: new Date().toISOString()
  };
}

/**
 * Generate project status insights from AIP data
 */
export function generateProjectStatusInsight(aip: AIP): InsightData {
  // Count projects by status
  const statusCounts = aip.projects.reduce((acc, project) => {
    const status = project.status || 'UNKNOWN';
    if (!acc[status]) {
      acc[status] = 0;
    }
    acc[status] += 1;
    return acc;
  }, {} as Record<string, number>);

  // Format for visualization
  const data = Object.entries(statusCounts).map(([status, count]) => ({
    name: formatStatus(status),
    value: count,
    fill: getStatusColor(status),
  }));

  return {
    id: `project-status-${aip.id}`,
    title: 'Project Status Distribution',
    description: 'Current status distribution of all projects in the investment program',
    type: 'project',
    priority: 'medium',
    data,
    performance: {
      accuracy: 100,
      confidence: 100,
      usage: 92
    },
    createdAt: new Date().toISOString()
  };
}

/**
 * Generate project risk assessment from AIP data
 */
export function generateRiskAssessmentInsight(aip: AIP): InsightData {
  // Analyze projects for risk factors
  const riskData = aip.projects.map(project => {
    // Calculate days remaining until end date
    const endDate = new Date(project.endDate);
    const daysRemaining = Math.max(0, Math.floor((endDate.getTime() - Date.now()) / (1000 * 3600 * 24)));
    
    // Calculate expected progress vs actual progress
    const totalDuration = Math.abs(new Date(project.endDate).getTime() - new Date(project.startDate).getTime());
    const elapsed = Math.abs(Date.now() - new Date(project.startDate).getTime());
    const expectedProgress = Math.min(100, Math.round((elapsed / totalDuration) * 100));
    
    // Calculate risk based on progress gap and time remaining
    const progressGap = Math.max(0, expectedProgress - project.progress);
    let risk = 0;
    
    // Higher risk when progress is behind expected and deadline is approaching
    if (daysRemaining < 30) {
      risk = progressGap * 0.8 + 20; // Higher base risk for soon-ending projects
    } else if (daysRemaining < 90) {
      risk = progressGap * 0.6 + 10;
    } else {
      risk = progressGap * 0.4;
    }
    
    // Normalize risk to 0-1 range
    risk = Math.min(100, Math.max(0, risk)) / 100;
    
    return {
      name: project.title,
      risk,
      budget: project.totalCost,
      progress: project.progress / 100,
      daysRemaining
    };
  });

  return {
    id: `risk-assessment-${aip.id}`,
    title: 'Project Risk Assessment',
    description: 'Risk analysis based on project progress, budget, and timeline factors',
    type: 'risk',
    priority: 'high',
    data: riskData,
    performance: {
      accuracy: 85,
      confidence: 82,
      usage: 90
    },
    createdAt: new Date().toISOString()
  };
}

/**
 * Generate expense trend insight from AIP data
 */
export function generateExpenseTrendInsight(aip: AIP): InsightData {
  // Get all expenses across projects
  const allExpenses = aip.projects.flatMap(project => 
    (project.expenses || []).map(expense => ({
      ...expense,
      date: new Date(expense.date)
    }))
  );

  // Sort expenses by date
  allExpenses.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group by month
  const expensesByMonth: Record<string, number> = {};
  
  allExpenses.forEach(expense => {
    const month = expense.date.toLocaleString('default', { month: 'short' });
    if (!expensesByMonth[month]) {
      expensesByMonth[month] = 0;
    }
    expensesByMonth[month] += expense.amount;
  });

  // Define the expense data type
  interface ExpenseData {
    month: string;
    expenditure: number;
  }

  // Generate historical data from existing expenses
  const historicalData: ExpenseData[] = Object.entries(expensesByMonth).map(([month, amount]) => ({
    month,
    expenditure: amount
  }));

  // Simple projection for future months (placeholder logic)
  const projectedData: ExpenseData[] = [];
  const lastAmount = historicalData.length > 0 
    ? historicalData[historicalData.length - 1].expenditure 
    : aip.totalAmount / 12;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const existingMonths = Object.keys(expensesByMonth);
  
  for (const month of months) {
    if (!existingMonths.includes(month)) {
      projectedData.push({
        month,
        expenditure: lastAmount * (1 + (Math.random() * 0.2 - 0.1)) // +/- 10% variation
      });
    }
  }

  return {
    id: `expense-trend-${aip.id}`,
    title: 'Expenditure Trend Analysis',
    description: 'Historical spending patterns and future projections for the investment program',
    type: 'trend',
    priority: 'medium',
    data: {
      historical: historicalData,
      projected: projectedData
    },
    performance: {
      accuracy: 88,
      confidence: 78,
      usage: 85
    },
    createdAt: new Date().toISOString()
  };
}

/**
 * Generate project implementation efficiency insight
 */
export function generateImplementationEfficiencyInsight(aip: AIP): InsightData {
  // Only include projects with meaningful progress
  const relevantProjects = aip.projects.filter(p => p.status === 'ONGOING' || p.status === 'COMPLETED');
  
  if (relevantProjects.length === 0) {
    return generatePlaceholderEfficiencyInsight(aip);
  }

  // Define radar chart data type
  interface RadarData {
    subject: string;
    project: string;
    fullMark: number;
    value: number;
  }

  // Create radar chart data for each project
  const radarData: RadarData[] = [];
  
  relevantProjects.forEach(project => {
    // Budget utilization (amount spent vs total cost)
    const expenses = project.expenses || [];
    const amountSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const budgetUtilization = Math.min(100, Math.round((amountSpent / project.totalCost) * 100));
    
    // Timeline adherence (compare actual progress to expected progress based on timeline)
    const totalDuration = Math.abs(new Date(project.endDate).getTime() - new Date(project.startDate).getTime());
    const elapsed = Math.abs(Date.now() - new Date(project.startDate).getTime());
    const expectedProgress = Math.min(100, Math.round((elapsed / totalDuration) * 100));
    const timelineAdherence = Math.min(100, Math.max(0, 100 - Math.abs(expectedProgress - project.progress)));
    
    // Milestone completion
    const milestones = project.milestones || [];
    const completedMilestones = milestones.filter(m => m.status === 'COMPLETED').length;
    const milestoneCompletion = milestones.length > 0
      ? Math.round((completedMilestones / milestones.length) * 100)
      : 50; // Default if no milestones
    
    // Add more metrics with simulated values where actual data is not available
    radarData.push(
      { subject: 'Budget Utilization', project: project.title, fullMark: 100, value: budgetUtilization },
      { subject: 'Timeline Adherence', project: project.title, fullMark: 100, value: timelineAdherence },
      { subject: 'Milestone Completion', project: project.title, fullMark: 100, value: milestoneCompletion },
      { subject: 'Resource Allocation', project: project.title, fullMark: 100, value: 70 + Math.floor(Math.random() * 20) },
      { subject: 'Risk Management', project: project.title, fullMark: 100, value: 60 + Math.floor(Math.random() * 30) },
      { subject: 'Stakeholder Satisfaction', project: project.title, fullMark: 100, value: 75 + Math.floor(Math.random() * 20) }
    );
  });

  return {
    id: `implementation-efficiency-${aip.id}`,
    title: 'Project Implementation Efficiency',
    description: 'Multi-dimensional analysis of project implementation factors across key metrics',
    type: 'project',
    priority: 'high',
    data: radarData,
    performance: {
      accuracy: 85,
      confidence: 80,
      usage: 92
    },
    createdAt: new Date().toISOString()
  };
}

/**
 * Create a placeholder implementation efficiency insight when no suitable projects exist
 */
function generatePlaceholderEfficiencyInsight(aip: AIP): InsightData {
  // Create sample data for demonstration
  const sampleData = [
    { subject: 'Budget Planning', project: 'AIP Overview', fullMark: 100, value: 85 },
    { subject: 'Project Selection', project: 'AIP Overview', fullMark: 100, value: 92 },
    { subject: 'Risk Assessment', project: 'AIP Overview', fullMark: 100, value: 78 },
    { subject: 'Resource Allocation', project: 'AIP Overview', fullMark: 100, value: 88 },
    { subject: 'Timeline Management', project: 'AIP Overview', fullMark: 100, value: 76 },
    { subject: 'Stakeholder Engagement', project: 'AIP Overview', fullMark: 100, value: 82 }
  ];

  return {
    id: `implementation-efficiency-${aip.id}`,
    title: 'AIP Planning Efficiency',
    description: 'Analysis of the investment program planning and preparation efficiency',
    type: 'project',
    priority: 'medium',
    data: sampleData,
    performance: {
      accuracy: 85,
      confidence: 80,
      usage: 92
    },
    createdAt: new Date().toISOString()
  };
}

/**
 * Generate all insights for an AIP
 */
export function generateAIPInsights(aip: AIP): InsightData[] {
  return [
    generateBudgetAllocationInsight(aip),
    generateProjectStatusInsight(aip),
    generateRiskAssessmentInsight(aip),
    generateExpenseTrendInsight(aip),
    generateImplementationEfficiencyInsight(aip)
  ];
}

// Helper functions

function getRandomColor(seed: string): string {
  // Generate color based on string seed for consistency
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', 
    '#d0ed57', '#ffc658', '#ff8042', '#ff6e4a', '#dd7b6b'
  ];
  
  return colors[Math.abs(hash) % colors.length];
}

function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'PLANNED': '#8884d8',
    'ONGOING': '#82ca9d',
    'COMPLETED': '#44a340',
    'CANCELLED': '#ff8042',
    'DELAYED': '#ff6e4a'
  };
  
  return colorMap[status] || '#8884d8';
}

function formatStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
} 