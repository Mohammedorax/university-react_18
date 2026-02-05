import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = 'admin@university.edu';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 12);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('Admin user already exists');
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.admin.create({
    data: {
      userId: user.id,
      firstName: 'System',
      lastName: 'Administrator',
      position: 'System Admin',
    },
  });

  console.log('Admin user created successfully!');
  console.log('Email: admin@university.edu');
  console.log('Password: admin123');
}

seedAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
