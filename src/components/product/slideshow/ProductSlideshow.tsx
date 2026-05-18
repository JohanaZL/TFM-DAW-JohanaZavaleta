'use client';

import { useState } from 'react';
import { Swiper as SwiperObject } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode, Navigation, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import './slideshow.css';
import Image from 'next/image';

interface Props {
  imageIds: number[];
  title: string;
  className?: string;
}

export const ProductSlideshow = ({ imageIds, title, className }: Props) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperObject>();

  if (imageIds.length === 0) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center h-96`}>
        <span className="text-gray-400">Sin imagen</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <Swiper
        style={{ '--swiper-navigation-color': '#fff', '--swiper-pagination-color': '#fff' } as React.CSSProperties}
        spaceBetween={10}
        navigation={true}
        autoplay={{ delay: 3000 }}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Navigation, Thumbs, Autoplay]}
        className="mySwiper2"
      >
        {imageIds.map(id => (
          <SwiperSlide key={id}>
            <Image
              width={1024}
              height={800}
              src={`/api/images/${id}`}
              alt={title}
              className="rounded-lg object-fill"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={4}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mySwiper"
      >
        {imageIds.map(id => (
          <SwiperSlide key={id}>
            <Image
              width={300}
              height={300}
              src={`/api/images/${id}`}
              alt={title}
              className="rounded-lg object-fill"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
