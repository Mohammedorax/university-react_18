import { FastifyInstance } from 'fastify';

async function gradeRoutes(fastify: FastifyInstance) {
  const prisma = fastify.prisma;
  fastify.get('/', async (request, reply) => {
    const { studentId, courseSectionId, semester, year } = request.query as any;
    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (courseSectionId) where.courseSectionId = courseSectionId;
    if (semester) where.semester = semester;
    if (year) where.year = parseInt(year);
    const grades = await prisma.grade.findMany({ where, include: { student: true, courseSection: { include: { course: true } } }, orderBy: { createdAt: 'desc' } });
    return { success: true, data: grades };
  });
  fastify.post('/', async (request, reply) => {
    const grade = await prisma.grade.create({ data: request.body as any });
    return { success: true, data: grade };
  });
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as any;
    const grade = await prisma.grade.update({ where: { id }, data: request.body as any });
    return { success: true, data: grade };
  });
}

export { gradeRoutes };
