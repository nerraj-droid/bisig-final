'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check, Copy, File, FileText, Tag, Upload, X } from 'lucide-react';
import { toast } from "sonner";
import { FeedbackMechanism } from '@/components/ai/FeedbackMechanism';

interface DocumentAnalysisResult {
  documentId: string;
  documentType: string;
  extractedEntities: {
    entity: string;
    type: string;
    confidence: number;
    value: string;
  }[];
  keyPhrases: {
    phrase: string;
    importance: number;
  }[];
  summary: string;
  topics: {
    topic: string;
    relevance: number;
  }[];
  sentimentScore: number;
}

interface DocumentRecommendations {
  classification: string;
  tags: string[];
  relatedDocuments: string[];
  actionItems: string[];
}

interface DocumentIntelligenceProps {
  projectId?: string;
  onAnalysisComplete?: (analysis: any) => void;
}

export function DocumentIntelligence({ projectId, onAnalysisComplete }: DocumentIntelligenceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [documentContent, setDocumentContent] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [recommendations, setRecommendations] = useState<DocumentRecommendations | null>(null);
  const [activeTab, setActiveTab] = useState('content');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeDocument = async () => {
    if (!documentContent.trim() || !documentTitle.trim()) {
      toast.error("Missing information", {
        description: "Please provide both document title and content"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Generate a document ID if none exists
      const docId = documentId || `doc-${Date.now()}`;
      setDocumentId(docId);
      
      // Call the document intelligence API endpoint
      const response = await fetch('/api/ai/document-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: docId,
          content: documentContent,
          projectId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      
      setAnalysisResult(result.documentAnalysis);
      setRecommendations(result.recommendations);
      setActiveTab('analysis');
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
      
      toast.success("Analysis complete", {
        description: "Document successfully analyzed"
      });
    } catch (error) {
      console.error("Error analyzing document:", error);
      toast.error("Analysis failed", {
        description: "An error occurred while analyzing the document"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearDocument = () => {
    setDocumentContent('');
    setDocumentTitle('');
    setAnalysisResult(null);
    setRecommendations(null);
    setActiveTab('content');
    setUploadedFile(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard", {
      description: "Text has been copied to your clipboard"
    });
  };

  // File upload handlers
  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processFile = async (file: File) => {
    // Check file type
    const validTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/msword', // doc
      'text/plain',
      'application/rtf',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload a PDF, Word document, or text file."
      });
      return;
    }
    
    // Set file and extract title from filename
    setUploadedFile(file);
    const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    if (!documentTitle) {
      setDocumentTitle(fileName);
    }
    
    // Extract text content from file
    setIsExtracting(true);
    try {
      let content = "";
      
      if (file.type === 'text/plain' || file.type === 'text/csv') {
        // For text files, read directly in the browser
        content = await readTextFile(file);
      } else {
        // For other document types, use the document parser API
        content = await extractTextFromDocument(file);
      }
      
      setDocumentContent(content);
      toast.success("File processed", {
        description: "Document content extracted successfully"
      });
    } catch (error) {
      console.error("Error extracting text:", error);
      toast.error("Extraction failed", {
        description: "Could not extract text from the document"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // For text files, process in the browser using FileReader
  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = (e) => {
        reject(new Error("Error reading file"));
      };
      reader.readAsText(file);
    });
  };

  // For PDFs, DOCXs, etc., send to the document parser API
  const extractTextFromDocument = async (file: File): Promise<string> => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Call document parser API
      const response = await fetch('/api/ai/document-parser', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Server responded with status ${response.status}`;
        console.error("Document parser error:", errorMessage);
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      // Check if the result includes a notification message (for disabled features)
      if (result.text && (result.text.includes('[PDF parsing is temporarily disabled') || 
                          result.text.includes('[DOCX parsing is temporarily disabled'))) {
        // Display info toast for placeholder content
        toast.info("Limited document processing", {
          description: "Full document parsing is temporarily disabled. See extracted content for details."
        });
      }
      
      return result.text;
    } catch (error) {
      console.error("Error calling document parser API:", error);
      throw new Error("Failed to extract text from document");
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    // Optionally clear the document content if it was from the file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Function to generate sentiment color based on score
  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return "text-green-500";
    if (score >= 0.4) return "text-amber-500";
    return "text-red-500";
  };

  // Function to map sentiment score to text
  const getSentimentText = (score: number) => {
    if (score >= 0.7) return "Positive";
    if (score >= 0.4) return "Neutral";
    return "Negative";
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content">Document Content</TabsTrigger>
          <TabsTrigger 
            value="analysis"
            disabled={!analysisResult}
          >
            Analysis Results
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Analysis</CardTitle>
              <CardDescription>
                Upload or paste document content for intelligent analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document-title">Document Title</Label>
                <input
                  id="document-title"
                  placeholder="Enter document title"
                  className="w-full p-2 border rounded-md"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                />
              </div>
              
              {/* File upload area */}
              <div className="space-y-2">
                <Label>Upload Document (Optional)</Label>
                <div 
                  className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.docx,.doc,.txt,.rtf,.csv"
                  />
                  
                  {uploadedFile ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <File className="h-8 w-8 text-primary mr-2" />
                        <div>
                          <p className="text-sm font-medium">{uploadedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Drag & drop your document here</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports PDF, Word documents, and text files
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Browse Files
                      </Button>
                    </>
                  )}
                </div>
                {isExtracting && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="animate-spin mr-2">
                      <Upload size={14} />
                    </div>
                    Extracting text from document...
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="document-content">Document Content</Label>
                <Textarea
                  id="document-content"
                  placeholder="Paste document content here..."
                  className="min-h-[200px]"
                  value={documentContent}
                  onChange={(e) => setDocumentContent(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={clearDocument}
                disabled={isLoading || (!documentContent && !documentTitle && !uploadedFile)}
              >
                Clear
              </Button>
              <Button 
                onClick={analyzeDocument} 
                disabled={isLoading || isExtracting || !documentContent || !documentTitle}
              >
                {isLoading ? "Analyzing..." : "Analyze Document"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-4">
          {analysisResult && recommendations && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{documentTitle}</CardTitle>
                      <CardDescription>
                        <Badge className="mr-2">{analysisResult.documentType.toUpperCase()}</Badge>
                        Sentiment: <span className={getSentimentColor(analysisResult.sentimentScore)}>
                          {getSentimentText(analysisResult.sentimentScore)}
                        </span>
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab('content')}
                    >
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-md font-semibold mb-2">Summary</h3>
                    <div className="p-3 bg-muted rounded-md relative pr-10">
                      <p>{analysisResult.summary}</p>
                      <button 
                        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                        onClick={() => copyToClipboard(analysisResult.summary)}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-semibold mb-2">Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.topics.map((topic, index) => (
                        <Badge 
                          key={index} 
                          variant={topic.relevance > 0.7 ? "default" : "outline"}
                          className="flex items-center gap-1"
                        >
                          <span>{topic.topic}</span>
                          <span className="text-xs opacity-70">{Math.round(topic.relevance * 100)}%</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Phrases</CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-[300px] overflow-y-auto">
                    <ul className="space-y-2">
                      {analysisResult.keyPhrases.map((phrase, index) => (
                        <li key={index} className="p-2 border rounded-md">
                          <div className="flex items-start justify-between">
                            <p className="text-sm">{phrase.phrase}</p>
                            <Badge 
                              variant="outline" 
                              className="ml-2 shrink-0"
                            >
                              {Math.round(phrase.importance * 100)}%
                            </Badge>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Extracted Entities</CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-[300px] overflow-y-auto">
                    <ul className="space-y-2">
                      {analysisResult.extractedEntities.map((entity, index) => (
                        <li key={index} className="p-2 border rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <Badge variant="outline" className="mr-2">
                                {entity.type}
                              </Badge>
                              <span className="font-medium">{entity.entity}</span>
                            </div>
                            <Badge>
                              {Math.round(entity.confidence * 100)}%
                            </Badge>
                          </div>
                          {entity.value !== entity.entity && (
                            <p className="text-xs text-muted-foreground">
                              Normalized: {entity.value}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Classification</h3>
                    <Badge className="mr-2" variant="default">
                      {recommendations.classification}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Suggested Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {recommendations.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          <Tag size={12} />
                          <span>{tag}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Action Items</h3>
                    <ul className="space-y-2">
                      {recommendations.actionItems.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <Check size={16} className="mr-2 text-green-500 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Feedback Mechanism */}
              <div className="mt-6">
                <FeedbackMechanism 
                  modelId="document-intelligence"
                  predictionId={documentId}
                  context="document-analysis"
                />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Function to generate mock analysis result based on input text
function generateMockAnalysis(documentId: string, content: string) {
  // This would be replaced by actual API call in production
  const contentLower = content.toLowerCase();
  
  // Determine document type based on content keywords
  let documentType = 'other';
  if (contentLower.includes('proposal') || contentLower.includes('plan')) {
    documentType = 'proposal';
  } else if (contentLower.includes('report') || contentLower.includes('summary')) {
    documentType = 'report';
  } else if (contentLower.includes('budget') || contentLower.includes('financial')) {
    documentType = 'financial';
  } else if (contentLower.includes('agreement') || contentLower.includes('contract')) {
    documentType = 'contract';
  }
  
  // Extract potential entities (simplified for demonstration)
  const extractedEntities: Array<{
    entity: string;
    type: string;
    confidence: number;
    value: string;
  }> = [];
  
  // Look for dates
  const dateMatches = content.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/g) || [];
  for (const match of dateMatches) {
    extractedEntities.push({
      entity: match,
      type: 'date',
      confidence: 0.9,
      value: match
    });
  }
  
  // Look for amounts
  const amountMatches = content.match(/₱\s*\d+(?:,\d{3})*(?:\.\d{2})?/g) || [];
  for (const match of amountMatches) {
    extractedEntities.push({
      entity: match,
      type: 'amount',
      confidence: 0.85,
      value: match.replace(/[₱\s,]/g, '')
    });
  }
  
  // Generate mock key phrases
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const keyPhrases = sentences.slice(0, 5).map((sentence, i) => ({
    phrase: sentence.trim(),
    importance: Math.max(0.3, 0.9 - (i * 0.1))
  }));
  
  // Generate mock topics
  const topics: Array<{ topic: string; relevance: number }> = [];
  if (contentLower.includes('road') || contentLower.includes('bridge') || contentLower.includes('construction')) {
    topics.push({ topic: 'infrastructure', relevance: 0.9 });
  }
  if (contentLower.includes('health') || contentLower.includes('medical') || contentLower.includes('patient')) {
    topics.push({ topic: 'health', relevance: 0.85 });
  }
  if (contentLower.includes('school') || contentLower.includes('education') || contentLower.includes('student')) {
    topics.push({ topic: 'education', relevance: 0.8 });
  }
  if (contentLower.includes('environment') || contentLower.includes('waste') || contentLower.includes('pollution')) {
    topics.push({ topic: 'environment', relevance: 0.75 });
  }
  
  // If no specific topics were found, add a generic one
  if (topics.length === 0) {
    topics.push({ topic: 'general', relevance: 0.6 });
  }
  
  // Calculate mock sentiment
  const positiveWords = ['good', 'excellent', 'improve', 'success', 'benefit'];
  const negativeWords = ['bad', 'problem', 'issue', 'risk', 'fail'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of positiveWords) {
    if (contentLower.includes(word)) positiveCount++;
  }
  
  for (const word of negativeWords) {
    if (contentLower.includes(word)) negativeCount++;
  }
  
  const totalCount = positiveCount + negativeCount;
  const sentimentScore = totalCount === 0 ? 
    0.5 : // Neutral
    Math.min(Math.max(0.5 + ((positiveCount - negativeCount) / (totalCount * 2)), 0), 1);
  
  // Generate mock summary
  const summary = sentences.length > 2 ? 
    sentences.slice(0, 2).join('. ') + '.' : 
    content;
  
  // Generate recommendations based on document type
  const actionItems: string[] = [];
  switch (documentType) {
    case 'proposal':
      actionItems.push(
        "Review proposal objectives and scope",
        "Verify budget requirements align with available resources",
        "Check timeline feasibility"
      );
      break;
    case 'report':
      actionItems.push(
        "Review key findings and conclusions",
        "Note recommendations for follow-up",
        "Share relevant insights with stakeholders"
      );
      break;
    case 'financial':
      actionItems.push(
        "Verify financial calculations for accuracy",
        "Compare against approved budget allocations",
        "Flag any significant variances for review"
      );
      break;
    default:
      actionItems.push(
        "Review document for completeness",
        "Identify key action points",
        "Determine appropriate next steps"
      );
  }
  
  return {
    documentAnalysis: {
      documentId,
      documentType,
      extractedEntities,
      keyPhrases,
      summary,
      topics,
      sentimentScore
    },
    recommendations: {
      classification: documentType.charAt(0).toUpperCase() + documentType.slice(1),
      tags: [
        documentType.charAt(0).toUpperCase() + documentType.slice(1),
        ...topics.slice(0, 2).map(t => t.topic.charAt(0).toUpperCase() + t.topic.slice(1))
      ],
      relatedDocuments: [],
      actionItems
    }
  };
} 