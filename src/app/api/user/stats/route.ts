import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('X-User-ID');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const response = await axios.get('http://localhost:5000/api/user/stats', {
      headers: { 'X-User-ID': userId }
    });
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}