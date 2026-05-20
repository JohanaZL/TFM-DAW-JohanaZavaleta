import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const ticket = await prisma.supportTicket.findUnique({ where: { id } });

  if (!ticket) return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
  if (session.role !== 'admin' && ticket.userId !== session.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  if (ticket.status === 'RESOLVED') {
    return NextResponse.json({ error: 'El ticket está cerrado' }, { status: 409 });
  }

  let body: { messageText?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  if (!body.messageText?.trim()) {
    return NextResponse.json({ error: 'El mensaje no puede estar vacío' }, { status: 422 });
  }

  const senderType = session.role === 'admin' ? 'ADMIN' : 'CUSTOMER';

  // Al primer mensaje del admin, pasar el ticket a IN_REVIEW
  const needsReview =
    senderType === 'ADMIN' && ticket.status === 'PENDING';

  const [message] = await prisma.$transaction([
    prisma.ticketMessage.create({
      data: { ticketId: id, senderType, messageText: body.messageText.trim() },
    }),
    prisma.supportTicket.update({
      where: { id },
      data: {
        updatedAt: new Date(),
        ...(needsReview ? { status: 'IN_REVIEW' } : {}),
      },
    }),
  ]);

  return NextResponse.json(message, { status: 201 });
}
