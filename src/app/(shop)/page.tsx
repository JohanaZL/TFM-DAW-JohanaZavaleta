import { ProductGrid } from '@/components';
import { Product } from '@/interfaces';
import { getBaseUrl } from '@/lib/getBaseUrl';
import { HomeCarousel } from '@/components/home/HomeCarousel';

async function getCarouselProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/products?page=1&limit=8`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products ?? [];
  } catch {
    return [];
  }
}

async function getBestsellers(): Promise<Product[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/products/bestsellers`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getSiteParagraph(): Promise<string> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/site-config`, { cache: 'no-store' });
    if (!res.ok) return '';
    const data = await res.json();
    return data.homeParagraph ?? '';
  } catch {
    return '';
  }
}

export default async function Home() {
  const [carouselProducts, bestsellers, paragraph] = await Promise.all([
    getCarouselProducts(),
    getBestsellers(),
    getSiteParagraph(),
  ]);

  return (
    <div className="pb-16">
      {/* Carrusel Swiper Thumbs Gallery */}
      <HomeCarousel products={carouselProducts} />

      {/* Párrafo configurable desde el backoffice */}
      {paragraph && (
        <div className="max-w-3xl mx-auto px-4 my-8">
          <p className="text-gray-600 text-base leading-relaxed text-center">{paragraph}</p>
        </div>
      )}

      {/* Sección de más vendidos */}
      {bestsellers.length > 0 && (
        <section className="mt-10 px-4 sm:px-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Más vendidos</h2>
          <ProductGrid products={bestsellers} />
        </section>
      )}

      {/* Si no hay bestsellers pero sí hay productos en el carrusel, mostramos un CTA */}
      {bestsellers.length === 0 && carouselProducts.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No hay productos disponibles.</p>
          <p className="text-sm mt-2">Accede al backoffice para añadir productos.</p>
        </div>
      )}
    </div>
  );
}
