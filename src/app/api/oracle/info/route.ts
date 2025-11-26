import { NextResponse } from 'next/server';
import { listModels } from '@/lib/services/oracle';

export async function GET() {
  return NextResponse.json({ models: listModels() });
}
