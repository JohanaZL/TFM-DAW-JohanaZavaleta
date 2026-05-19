import { Title } from '@/components/ui/title/Title';
import { ProductGrid } from '@/components';
import { Product } from '@/interfaces';

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${process.env.VERCEL_URL ?? 'http://localhost:3000'}/api/products?page=1`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products ?? [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      <Title title='Teslo Muebles' subTitle='Descubre nuestra colección' className='mb-2' />
      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No hay productos disponibles.</p>
          <p className="text-sm mt-2">Accede al backoffice para añadir productos.</p>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </>
  );
}
