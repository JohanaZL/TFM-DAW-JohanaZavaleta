import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { TicketStatusBadge } from '@/components/soporte/TicketStatusBadge';
import { TicketChat } from '@/components/soporte/TicketChat';
import { AdminTicketActions } from '@/components/backoffice/AdminTicketActions';
import Link from 'next/link';
import Image from 'next/image';
import {
  IoArrowBackOutline,
  IoPersonOutline,
  IoReceiptOutline,
  IoCubeOutline,
  IoCartOutline,
} from 'react-icons/io5';

interface Props { params: Promise<{ id: string }> }

function getMainImageSrc(images: { id: number; isMain: boolean }[]): string | null {
  if (images.length === 0) return null;
  const main = images.find(i => i.isMain) ?? images[0];
  return `/api/images/${main.id}`;
}

export default async function BackofficeSoporteDetailPage({ params }: Props) {
  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      order: { select: { id: true, ticketNumber: true, total: true, status: true } },
      product: {
        include: {
          images: { select: { id: true, isMain: true }, take: 2 },
          category: { select: { name: true } },
        },
      },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!ticket) notFound();

  // Productos del carrito adjuntos al ticket
  const cartProducts =
    ticket.cartProductIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: ticket.cartProductIds } },
          include: {
            images: { select: { id: true, isMain: true }, take: 1 },
            category: { select: { name: true } },
          },
        })
      : [];

  // Ordenar cartProducts según el orden original de cartProductIds
  const cartProductsOrdered = ticket.cartProductIds
    .map(pid => cartProducts.find(p => p.id === pid))
    .filter(Boolean) as typeof cartProducts;

  // Marcar mensajes del cliente como leídos
  await prisma.ticketMessage.updateMany({
    where: { ticketId: id, senderType: 'CUSTOMER', isRead: false },
    data: { isRead: true },
  });

  const messages = ticket.messages.map(m => ({
    id: m.id,
    senderType: m.senderType as 'CUSTOMER' | 'ADMIN',
    messageText: m.messageText,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-3xl">
      <Link
        href="/backoffice/soporte"
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <IoArrowBackOutline size={16} />
        Volver a consultas
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{ticket.subject}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Abierto el {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <TicketStatusBadge status={ticket.status} />
          <AdminTicketActions ticketId={id} currentStatus={ticket.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Info del usuario */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <IoPersonOutline size={16} />
            <span className="text-xs font-semibold uppercase tracking-wide">Cliente</span>
          </div>
          <p className="font-medium text-gray-800">{ticket.user.name}</p>
          <p className="text-sm text-gray-500">{ticket.user.email}</p>
          {ticket.phone && <p className="text-sm text-gray-500 mt-1">{ticket.phone}</p>}
        </div>

        {/* Pedido relacionado */}
        {ticket.order ? (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 text-gray-500">
              <IoReceiptOutline size={16} />
              <span className="text-xs font-semibold uppercase tracking-wide">Pedido relacionado</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium text-gray-800">#{ticket.order.ticketNumber}</p>
                <p className="text-sm text-gray-500">
                  €{ticket.order.total.toFixed(2)} — {ticket.order.status}
                </p>
              </div>
              <Link
                href="/backoffice/orders"
                className="text-sm text-primary hover:text-primary-dark font-medium shrink-0"
              >
                Ver pedido →
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-center">
            <p className="text-sm text-gray-400">Sin pedido relacionado</p>
          </div>
        )}
      </div>

      {/* Producto específico */}
      {ticket.product && (
        <div className="bg-white border border-primary-muted rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3 text-primary">
            <IoCubeOutline size={16} />
            <span className="text-xs font-semibold uppercase tracking-wide">Producto consultado</span>
          </div>
          <div className="flex items-center gap-3">
            {(() => {
              const src = getMainImageSrc(ticket.product.images);
              return src ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                  <Image src={src} alt={ticket.product.title} fill className="object-cover" sizes="64px" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <IoCubeOutline size={24} className="text-gray-300" />
                </div>
              );
            })()}
            <div className="min-w-0">
              <Link
                href={`/product/${ticket.product.slug}`}
                className="font-medium text-gray-800 hover:text-primary transition-colors"
                target="_blank"
              >
                {ticket.product.title}
              </Link>
              <p className="text-sm text-gray-500 mt-0.5">
                €{ticket.product.price.toFixed(2)}
                {ticket.product.category && (
                  <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                    {ticket.product.category.name}
                  </span>
                )}
              </p>
              <p className={`text-xs mt-1 ${ticket.product.inStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {ticket.product.inStock > 0 ? `${ticket.product.inStock} en stock` : 'Sin stock'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Productos del carrito */}
      {cartProductsOrdered.length > 0 && (
        <div className="bg-white border border-amber-100 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3 text-amber-600">
            <IoCartOutline size={16} />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Productos del carrito ({cartProductsOrdered.length})
            </span>
          </div>
          <div className="space-y-3">
            {cartProductsOrdered.map(product => {
              const src = getMainImageSrc(product.images);
              return (
                <div key={product.id} className="flex items-center gap-3">
                  {src ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                      <Image src={src} alt={product.title} fill className="object-cover" sizes="48px" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <IoCubeOutline size={18} className="text-gray-300" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${product.slug}`}
                      className="text-sm font-medium text-gray-800 hover:text-primary transition-colors truncate block"
                      target="_blank"
                    >
                      {product.title}
                    </Link>
                    <p className="text-xs text-gray-500">
                      €{product.price.toFixed(2)}
                      {product.category && (
                        <span className="ml-2 bg-gray-100 px-1.5 py-0.5 rounded">
                          {product.category.name}
                        </span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                      product.inStock > 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {product.inStock > 0 ? `${product.inStock} stock` : 'Sin stock'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-700">Conversación</p>
        </div>
        <TicketChat
          ticketId={id}
          initialMessages={messages}
          currentRole="ADMIN"
          isClosed={ticket.status === 'RESOLVED'}
        />
      </div>
    </div>
  );
}
