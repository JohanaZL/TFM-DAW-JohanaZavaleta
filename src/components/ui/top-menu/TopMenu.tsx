'use client';

import { IoCartOutline } from 'react-icons/io5';
import { NotificationBell } from '@/components/soporte/NotificationBell';
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useUIStore, useCartStore, useAuthStore } from '@/store';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const navLinks = [
  { href: '/products', label: 'Productos' },
  { href: '/contacto', label: 'Contacto' },
  { href: '/faqs', label: 'FAQs' },
];

export const TopMenu = () => {
  const openSideMenu = useUIStore(state => state.openSideMenu);
  const cartItems = useCartStore(state => state.items);
  const { user, fetchSession } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    fetchSession();
  }, [fetchSession]);

  const cartCount = mounted ? cartItems.length : 0;

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="flex px-5 justify-between items-center w-full h-14">

        {/* LOGO */}
        <div>
          <Link href="/">
            <Image
              src="/imgs/Logo_de_Muebles_con_Alma.png"
              alt="Muebles con Alma"
              width={140}
              height={48}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        {/* NAV LINKS — solo escritorio */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'm-2 p-2 rounded-md text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'bg-primary-light text-primary'
                  : 'hover:bg-gray-100 text-gray-700'
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* ICONOS: SEARCH, CART, MENU */}
        <div className="flex items-center">

          <NotificationBell isLoggedIn={!!user && mounted} />

          <Link href="/cart" className="mx-2" aria-label="Carrito de compra">
            <div className="relative">
              {cartCount > 0 && (
                <span className="absolute text-xs rounded-full px-1 font-bold -top-2 -right-2 bg-primary text-white">
                  {cartCount}
                </span>
              )}
              <IoCartOutline className="w-5 h-5" />
            </div>
          </Link>

          {user && (
            <span className="text-sm mx-2 text-gray-600 hidden md:block">{user.name}</span>
          )}

          <button
            onClick={openSideMenu}
            className="m-2 p-2 rounded-md hover:bg-gray-100 text-sm font-medium"
          >
            Menú
          </button>
        </div>
      </div>
    </nav>
  );
};
