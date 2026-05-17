import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key no configurada" }, { status: 500 });
  }

  let userImage: string;
  let productImage: string;
  let userMimeType: string;

  try {
    const body = await req.json();
    userImage = body.userImage;
    productImage = body.productImage;
    userMimeType = body.userMimeType ?? "image/jpeg";
  } catch {
    return NextResponse.json({ error: "Cuerpo de la petición inválido" }, { status: 400 });
  }

  if (!userImage || !productImage) {
    return NextResponse.json({ error: "Faltan imágenes requeridas" }, { status: 400 });
  }

  // Sanitize filename to prevent path traversal
  const safeFilename = path.basename(productImage);
  const productImagePath = path.join(process.cwd(), "public", "products", safeFilename);

  if (!fs.existsSync(productImagePath)) {
    return NextResponse.json({ error: "Imagen del producto no encontrada" }, { status: 404 });
  }

  const productImageBuffer = fs.readFileSync(productImagePath);
  const productImageBase64 = productImageBuffer.toString("base64");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

  const prompt =
    "You are a virtual fashion assistant. Given a photo of a person and a clothing product image, " +
    "generate a realistic photo showing the person wearing that clothing item. " +
    "Keep the person's face, skin tone, hair, and body proportions exactly as they are. " +
    "Replace only the clothing naturally so the result looks like a real photo.";

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType: userMimeType as "image/jpeg" | "image/png" | "image/webp", data: userImage } },
            { inlineData: { mimeType: "image/jpeg", data: productImageBase64 } },
          ],
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      generationConfig: { responseModalities: ["IMAGE", "TEXT"] } as any,
    });

    const parts = result.response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData?.data);

    if (!imagePart?.inlineData) {
      return NextResponse.json(
        { error: "Gemini no devolvió una imagen. Intenta con otra foto." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      image: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType ?? "image/jpeg",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al llamar a Gemini";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
