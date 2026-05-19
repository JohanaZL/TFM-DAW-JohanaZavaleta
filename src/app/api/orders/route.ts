import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const isAdmin = session.role === 'admin';
  const orders = await prisma.order.findMany({
    where: isAdmin ? {} : { userId: session.id },
    include: {
      items: { include: { product: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let body: { address?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.id },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: 'El carrito está vacío' }, { status: 422 });
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.21;
  const total = subtotal + tax;

  const [order] = await prisma.$transaction([
    prisma.order.create({
      data: {
        userId: session.id,
        address: body.address ?? '',
        total,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtBuy: item.product.price,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    }),
    prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
    ...cart.items.map(item =>
      prisma.product.update({
        where: { id: item.productId },
        data: { inStock: { decrement: item.quantity } },
      })
    ),
  ]);

  return NextResponse.json(order, { status: 201 });
}
