'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, MessageSquare, Check, Star, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackMechanismProps {
  modelId: string;      // Which AI model provided the output (e.g., 'document-intelligence', 'risk-assessment')
  predictionId?: string; // Specific prediction ID if available
  context?: string;     // Additional context (e.g., 'summary', 'recommendations')
  onFeedbackSubmitted?: () => void; // Optional callback after feedback is submitted
}

export function FeedbackMechanism({ 
  modelId, 
  predictionId = 'unknown',
  context = 'general',
  onFeedbackSubmitted 
}: FeedbackMechanismProps) {
  const [feedbackType, setFeedbackType] = useState<'helpful' | 'unhelpful' | 'suggestion' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleFeedbackSelection = (type: 'helpful' | 'unhelpful' | 'suggestion') => {
    setFeedbackType(type);
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedbackText(e.target.value);
  };
  
  const submitFeedback = async () => {
    if (!feedbackType) {
      toast.error('Please select a feedback type.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId,
          predictionId,
          context,
          feedbackType,
          feedbackText,
          timestamp: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to submit feedback: ${response.status}`);
      }
      
      setIsSubmitted(true);
      toast.success('Thank you for your feedback!');
      
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setFeedbackType(null);
    setFeedbackText('');
    setIsSubmitted(false);
  };
  
  if (isSubmitted) {
    return (
      <div className="p-4 border rounded-md bg-muted/40">
        <div className="flex flex-col items-center justify-center py-2 text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Check className="h-5 w-5 text-primary" />
          </div>
          <h4 className="font-medium">Feedback received</h4>
          <p className="text-sm text-muted-foreground mt-1 mb-3">
            Thank you for helping us improve our AI features.
          </p>
          <Button size="sm" variant="outline" onClick={resetForm}>
            Submit another feedback
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 border rounded-md bg-muted/40">
      <h4 className="font-medium flex items-center gap-2 mb-3">
        <Lightbulb size={16} className="text-primary" />
        <span>Help us improve</span>
      </h4>
      
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">
          How would you rate this AI output?
        </p>
        <div className="flex gap-2">
          <Button
            variant={feedbackType === 'helpful' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFeedbackSelection('helpful')}
            className="flex gap-1"
          >
            <ThumbsUp size={14} />
            <span>Helpful</span>
          </Button>
          <Button
            variant={feedbackType === 'unhelpful' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFeedbackSelection('unhelpful')}
            className="flex gap-1"
          >
            <ThumbsDown size={14} />
            <span>Not helpful</span>
          </Button>
          <Button
            variant={feedbackType === 'suggestion' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFeedbackSelection('suggestion')}
            className="flex gap-1"
          >
            <Star size={14} />
            <span>Suggestion</span>
          </Button>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">
          {feedbackType === 'helpful' 
            ? 'What did you find most helpful?' 
            : feedbackType === 'unhelpful' 
              ? 'How could we improve this output?' 
              : feedbackType === 'suggestion'
                ? 'What suggestions do you have?'
                : 'Additional comments (optional)'}
        </p>
        <Textarea 
          value={feedbackText}
          onChange={handleTextChange}
          placeholder="Enter your feedback here..."
          className="resize-none min-h-[80px]"
        />
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={submitFeedback}
          disabled={isSubmitting || (!feedbackType && !feedbackText)}
          size="sm"
        >
          {isSubmitting ? 'Submitting...' : 'Submit feedback'}
        </Button>
      </div>
    </div>
  );
} 