'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productImageId: number;
  productTitle: string;
}

export const RoomPreviewModal = ({ isOpen, onClose, productImageId, productTitle }: Props) => {
  const [roomImage, setRoomImage] = useState<string | null>(null);
  const [roomMimeType, setRoomMimeType] = useState<string>('image/jpeg');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultMimeType, setResultMimeType] = useState<string>('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const [meta, base64] = dataUrl.split(',');
      const mime = meta.split(':')[1].split(';')[0];
      setRoomMimeType(mime);
      setRoomImage(base64);
      setResultImage(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!roomImage) return;
    setLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const res = await fetch('/api/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomImage,
          roomMimeType,
          productImageId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Error desconocido');
        return;
      }
      setResultImage(data.image);
      setResultMimeType(data.mimeType ?? 'image/jpeg');
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRoomImage(null);
    setResultImage(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={handleClose}>
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 flex flex-col gap-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">🏠 Ver en tu hogar: {productTitle}</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-black text-2xl leading-none">
            &times;
          </button>
        </div>

        {!roomImage && (
          <div className="flex flex-col items-center gap-3 py-4">
            <p className="text-sm text-gray-500 text-center">
              Sube una foto de tu habitación y la IA visualizará cómo quedaría este mueble en ella
            </p>
            <div className="flex gap-3">
              <button className="btn-secondary" onClick={() => cameraInputRef.current?.click()}>
                📷 Foto de habitación
              </button>
              <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
                🖼 Subir imagen
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
          </div>
        )}

        {roomImage && !resultImage && !loading && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-gray-500">Tu habitación:</p>
            <Image
              src={`data:${roomMimeType};base64,${roomImage}`}
              alt="Tu habitación"
              width={400}
              height={300}
              className="max-h-56 rounded-lg object-contain border"
              unoptimized
            />
            <div className="flex gap-3">
              <button className="btn-secondary text-sm" onClick={() => { setRoomImage(null); setError(null); }}>
                Cambiar foto
              </button>
              <button className="btn-primary text-sm" onClick={handleGenerate}>
                Visualizar mueble
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
            <p className="text-sm text-gray-500">Generando visualización con IA...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {resultImage && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm font-semibold text-gray-700">¡Así quedaría en tu hogar!</p>
            <Image
              src={`data:${resultMimeType};base64,${resultImage}`}
              alt="Visualización en tu hogar"
              width={400}
              height={400}
              className="rounded-xl object-contain border shadow"
              unoptimized
            />
            <button className="btn-secondary text-sm" onClick={() => { setRoomImage(null); setResultImage(null); setError(null); }}>
              Intentar con otra foto
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
