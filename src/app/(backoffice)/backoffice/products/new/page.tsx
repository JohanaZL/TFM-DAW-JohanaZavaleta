import { prisma } from '@/lib/prisma';
import { ProductForm } from '@/components/backoffice/ProductForm';

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  if (categories.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Nuevo Producto</h1>
        <p className="text-gray-500 mb-4">Primero debes crear al menos una categoría.</p>
        <a href="/backoffice/categories" className="btn-primary">
          Ir a Categorías
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Nuevo Producto</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
