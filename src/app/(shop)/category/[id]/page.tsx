import { ProductGrid } from '@/components';
import { Title } from '@/components/ui/title/Title';
import { Product } from '@/interfaces';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

async function getCategoryProducts(slug: string): Promise<{ products: Product[]; categoryName: string } | null> {
  try {
    const res = await fetch(
      `${process.env.VERCEL_URL ?? 'http://localhost:3000'}/api/products?category=${slug}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();

    const catRes = await fetch(
      `${process.env.VERCEL_URL ?? 'http://localhost:3000'}/api/categories`,
      { cache: 'no-store' }
    );
    const categories = catRes.ok ? await catRes.json() : [];
    const cat = categories.find((c: { slug: string; name: string }) => c.slug === slug);

    return { products: data.products ?? [], categoryName: cat?.name ?? slug };
  } catch {
    return null;
  }
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  const result = await getCategoryProducts(id);

  if (!result) notFound();

  return (
    <>
      <Title title={result.categoryName} subTitle={`${result.products.length} productos`} className="mb-2" />
      {result.products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>No hay productos en esta categoría.</p>
        </div>
      ) : (
        <ProductGrid products={result.products} />
      )}
    </>
  );
}
