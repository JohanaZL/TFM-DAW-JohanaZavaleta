import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptAndDecompress } from '@/lib/imageUtils';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key no configurada' }, { status: 500 });
  }

  let roomImage: string;
  let roomMimeType: string;
  let productImageId: number;

  try {
    const body = await req.json();
    roomImage = body.roomImage;
    roomMimeType = body.roomMimeType ?? 'image/jpeg';
    productImageId = parseInt(body.productImageId);
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la petición inválido' }, { status: 400 });
  }

  if (!roomImage || !productImageId) {
    return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
  }

  // Fetch and decrypt product image from DB
  const productImg = await prisma.productImage.findUnique({ where: { id: productImageId } });
  if (!productImg) {
    return NextResponse.json({ error: 'Imagen del producto no encontrada' }, { status: 404 });
  }

  let productImageBase64: string;
  let productMimeType: string;
  try {
    const decoded = await decryptAndDecompress(Buffer.from(productImg.imageData));
    productImageBase64 = decoded.toString('base64');
    productMimeType = productImg.mimeType;
  } catch {
    return NextResponse.json({ error: 'Error al procesar la imagen del producto' }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

  const prompt =
    'You are an interior design assistant. Given a photo of a room and a furniture product image, ' +
    'generate a realistic photo showing the furniture naturally placed in that room. ' +
    'Keep the room\'s architecture, lighting, and existing elements exactly as they are. ' +
    'Place only the furniture piece in a natural, realistic position within the room so the result looks like a real interior photo.';

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: roomMimeType as 'image/jpeg' | 'image/png' | 'image/webp', data: roomImage } },
            { inlineData: { mimeType: productMimeType as 'image/jpeg' | 'image/png' | 'image/webp', data: productImageBase64 } },
          ],
        },
      ],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } as unknown as Record<string, unknown>,
    });

    const parts = result.response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find(p => p.inlineData?.data);

    if (!imagePart?.inlineData) {
      return NextResponse.json({ error: 'Gemini no devolvió una imagen. Intenta con otra foto.' }, { status: 502 });
    }

    return NextResponse.json({
      image: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType ?? 'image/jpeg',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al llamar a Gemini';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
