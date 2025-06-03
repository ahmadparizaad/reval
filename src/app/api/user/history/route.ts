import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const per_page = searchParams.get('per_page') || '10';
    const sort_by = searchParams.get('sort_by') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    
    // Get user ID from headers (passed from frontend)
    const userId = request.headers.get('X-User-ID');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const response = await axios.get('http://localhost:5000/api/user/history', {
      params: { page, per_page, sort_by, order },
      headers: { 'X-User-ID': userId }
    });
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching user history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user history' },
      { status: 500 }
    );
  }
}