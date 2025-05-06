import { NextRequest, NextResponse } from 'next/server';
import { 
  generateSystemPerformanceSummary, 
  getModelPerformanceMetrics,
  comparePerformancePeriods,
  getModelBenchmarks
} from '@/lib/ai/analytics/performance-metrics';

/**
 * Performance metrics API
 * 
 * Provides endpoints for accessing and analyzing AI model performance metrics
 */
export async function GET(request: NextRequest) {
  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const modelId = searchParams.get('modelId');
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  
  try {
    // Handle different action types
    switch (action) {
      case 'system-summary':
        // Get system-wide performance summary
        const summary = await generateSystemPerformanceSummary(startDate, endDate);
        return NextResponse.json(summary);
        
      case 'model-metrics':
        // Get metrics for a specific model
        if (!modelId) {
          return NextResponse.json(
            { error: 'modelId parameter is required for model-metrics action' },
            { status: 400 }
          );
        }
        
        const metrics = await getModelPerformanceMetrics(modelId, startDate, endDate);
        return NextResponse.json({ modelId, metrics });
        
      case 'period-comparison':
        // Compare two time periods
        const period1Start = searchParams.get('period1Start');
        const period1End = searchParams.get('period1End');
        const period2Start = searchParams.get('period2Start');
        const period2End = searchParams.get('period2End');
        
        if (!period1Start || !period1End || !period2Start || !period2End) {
          return NextResponse.json(
            { error: 'period1Start, period1End, period2Start, and period2End parameters are required for period-comparison action' },
            { status: 400 }
          );
        }
        
        const comparison = await comparePerformancePeriods(
          period1Start,
          period1End,
          period2Start,
          period2End
        );
        
        return NextResponse.json(comparison);
        
      case 'model-benchmarks':
        // Get benchmarks for a specific model
        if (!modelId) {
          return NextResponse.json(
            { error: 'modelId parameter is required for model-benchmarks action' },
            { status: 400 }
          );
        }
        
        const benchmarks = await getModelBenchmarks(modelId);
        return NextResponse.json({ modelId, benchmarks });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Supported actions: system-summary, model-metrics, period-comparison, model-benchmarks' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing performance metrics request:', error);
    return NextResponse.json(
      { error: 'Failed to process performance metrics request' },
      { status: 500 }
    );
  }
}

/**
 * Record benchmark data endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.action) {
      return NextResponse.json(
        { error: 'Missing required field: action' },
        { status: 400 }
      );
    }
    
    // Currently only record-metric and record-benchmark actions are supported
    if (body.action !== 'record-metric' && body.action !== 'record-benchmark') {
      return NextResponse.json(
        { error: 'Invalid action. Supported actions: record-metric, record-benchmark' },
        { status: 400 }
      );
    }
    
    // Handle action based on type
    if (body.action === 'record-benchmark') {
      // Validate benchmark data
      if (!body.modelId || !body.benchmarkData) {
        return NextResponse.json(
          { error: 'Missing required fields for record-benchmark: modelId, benchmarkData' },
          { status: 400 }
        );
      }
      
      // Record benchmark data
      await import('@/lib/ai/analytics/performance-metrics').then(module => {
        return module.recordModelBenchmark(body.modelId, body.benchmarkData);
      });
      
      return NextResponse.json({ success: true });
    } else if (body.action === 'record-metric') {
      // Validate metric data
      if (!body.metric || !body.metric.modelId || !body.metric.operation) {
        return NextResponse.json(
          { error: 'Missing required fields for record-metric: metric.modelId, metric.operation' },
          { status: 400 }
        );
      }
      
      // Ensure timestamp is present
      if (!body.metric.timestamp) {
        body.metric.timestamp = new Date().toISOString();
      }
      
      // Record performance metric
      await import('@/lib/ai/analytics/performance-metrics').then(module => {
        return module.recordPerformanceMetric(body.metric);
      });
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording benchmark data:', error);
    return NextResponse.json(
      { error: 'Failed to record benchmark data' },
      { status: 500 }
    );
  }
} 