import { describe, it, expect } from 'vitest';
import { handleApiError, successResponse, errorResponse } from './api';
import { ZodError } from 'zod';
import { NextResponse } from 'next/server';

describe('API Utilities', () => {
  it('successResponse returns correct structure', async () => {
    const response = successResponse({ foo: 'bar' }, 201);
    const json = await response.json();
    
    expect(response.status).toBe(201);
    expect(json).toEqual({ success: true, data: { foo: 'bar' } });
  });

  it('errorResponse returns correct structure', async () => {
    const response = errorResponse('BAD_REQUEST', 400);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ success: false, error: 'BAD_REQUEST' });
  });

  it('handleApiError handles generic Error', async () => {
    const error = new Error('Something went wrong');
    const response = handleApiError(error);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ success: false, error: 'Something went wrong' });
  });

  it('handleApiError handles UNAUTHORIZED', async () => {
    const error = new Error('UNAUTHORIZED');
    const response = handleApiError(error);
    
    expect(response.status).toBe(401);
  });
});
