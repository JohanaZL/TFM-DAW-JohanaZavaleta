'use client';

import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IoChatbubblesOutline } from 'react-icons/io5';

interface Props {
  productId?: string;
  productTitle?: string;
  productSlug?: string;
  fromCart?: boolean;
  label?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const SupportButton = ({
  productId,
  productTitle,
  productSlug,
  fromCart = false,
  label = '¿Tienes dudas? Contactar soporte',
  className = '',
  variant = 'ghost',
}: Props) => {
  const { user, fetchSession } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchSession();
  }, [fetchSession]);

  const buildTarget = () => {
    const params = new URLSearchParams();
    if (productId) params.set('productId', productId);
    if (productTitle) params.set('productTitle', productTitle);
    if (productSlug) params.set('productSlug', productSlug);
    if (fromCart) params.set('fromCart', '1');
    const query = params.toString();
    return `/soporte/nuevo${query ? `?${query}` : ''}`;
  };

  const handleClick = () => {
    if (!mounted) return;
    const target = buildTarget();
    if (user) {
      router.push(target);
    } else {
      router.push(`/auth/login?redirect=${encodeURIComponent(target)}`);
    }
  };

  const baseStyles =
    variant === 'primary'
      ? 'btn-primary flex items-center gap-2'
      : variant === 'secondary'
      ? 'btn-secondary flex items-center gap-2'
      : 'flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors';

  return (
    <button onClick={handleClick} className={`${baseStyles} ${className}`}>
      <IoChatbubblesOutline size={variant === 'ghost' ? 16 : 18} />
      {label}
    </button>
  );
};
