'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { IoAddOutline, IoCreateOutline, IoTrashOutline, IoCheckmarkOutline, IoCloseOutline } from 'react-icons/io5';

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { products: number };
}

interface Props {
  initialCategories: CategoryWithCount[];
}

export const CategoryManager = ({ initialCategories }: Props) => {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName(''); setSlug(''); setDescription(''); setError('');
    setShowForm(false); setEditId(null);
  };

  const startEdit = (cat: CategoryWithCount) => {
    setEditId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description ?? '');
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const url = editId ? `/api/categories/${editId}` : '/api/categories';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, description }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Error'); return; }
      router.refresh();
      resetForm();
    } catch {
      setError('Error de red');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`¿Eliminar categoría "${catName}"? Los productos asociados quedarán sin categoría.`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
        router.refresh();
      }
    } catch {/* noop */}
  };

  return (
    <div>
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2 mb-6"
        >
          <IoAddOutline size={20} /> Nueva Categoría
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-5 mb-6 border">
          <h3 className="font-semibold mb-4">{editId ? 'Editar categoría' : 'Nueva categoría'}</h3>
          {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm mb-3">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (!editId) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                }}
                className="w-full border rounded px-3 py-2" required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full border rounded px-3 py-2" required />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <input value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-1 disabled:opacity-60">
              <IoCheckmarkOutline size={16} /> {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary flex items-center gap-1">
              <IoCloseOutline size={16} /> Cancelar
            </button>
          </div>
        </form>
      )}

      {categories.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay categorías. Crea la primera.</p>
      ) : (
        <table className="min-w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left py-2 pr-4 font-medium text-gray-600">Nombre</th>
              <th className="text-left py-2 pr-4 font-medium text-gray-600">Slug</th>
              <th className="text-left py-2 pr-4 font-medium text-gray-600">Productos</th>
              <th className="text-left py-2 font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="py-3 pr-4 font-medium">{cat.name}</td>
                <td className="py-3 pr-4 text-gray-500 font-mono text-xs">{cat.slug}</td>
                <td className="py-3 pr-4">{cat._count.products}</td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(cat)} className="text-primary hover:text-primary-dark p-1 rounded hover:bg-primary-light">
                      <IoCreateOutline size={16} />
                    </button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50">
                      <IoTrashOutline size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
