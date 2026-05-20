'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';

const STATUSES = [
  { value: '', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'IN_REVIEW', label: 'En revisión' },
  { value: 'RESOLVED', label: 'Resueltos' },
];

interface Props {
  currentStatus?: string;
  currentSearch: string;
}

export const BackofficeSoporteFilters = ({ currentStatus = '', currentSearch }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(currentSearch);

  const navigate = (status: string, q: string) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (q) params.set('search', q);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Filtros de estado */}
      <div className="flex gap-1 flex-wrap">
        {STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => navigate(s.value, search)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
              currentStatus === s.value
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-300 text-gray-600 hover:bg-gray-100'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Búsqueda */}
      <div className="flex gap-2 sm:ml-auto">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && navigate(currentStatus ?? '', search)}
          placeholder="Buscar por usuario, asunto o pedido..."
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[220px]"
        />
        <button
          onClick={() => navigate(currentStatus ?? '', search)}
          className="btn-primary text-sm px-3"
        >
          Buscar
        </button>
      </div>
    </div>
  );
};
