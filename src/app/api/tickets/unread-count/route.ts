import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ count: 0 });

  // Mensajes de ADMIN no leídos en tickets del usuario autenticado
  const count = await prisma.ticketMessage.count({
    where: {
      senderType: 'ADMIN',
      isRead: false,
      ticket: {
        userId: session.id,
        status: { not: 'RESOLVED' },
      },
    },
  });

  return NextResponse.json({ count });
}
