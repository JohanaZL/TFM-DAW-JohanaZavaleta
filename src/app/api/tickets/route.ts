import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status');
  const search = searchParams.get('search') ?? '';

  const isAdmin = session.role === 'admin';

  const tickets = await prisma.supportTicket.findMany({
    where: {
      ...(isAdmin ? {} : { userId: session.id }),
      ...(status ? { status: status as never } : {}),
      ...(search
        ? {
            OR: [
              { user: { name: { contains: search, mode: 'insensitive' } } },
              { user: { email: { contains: search, mode: 'insensitive' } } },
              { order: { ticketNumber: { contains: search, mode: 'insensitive' } } },
              { subject: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      order: { select: { id: true, ticketNumber: true, total: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(tickets);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let body: {
    subject?: string;
    message?: string;
    phone?: string;
    orderId?: string;
    productId?: string;
    cartProductIds?: string[];
  };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const { subject, message, phone, orderId, productId, cartProductIds } = body;
  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Asunto y mensaje son obligatorios' }, { status: 422 });
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: session.id,
      subject: subject.trim(),
      phone: phone?.trim() || null,
      orderId: orderId || null,
      productId: productId || null,
      cartProductIds: cartProductIds ?? [],
      messages: {
        create: {
          senderType: 'CUSTOMER',
          messageText: message.trim(),
        },
      },
    },
    include: {
      messages: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(ticket, { status: 201 });
}
