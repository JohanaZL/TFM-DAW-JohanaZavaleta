'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IoNotificationsOutline } from 'react-icons/io5';

interface Props {
  isLoggedIn: boolean;
}

export const NotificationBell = ({ isLoggedIn }: Props) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchCount = async () => {
      try {
        const res = await fetch('/api/tickets/unread-count');
        if (!res.ok) return;
        const data = await res.json();
        setCount(data.count ?? 0);
      } catch { /* silently ignore */ }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;

  return (
    <Link href="/soporte" className="mx-2 relative" aria-label="Notificaciones de soporte">
      {count > 0 && (
        <span className="absolute text-xs rounded-full px-1 font-bold -top-2 -right-2 bg-red-500 text-white min-w-[16px] text-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
      <IoNotificationsOutline className="w-5 h-5" />
    </Link>
  );
};
