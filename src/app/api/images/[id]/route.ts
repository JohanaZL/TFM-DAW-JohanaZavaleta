import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptAndDecompress } from '@/lib/imageUtils';

interface Props { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  const { id } = await params;
  const image = await prisma.productImage.findUnique({ where: { id: parseInt(id) } });
  if (!image) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });

  try {
    const decoded = await decryptAndDecompress(Buffer.from(image.imageData));
    return new NextResponse(new Uint8Array(decoded), {
      headers: {
        'Content-Type': image.mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Error al procesar la imagen' }, { status: 500 });
  }
}
