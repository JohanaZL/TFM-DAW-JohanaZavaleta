'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store';
import Image from 'next/image';
import { IoCartOutline, IoCubeOutline } from 'react-icons/io5';

interface Order {
  id: string;
  ticketNumber: string;
  total: number;
  createdAt: Date | string;
}

interface ProductContext {
  id: string;
  title: string;
  slug: string;
  price: number;
  imageId?: number;
}

interface Props {
  orders: Order[];
  initialSubject?: string;
  productContext?: ProductContext | null;
  fromCart?: boolean;
}

export const NuevoTicketForm = ({ orders, initialSubject = '', productContext, fromCart = false }: Props) => {
  const router = useRouter();
  const cartItems = useCartStore(state => state.items);

  const [form, setForm] = useState({
    subject: initialSubject,
    message: '',
    phone: '',
    orderId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-rellena el mensaje con los productos del carrito
  useEffect(() => {
    if (!fromCart || cartItems.length === 0) return;
    const lines = cartItems.map(
      ({ product, quantity }) =>
        `- ${product.title} (x${quantity}) — €${(product.price * quantity).toFixed(2)}`
    );
    setForm(prev => ({
      ...prev,
      subject: prev.subject || 'Consulta sobre mi carrito',
      message: `Tengo una consulta sobre los siguientes productos en mi carrito:\n\n${lines.join('\n')}\n\n`,
    }));
  }, [fromCart, cartItems]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      setError('El asunto y el mensaje son obligatorios.');
      return;
    }
    setError('');
    setLoading(true);

    const cartProductIds = fromCart ? cartItems.map(i => i.product.id) : [];

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subject: form.subject,
          message: form.message,
          phone: form.phone || undefined,
          orderId: form.orderId || undefined,
          productId: productContext?.id || undefined,
          cartProductIds: cartProductIds.length > 0 ? cartProductIds : undefined,
        }),
      });

      if (res.status === 401) {
        // Sesión expirada — redirigir a login con vuelta a esta página
        router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Error al crear la consulta. Inténtalo de nuevo.');
        return;
      }

      const ticket = await res.json();
      router.push(`/soporte/${ticket.id}`);
    } catch {
      setError('Error de conexión. Comprueba tu conexión e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 mt-6">

      {/* Contexto: producto */}
      {productContext && (
        <div className="flex items-center gap-3 p-3 bg-primary-light border border-primary-muted rounded-lg">
          <IoCubeOutline size={20} className="text-primary shrink-0" />
          {productContext.imageId && (
            <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden">
              <Image
                src={`/api/images/${productContext.imageId}`}
                alt={productContext.title}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">Producto relacionado</p>
            <p className="text-sm font-medium text-gray-800 truncate">{productContext.title}</p>
            <p className="text-xs text-gray-500">€{productContext.price.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Contexto: carrito */}
      {fromCart && cartItems.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <IoCartOutline size={18} className="text-amber-600" />
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
              Productos en tu carrito ({cartItems.length})
            </p>
          </div>
          <ul className="space-y-1">
            {cartItems.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-center gap-2 text-sm text-gray-700">
                {product.images?.[0] && (
                  <div className="relative w-8 h-8 shrink-0 rounded overflow-hidden">
                    <Image
                      src={`/api/images/${product.images[0].id}`}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                )}
                <span className="truncate">{product.title}</span>
                <span className="shrink-0 text-gray-400">×{quantity}</span>
                <span className="shrink-0 font-medium ml-auto">
                  €{(product.price * quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Asunto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Asunto <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="Ej: Consulta sobre un producto, problema con mi pedido..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          maxLength={200}
        />
      </div>

      {/* Pedido relacionado */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pedido relacionado <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <select
          name="orderId"
          value={form.orderId}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        >
          <option value="">Sin pedido relacionado</option>
          {orders.map(order => (
            <option key={order.id} value={order.id}>
              #{order.ticketNumber} — €{order.total.toFixed(2)} —{' '}
              {new Date(order.createdAt).toLocaleDateString('es-ES')}
            </option>
          ))}
        </select>
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono de contacto <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="+34 600 000 000"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Mensaje */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={5}
          placeholder="Describe tu consulta o problema con el mayor detalle posible..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary flex-1"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enviando...' : 'Enviar consulta'}
        </button>
      </div>
    </form>
  );
};
