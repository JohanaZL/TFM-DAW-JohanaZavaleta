'use client';

import { Title } from '@/components/ui/title/Title';
import { IoMailOutline, IoCallOutline, IoLocationOutline, IoTimeOutline } from 'react-icons/io5';

export default function ContactoPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Title title="Contacto" subTitle="Estamos aquí para ayudarte" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">

        {/* Información de contacto */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">Información de contacto</h2>

          <div className="flex items-start gap-4">
            <IoLocationOutline size={24} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-700">Dirección</p>
              <p className="text-gray-500 text-sm">Calle del Mueble 42, 28001 Madrid, España</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <IoCallOutline size={24} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-700">Teléfono</p>
              <p className="text-gray-500 text-sm">+34 900 123 456</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <IoMailOutline size={24} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-700">Email</p>
              <p className="text-gray-500 text-sm">soporte@teslomuebles.es</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <IoTimeOutline size={24} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-700">Horario de atención</p>
              <p className="text-gray-500 text-sm">Lunes a viernes: 9:00 – 18:00</p>
              <p className="text-gray-500 text-sm">Sábados: 10:00 – 14:00</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Envíanos un mensaje</h2>
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                placeholder="Tu nombre"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
              <textarea
                rows={5}
                placeholder="¿En qué podemos ayudarte?"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full"
            >
              Enviar mensaje
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
