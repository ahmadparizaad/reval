import { NextResponse } from "next/server";

/**
 * Health check API endpoint to test the API routes
 * Can be used to validate API route encoding and basic functionality
 */
export async function GET() {
  console.log('Health check API called');
  
  try {
    // Test various encoding scenarios
    const testData = {
      healthStatus: "OK",
      encodingTest: "UTF-8 test: Hello 你好 नमस्ते こんにちは 안녕하세요",
      apiRouteStatus: "working",
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    };
    
    return NextResponse.json({
      status: "success",
      message: "API health check successful",
      data: testData
    });
  } catch (error) {
    console.error('Error in health check API:', error);
    
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
