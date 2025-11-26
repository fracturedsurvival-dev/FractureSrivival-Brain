import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, password, characterName, faction } = await req.json();

    if (!email || !password || !characterName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const existingNPC = await prisma.nPC.findUnique({ where: { name: characterName } });
    if (existingNPC) {
      return NextResponse.json({ error: 'Character name taken' }, { status: 400 });
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

    return NextResponse.json({ success: true, user: { id: result.user.id, email: result.user.email }, npc: result.npc });

  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
