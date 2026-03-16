import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: any, res: any) {
  // Add CORS headers for local development testing
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: 'asc' },
      });
      return res.status(200).json(products);
    } 
    
    if (req.method === 'POST') {
      const data = req.body;
      const product = await prisma.product.upsert({
        where: { id: data.id },
        update: {
          name: data.name,
          price: data.price,
          image: data.image,
          category: data.category,
          collection: data.collection,
          description: data.description,
          isNew: data.isNew,
          isBestseller: data.isBestseller,
          isFeatured: data.isFeatured,
          stock: data.stock !== '' ? Number(data.stock) : null
        },
        create: {
          id: data.id,
          name: data.name,
          price: data.price,
          image: data.image,
          category: data.category,
          collection: data.collection,
          description: data.description,
          isNew: data.isNew,
          isBestseller: data.isBestseller,
          isFeatured: data.isFeatured,
          stock: data.stock !== '' ? Number(data.stock) : null
        }
      });
      return res.status(200).json(product);
    }

    res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
