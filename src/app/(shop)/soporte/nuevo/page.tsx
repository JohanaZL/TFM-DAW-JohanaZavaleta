import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { NuevoTicketForm } from '@/components/soporte/NuevoTicketForm';
import { Title } from '@/components/ui/title/Title';

interface Props {
  searchParams: Promise<{
    productId?: string;
    productTitle?: string;
    productSlug?: string;
    fromCart?: string;
  }>;
}

export default async function NuevoTicketPage({ searchParams }: Props) {
  const session = await getSession();

  const { productId, productTitle, productSlug, fromCart } = await searchParams;

  if (!session) {
    // Reconstruir la URL actual para volver después del login
    const params = new URLSearchParams();
    if (productId) params.set('productId', productId);
    if (productTitle) params.set('productTitle', productTitle);
    if (productSlug) params.set('productSlug', productSlug);
    if (fromCart) params.set('fromCart', fromCart);
    const query = params.toString();
    const returnTo = `/soporte/nuevo${query ? `?${query}` : ''}`;
    redirect(`/auth/login?redirect=${encodeURIComponent(returnTo)}`);
  }

  // Cargar pedidos del usuario para el selector
  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    select: { id: true, ticketNumber: true, total: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Cargar contexto del producto si viene de la página de producto
  let productContext: {
    id: string;
    title: string;
    slug: string;
    price: number;
    imageId?: number;
  } | null = null;

  if (productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: { where: { isMain: true }, take: 1 } },
    });
    if (product) {
      productContext = {
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        imageId: product.images[0]?.id,
      };
    }
  }

  const isFromCart = fromCart === '1';
  const titleText = isFromCart
    ? 'Consulta sobre tu carrito'
    : productContext
    ? `Consulta sobre "${productContext.title}"`
    : 'Nueva consulta';

  const initialSubject = isFromCart
    ? 'Consulta sobre mi carrito'
    : productContext
    ? `Consulta sobre ${productContext.title}`
    : '';

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <Title title={titleText} subTitle="Cuéntanos en qué podemos ayudarte" />
      <NuevoTicketForm
        orders={orders}
        initialSubject={initialSubject}
        productContext={productContext}
        fromCart={isFromCart}
      />
    </div>
  );
}
