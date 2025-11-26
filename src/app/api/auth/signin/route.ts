import prisma from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { handleApiError, successResponse, errorResponse } from '@/lib/api';

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = signinSchema.parse(body);

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { npc: true }
    });

    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return errorResponse('Invalid credentials', 401);
    }

    const token = generateToken(user.id);
    (await cookies()).set('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    return successResponse({ 
      user: { id: user.id, email: user.email },
      npc: user.npc 
    });

  } catch (e) {
    return handleApiError(e);
  }
}
