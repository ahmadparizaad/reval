import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    
    // Send user data to Flask backend
    const response = await axios.post('http://localhost:5000/api/auth/sync-user', userData);
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error syncing user with backend:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}