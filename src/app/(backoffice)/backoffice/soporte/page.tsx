import { prisma } from '@/lib/prisma';
import { TicketStatusBadge } from '@/components/soporte/TicketStatusBadge';
import { BackofficeSoporteFilters } from '@/components/backoffice/BackofficeSoporteFilters';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ status?: string; search?: string }>;
}

export default async function BackofficeSoportePage({ searchParams }: Props) {
  const { status, search = '' } = await searchParams;

  const tickets = await prisma.supportTicket.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(search
        ? {
            OR: [
              { user: { name: { contains: search, mode: 'insensitive' } } },
              { user: { email: { contains: search, mode: 'insensitive' } } },
              { subject: { contains: search, mode: 'insensitive' } },
              { order: { ticketNumber: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { name: true, email: true } },
      order: { select: { ticketNumber: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const counts = await prisma.supportTicket.groupBy({
    by: ['status'],
    _count: { _all: true },
  });
  const countMap = Object.fromEntries(counts.map(c => [c.status, c._count._all]));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Soporte</h1>
          <p className="text-sm text-gray-500">Gestión de consultas de clientes</p>
        </div>
        <div className="flex gap-3 text-sm">
          <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 font-medium">
            Pendientes: {countMap['PENDING'] ?? 0}
          </span>
          <span className="px-2 py-1 rounded bg-primary-light text-primary font-medium">
            En revisión: {countMap['IN_REVIEW'] ?? 0}
          </span>
        </div>
      </div>

      <BackofficeSoporteFilters currentStatus={status} currentSearch={search} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-4">
        {tickets.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium">No hay consultas con estos filtros.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Usuario</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">Asunto</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden lg:table-cell">Pedido</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{ticket.user.name}</p>
                    <p className="text-xs text-gray-400">{ticket.user.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-gray-700 line-clamp-1">{ticket.subject}</p>
                    {ticket.messages[0] && (
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                        {ticket.messages[0].messageText}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500">
                    {ticket.order ? `#${ticket.order.ticketNumber}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <TicketStatusBadge status={ticket.status} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                    {new Date(ticket.updatedAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/backoffice/soporte/${ticket.id}`}
                      className="text-primary hover:text-primary-dark font-medium"
                    >
                      Ver
                    </Link>
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
