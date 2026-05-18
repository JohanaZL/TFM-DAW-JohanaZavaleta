'use client';

import { titleFont } from '@/config/fonts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuthStore } from '@/store';

export default function NewAccountPage() {
  const router = useRouter();
  const setUser = useAuthStore(s => s.setUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Error al crear la cuenta');
        return;
      }
      setUser(data.user);
      router.push('/');
    } catch {
      setError('Error de red. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pt-32 sm:pt-52">
      <h1 className={`${titleFont.className} text-4xl mb-5`}>Nueva Cuenta</h1>

      <form onSubmit={handleSubmit} className="flex flex-col">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <label htmlFor="name">Nombre completo</label>
        <input
          id="name"
          className="px-5 py-2 border bg-gray-200 rounded mb-1"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <p className="text-xs text-gray-500 mb-4">Solo letras, números y espacios</p>

        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          className="px-5 py-2 border bg-gray-200 rounded mb-5"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          className="px-5 py-2 border bg-gray-200 rounded mb-1"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <p className="text-xs text-gray-500 mb-5">
          Mínimo 6 caracteres, con mayúscula, minúscula y un número
        </p>

        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </button>

        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-gray-500"></div>
          <div className="px-2 text-gray-800">O</div>
          <div className="flex-1 border-t border-gray-500"></div>
        </div>

        <Link href="/auth/login" className="btn-secondary text-center">
          Ingresar
        </Link>
      </form>
    </div>
  );
}
