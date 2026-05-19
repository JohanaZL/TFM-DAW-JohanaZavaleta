import { Title } from '@/components/ui/title/Title';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect('/auth/login');

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { select: { id: true, mimeType: true, fileName: true, isMain: true, productId: true } },
            },
          },
        },
      },
      user: { select: { name: true, email: true } },
    },
  });

  if (!order || (order.userId !== session.id && session.role !== 'admin')) {
    redirect('/orders');
  }

  const subtotal = order.items.reduce((s, i) => s + i.priceAtBuy * i.quantity, 0);
  const tax = order.total - subtotal;

  return (
    <div className="flex justify-center items-start mb-20 px-4 sm:px-0">
      <div className="flex flex-col w-full max-w-4xl">
        <Title title={`Pedido #${order.ticketNumber}`} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">

          {/* Items */}
          <div className="flex flex-col mt-5">
            <div className="flex items-center gap-2 rounded-lg py-2 px-4 text-sm font-bold text-white bg-green-700 mb-5 w-fit">
              <IoCheckmarkCircleOutline size={24} />
              <span>Pedido confirmado</span>
            </div>

            {order.items.map(item => {
              const mainImage = item.product.images?.find(i => i.isMain) ?? item.product.images?.[0];
              return (
                <div key={item.id} className="flex mb-5 gap-3">
                  {mainImage ? (
                    <Image
                      src={`/api/images/${mainImage.id}`}
                      width={80}
                      height={80}
                      style={{ width: '80px', height: '80px' }}
                      alt={item.product.title}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded" />
                  )}
                  <div>
                    <p className="font-medium">{item.product.title}</p>
                    <p className="text-sm text-gray-500">€{item.priceAtBuy.toFixed(2)} × {item.quantity}</p>
                    <p className="font-semibold">€{(item.priceAtBuy * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ticket */}
          <div className="bg-white rounded-xl shadow-xl p-7">
            {/* Ticket header */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-5 text-center">
              <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-1">Ticket de Compra</h3>
              <p className="font-mono text-lg font-bold">{order.ticketNumber}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(order.createdAt).toLocaleDateString('es-ES', {
                  day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 font-semibold">Cliente</p>
              <p className="text-sm">{order.user.name}</p>
              <p className="text-xs text-gray-400">{order.user.email}</p>
            </div>

            {order.address && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 font-semibold">Dirección de entrega</p>
                <p className="text-sm">{order.address}</p>
              </div>
            )}

            <div className="w-full h-px bg-gray-200 mb-4" />

            <div className="grid grid-cols-2 gap-y-1 text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-right">€{subtotal.toFixed(2)}</span>
              <span className="text-gray-600">IVA (21%)</span>
              <span className="text-right">€{tax.toFixed(2)}</span>
              <span className="font-bold text-lg mt-2">Total</span>
              <span className="font-bold text-lg text-right mt-2">€{order.total.toFixed(2)}</span>
            </div>

            <div className="w-full h-px bg-gray-200 my-4" />

            <div className={clsx(
              'flex items-center gap-2 rounded-lg py-2 px-4 text-sm font-bold text-white',
              {
                'bg-green-700': order.status === 'delivered' || order.status === 'pending',
                'bg-yellow-600': order.status === 'processing' || order.status === 'shipped',
                'bg-red-500': order.status === 'cancelled',
              }
            )}>
              <IoCheckmarkCircleOutline size={20} />
              <span className="capitalize">{order.status === 'pending' ? 'Pagado' : order.status}</span>
            </div>

            <div className="mt-5">
              <Link href="/orders" className="btn-secondary w-full text-center block">
                Ver todos mis pedidos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
