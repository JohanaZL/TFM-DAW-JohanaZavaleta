import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Title } from '@/components/ui/title/Title';
import Link from 'next/link';
import { IoAddCircleOutline, IoChatbubblesOutline } from 'react-icons/io5';
import { TicketStatusBadge } from '@/components/soporte/TicketStatusBadge';

export default async function SoportePage() {
  const session = await getSession();
  if (!session) redirect('/auth/login?redirect=/soporte');

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.id },
    include: {
      order: { select: { ticketNumber: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Title title="Mi soporte" subTitle="Historial de consultas" className="mb-0" />
        <Link href="/soporte/nuevo" className="btn-primary flex items-center gap-2 text-sm shrink-0">
          <IoAddCircleOutline size={18} />
          Nueva consulta
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <IoChatbubblesOutline size={48} className="mx-auto mb-4" />
          <p className="font-medium text-gray-500">No tienes consultas abiertas</p>
          <p className="text-sm mt-1 text-gray-400">Abre una nueva consulta si necesitas ayuda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <Link
              key={ticket.id}
              href={`/soporte/${ticket.id}`}
              className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">{ticket.subject}</p>
                  {ticket.order && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Pedido #{ticket.order.ticketNumber}
                    </p>
                  )}
                  {ticket.messages[0] && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {ticket.messages[0].messageText}
                    </p>
                  )}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <TicketStatusBadge status={ticket.status} />
                  <span className="text-xs text-gray-400">
                    {new Date(ticket.updatedAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
