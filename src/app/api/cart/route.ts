import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const cart = await prisma.cart.findUnique({
    where: { userId: session.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { select: { id: true, mimeType: true, fileName: true, isMain: true, productId: true } },
            },
          },
        },
      },
    },
  });

  return NextResponse.json(cart ?? { items: [] });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let items: { productId: string; quantity: number }[];
  try {
    items = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  // Upsert cart
  let cart = await prisma.cart.findUnique({ where: { userId: session.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: session.id } });
  }

  // Sync items
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  if (items.length > 0) {
    await prisma.cartItem.createMany({
      data: items.map(i => ({ cartId: cart!.id, productId: i.productId, quantity: i.quantity })),
    });
  }

  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: {
            include: { images: { select: { id: true, mimeType: true, fileName: true, isMain: true, productId: true } } },
          },
        },
      },
    },
  });
  return NextResponse.json(updated);
}
