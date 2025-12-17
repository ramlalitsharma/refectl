// Centralized error handling utility

import { NextResponse } from 'next/server';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage = 'An error occurred',
  statusCode = 500
): NextResponse {
  const isDev = process.env.NODE_ENV === 'development';
  
  // Don't expose internal errors in production
  let message = defaultMessage;
  let details: any = undefined;

  if (error instanceof Error) {
    // Only expose error messages in development
    if (isDev) {
      message = error.message || defaultMessage;
      details = {
        stack: error.stack,
        name: error.name,
      };
    }

    // Handle specific error types
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      statusCode = error.statusCode;
    }

    // Handle known error codes
    if ('code' in error) {
      const code = String(error.code);
      
      // MongoDB errors
      if (code === '11000') {
        message = 'Duplicate entry';
        statusCode = 409;
      } else if (code === 'ENOTFOUND' || code === 'ECONNREFUSED') {
        message = 'Database connection error';
        statusCode = 503;
      }
    }
  }

  // Log error in server (but don't expose to client)
  if (statusCode >= 500) {
    console.error('Server error:', error);
  }

  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
      ...(isDev && { timestamp: new Date().toISOString() }),
    },
    { status: statusCode }
  );
}

/**
 * Create success response with consistent format
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  statusCode = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      ...(message && { message }),
      data,
    },
    { status: statusCode }
  );
}

/**
 * Validate request body
 */
export async function validateRequestBody<T>(
  request: Request,
  validator: (body: any) => body is T
): Promise<{ valid: true; data: T } | { valid: false; error: NextResponse }> {
  try {
    const body = await request.json();
    
    if (!validator(body)) {
      return {
        valid: false,
        error: createErrorResponse(
          new Error('Invalid request body'),
          'Invalid request data',
          400
        ),
      };
    }

    return { valid: true, data: body };
  } catch (error) {
    return {
      valid: false,
      error: createErrorResponse(
        error,
        'Invalid JSON in request body',
        400
      ),
    };
  }
}

/**
 * Check if error is operational (expected) vs programming error
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof Error && 'isOperational' in error) {
    return (error as AppError).isOperational === true;
  }
  return false;
}

