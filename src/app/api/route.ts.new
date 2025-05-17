import { NextResponse } from "next/server";

// Simple health check endpoint
export async function GET() {
    return NextResponse.json({
        status: 'online',
        message: 'Reval API is running',
        timestamp: new Date().toISOString()
    });
}
