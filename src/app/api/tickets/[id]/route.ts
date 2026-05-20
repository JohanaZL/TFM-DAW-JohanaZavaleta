import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

interface Params { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      order: { select: { id: true, ticketNumber: true, total: true, status: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!ticket) return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });

  // El usuario solo puede ver sus propios tickets
  if (session.role !== 'admin' && ticket.userId !== session.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  // Marcar mensajes ADMIN como leídos si el usuario es CUSTOMER
  if (session.role !== 'admin') {
    await prisma.ticketMessage.updateMany({
      where: { ticketId: id, senderType: 'ADMIN', isRead: false },
      data: { isRead: true },
    });
  }

  return NextResponse.json(ticket);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { id } = await params;
  let body: { status?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const allowed = ['PENDING', 'IN_REVIEW', 'RESOLVED'];
  if (!body.status || !allowed.includes(body.status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 422 });
  }

  const ticket = await prisma.supportTicket.update({
    where: { id },
    data: { status: body.status as never },
  });

  return NextResponse.json(ticket);
}
