import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback to .env

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' }
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Upsert a product
app.post('/api/products', async (req, res) => {
  try {
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
        stock: data.stock
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
        stock: data.stock
      }
    });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save product' });
  }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});
