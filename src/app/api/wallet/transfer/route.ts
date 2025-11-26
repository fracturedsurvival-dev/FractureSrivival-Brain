import { prisma } from '@/lib/db';
import { z } from 'zod';
import { handleApiError, successResponse, errorResponse } from '@/lib/api';

const transferSchema = z.object({
  fromAddress: z.string().min(10),
  toAddress: z.string().min(10),
  amount: z.number().positive()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fromAddress, toAddress, amount } = transferSchema.parse(body);
    
    const sender = await prisma.wallet.findUnique({ where: { address: fromAddress } });
    const receiver = await prisma.wallet.findUnique({ where: { address: toAddress } });

    if (!sender || !receiver) {
      return errorResponse('Wallet not found', 404);
    }

    if (sender.balance < amount) {
      return errorResponse('Insufficient funds', 400);
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

    return successResponse({ 
      txHash: tx.hash, 
      newBalance: updatedSender.balance 
    });

  } catch (e) {
    return handleApiError(e);
  }
}
