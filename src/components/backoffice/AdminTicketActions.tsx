'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  ticketId: string;
  currentStatus: string;
}

export const AdminTicketActions = ({ ticketId, currentStatus }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const changeStatus = async (newStatus: string) => {
    if (loading || currentStatus === newStatus) return;
    setLoading(true);
    try {
      await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {currentStatus !== 'IN_REVIEW' && currentStatus !== 'RESOLVED' && (
        <button
          onClick={() => changeStatus('IN_REVIEW')}
          disabled={loading}
          className="text-sm px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50 font-medium"
        >
          Marcar en revisión
        </button>
      )}
      {currentStatus !== 'RESOLVED' && (
        <button
          onClick={() => changeStatus('RESOLVED')}
          disabled={loading}
          className="text-sm px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50 font-medium"
        >
          Marcar resuelto
        </button>
      )}
      {currentStatus === 'RESOLVED' && (
        <button
          onClick={() => changeStatus('IN_REVIEW')}
          disabled={loading}
          className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
        >
          Reabrir
        </button>
      )}
    </div>
  );
};
