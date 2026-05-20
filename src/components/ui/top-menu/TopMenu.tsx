'use client';

import { titleFont } from '@/config/fonts';
import { IoSearchOutline, IoCartOutline } from 'react-icons/io5';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useUIStore, useCartStore, useAuthStore } from '@/store';

export const TopMenu = () => {
  const openSideMenu = useUIStore(state => state.openSideMenu);
  const cartItems = useCartStore(state => state.items);
  const { user, fetchSession } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchSession();
  }, [fetchSession]);

  const cartCount = mounted ? cartItems.length : 0;

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">

      {/* Fila principal */}
      <div className="flex px-5 justify-between items-center w-full h-14">

        {/* LOGO */}
        <div>
          <Link href="/">
            <span className={`${titleFont.className} font-bold`}>Teslo</span>
            <span> | Muebles</span>
          </Link>
        </div>

        {/* OPCIONES DE MENU — solo escritorio */}
        <div className="hidden md:flex">
          <Link className="m-2 p-2 rounded-md hover:bg-gray-100" href="/category/sofas">Sofás</Link>
          <Link className="m-2 p-2 rounded-md hover:bg-gray-100" href="/category/sillas">Sillas</Link>
          <Link className="m-2 p-2 rounded-md hover:bg-gray-100" href="/category/mesas">Mesas</Link>
          <Link className="m-2 p-2 rounded-md hover:bg-gray-100" href="/category/camas">Camas</Link>
        </div>

        {/* SEARCH, CART, MENU */}
        <div className="flex items-center">
          <Link href="/products" className="mx-2">
            <IoSearchOutline className="w-5 h-5" />
          </Link>

          <Link href="/cart" className="mx-2">
            <div className="relative">
              {cartCount > 0 && (
                <span className="absolute text-xs rounded-full px-1 font-bold -top-2 -right-2 bg-blue-700 text-white">
                  {cartCount}
                </span>
              )}
              <IoCartOutline className="w-5 h-5" />
            </div>
          </Link>

          {user ? (
            <span className="text-sm mx-2 text-gray-600 hidden md:block">{user.name}</span>
          ) : null}

          <button
            onClick={openSideMenu}
            className="m-2 p-2 rounded-md hover:bg-gray-100">
            Menú
          </button>
        </div>
      </div>

      {/* Barra de categorías — solo móvil */}
      <div className="flex md:hidden overflow-x-auto px-3 pb-2 gap-1 border-t border-gray-100 scrollbar-hide">
        <Link className="shrink-0 text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200" href="/category/sofas">Sofás</Link>
        <Link className="shrink-0 text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200" href="/category/sillas">Sillas</Link>
        <Link className="shrink-0 text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200" href="/category/mesas">Mesas</Link>
        <Link className="shrink-0 text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200" href="/category/camas">Camas</Link>
      </div>

    </nav>
  );
};
