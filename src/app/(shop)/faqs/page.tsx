'use client';

import { useState } from 'react';
import { Title } from '@/components/ui/title/Title';
import { IoChevronDownOutline } from 'react-icons/io5';
import clsx from 'clsx';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSection {
  category: string;
  items: FaqItem[];
}

const faqs: FaqSection[] = [
  {
    category: 'Envío y entrega',
    items: [
      {
        question: '¿Cuánto tarda la entrega de un pedido?',
        answer:
          'El plazo de entrega estándar es de 5 a 10 días hábiles dependiendo de la zona geográfica. Para pedidos voluminosos (sofás, camas, armarios) el plazo puede extenderse hasta 15 días hábiles. Recibirás un email de confirmación con el número de seguimiento en cuanto el pedido salga de nuestro almacén.',
      },
      {
        question: '¿Realizáis envíos a toda España?',
        answer:
          'Sí, realizamos envíos a toda la península ibérica, incluidos Portugal, así como a las Islas Baleares. Los envíos a Canarias, Ceuta y Melilla tienen condiciones especiales de tarifa y plazo; puedes consultarlas durante el proceso de checkout.',
      },
      {
        question: '¿Puedo cambiar la dirección de entrega después de realizar el pedido?',
        answer:
          'Puedes modificar la dirección de entrega dentro de las primeras 24 horas tras realizar el pedido contactando con nuestro servicio de atención al cliente. Una vez el pedido haya salido de almacén no es posible cambiar la dirección.',
      },
      {
        question: '¿El envío tiene algún coste?',
        answer:
          'Los envíos son gratuitos para pedidos superiores a 500 €. Para pedidos de menor importe, el coste de envío se calcula en función del volumen y el destino y se muestra claramente en el proceso de compra antes de confirmar el pago.',
      },
    ],
  },
  {
    category: 'Montaje',
    items: [
      {
        question: '¿Los muebles vienen montados?',
        answer:
          'La mayoría de nuestros muebles se entregan desmontados para facilitar el transporte y reducir el riesgo de daños. Cada producto incluye instrucciones de montaje detalladas y todo el herraje necesario. En la ficha de cada producto se indica si se entrega ya montado.',
      },
      {
        question: '¿Ofrecéis servicio de montaje a domicilio?',
        answer:
          'Sí, disponemos de un servicio de montaje profesional a domicilio por un coste adicional que varía según el tipo de mueble y tu ubicación. Puedes añadir este servicio durante el proceso de compra o contactarnos una vez realizado el pedido.',
      },
      {
        question: '¿Qué hago si me faltan piezas o el herraje está incompleto?',
        answer:
          'Contáctanos a través del formulario de soporte o por email indicando tu número de pedido y las piezas que faltan. Realizamos envíos de repuesto sin coste adicional en un plazo máximo de 5 días hábiles.',
      },
    ],
  },
  {
    category: 'Materiales y garantía',
    items: [
      {
        question: '¿Qué materiales se utilizan en los muebles?',
        answer:
          'Trabajamos con una amplia variedad de materiales de calidad: madera maciza de roble y pino, tablero DM lacado, tapizados en tela, piel natural y polipiel. En la descripción de cada producto encontrarás el detalle exacto de materiales y acabados.',
      },
      {
        question: '¿Cuánta garantía tienen los productos?',
        answer:
          'Todos nuestros muebles cuentan con una garantía mínima de 2 años conforme a la normativa europea de protección al consumidor. Para defectos de fabricación, la garantía cubre la reparación o sustitución del producto sin coste para el cliente.',
      },
      {
        question: '¿Cómo debo cuidar y limpiar los muebles?',
        answer:
          'Las recomendaciones de limpieza varían según el material. En general, para madera se recomienda un paño húmedo y productos específicos para madera; para tapizados, aspirado regular y limpieza puntual con paño suave. Cada producto incluye en su ficha las instrucciones de cuidado específicas.',
      },
    ],
  },
  {
    category: 'Devoluciones y cambios',
    items: [
      {
        question: '¿Puedo devolver un mueble si no me convence?',
        answer:
          'Sí, dispones de 30 días desde la recepción del pedido para solicitar una devolución. El mueble debe estar en perfecto estado, sin montar (o desmontado en su embalaje original) y sin signos de uso. Los gastos de recogida corren por cuenta del cliente salvo en casos de defecto de fabricación.',
      },
      {
        question: '¿En cuánto tiempo recibiré el reembolso?',
        answer:
          'Una vez recibamos el mueble en nuestro almacén y verifiquemos su estado, procesaremos el reembolso en un plazo máximo de 14 días hábiles. El importe se devolverá al mismo método de pago utilizado en la compra.',
      },
      {
        question: '¿Qué pasa si el mueble llega dañado?',
        answer:
          'Si el pedido llega con daños, fotografía el embalaje y el producto antes de abrirlo y contáctanos en las primeras 48 horas tras la entrega. Te enviaremos un producto de sustitución sin coste adicional o gestionaremos la reparación según corresponda.',
      },
    ],
  },
  {
    category: 'Pagos y seguridad',
    items: [
      {
        question: '¿Qué métodos de pago aceptáis?',
        answer:
          'Aceptamos tarjeta de crédito y débito (Visa, Mastercard, American Express), transferencia bancaria y pago en cuotas sin intereses para pedidos superiores a 300 € a través de nuestros partners financieros.',
      },
      {
        question: '¿Es seguro comprar en Teslo Muebles?',
        answer:
          'Sí, nuestra tienda dispone de certificado SSL y cumple con los estándares PCI-DSS para el procesamiento seguro de pagos. No almacenamos datos de tarjetas en nuestros servidores; el pago se procesa directamente a través de pasarelas de pago certificadas.',
      },
      {
        question: '¿Emitís factura?',
        answer:
          'Sí, emitimos factura para todos los pedidos. Puedes descargarla desde tu área de cliente en el apartado "Mis Pedidos". Si necesitas factura con datos de empresa, indícalos durante el proceso de compra.',
      },
    ],
  },
  {
    category: 'Stock y personalización',
    items: [
      {
        question: '¿Cómo sé si un producto está en stock?',
        answer:
          'En la ficha de cada producto se muestra el número de unidades disponibles. Si el producto aparece como "Sin stock", puedes activar el aviso de reposición para recibir una notificación por email en cuanto vuelva a estar disponible.',
      },
      {
        question: '¿Puedo pedir un mueble en otro color o acabado?',
        answer:
          'Algunos de nuestros modelos ofrecen múltiples opciones de color y acabado seleccionables en la ficha del producto. Si necesitas una personalización especial que no esté disponible online, contáctanos y estudiaremos la solicitud con nuestro equipo de producción.',
      },
      {
        question: '¿Hacéis pedidos a medida?',
        answer:
          'Sí, disponemos de un servicio de muebles a medida para proyectos de interiorismo y reformas. Contacta con nosotros a través del formulario de contacto o por teléfono para que uno de nuestros especialistas estudie tu caso.',
      },
    ],
  },
];

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-gray-200">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full text-left py-4 flex justify-between items-center gap-4 hover:text-blue-700 transition-colors"
          >
            <span className="text-sm font-medium text-gray-800">{item.question}</span>
            <IoChevronDownOutline
              size={18}
              className={clsx(
                'shrink-0 text-gray-400 transition-transform duration-200',
                openIndex === i && 'rotate-180'
              )}
            />
          </button>
          {openIndex === i && (
            <p className="pb-4 text-sm text-gray-600 leading-relaxed">{item.answer}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function FaqsPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Title title="Preguntas frecuentes" subTitle="Todo lo que necesitas saber sobre Teslo Muebles" />

      <div className="mt-10 space-y-10">
        {faqs.map(section => (
          <section key={section.category}>
            <h2 className="text-base font-semibold text-blue-700 uppercase tracking-wide mb-2">
              {section.category}
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 px-5">
              <FaqAccordion items={section.items} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
