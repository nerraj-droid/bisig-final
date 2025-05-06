import { NextRequest, NextResponse } from 'next/server';

/**
 * Document parser API endpoint (Simplified version)
 * 
 * This endpoint processes document files and extracts text content:
 * - Text files: Reads text directly
 * - For more complex formats, it returns a fallback message
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Get file details
    const fileName = file.name;
    const fileType = file.type;
    
    // Validate file type
    const validTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/msword', // doc
      'text/plain',
      'application/rtf',
      'text/csv'
    ];
    
    if (!validTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported types: PDF, DOCX, TXT, RTF, CSV' }, 
        { status: 400 }
      );
    }
    
    // Process file based on type
    let extractedText = '';
    
    if (fileType === 'text/plain' || fileType === 'text/csv' || fileType === 'application/rtf') {
      // For text files, read directly
      try {
        const buffer = await file.arrayBuffer();
        extractedText = new TextDecoder().decode(buffer);
      } catch (error) {
        console.error('Error decoding text file:', error);
        extractedText = `[Error reading text file. Please try another file.]`;
      }
    } 
    else if (fileType === 'application/pdf') {
      // For PDF files, return a placeholder message
      // In production, you would use a library like pdf-parse
      extractedText = `[PDF parsing is temporarily disabled. PDF detected: ${fileName}]

This is a placeholder message for PDF content. Due to server-side compatibility issues, PDF parsing has been temporarily disabled. 

In a production environment, we would use libraries like pdf-parse to extract the text content. For now, please consider:
1. Converting your PDF to text format manually
2. Copy-pasting the content directly into the document content box
3. Using a plain text file instead

File name: ${fileName}
File size: ${(file.size / 1024).toFixed(2)} KB`;
    } 
    else if (fileType.includes('word')) {
      // For Word documents, return a placeholder message
      // In production, you would use a library like mammoth.js
      extractedText = `[DOCX parsing is temporarily disabled. Word document detected: ${fileName}]

This is a placeholder message for Word document content. Due to server-side compatibility issues, Word document parsing has been temporarily disabled.

In a production environment, we would use libraries like mammoth.js to extract the text content. For now, please consider:
1. Converting your document to text format manually
2. Copy-pasting the content directly into the document content box
3. Using a plain text file instead

File name: ${fileName}
File size: ${(file.size / 1024).toFixed(2)} KB`;
    }
    
    // Return the extracted text
    return NextResponse.json({ text: extractedText }, { status: 200 });
  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      { error: 'Failed to process document', message: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
} 