import { prisma } from '@/lib/prisma';
import { ProductForm } from '@/components/backoffice/ProductForm';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { where: { isMain: true }, take: 1 } },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Editar: {product.title}</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <ProductForm
          categories={categories}
          initialData={{
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            inStock: product.inStock,
            slug: product.slug,
            categoryId: product.categoryId,
            material: product.material ?? '',
            dimensions: product.dimensions ?? '',
            color: product.color ?? '',
            weight: product.weight ? String(product.weight) : '',
            tags: product.tags.join(', '),
            existingImageId: product.images[0]?.id,
          }}
        />
      </div>
    </div>
  );
}
