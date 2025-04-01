import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log('Unauthorized upload attempt');
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const formData = await request.formData();

    const file = formData.get("file") as File;
    if (!file) {
      console.log('No file provided in upload');
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Log file information
    console.log(`File upload details - Name: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);

    // Get the file type from the form data
    const fileType = formData.get("type") as string || "proof-of-identity"; // Default to proof-of-identity
    console.log(`File upload type: ${fileType}`);

    // Validate mime type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];

    if (!validTypes.includes(file.type)) {
      console.log(`Invalid file type: ${file.type}`);
      return new Response(
        JSON.stringify({
          error: "Invalid file type. Only JPEG, PNG, and PDF files are allowed.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log(`File too large: ${file.size} bytes`);
      return new Response(
        JSON.stringify({
          error: "File too large. Maximum file size is 5MB.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generate a unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine file extension
    const fileExt = file.name.split(".").pop() || "";
    const uniqueFilename = `${uuidv4()}.${fileExt}`;

    // Determine the appropriate directory based on file type
    // This structure maintains compatibility with existing uploads
    let uploadDir = 'uploads/proof-of-identity'; // Default directory

    if (fileType === "profile-photo") {
      uploadDir = 'uploads/profile-photos';
    } else if (fileType === "proof-of-identity") {
      uploadDir = 'uploads/proof-of-identity';
    } else {
      uploadDir = 'uploads';
    }

    // Create full directory path
    const dirPath = join(process.cwd(), "public", uploadDir);

    // Ensure directory exists
    await mkdir(dirPath, { recursive: true });

    const filePath = join(dirPath, uniqueFilename);

    try {
      // Write the file to the filesystem
      await writeFile(filePath, buffer);
      console.log(`File saved at ${filePath}`);

      // Return the URL to the uploaded file
      const url = `/${uploadDir}/${uniqueFilename}`;
      return new Response(
        JSON.stringify({
          url,
          message: "File uploaded successfully",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error saving file:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to save file",
          details: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Upload handler error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process upload",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 
