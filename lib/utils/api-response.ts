import { NextResponse } from 'next/server';
import { ApiError } from './api-error';

interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
}

type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

export function successResponse<T = any>(data?: T, message?: string, status: number = 200): NextResponse {
  const response: SuccessResponse<T> = {
    success: true,
    ...(data && { data }),
    ...(message && { message })
  };

  return NextResponse.json(response, {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function errorResponse(error: Error | ApiError | unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    const response: ErrorResponse = {
      success: false,
      error: error.message,
      ...(error.details && { details: error.details })
    };

    return NextResponse.json(response, {
      status: error.statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Handle unknown errors
  const response: ErrorResponse = {
    success: false,
    error: 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && error instanceof Error && {
      details: {
        message: error.message,
        stack: error.stack
      }
    })
  };

  return NextResponse.json(response, {
    status: 500,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function validateContentType(contentType: string | null): void {
  if (!contentType || !contentType.includes('application/json')) {
    throw new ApiError(415, 'Content-Type must be application/json');
  }
}
