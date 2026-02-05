import { FastifyInstance } from 'fastify';

async function courseRoutes(fastify: FastifyInstance) {
  const prisma = fastify.prisma;
  fastify.get('/', async (request, reply) => {
    const { page = 1, limit = 10, search, department } = request.query as any;
    const where: any = {};
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }];
    if (department) where.departmentId = department;
    const [courses, total] = await Promise.all([
      prisma.course.findMany({ where, skip: (page - 1) * limit, take: limit, include: { department: true }, orderBy: { createdAt: 'desc' } }),
      prisma.course.count({ where }),
    ]);
    return { success: true, data: courses, pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total, itemsPerPage: limit } };
  });
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as any;
    const course = await prisma.course.findUnique({ where: { id }, include: { department: true, sections: { include: { teacher: true } } } });
    if (!course) return reply.status(404).send({ success: false, error: 'المادة غير موجودة' });
    return { success: true, data: course };
  });
  fastify.post('/', async (request, reply) => {
    const course = await prisma.course.create({ data: request.body as any });
    return { success: true, data: course };
  });
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as any;
    const course = await prisma.course.update({ where: { id }, data: request.body as any });
    return { success: true, data: course };
  });
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as any;
    await prisma.course.delete({ where: { id } });
    return { success: true, message: 'تم حذف المادة بنجاح' };
  });
}

export { courseRoutes };
