import { Metadata } from 'next';
import { DocumentIntelligence } from '@/components/aip/DocumentIntelligence';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, BookOpen, BrainCircuit, Library } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Document Intelligence | AI Tools',
  description: 'Analyze documents using AI to extract key information and insights',
};

export default function DocumentIntelligencePage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Document Intelligence</h1>
        <p className="text-muted-foreground">
          Extract insights, summarize content, and get recommendations from project documents.
        </p>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Automated Analysis</CardTitle>
              <CardDescription>
                Extract key information from documents automatically
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our AI analyzes document content to identify important entities like dates, 
              amounts, organizations, and more. You'll get a structured view of key information
              without having to manually scan through lengthy documents.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Smart Summarization</CardTitle>
              <CardDescription>
                Get concise summaries of lengthy documents
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The AI extracts the most important sentences to create a meaningful summary 
              of your document. Perfect for quickly understanding the main points without 
              having to read everything in detail.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Intelligent Recommendations</CardTitle>
              <CardDescription>
                Get context-aware suggestions based on document content
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Receive tailored recommendations and action items based on the document type 
              and content. The system identifies relevant next steps to help you take 
              appropriate action on each document.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Library className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Thematic Analysis</CardTitle>
              <CardDescription>
                Identify key topics and themes in your documents
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The AI detects and extracts key topics in your documents, allowing you to 
              see at a glance what themes are covered. It also identifies important phrases
              and contextual sentiments to provide a complete understanding.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Document Analysis Tool</CardTitle>
          <CardDescription>
            Paste document content or upload a document to analyze
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentIntelligence />
        </CardContent>
      </Card>
    </div>
  );
} 