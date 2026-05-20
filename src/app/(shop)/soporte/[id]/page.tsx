import { getSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { TicketStatusBadge } from '@/components/soporte/TicketStatusBadge';
import { TicketChat } from '@/components/soporte/TicketChat';
import Link from 'next/link';
import { IoArrowBackOutline } from 'react-icons/io5';

interface Props { params: Promise<{ id: string }> }

export default async function TicketDetailPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  const { id } = await params;
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      order: { select: { id: true, ticketNumber: true, total: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!ticket) notFound();
  if (ticket.userId !== session.id && session.role !== 'admin') notFound();

  // Marcar mensajes ADMIN como leídos
  if (session.role !== 'admin') {
    await prisma.ticketMessage.updateMany({
      where: { ticketId: id, senderType: 'ADMIN', isRead: false },
      data: { isRead: true },
    });
  }

  const messages = ticket.messages.map(m => ({
    id: m.id,
    senderType: m.senderType as 'CUSTOMER' | 'ADMIN',
    messageText: m.messageText,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/soporte" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <IoArrowBackOutline size={16} />
        Volver a mis consultas
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Cabecera del ticket */}
        <div className="p-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div>
            <h1 className="font-semibold text-gray-800">{ticket.subject}</h1>
            {ticket.order && (
              <p className="text-xs text-gray-400 mt-0.5">
                Pedido #{ticket.order.ticketNumber} — €{ticket.order.total.toFixed(2)}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">
              Abierto el {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
            </p>
          </div>
          <TicketStatusBadge status={ticket.status} />
        </div>

        {/* Chat */}
        <TicketChat
          ticketId={id}
          initialMessages={messages}
          currentRole="CUSTOMER"
          isClosed={ticket.status === 'RESOLVED'}
        />
      </div>
    </div>
  );
}
