import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export type ApiResponse<T = unknown> = 
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 500, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof ZodError) {
    return errorResponse('VALIDATION_ERROR', 400, error.format());
  }

  if (error instanceof Error) {
    if (error.message.includes('Unique constraint')) {
      return errorResponse('CONFLICT', 409, error.message);
    }
    if (error.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', 401);
    if (error.message === 'NOT_FOUND') return errorResponse('NOT_FOUND', 404);
    
    return errorResponse(error.message, 500);
  }

  return errorResponse('UNKNOWN_ERROR', 500);
}
