import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { compressAndEncrypt } from '@/lib/imageUtils';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const categorySlug = searchParams.get('category');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const q = searchParams.get('q') ?? '';
  const take = 12;
  const skip = (page - 1) * take;

  const where = {
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(q ? { title: { contains: q, mode: 'insensitive' as const } } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { select: { id: true, mimeType: true, fileName: true, isMain: true, productId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, page, pages: Math.ceil(total / take) });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const formData = await req.formData();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const inStock = parseInt(formData.get('inStock') as string);
  const slug = formData.get('slug') as string;
  const categoryId = formData.get('categoryId') as string;
  const material = formData.get('material') as string | null;
  const dimensions = formData.get('dimensions') as string | null;
  const color = formData.get('color') as string | null;
  const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null;
  const tagsRaw = formData.get('tags') as string | null;
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

  if (!title || !description || isNaN(price) || isNaN(inStock) || !slug || !categoryId) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 422 });
  }

  const product = await prisma.product.create({
    data: { title, description, price, inStock, slug, categoryId, material, dimensions, color, weight, tags },
  });

  const imageFile = formData.get('image') as File | null;
  if (imageFile && imageFile.size > 0) {
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const encrypted = await compressAndEncrypt(buffer);
    await prisma.productImage.create({
      data: {
        imageData: new Uint8Array(encrypted),
        mimeType: imageFile.type || 'image/jpeg',
        fileName: imageFile.name,
        isMain: true,
        productId: product.id,
      },
    });
  }

  const full = await prisma.product.findUnique({
    where: { id: product.id },
    include: {
      category: true,
      images: { select: { id: true, mimeType: true, fileName: true, isMain: true, productId: true } },
    },
  });

  return NextResponse.json(full, { status: 201 });
}
