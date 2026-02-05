import { FastifyInstance } from 'fastify';

async function studentRoutes(fastify: FastifyInstance) {
  const prisma = fastify.prisma;

  fastify.get('/', async (request, reply) => {
    const { page = 1, limit = 10, search, department, status } = request.query as any;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }
    
    if (department) {
      where.departmentId = department;
    }
    
    if (status) {
      where.status = status;
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { email: true } },
          department: { select: { name: true, arabicName: true } },
          major: { select: { name: true, arabicName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
    ]);

    return {
      success: true,
      data: students,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as any;
    
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, lastLoginAt: true } },
        department: true,
        major: true,
        enrollments: {
          include: {
            courseSection: {
              include: { course: true, teacher: true },
            },
          },
        },
        grades: {
          include: { courseSection: { include: { course: true } } },
        },
        payments: true,
      },
    });

    if (!student) {
      return reply.status(404).send({ success: false, error: 'الطالب غير موجود' });
    }

    return { success: true, data: student };
  });

  fastify.post('/', async (request, reply) => {
    try {
      const data = request.body as any;
      
      const passwordHash = await fastify.prisma.$queryRaw`SELECT crypt('${data.password}', gen_salt('bf'))`;
      
      const user = await prisma.user.create({
        data: {
          email: data.email,
          passwordHash: passwordHash as string,
          role: 'STUDENT',
        },
      });

      const student = await prisma.student.create({
        data: {
          userId: user.id,
          studentId: `STU-${Date.now()}`,
          firstName: data.firstName,
          lastName: data.lastName,
          arabicName: data.arabicName,
          dateOfBirth: new Date(data.dateOfBirth),
          gender: data.gender,
          phone: data.phone,
          address: data.address,
          departmentId: data.departmentId,
          majorId: data.majorId,
          year: data.year || 1,
        },
      });

      return { success: true, data: student };
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({ success: false, error: error.message });
    }
  });

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;

    const student = await prisma.student.update({
      where: { id },
      data,
    });

    return { success: true, data: student };
  });

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as any;

    await prisma.student.delete({ where: { id } });

    return { success: true, message: 'تم حذف الطالب بنجاح' };
  });

  fastify.get('/:id/grades', async (request, reply) => {
    const { id } = request.params as any;
    
    const grades = await prisma.grade.findMany({
      where: { studentId: id },
      include: {
        courseSection: {
          include: { course: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: grades };
  });

  fastify.get('/:id/enrollments', async (request, reply) => {
    const { id } = request.params as any;
    
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: id },
      include: {
        courseSection: {
          include: { course: true, teacher: true },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return { success: true, data: enrollments };
  });
}

export { studentRoutes };
