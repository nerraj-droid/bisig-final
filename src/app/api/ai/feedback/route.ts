import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

// Define the feedback data interface
interface FeedbackData {
  modelId: string;
  predictionId: string;
  context: string;
  feedbackType: 'helpful' | 'unhelpful' | 'suggestion';
  feedbackText: string;
  timestamp: string;
}

/**
 * API endpoint for collecting feedback on AI predictions
 * 
 * This endpoint receives feedback from users about AI model outputs,
 * validates the data, and stores it for later analysis.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.modelId || !data.feedbackType) {
      return NextResponse.json(
        { error: 'Missing required fields: modelId and feedbackType are required' },
        { status: 400 }
      );
    }
    
    // Create a feedback entry
    const feedbackEntry: FeedbackData = {
      modelId: data.modelId,
      predictionId: data.predictionId || 'unknown',
      context: data.context || 'general',
      feedbackType: data.feedbackType,
      feedbackText: data.feedbackText || '',
      timestamp: data.timestamp || new Date().toISOString()
    };
    
    // In a production environment, this would be stored in a database
    // For this demo, we'll store it in a JSON file
    await storeFeedback(feedbackEntry);
    
    // Log the feedback for monitoring
    console.log('AI feedback received:', {
      modelId: feedbackEntry.modelId,
      feedbackType: feedbackEntry.feedbackType,
      timestamp: feedbackEntry.timestamp
    });
    
    // Return success
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}

/**
 * Store feedback data in a JSON file
 * 
 * This is a simplified implementation for demo purposes.
 * In production, you would use a database for this.
 */
async function storeFeedback(feedbackData: FeedbackData) {
  try {
    // Define the data directory and file path
    const dataDir = path.join(process.cwd(), 'data');
    const feedbackFilePath = path.join(dataDir, 'ai-feedback.json');
    
    // Ensure the directory exists
    await fs.mkdir(dataDir, { recursive: true });
    
    // Read existing feedback data or create a new array
    let feedbackArray: FeedbackData[] = [];
    
    try {
      const existingData = await fs.readFile(feedbackFilePath, 'utf-8');
      feedbackArray = JSON.parse(existingData);
    } catch (error) {
      // File doesn't exist or is invalid JSON, start with an empty array
      feedbackArray = [];
    }
    
    // Add the new feedback
    feedbackArray.push(feedbackData);
    
    // Write the updated data back to the file
    await fs.writeFile(feedbackFilePath, JSON.stringify(feedbackArray, null, 2), 'utf-8');
    
  } catch (error) {
    console.error('Error storing feedback:', error);
    throw error;
  }
} 