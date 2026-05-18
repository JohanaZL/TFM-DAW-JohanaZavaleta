'use client';

import { Title } from '@/components/ui/title/Title';
import { useCartStore, useAuthStore } from '@/store';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { user, fetchSession } = useAuthStore();
  const router = useRouter();

  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !loading) {
      // Small delay to let fetchSession complete
      const timer = setTimeout(() => {
        const authStore = useAuthStore.getState();
        if (!authStore.user && !authStore.isLoading) {
          router.push('/auth/login?redirect=/checkout');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Title title="Checkout" />
        <p className="text-gray-500">Tu carrito está vacío</p>
        <Link href="/" className="btn-primary">Explorar productos</Link>
      </div>
    );
  }

  const subtotal = totalPrice();
  const tax = subtotal * 0.21;
  const total = subtotal + tax;

  const handlePay = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }
    if (!address.trim()) {
      setError('La dirección de entrega es obligatoria');
      return;
    }

    setLoading(true);
    setError('');

    // Sync cart with server first
    await useCartStore.getState().syncWithServer();

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Error al procesar el pedido');
        return;
      }
      clearCart();
      router.push(`/orders/${data.id}`);
    } catch {
      setError('Error de red. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start mb-20 px-4 sm:px-0">
      <div className="flex flex-col w-full max-w-4xl">
        <Title title="Verificar Pedido" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {/* Items */}
          <div className="flex flex-col mt-5">
            <Link href="/cart" className="underline mb-5 text-sm">Editar carrito</Link>

            {items.map(({ product, quantity }) => {
              const mainImage = product.images?.find(i => i.isMain) ?? product.images?.[0];
              return (
                <div key={product.id} className="flex mb-5 gap-3">
                  {mainImage ? (
                    <Image
                      src={`/api/images/${mainImage.id}`}
                      width={80}
                      height={80}
                      style={{ width: '80px', height: '80px' }}
                      alt={product.title}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded" />
                  )}
                  <div>
                    <p className="font-medium">{product.title}</p>
                    <p className="text-sm text-gray-500">€{product.price.toFixed(2)} × {quantity}</p>
                    <p className="font-semibold">€{(product.price * quantity).toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form + Resumen */}
          <form onSubmit={handlePay} className="bg-white rounded-xl shadow-xl p-7">
            <h2 className="text-xl font-semibold mb-4">Dirección de entrega</h2>

            <textarea
              className="w-full border rounded px-3 py-2 text-sm bg-gray-50 mb-2 resize-none"
              rows={3}
              placeholder="Calle, número, ciudad, código postal..."
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
            />

            <div className="w-full h-px bg-gray-200 my-5" />

            <h2 className="text-xl font-semibold mb-3">Resumen</h2>
            <div className="grid grid-cols-2 gap-y-1 text-sm mb-5">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-right">€{subtotal.toFixed(2)}</span>
              <span className="text-gray-600">IVA (21%)</span>
              <span className="text-right">€{tax.toFixed(2)}</span>
              <span className="font-bold text-lg mt-2">Total</span>
              <span className="font-bold text-lg text-right mt-2">€{total.toFixed(2)}</span>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm mb-4">
                {error}
              </div>
            )}

            {!user && (
              <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-sm mb-4">
                Debes <Link href="/auth/login?redirect=/checkout" className="underline font-semibold">iniciar sesión</Link> para finalizar el pedido
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !user}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Procesando...' : '💳 Pagar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
