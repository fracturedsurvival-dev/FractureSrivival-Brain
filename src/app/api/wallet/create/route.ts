import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { ownerId } = await req.json();
    
    // Generate a fake address
    const address = '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const wallet = await prisma.wallet.create({
      data: {
        address,
        ownerId: ownerId || null,
        balance: 100.0 // Initial airdrop
      }
    });

    return NextResponse.json(wallet);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
