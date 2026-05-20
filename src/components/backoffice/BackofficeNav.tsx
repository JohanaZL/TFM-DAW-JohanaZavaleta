'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';
import {
  IoGridOutline,
  IoCubeOutline,
  IoListOutline,
  IoReceiptOutline,
  IoHomeOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoSettingsOutline,
  IoChatbubblesOutline,
} from 'react-icons/io5';

const navItems = [
  { href: '/backoffice', label: 'Dashboard', icon: IoGridOutline, exact: true },
  { href: '/backoffice/products', label: 'Productos', icon: IoCubeOutline },
  { href: '/backoffice/categories', label: 'Categorías', icon: IoListOutline },
  { href: '/backoffice/orders', label: 'Pedidos', icon: IoReceiptOutline },
  { href: '/backoffice/soporte', label: 'Soporte', icon: IoChatbubblesOutline },
  { href: '/backoffice/config', label: 'Configuración', icon: IoSettingsOutline },
];

export const BackofficeNav = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const NavContent = () => (
    <>
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        <div>
          <p className="font-bold text-lg">Teslo Backoffice</p>
          <p className="text-xs text-gray-400">Panel de administración</p>
        </div>
        {/* Botón cerrar — solo en mobile overlay */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden text-gray-400 hover:text-white"
          aria-label="Cerrar menú"
        >
          <IoCloseOutline size={24} />
        </button>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
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
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <IoHomeOutline size={20} />
          Ir a la tienda
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Botón hamburguesa — solo mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-lg shadow-lg"
        aria-label="Abrir menú"
      >
        <IoMenuOutline size={22} />
      </button>

      {/* Overlay oscuro — solo mobile cuando está abierto */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar mobile: overlay deslizante */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full w-64 bg-gray-900 text-white flex flex-col shadow-xl z-50 transform transition-transform duration-300',
          'md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <NavContent />
      </aside>

      {/* Sidebar desktop: siempre visible, sin posicionamiento fixed */}
      <aside className="hidden md:flex w-64 bg-gray-900 text-white flex-col shadow-xl min-h-screen shrink-0">
        <NavContent />
      </aside>
    </>
  );
};
