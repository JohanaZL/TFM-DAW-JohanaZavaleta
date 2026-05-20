'use client';

import { useRef, useState } from "react";
import Image from "next/image";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productImage: string;
  productTitle: string;
}

export const TryOnModal = ({ isOpen, onClose, productImage, productTitle }: Props) => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [userMimeType, setUserMimeType] = useState<string>("image/jpeg");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultMimeType, setResultMimeType] = useState<string>("image/jpeg");
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
      // dataUrl format: "data:image/jpeg;base64,XXXXX"
      const [meta, base64] = dataUrl.split(",");
      const mime = meta.split(":")[1].split(";")[0];
      setUserMimeType(mime);
      setUserImage(base64);
      setResultImage(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!userImage) return;

    setLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const res = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userImage, userMimeType, productImage }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error desconocido");
        return;
      }

      setResultImage(data.image);
      setResultMimeType(data.mimeType ?? "image/jpeg");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUserImage(null);
    setResultImage(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Pruébate: {productTitle}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-black text-2xl leading-none"
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>

        {/* Step 1 — upload photo */}
        {!userImage && (
          <div className="flex flex-col items-center gap-3 py-4">
            <p className="text-sm text-gray-500 text-center">
              Sube una foto tuya para ver cómo te quedaría esta prenda
            </p>
            <div className="flex gap-3">
              <button
                className="btn-secondary"
                onClick={() => cameraInputRef.current?.click()}
              >
                📷 Tomar foto
              </button>
              <button
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                🖼 Subir imagen
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Preview user photo */}
        {userImage && !resultImage && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-gray-500">Tu foto:</p>
            <Image
              src={`data:${userMimeType};base64,${userImage}`}
              alt="Tu foto"
              className="max-h-56 rounded-lg object-contain border"
            />
            <div className="flex gap-3">
              <button
                className="btn-secondary text-sm"
                onClick={() => {
                  setUserImage(null);
                  setError(null);
                }}
              >
                Cambiar foto
              </button>
              <button
                className="btn-primary text-sm"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? "Generando..." : "Generar mi look"}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
            <p className="text-sm text-gray-500">Generando tu look con IA...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Result */}
        {resultImage && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm font-semibold text-gray-700">¡Así te quedaría!</p>
            <Image
              src={`data:${resultMimeType};base64,${resultImage}`}
              alt="Tu look generado"
              width={400}
              height={500}
              className="rounded-xl object-contain border shadow"
              unoptimized
            />
            <button
              className="btn-secondary text-sm"
              onClick={() => {
                setUserImage(null);
                setResultImage(null);
                setError(null);
              }}
            >
              Intentar con otra foto
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
