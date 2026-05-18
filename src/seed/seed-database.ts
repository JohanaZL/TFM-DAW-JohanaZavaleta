import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { compressAndEncrypt } from '../lib/imageUtils';
import { hashPassword } from '../lib/auth';
import { furnitureCategories, furnitureProducts } from './furniture-seed';
import https from 'https';
import http from 'http';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log('🌱 Iniciando seed de Teslo Muebles...');

  // Clear existing data
  console.log('🗑️  Limpiando datos existentes...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  console.log('👤 Creando usuario admin...');
  await prisma.user.create({
    data: {
      name: 'Admin Teslo',
      email: 'admin@teslo.com',
      password: await hashPassword('Admin1234!'),
      role: 'admin',
    },
  });

  // Create categories
  console.log('📁 Creando categorías de muebles...');
  const categoryMap = new Map<string, string>();
  for (const cat of furnitureCategories) {
    const created = await prisma.category.create({ data: cat });
    categoryMap.set(cat.slug, created.id);
  }

  // Create products with images
  console.log('🪑 Creando productos...');
  for (const product of furnitureProducts) {
    const categoryId = categoryMap.get(product.categorySlug);
    if (!categoryId) {
      console.warn(`  ⚠️  Categoría no encontrada: ${product.categorySlug}`);
      continue;
    }

    const created = await prisma.product.create({
      data: {
        title: product.title,
        description: product.description,
        price: product.price,
        inStock: product.inStock,
        slug: product.slug,
        categoryId,
        material: product.material,
        dimensions: product.dimensions,
        color: product.color,
        weight: product.weight,
        tags: product.tags,
      },
    });

    // Download and store image
    try {
      process.stdout.write(`  📷 Descargando imagen para "${product.title}"... `);
      const imageBuffer = await downloadImage(product.imageUrl);
      const encrypted = await compressAndEncrypt(imageBuffer);

      // Detect MIME type from URL
      const mimeType = product.imageUrl.includes('.png') ? 'image/png' :
                       product.imageUrl.includes('.webp') ? 'image/webp' : 'image/jpeg';

      await prisma.productImage.create({
        data: {
          imageData: new Uint8Array(encrypted),
          mimeType,
          fileName: `${product.slug}.jpg`,
          isMain: true,
          productId: created.id,
        },
      });
      console.log('✅');
    } catch (err) {
      console.log(`❌ Error: ${err instanceof Error ? err.message : 'desconocido'}`);
      // Create a placeholder tiny image (1x1 gray JPEG in base64)
      const placeholder = Buffer.from(
        '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=',
        'base64'
      );
      try {
        const encryptedPlaceholder = await compressAndEncrypt(placeholder);
        await prisma.productImage.create({
          data: {
            imageData: new Uint8Array(encryptedPlaceholder),
            mimeType: 'image/jpeg',
            fileName: `${product.slug}-placeholder.jpg`,
            isMain: true,
            productId: created.id,
          },
        });
      } catch { /* If placeholder also fails, product has no image */ }
    }
  }

  console.log('\n✅ Seed completado!');
  console.log('📧 Admin: admin@teslo.com / Admin1234!');
  console.log(`📦 ${furnitureCategories.length} categorías, ${furnitureProducts.length} productos`);
}

main()
  .catch(e => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
