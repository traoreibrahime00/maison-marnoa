import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

const EMAIL = process.argv[2] || process.env.ADMIN_EMAIL;
const PASSWORD = process.argv[3] || process.env.ADMIN_PASSWORD;
const NAME = process.argv[4] || process.env.ADMIN_NAME || 'Admin Marnoa';

if (!EMAIL || !PASSWORD) {
  console.error('Usage: npm run create:admin -- <email> <password> [name]');
  console.error('   ou: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run create:admin');
  process.exit(1);
}

async function main() {
  // Import dynamique pour ESM compat
  const { hashPassword } = await import('better-auth/crypto');

  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    // S'assurer que le rôle est bien admin
    await prisma.user.update({ where: { email: EMAIL }, data: { role: 'admin' } });
    console.log(`✓ Utilisateur existant mis à jour en admin : ${EMAIL}`);
    return;
  }

  const hashed = await hashPassword(PASSWORD!);

  const user = await prisma.user.create({
    data: {
      email: EMAIL!,
      name: NAME,
      role: 'admin',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await prisma.account.create({
    data: {
      userId: user.id,
      accountId: user.id,
      providerId: 'credential',
      password: hashed,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log(`✓ Admin créé avec succès : ${EMAIL}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
