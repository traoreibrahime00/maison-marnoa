import { PrismaClient } from '@prisma/client';
import { products } from '../../frontend/src/app/data/products';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding…');

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        image: p.image,
        images: p.images ?? [p.image],
        category: p.category,
        collection: p.collection,
        description: p.description,
        material: p.material ?? '',
        weight: p.weight ?? '',
        sizes: p.sizes ?? [],
        colorVariants: p.colorVariants ? JSON.parse(JSON.stringify(p.colorVariants)) : null,
        rating: p.rating ?? 4.5,
        reviews: p.reviews ?? 0,
        isNew: p.isNew ?? false,
        isBestseller: p.isBestseller ?? false,
        isFeatured: p.isFeatured ?? false,
        stock: p.stock ?? null,
      },
      create: {
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        image: p.image,
        images: p.images ?? [p.image],
        category: p.category,
        collection: p.collection,
        description: p.description,
        material: p.material ?? '',
        weight: p.weight ?? '',
        sizes: p.sizes ?? [],
        colorVariants: p.colorVariants ? JSON.parse(JSON.stringify(p.colorVariants)) : null,
        rating: p.rating ?? 4.5,
        reviews: p.reviews ?? 0,
        isNew: p.isNew ?? false,
        isBestseller: p.isBestseller ?? false,
        isFeatured: p.isFeatured ?? false,
        stock: p.stock ?? null,
      },
    });
    console.log(`  ✓ ${product.name} (${product.id})`);
  }

  console.log(`\nSeeding finished — ${products.length} products.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
