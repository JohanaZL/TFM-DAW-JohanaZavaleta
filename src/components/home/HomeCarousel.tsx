'use client';

import { useState } from 'react';
import { Swiper as SwiperObject } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode, Navigation, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import './home-carousel.css';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/interfaces';

interface Props {
  products: Product[];
}

function getMainImageSrc(product: Product): string {
  const images = product.images ?? [];
  if (images.length === 0) return '/placeholder-furniture.jpg';
  const main = images.find(img => img.isMain) ?? images[0];
  return `/api/images/${main.id}`;
}

export const HomeCarousel = ({ products }: Props) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperObject | null>(null);

  if (products.length === 0) return null;

  return (
    <div className="w-full mb-8">
      {/* Carrusel principal */}
      <Swiper
        style={{ '--swiper-navigation-color': '#fff', '--swiper-pagination-color': '#fff' } as React.CSSProperties}
        spaceBetween={10}
        navigation
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        modules={[FreeMode, Navigation, Thumbs, Autoplay]}
        className="home-carousel-main"
      >
        {products.map(product => (
          <SwiperSlide key={product.id}>
            <Link href={`/product/${product.slug}`} className="relative w-full h-full block">
              <Image
                src={getMainImageSrc(product)}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 80vw"
                priority
              />
              {/* Overlay con info del producto */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 md:p-6">
                <p className="text-white font-semibold text-lg md:text-2xl drop-shadow">{product.title}</p>
                <p className="text-white/90 text-sm md:text-base">€{product.price.toFixed(2)}</p>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnails */}
      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={8}
        slidesPerView={4}
        freeMode
        watchSlidesProgress
        modules={[FreeMode, Navigation, Thumbs]}
        className="home-carousel-thumbs"
      >
        {products.map(product => (
          <SwiperSlide key={product.id}>
            <div className="relative w-full h-full">
              <Image
                src={getMainImageSrc(product)}
                alt={product.title}
                fill
                className="object-cover"
                sizes="15vw"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
