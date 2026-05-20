import { prisma } from '@/lib/prisma';
import { IoCubeOutline, IoListOutline, IoReceiptOutline, IoCashOutline } from 'react-icons/io5';

export default async function BackofficeDashboard() {
  const [totalProducts, totalCategories, totalOrders, revenue] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } } },
  });

  const stats = [
    { label: 'Productos', value: totalProducts, icon: IoCubeOutline, color: 'bg-primary' },
    { label: 'Categorías', value: totalCategories, icon: IoListOutline, color: 'bg-green-500' },
    { label: 'Pedidos', value: totalOrders, icon: IoReceiptOutline, color: 'bg-yellow-500' },
    { label: 'Ingresos', value: `€${(revenue._sum.total ?? 0).toFixed(2)}`, icon: IoCashOutline, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <div className={`${color} text-white p-3 rounded-lg`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Últimos Pedidos</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay pedidos todavía.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4">Ticket</th>
                <th className="py-2 pr-4">Cliente</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 pr-4 font-mono text-xs">{order.ticketNumber}</td>
                  <td className="py-2 pr-4">{order.user.name}</td>
                  <td className="py-2 pr-4 font-semibold">€{order.total.toFixed(2)}</td>
                  <td className="py-2 capitalize text-gray-600">{order.status === 'pending' ? 'Confirmado' : order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
