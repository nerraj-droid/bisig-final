import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Import the model we've created
import { budgetAllocationModel } from "@/lib/ai/models/budget-allocation";

/**
 * GET /api/ai/models/budget-allocation
 * 
 * Endpoint to get budget allocation recommendations
 * 
 * Query parameters:
 * - aipId: ID of the AIP to analyze
 * - fiscalYear: (optional) specific fiscal year to consider
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check authentication
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Extract query parameters
        const url = new URL(req.url);
        const modelType = url.pathname.split('/').pop(); // Get model type from URL
        const aipId = url.searchParams.get("aipId");
        const fiscalYear = url.searchParams.get("fiscalYear");

        // Check required parameters
        if (!aipId) {
            return NextResponse.json(
                { error: "Missing required parameter: aipId" },
                { status: 400 }
            );
        }

        // Dispatch to appropriate model based on URL path
        let prediction;
        switch (modelType) {
            case "budget-allocation":
                prediction = await budgetAllocationModel.predict({ aipId, fiscalYear: fiscalYear || undefined });
                break;
            // Add other model types as they become available
            default:
                return NextResponse.json(
                    { error: "Unknown model type" },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            model: modelType,
            timestamp: new Date().toISOString(),
            prediction,
        });

    } catch (error) {
        console.error(`Error in AI model API (${req.url}):`, error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "An error occurred processing the model" },
            { status: 500 }
        );
    }
} 