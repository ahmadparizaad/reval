import { useUser } from '@clerk/nextjs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class APIError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = 'APIError';
  }
}

export const fetchWithAuth = async (endpoint: string, userId: string, options: RequestInit = {}) => {
  if (!userId) {
    throw new APIError('User ID is required', 401, 'AUTH_REQUIRED');
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-Clerk-User-Id': userId,
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || `API error: ${response.statusText}`,
        response.status,
        errorData.code
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new APIError(
        'Unable to connect to the server. Please check if the server is running.',
        0,
        'CONNECTION_ERROR'
      );
    }

    // Handle other errors
    throw new APIError(
      'An unexpected error occurred. Please try again later.',
      500,
      'UNKNOWN_ERROR'
    );
  }
}; 