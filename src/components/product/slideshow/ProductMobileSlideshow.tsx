'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode, Pagination } from 'swiper/modules';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
import './slideshow.css';

interface Props {
  imageIds: number[];
  title: string;
  className?: string;
}

export const ProductMobileSlideshow = ({ imageIds, title, className }: Props) => {
  if (imageIds.length === 0) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center h-64`}>
        <span className="text-gray-400">Sin imagen</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <Swiper
        style={{ width: '100vw', height: '500px' }}
        pagination
        autoplay={{ delay: 3000 }}
        modules={[FreeMode, Autoplay, Pagination]}
        className="mySwiper2"
      >
        {imageIds.map(id => (
          <SwiperSlide key={id}>
            <Image
              width={600}
              height={500}
              src={`/api/images/${id}`}
              alt={title}
              className="object-fill"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
