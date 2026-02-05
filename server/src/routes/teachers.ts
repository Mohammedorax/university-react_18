import { FastifyInstance } from 'fastify';

async function teacherRoutes(fastify: FastifyInstance) {
  const prisma = fastify.prisma;

  fastify.get('/', async (request, reply) => {
    const { page = 1, limit = 10, search, department, status } = request.query as any;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (department) where.departmentId = department;
    if (status) where.status = status;

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { email: true } }, department: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.teacher.count({ where }),
    ]);

    return { success: true, data: teachers, pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total, itemsPerPage: limit } };
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as any;
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: { user: { select: { email: true, lastLoginAt: true } }, department: true, courses: { include: { course: true } }, courseSections: true },
    });
    if (!teacher) return reply.status(404).send({ success: false, error: 'المعلم غير موجود' });
    return { success: true, data: teacher };
  });

  fastify.post('/', async (request, reply) => {
    const data = request.body as any;
    const passwordHash = await fastify.prisma.$queryRaw`SELECT crypt('${data.password}', gen_salt('bf'))`;
    const user = await prisma.user.create({ data: { email: data.email, passwordHash: passwordHash as string, role: 'TEACHER' } });
    const teacher = await prisma.teacher.create({
      data: { userId: user.id, employeeId: `TCH-${Date.now()}`, firstName: data.firstName, lastName: data.lastName, dateOfBirth: new Date(data.dateOfBirth), gender: data.gender, phone: data.phone, specialization: data.specialization, departmentId: data.departmentId },
    });
    return { success: true, data: teacher };
  });

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;
    const teacher = await prisma.teacher.update({ where: { id }, data });
    return { success: true, data: teacher };
  });

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as any;
    await prisma.teacher.delete({ where: { id } });
    return { success: true, message: 'تم حذف المعلم بنجاح' };
  });

  fastify.get('/:id/courses', async (request, reply) => {
    const { id } = request.params as any;
    const courses = await prisma.courseSection.findMany({ where: { teacherId: id }, include: { course: true, enrollments: true } });
    return { success: true, data: courses };
  });
}

export { teacherRoutes };
