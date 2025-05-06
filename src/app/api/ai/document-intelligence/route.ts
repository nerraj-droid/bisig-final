import { NextRequest, NextResponse } from 'next/server';
import { documentIntelligenceModel } from '@/lib/ai/models/document-intelligence';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, content, projectId } = body;

    if (!documentId || !content) {
      return NextResponse.json(
        { error: 'Missing required parameters: documentId and content are required' },
        { status: 400 }
      );
    }

    // Call the document intelligence model
    const prediction = await documentIntelligenceModel.predict({
      documentId,
      content,
      projectId
    });

    // Return the prediction results
    return NextResponse.json(prediction, { status: 200 });
  } catch (error) {
    console.error('Error processing document intelligence request:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
} 