'use client';

import { Title } from '@/components/ui/title/Title';
import { useCartStore } from '@/store';
import Image from 'next/image';
import Link from 'next/link';
import { IoAddOutline, IoRemoveOutline, IoTrashOutline } from 'react-icons/io5';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Title title="Carrito" />
        <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
        <Link href="/" className="btn-primary">
          Explorar productos
        </Link>
      </div>
    );
  }

  const subtotal = totalPrice();
  const tax = subtotal * 0.21;
  const total = subtotal + tax;

  return (
    <div className="flex justify-center items-start mb-20 px-4 sm:px-0">
      <div className="flex flex-col w-full max-w-4xl">
        <Title title="Carrito" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {/* Items */}
          <div className="flex flex-col mt-5">
            <Link href="/" className="underline mb-5 text-sm">Continuar comprando</Link>

            {items.map(({ product, quantity }) => {
              const mainImage = product.images?.find(i => i.isMain) ?? product.images?.[0];
              return (
                <div key={product.id} className="flex mb-5 gap-4">
                  {mainImage ? (
                    <Image
                      src={`/api/images/${mainImage.id}`}
                      width={100}
                      height={100}
                      style={{ width: '100px', height: '100px' }}
                      alt={product.title}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-400">Sin imagen</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1 flex-1">
                    <Link href={`/product/${product.slug}`} className="font-medium hover:underline">
                      {product.title}
                    </Link>
                    {product.color && <span className="text-xs text-gray-500">{product.color}</span>}
                    <span className="text-sm">€{product.price.toFixed(2)}</span>

                    <div className="flex items-center gap-3 mt-1">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        <IoRemoveOutline size={12} />
                      </button>
                      <span className="text-sm w-4 text-center">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        <IoAddOutline size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(product.id)}
                      className="flex items-center gap-1 text-red-500 text-xs mt-1 hover:underline"
                    >
                      <IoTrashOutline size={14} /> Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen */}
          <div className="bg-white rounded-xl shadow-xl p-7 h-fit mt-5">
            <h2 className="text-2xl mb-4">Resumen de orden</h2>

            <div className="grid grid-cols-2 gap-y-2">
              <span className="text-gray-600">Artículos</span>
              <span className="text-right">{totalItems()}</span>

              <span className="text-gray-600">Subtotal</span>
              <span className="text-right">€{subtotal.toFixed(2)}</span>

              <span className="text-gray-600">IVA (21%)</span>
              <span className="text-right">€{tax.toFixed(2)}</span>

              <span className="mt-4 text-2xl font-bold">Total</span>
              <span className="mt-4 text-2xl font-bold text-right">€{total.toFixed(2)}</span>
            </div>

            <div className="mt-6">
              <Link className="flex btn-primary justify-center" href="/checkout">
                Tramitar pedido
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
