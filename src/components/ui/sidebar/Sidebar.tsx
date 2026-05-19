'use client';

import { useUIStore, useAuthStore } from '@/store';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IoCloseOutline,
  IoLogInOutline,
  IoLogOutOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoSearchOutline,
  IoTicketOutline,
  IoHomeOutline,
  IoSettingsOutline,
} from 'react-icons/io5';

export const Sidebar = () => {
  const isSideMenuOpen = useUIStore(state => state.isSideMenuOpen);
  const closeMenu = useUIStore(state => state.closeSideMenu);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    closeMenu();
    router.push('/');
  };

  return (
    <div>
      {isSideMenuOpen && (
        <div className='fixed top-0 left-0 w-screen h-screen z-10 bg-black opacity-30' />
      )}

      {isSideMenuOpen && (
        <div
          onClick={closeMenu}
          className='fade-in fixed top-0 left-0 w-screen h-screen z-10 backdrop-filter backdrop-blur-sm'
        />
      )}

      <nav className={clsx(
        'fixed p-5 right-0 top-0 w-[500px] h-screen bg-white z-20 shadow-2xl transform transition-all duration-300',
        { 'translate-x-full': !isSideMenuOpen }
      )}>
        <IoCloseOutline
          size={50}
          className='absolute top-5 right-5 cursor-pointer'
          onClick={closeMenu}
        />

        <div className='relative mt-14'>
          <IoSearchOutline size={20} className='absolute top-2 left-2' />
          <input
            type="text"
            placeholder='Buscar muebles...'
            className='w-full bg-gray-50 rounded pl-10 py-1 pr-10 border-b-2 text-xl border-gray-200 focus:outline-none focus:border-blue-500'
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const q = (e.target as HTMLInputElement).value;
                closeMenu();
                router.push(`/products?q=${encodeURIComponent(q)}`);
              }
            }}
          />
        </div>

        {user ? (
          <>
            <Link onClick={closeMenu} href='/orders' className='flex items-center mt-10 p-2 hover:bg-gray-100 rounded transition-all'>
              <IoPersonOutline size={30} />
              <span className='ml-3 text-xl'>{user.name}</span>
            </Link>
            <Link onClick={closeMenu} href='/orders' className='flex items-center mt-4 p-2 hover:bg-gray-100 rounded transition-all'>
              <IoTicketOutline size={30} />
              <span className='ml-3 text-xl'>Mis Pedidos</span>
            </Link>
            <button onClick={handleLogout} className='flex items-center mt-4 p-2 hover:bg-gray-100 rounded transition-all w-full'>
              <IoLogOutOutline size={30} />
              <span className='ml-3 text-xl'>Cerrar Sesión</span>
            </button>
          </>
        ) : (
          <>
            <Link onClick={closeMenu} href='/auth/login' className='flex items-center mt-10 p-2 hover:bg-gray-100 rounded transition-all'>
              <IoLogInOutline size={30} />
              <span className='ml-3 text-xl'>Ingresar</span>
            </Link>
            <Link onClick={closeMenu} href='/auth/new-account' className='flex items-center mt-4 p-2 hover:bg-gray-100 rounded transition-all'>
              <IoPersonOutline size={30} />
              <span className='ml-3 text-xl'>Crear Cuenta</span>
            </Link>
          </>
        )}

        <div className='w-full h-px bg-gray-200 my-10' />

        <Link onClick={closeMenu} href='/' className='flex items-center mt-4 p-2 hover:bg-gray-100 rounded transition-all'>
          <IoHomeOutline size={30} />
          <span className='ml-3 text-xl'>Inicio</span>
        </Link>

        <Link onClick={closeMenu} href='/products' className='flex items-center mt-4 p-2 hover:bg-gray-100 rounded transition-all'>
          <IoSearchOutline size={30} />
          <span className='ml-3 text-xl'>Todos los productos</span>
        </Link>

        {user?.role === 'admin' && (
          <>
            <div className='w-full h-px bg-gray-200 my-5' />
            <Link onClick={closeMenu} href='/backoffice' className='flex items-center mt-4 p-2 hover:bg-gray-100 rounded transition-all'>
              <IoSettingsOutline size={30} />
              <span className='ml-3 text-xl'>Backoffice</span>
            </Link>
            <Link onClick={closeMenu} href='/backoffice/products' className='flex items-center mt-4 p-2 hover:bg-gray-100 rounded transition-all'>
              <IoPeopleOutline size={30} />
              <span className='ml-3 text-xl'>Gestión de Productos</span>
            </Link>
            <Link onClick={closeMenu} href='/backoffice/orders' className='flex items-center mt-4 p-2 hover:bg-gray-100 rounded transition-all'>
              <IoTicketOutline size={30} />
              <span className='ml-3 text-xl'>Gestión de Pedidos</span>
            </Link>
          </>
        )}
      </nav>
    </div>
  );
};
