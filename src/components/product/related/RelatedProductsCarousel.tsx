'use client';

import { Product } from '@/interfaces';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface Props {
  products: Product[];
}

function getMainImageSrc(product: Product): string {
  const images = product.images ?? [];
  if (images.length === 0) return '/placeholder-furniture.jpg';
  const main = images.find(img => img.isMain) ?? images[0];
  return `/api/images/${main.id}`;
}

export const RelatedProductsCarousel = ({ products }: Props) => {
  if (products.length === 0) return null;

  return (
    <section className="mt-16 mb-10 px-1">
      <h2 className="text-lg font-semibold text-gray-800 mb-5">Productos de la misma categoría</h2>
      <Swiper
        modules={[Navigation, A11y]}
        navigation
        spaceBetween={16}
        breakpoints={{
          0:   { slidesPerView: 1.5 },
          480: { slidesPerView: 2.5 },
          768: { slidesPerView: 3.5 },
          1024:{ slidesPerView: 4 },
        }}
      >
        {products.map(product => (
          <SwiperSlide key={product.id}>
            <Link href={`/product/${product.slug}`} className="block group">
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={getMainImageSrc(product)}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 480px) 60vw, (max-width: 768px) 40vw, 25vw"
                />
              </div>
              <div className="mt-2 px-1">
                <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-blue-700 transition-colors">
                  {product.title}
                </p>
                <p className="text-sm font-bold mt-0.5">€{product.price.toFixed(2)}</p>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};
