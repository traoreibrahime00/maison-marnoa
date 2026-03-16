import { PrismaClient } from '@prisma/client';
import { products } from '../src/app/data/products';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  
  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        category: p.category,
        collection: p.collection,
        description: p.description,
        isNew: p.isNew,
        isBestseller: p.isBestseller,
        isFeatured: p.isFeatured,
        stock: p.stock
      },
    });
    console.log(`Created product with id: ${product.id}`);
  }
  
  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
