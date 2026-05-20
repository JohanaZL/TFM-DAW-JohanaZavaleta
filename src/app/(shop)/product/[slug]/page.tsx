import { titleFont } from '@/config/fonts';
import { notFound } from 'next/navigation';
import { Product } from '@/interfaces';
import { getBaseUrl } from '@/lib/getBaseUrl';
import { ProductSlideshow } from '@/components/product/slideshow/ProductSlideshow';
import { ProductMobileSlideshow } from '@/components/product/slideshow/ProductMobileSlideshow';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { RoomPreviewButton } from '@/components/product/try-on/RoomPreviewButton';
import { RelatedProductsCarousel } from '@/components/product/related/RelatedProductsCarousel';
import { SupportButton } from '@/components/soporte/SupportButton';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/products/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getRelatedProducts(categorySlug: string, excludeSlug: string): Promise<Product[]> {
  try {
    const params = new URLSearchParams({ category: categorySlug, exclude: excludeSlug, limit: '8' });
    const res = await fetch(`${getBaseUrl()}/api/products?${params}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products ?? [];
  } catch {
    return [];
  }
}

export default async function ProductSlugPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const imageIds = (product.images ?? []).map(img => img.id);
  const categorySlug = product.category?.slug ?? '';
  const relatedProducts = categorySlug
    ? await getRelatedProducts(categorySlug, slug)
    : [];

  return (
    <div className="mt-5 mb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

        {/* Slideshow */}
        <div className="col-span-1 md:col-span-2">
          <ProductMobileSlideshow
            title={product.title}
            imageIds={imageIds}
            className="block md:hidden"
          />
          <ProductSlideshow
            title={product.title}
            imageIds={imageIds}
            className="hidden md:block"
          />
        </div>

        {/* Detalles */}
        <div className="col-span-1 px-5">
          <h1 className={`${titleFont.className} antialiased font-bold text-xl`}>
            {product.title}
          </h1>

          <p className="text-lg mb-5">€{product.price.toFixed(2)}</p>

          <div className="space-y-1 mb-5 text-sm text-gray-600">
            {product.material && <p><span className="font-semibold">Material:</span> {product.material}</p>}
            {product.dimensions && <p><span className="font-semibold">Dimensiones:</span> {product.dimensions}</p>}
            {product.color && <p><span className="font-semibold">Color:</span> {product.color}</p>}
            {product.weight && <p><span className="font-semibold">Peso:</span> {product.weight} kg</p>}
            {product.inStock === 0 && <p className="text-red-500 font-semibold">Sin stock</p>}
            {product.inStock > 0 && <p className="text-green-600">{product.inStock} unidades disponibles</p>}
          </div>

          <AddToCartButton product={product} />

          {imageIds.length > 0 && (
            <RoomPreviewButton
              productImageId={imageIds[0]}
              productTitle={product.title}
            />
          )}

          <h3 className="font-bold text-sm mt-4">Descripción</h3>
          <p className="font-light">{product.description}</p>

          {product.tags && product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1">
              {product.tags.map(tag => (
                <span key={tag} className="text-xs bg-gray-100 rounded px-2 py-1">{tag}</span>
              ))}
            </div>
          )}

          {/* Soporte */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <SupportButton
              productId={product.id}
              productTitle={product.title}
              productSlug={product.slug}
              label="¿Tienes dudas sobre este producto? Contactar soporte"
            />
          </div>
        </div>
      </div>

      {/* Productos relacionados */}
      <RelatedProductsCarousel products={relatedProducts} />
    </div>
  );
}
