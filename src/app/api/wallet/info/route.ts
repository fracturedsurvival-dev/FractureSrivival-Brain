import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get('ownerId');

  if (!ownerId) {
    // Return all wallets for debugging
    const wallets = await prisma.wallet.findMany({ include: { owner: true } });
    return NextResponse.json(wallets);
  }

  const wallet = await prisma.wallet.findUnique({ 
    where: { ownerId },
    include: { owner: true }
  });

  if (!wallet) {
    return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
  }

  return NextResponse.json(wallet);
}
