
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    // Find the first NPC with the TRADER job
    const trader = await prisma.nPC.findFirst({
      where: { job: 'TRADER' },
      include: { wallet: true }
    });

    if (!trader) {
      return NextResponse.json({ error: 'No trader found' }, { status: 404 });
    }

    const traderWithBalance = {
      ...trader,
      walletBalance: trader.wallet?.balance || 0
    };

    return NextResponse.json({ trader: traderWithBalance });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trader' }, { status: 500 });
  }
}
