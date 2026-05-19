'use client';

import { Product } from '@/interfaces';
import { useCartStore } from '@/store';
import { useState } from 'react';
import { IoAddOutline, IoRemoveOutline } from 'react-icons/io5';

interface Props {
  product: Product;
}

export const AddToCartButton = ({ product }: Props) => {
  const [qty, setQty] = useState(1);
  const addItem = useCartStore(s => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (product.inStock === 0) return;
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setQty(q => Math.max(1, q - 1))}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
        >
          <IoRemoveOutline />
        </button>
        <span className="text-lg font-semibold w-6 text-center">{qty}</span>
        <button
          onClick={() => setQty(q => Math.min(product.inStock, q + 1))}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
        >
          <IoAddOutline />
        </button>
      </div>

      <button
        onClick={handleAdd}
        disabled={product.inStock === 0}
        className={`btn-primary disabled:opacity-50 ${added ? 'bg-green-600' : ''}`}
      >
        {added ? '¡Añadido al carrito!' : 'Agregar al carrito'}
      </button>
    </div>
  );
};
