"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, LineChart, PieChart, TrendingUp, Activity, Search, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { PerformanceDashboard } from '@/components/ai/PerformanceDashboard';

export default function PerformanceAnalyticsPage() {
  return (
    <div className="container p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          Performance Analytics
        </h1>
        <p className="text-muted-foreground">
          Track, analyze, and benchmark AI model performance across your system
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <PerformanceDashboard />
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Benchmarks</CardTitle>
              <CardDescription>
                Compare model performance against standard benchmarks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Select a model to view its performance against standard benchmarks.
                This helps you understand how your models perform relative to established standards.
              </p>
              <div className="mt-4">
                <Select>
                  <SelectTrigger className="w-full md:w-80">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document-intelligence">Document Intelligence</SelectItem>
                    <SelectItem value="advisor">AI Advisor</SelectItem>
                    <SelectItem value="recommendation-engine">Recommendation Engine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Accuracy Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Select a model to view benchmarks</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Select a model to view benchmarks</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Period Comparison</CardTitle>
              <CardDescription>
                Compare model performance across different time periods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Period 1</h4>
                  <DateRangePicker />
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Period 2</h4>
                  <DateRangePicker />
                </div>
              </div>
              <div className="mt-6">
                <Select>
                  <SelectTrigger className="w-full md:w-80">
                    <SelectValue placeholder="Select model to compare" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Models</SelectItem>
                    <SelectItem value="document-intelligence">Document Intelligence</SelectItem>
                    <SelectItem value="advisor">AI Advisor</SelectItem>
                    <SelectItem value="recommendation-engine">Recommendation Engine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-6">
                <Button>Generate Comparison</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 