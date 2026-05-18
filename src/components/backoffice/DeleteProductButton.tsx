'use client';

import { useRouter } from 'next/navigation';
import { IoTrashOutline } from 'react-icons/io5';
import { useState } from 'react';

interface Props {
  id: string;
  title: string;
}

export const DeleteProductButton = ({ id, title }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 disabled:opacity-50"
      title="Eliminar"
    >
      <IoTrashOutline size={18} />
    </button>
  );
};
