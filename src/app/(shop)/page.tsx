import { Title } from '@/components/ui/title/Title';
import { ProductGrid } from '@/components';
import { Product } from '@/interfaces';

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? 'http://localhost:3000'}/api/products?page=1`, {
      cache: 'no-store',
    });
    console.log('VERCEL_PROJECT_PRODUCTION_URL',process.env.VERCEL_PROJECT_PRODUCTION_URL)
    console.log('RES--',res)
    if (!res.ok) return [];
    const data = await res.json();
    console.log('DATA---',data);
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
