import { NextResponse } from "next/server"

export async function GET() {
    return NextResponse.json({ status: "ok", message: "API connection successful" })
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        return NextResponse.json({
            status: "ok",
            message: "POST successful",
            receivedData: body
        })
    } catch (error) {
        return NextResponse.json({
            status: "error",
            message: "Failed to parse request body"
        }, { status: 400 })
    }
} 