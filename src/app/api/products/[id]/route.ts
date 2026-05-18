import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { compressAndEncrypt } from '@/lib/imageUtils';

interface Props { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      category: true,
      images: { select: { id: true, mimeType: true, fileName: true, isMain: true, productId: true } },
    },
  });
  if (!product) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { id } = await params;
  const contentType = req.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const data: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (key === 'image') continue;
      if (key === 'price' || key === 'weight') data[key] = parseFloat(value as string);
      else if (key === 'inStock') data[key] = parseInt(value as string);
      else if (key === 'tags') data[key] = (value as string).split(',').map(t => t.trim()).filter(Boolean);
      else data[key] = value;
    }
    const product = await prisma.product.update({ where: { id }, data });

    const imageFile = formData.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const encrypted = await compressAndEncrypt(Buffer.from(arrayBuffer));
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.create({
        data: { imageData: new Uint8Array(encrypted), mimeType: imageFile.type || 'image/jpeg', fileName: imageFile.name, isMain: true, productId: id },
      });
    }

    const full = await prisma.product.findUnique({
      where: { id },
      include: { category: true, images: { select: { id: true, mimeType: true, fileName: true, isMain: true, productId: true } } },
    });
    return NextResponse.json(full);
  }

  const body = await req.json();
  const product = await prisma.product.update({ where: { id }, data: body });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
