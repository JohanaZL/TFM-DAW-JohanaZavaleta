import { Title } from '@/components/ui/title/Title';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { IoCheckmarkCircleOutline, IoCloseCircleOutline, IoTimeOutline } from 'react-icons/io5';

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect('/auth/login?redirect=/orders');

  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <Title title="Mis Pedidos" />

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>No tienes pedidos todavía.</p>
          <Link href="/" className="btn-primary mt-4 inline-block">Explorar productos</Link>
        </div>
      ) : (
        <div className="mb-10 overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-200 border-b">
              <tr>
                <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">Ticket</th>
                <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">Fecha</th>
                <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">Total</th>
                <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">Estado</th>
                <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">Opciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="bg-white border-b transition hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono">{order.ticketNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold">€{order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    {order.status === 'cancelled' ? (
                      <span className="flex items-center gap-1 text-red-600 text-sm">
                        <IoCloseCircleOutline /> Cancelado
                      </span>
                    ) : order.status === 'delivered' ? (
                      <span className="flex items-center gap-1 text-green-700 text-sm">
                        <IoCheckmarkCircleOutline /> Entregado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600 text-sm">
                        <IoTimeOutline /> {order.status === 'pending' ? 'Confirmado' : order.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link href={`/orders/${order.id}`} className="hover:underline text-blue-600">
                      Ver detalles
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
