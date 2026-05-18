import { prisma } from '@/lib/prisma';
import { CategoryManager } from '@/components/backoffice/CategoryManager';

export default async function BackofficeCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categorías</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <CategoryManager initialCategories={categories} />
      </div>
    </div>
  );
}
