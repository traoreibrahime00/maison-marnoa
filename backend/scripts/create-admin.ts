import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

const EMAIL = 'contact@maisonmarnoa.com';
const PASSWORD = 'maisonmarnoa@21';
const NAME = 'Admin Marnoa';

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

  const hashed = await hashPassword(PASSWORD);

  const user = await prisma.user.create({
    data: {
      email: EMAIL,
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
