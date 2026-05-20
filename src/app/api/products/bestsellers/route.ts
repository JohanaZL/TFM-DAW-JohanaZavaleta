import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Agrupa OrderItem por productId, suma quantities y devuelve top 6
  const topItems = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 6,
  });

  if (topItems.length === 0) return NextResponse.json([]);

  const productIds = topItems.map(item => item.productId);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
      category: true,
      images: {
        select: { id: true, mimeType: true, fileName: true, isMain: true, productId: true },
      },
    },
  });

  // Reordenar según el ranking de ventas
  const ordered = topItems
    .map(item => products.find(p => p.id === item.productId))
    .filter(Boolean);

  return NextResponse.json(ordered);
}
