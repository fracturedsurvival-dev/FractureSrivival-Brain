import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { fromAddress, toAddress, amount } = await req.json();
    
    const sender = await prisma.wallet.findUnique({ where: { address: fromAddress } });
    const receiver = await prisma.wallet.findUnique({ where: { address: toAddress } });

    if (!sender || !receiver) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    if (sender.balance < amount) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    // Transaction
    const [updatedSender, , tx] = await prisma.$transaction([
      prisma.wallet.update({
        where: { address: fromAddress },
        data: { balance: { decrement: amount } }
      }),
      prisma.wallet.update({
        where: { address: toAddress },
        data: { balance: { increment: amount } }
      }),
      prisma.transaction.create({
        data: {
          hash: 'tx_' + Math.random().toString(36).substr(2, 9),
          from: fromAddress,
          to: toAddress,
          amount
        }
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      txHash: tx.hash, 
      newBalance: updatedSender.balance 
    });

  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
