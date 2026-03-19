/**
 * Crée un utilisateur admin dans la base de données.
 * Usage: npm run create:admin [email] [password] [name]
 * Exemple: npm run create:admin admin@maisonmarnoa.com MonMotDePasse Admin
 */
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

const prisma = new PrismaClient();

const email    = process.argv[2] || 'admin@maisonmarnoa.com';
const password = process.argv[3] || 'Marnoa2025!';
const name     = process.argv[4] || 'Admin Marnoa';
const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';

async function main() {
  console.log(`\nCréation de l'admin: ${email}\n`);

  // 1. Sign up via Better Auth (crée l'utilisateur avec le hash correct)
  const res = await fetch(`${backendUrl}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string; code?: string };
    // Si l'utilisateur existe déjà on continue pour juste mettre à jour le rôle
    if (res.status !== 422 && !body.message?.toLowerCase().includes('exist')) {
      throw new Error(`Erreur sign-up (${res.status}): ${JSON.stringify(body)}`);
    }
    console.log('ℹ️  Utilisateur déjà existant — mise à jour du rôle en admin...');
  } else {
    console.log('✓ Compte créé via Better Auth');
  }

  // 2. Forcer le rôle 'admin' dans la DB
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'admin' },
  });

  console.log(`✅ Admin configuré avec succès !`);
  console.log(`   Email  : ${user.email}`);
  console.log(`   Nom    : ${user.name}`);
  console.log(`   ID     : ${user.id}`);
  console.log(`   Rôle   : ${user.role}`);
  console.log(`\nConnectez-vous sur /admin avec ces identifiants.\n`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async e => {
    console.error('\n❌ Erreur:', e.message);
    console.error('   Assurez-vous que le backend tourne (npm run dev:backend)\n');
    await prisma.$disconnect();
    process.exit(1);
  });
