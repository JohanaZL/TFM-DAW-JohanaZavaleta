'use client';

import { useState } from 'react';

interface Props {
  initialParagraph: string;
}

export const SiteConfigForm = ({ initialParagraph }: Props) => {
  const [paragraph, setParagraph] = useState(initialParagraph);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = async () => {
    setStatus('saving');
    try {
      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homeParagraph: paragraph }),
      });
      setStatus(res.ok ? 'saved' : 'error');
    } catch {
      setStatus('error');
    }
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Párrafo de la página de inicio
        </label>
        <p className="text-xs text-gray-400 mb-2">
          Este texto aparece debajo del carrusel principal en la página de inicio.
        </p>
        <textarea
          rows={5}
          value={paragraph}
          onChange={e => setParagraph(e.target.value)}
          placeholder="Escribe aquí el texto que quieres mostrar en la home..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={status === 'saving'}
          className="btn-primary disabled:opacity-50"
        >
          {status === 'saving' ? 'Guardando...' : 'Guardar cambios'}
        </button>
        {status === 'saved' && (
          <span className="text-sm text-green-600 font-medium">¡Guardado correctamente!</span>
        )}
        {status === 'error' && (
          <span className="text-sm text-red-500 font-medium">Error al guardar.</span>
        )}
      </div>
    </div>
  );
};
