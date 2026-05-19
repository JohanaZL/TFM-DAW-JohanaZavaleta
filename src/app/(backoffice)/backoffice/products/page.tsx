import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { IoAddOutline, IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import { DeleteProductButton } from '@/components/backoffice/DeleteProductButton';

export default async function BackofficeProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link href="/backoffice/products/new" className="btn-primary flex items-center gap-2">
          <IoAddOutline size={20} /> Nuevo Producto
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No hay productos todavía.</p>
            <Link href="/backoffice/products/new" className="btn-primary mt-4 inline-block">
              Crear primer producto
            </Link>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Producto</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Categoría</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Precio</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Stock</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{product.title}</p>
                      <p className="text-xs text-gray-400">{product.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.category.name}</td>
                  <td className="px-6 py-4 font-semibold">€{product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.inStock === 0 ? 'bg-red-100 text-red-700' :
                      product.inStock < 5 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {product.inStock} ud.
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/backoffice/products/${product.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                        title="Editar"
                      >
                        <IoCreateOutline size={18} />
                      </Link>
                      <DeleteProductButton id={product.id} title={product.title} />
                    </div>
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
