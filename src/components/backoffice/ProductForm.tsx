'use client';

import { Category } from '@/interfaces';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';

interface ProductFormData {
  id?: string;
  title: string;
  description: string;
  price: number;
  inStock: number;
  slug: string;
  categoryId: string;
  material: string;
  dimensions: string;
  color: string;
  weight: string;
  tags: string;
  existingImageId?: number;
}

interface Props {
  categories: Category[];
  initialData?: ProductFormData;
}

export const ProductForm = ({ categories, initialData }: Props) => {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    inStock: 1,
    slug: '',
    categoryId: categories[0]?.id ?? '',
    material: '',
    dimensions: '',
    color: '',
    weight: '',
    tags: '',
    ...initialData,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.existingImageId ? `/api/images/${initialData.existingImageId}` : null
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));

    // Auto-generate slug from title
    if (name === 'title' && !initialData?.id) {
      setForm(f => ({
        ...f,
        title: value,
        slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'existingImageId' && value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    if (imageFile) formData.append('image', imageFile);

    const isEdit = !!initialData?.id;
    const url = isEdit ? `/api/products/${initialData!.id}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Error al guardar el producto');
        return;
      }
      router.push('/backoffice/products');
      router.refresh();
    } catch {
      setError('Error de red. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-1">Título *</label>
          <input name="title" value={form.title} onChange={handleChange} required
            className="w-full border rounded px-3 py-2 bg-gray-50" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug *</label>
          <input name="slug" value={form.slug} onChange={handleChange} required
            className="w-full border rounded px-3 py-2 bg-gray-50" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción *</label>
        <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
          className="w-full border rounded px-3 py-2 bg-gray-50 resize-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-sm font-medium mb-1">Precio (€) *</label>
          <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required
            className="w-full border rounded px-3 py-2 bg-gray-50" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stock *</label>
          <input name="inStock" type="number" min="0" value={form.inStock} onChange={handleChange} required
            className="w-full border rounded px-3 py-2 bg-gray-50" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Categoría *</label>
          <select name="categoryId" value={form.categoryId} onChange={handleChange} required
            className="w-full border rounded px-3 py-2 bg-gray-50">
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div>
          <label className="block text-sm font-medium mb-1">Material</label>
          <input name="material" value={form.material} onChange={handleChange}
            placeholder="Ej: Roble macizo" className="w-full border rounded px-3 py-2 bg-gray-50" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dimensiones</label>
          <input name="dimensions" value={form.dimensions} onChange={handleChange}
            placeholder="Ej: 200x90x75 cm" className="w-full border rounded px-3 py-2 bg-gray-50" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Color</label>
          <input name="color" value={form.color} onChange={handleChange}
            placeholder="Ej: Blanco nórdico" className="w-full border rounded px-3 py-2 bg-gray-50" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Peso (kg)</label>
          <input name="weight" type="number" step="0.1" min="0" value={form.weight} onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-gray-50" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tags (separados por comas)</label>
        <input name="tags" value={form.tags} onChange={handleChange}
          placeholder="moderno, escandinavo, madera..." className="w-full border rounded px-3 py-2 bg-gray-50" />
      </div>

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Imagen del producto</label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {imagePreview ? (
            <div className="flex flex-col items-center gap-2">
              <Image src={imagePreview} alt="Preview" width={200} height={200} className="object-contain rounded" unoptimized />
              <span className="text-sm text-gray-500">Haz clic para cambiar la imagen</span>
            </div>
          ) : (
            <div className="text-gray-400">
              <p className="text-3xl mb-2">📷</p>
              <p className="text-sm">Haz clic o arrastra una imagen aquí</p>
              <p className="text-xs mt-1">JPG, PNG, WEBP hasta 10MB</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? 'Guardando...' : (initialData?.id ? 'Guardar cambios' : 'Crear producto')}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
};
