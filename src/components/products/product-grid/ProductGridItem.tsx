'use client';

import { Product } from '@/interfaces';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface Props {
  product: Product;
}

function getImageSrc(product: Product, index: number): string {
  const images = product.images ?? [];
  if (images.length === 0) return '/placeholder-furniture.jpg';
  const img = images[index] ?? images[0];
  return `/api/images/${img.id}`;
}

export const ProductGridItem = ({ product }: Props) => {
  const hasSecondImage = (product.images?.length ?? 0) > 1;
  const [showSecond, setShowSecond] = useState(false);

  return (
    <div className="rounded-md overflow-hidden fade-in">
      <Link href={`/product/${product.slug}`}>
        <div className="relative w-full h-[500px] overflow-hidden rounded">
          <Image
            src={showSecond && hasSecondImage ? getImageSrc(product, 1) : getImageSrc(product, 0)}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 33vw"
            onMouseEnter={() => hasSecondImage && setShowSecond(true)}
            onMouseLeave={() => setShowSecond(false)}
          />
        </div>
      </Link>

      <div className="p-4 flex flex-col">
        <Link className="hover:text-blue-600" href={`/product/${product.slug}`}>
          {product.title}
        </Link>
        {product.material && (
          <span className="text-xs text-gray-500">{product.material}</span>
        )}
        <span className="font-bold">€{product.price.toFixed(2)}</span>
      </div>
    </div>
  );
};
