import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@uni.local' },
    update: {},
    create: {
      email: 'admin@uni.local',
      passwordHash: adminPassword,
      name: 'مدير النظام',
      role: UserRole.admin,
    },
  })

  const csDept = await prisma.department.upsert({
    where: { code: 'CS' },
    update: {},
    create: { name: 'علوم الحاسب', code: 'CS' },
  })

  await prisma.course.upsert({
    where: { code: 'CS101' },
    update: {},
    create: {
      code: 'CS101',
      name: 'مقدمة في البرمجة',
      description: 'أساسيات البرمجة باستخدام Python',
      credits: 3,
      maxStudents: 40,
      departmentId: csDept.id,
    },
  })

  console.log('✅ Seed complete. Admin:', admin.email, 'password: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
