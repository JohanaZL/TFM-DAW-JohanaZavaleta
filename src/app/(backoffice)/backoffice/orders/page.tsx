import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { IoCheckmarkCircleOutline, IoCloseCircleOutline, IoTimeOutline } from 'react-icons/io5';

export default async function BackofficeOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { title: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pedidos ({orders.length})</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>No hay pedidos todavía.</p>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Ticket</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Cliente</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Productos</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Total</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/orders/${order.id}`} className="font-mono text-xs text-blue-600 hover:underline">
                      {order.ticketNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{order.user.name}</p>
                    <p className="text-xs text-gray-400">{order.user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-xs">
                    {order.items.map(i => i.product.title).join(', ')}
                  </td>
                  <td className="px-6 py-4 font-semibold">€{order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    {order.status === 'cancelled' ? (
                      <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                        <IoCloseCircleOutline /> Cancelado
                      </span>
                    ) : order.status === 'delivered' ? (
                      <span className="flex items-center gap-1 text-green-700 text-xs font-medium">
                        <IoCheckmarkCircleOutline /> Entregado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600 text-xs font-medium">
                        <IoTimeOutline /> {order.status === 'pending' ? 'Confirmado' : order.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
