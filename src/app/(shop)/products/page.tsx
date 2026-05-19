import { Title } from '@/components/ui/title/Title';
import { ProductGrid } from '@/components';
import { Product } from '@/interfaces';
import Link from 'next/link';
import { getBaseUrl } from '@/lib/getBaseUrl';

interface Props {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}

async function getProducts(q: string, category: string, page: string) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  if (page) params.set('page', page);

  try {
    const res = await fetch(
      `${getBaseUrl()}/api/products?${params}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return { products: [], total: 0, pages: 1 };
    return res.json() as Promise<{ products: Product[]; total: number; pages: number }>;
  } catch {
    return { products: [] as Product[], total: 0, pages: 1 };
  }
}

export default async function ProductsPage({ searchParams }: Props) {
  const { q = '', category = '', page = '1' } = await searchParams;
  const { products, total, pages } = await getProducts(q, category, page);
  const currentPage = parseInt(page);

  return (
    <>
      <Title
        title={q ? `Resultados para "${q}"` : 'Todos los productos'}
        subTitle={`${total} producto${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
        className="mb-4"
      />

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>No se encontraron productos.</p>
          <Link href="/products" className="underline mt-2 block">Ver todos los productos</Link>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}

      {/* Paginación */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-8 mb-10">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`/products?${new URLSearchParams({ q, category, page: String(p) })}`}
              className={`px-4 py-2 rounded border ${p === currentPage ? 'bg-gray-900 text-white border-gray-900' : 'hover:bg-gray-100'}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
