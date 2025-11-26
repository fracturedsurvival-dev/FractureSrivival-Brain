import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { handleApiError, successResponse, errorResponse } from '@/lib/api';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  characterName: z.string().min(2).max(30),
  faction: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = signupSchema.parse(body);

    const { email, password, characterName, faction } = validation;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse('User already exists', 400);
    }

    const existingNPC = await prisma.nPC.findUnique({ where: { name: characterName } });
    if (existingNPC) {
      return errorResponse('Character name taken', 400);
    }

    const hashedPassword = await hashPassword(password);

    // Transaction: Create User -> Create NPC -> Create Wallet
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword
        }
      });

      const npc = await tx.nPC.create({
        data: {
          name: characterName,
          faction: faction || 'SURVIVOR',
          alignment: 'Neutral',
          userId: user.id,
          status: 'ALIVE',
          health: 100
        }
      });

      // Create Wallet
      const address = '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      await tx.wallet.create({
        data: {
          address,
          ownerId: npc.id,
          balance: 50.0 // Starting balance
        }
      });

      return { user, npc };
    });

    const token = generateToken(result.user.id);
    (await cookies()).set('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    return successResponse({ user: { id: result.user.id, email: result.user.email }, npc: result.npc });

  } catch (e) {
    return handleApiError(e);
  }
}
