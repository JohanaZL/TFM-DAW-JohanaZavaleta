'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  IoGridOutline,
  IoCubeOutline,
  IoListOutline,
  IoReceiptOutline,
  IoHomeOutline,
} from 'react-icons/io5';

const navItems = [
  { href: '/backoffice', label: 'Dashboard', icon: IoGridOutline, exact: true },
  { href: '/backoffice/products', label: 'Productos', icon: IoCubeOutline },
  { href: '/backoffice/categories', label: 'Categorías', icon: IoListOutline },
  { href: '/backoffice/orders', label: 'Pedidos', icon: IoReceiptOutline },
];

export const BackofficeNav = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl min-h-screen">
      <div className="p-6 border-b border-gray-700">
        <p className="font-bold text-lg">Teslo Backoffice</p>
        <p className="text-xs text-gray-400">Panel de administración</p>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <IoHomeOutline size={20} />
          Ir a la tienda
        </Link>
      </div>
    </aside>
  );
};
