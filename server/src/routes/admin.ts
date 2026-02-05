import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const updateSettingsSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  type: z.string().optional(),
  description: z.string().optional(),
});

export default async function adminRoutes(fastify: FastifyInstance) {
  fastify.get('/api/admin/dashboard/stats', async (_request, reply) => {
    try {
      const [
        totalStudents,
        totalTeachers,
        totalCourses,
        totalEnrollments,
        totalRevenue,
        recentPayments,
      ] = await Promise.all([
        fastify.prisma.student.count(),
        fastify.prisma.teacher.count(),
        fastify.prisma.course.count(),
        fastify.prisma.enrollment.count(),
        fastify.prisma.payment.aggregate({
          where: { status: 'PAID' },
          _sum: { amount: true },
        }),
        fastify.prisma.payment.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { student: true },
        }),
      ]);

      return {
        success: true,
        data: {
          totalStudents,
          totalTeachers,
          totalCourses,
          totalEnrollments,
          totalRevenue: totalRevenue._sum.amount || 0,
          recentPayments,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: 'Failed to fetch dashboard stats' });
    }
  });

  fastify.get('/api/admin/users', async (_request, reply) => {
    try {
      const users = await fastify.prisma.user.findMany({
        include: {
          student: true,
          teacher: true,
          admin: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return { success: true, data: users };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: 'Failed to fetch users' });
    }
  });

  fastify.put('/api/admin/users/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { isActive } = request.body as { isActive: boolean };

    try {
      const user = await fastify.prisma.user.update({
        where: { id },
        data: { isActive },
      });

      await fastify.prisma.auditLog.create({
        data: {
          userId: (request as any).user?.id,
          action: 'UPDATE_STATUS',
          entity: 'User',
          entityId: id,
          details: JSON.stringify({ isActive }),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        },
      });

      return { success: true, data: user };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: 'Failed to update user status' });
    }
  });

  fastify.get('/api/admin/audit-logs', async (request, reply) => {
    const { page = 1, limit = 50, action, entity } = request.query as {
      page?: number;
      limit?: number;
      action?: string;
      entity?: string;
    };

    try {
      const where: any = {};
      if (action) where.action = action;
      if (entity) where.entity = entity;

      const [logs, total] = await Promise.all([
        fastify.prisma.auditLog.findMany({
          where,
          include: { user: true },
          orderBy: { timestamp: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        fastify.prisma.auditLog.count({ where }),
      ]);

      return {
        success: true,
        data: logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: 'Failed to fetch audit logs' });
    }
  });

  fastify.get('/api/admin/settings', async (_request, reply) => {
    try {
      const settings = await fastify.prisma.setting.findMany({
        orderBy: { key: 'asc' },
      });
      return { success: true, data: settings };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: 'Failed to fetch settings' });
    }
  });

  fastify.post('/api/admin/settings', async (request, reply) => {
    try {
      const data = updateSettingsSchema.parse(request.body);
      const setting = await fastify.prisma.setting.upsert({
        where: { key: data.key },
        update: {
          value: data.value,
          type: data.type,
          description: data.description,
        },
        create: {
          key: data.key,
          value: data.value,
          type: data.type,
          description: data.description,
        },
      });

      await fastify.prisma.auditLog.create({
        data: {
          userId: (request as any).user?.id,
          action: 'UPDATE',
          entity: 'Setting',
          entityId: setting.id,
          details: JSON.stringify(data),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        },
      });

      return { success: true, data: setting };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ success: false, error: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: 'Failed to update setting' });
    }
  });

  fastify.get('/api/admin/enrollments/pending', async (_request, reply) => {
    try {
      const enrollments = await fastify.prisma.enrollment.findMany({
        where: { status: 'PENDING' },
        include: {
          student: true,
          courseSection: {
            include: {
              course: true,
              teacher: true,
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
      });
      return { success: true, data: enrollments };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: 'Failed to fetch pending enrollments' });
    }
  });

  fastify.put('/api/admin/enrollments/:id/approve', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const enrollment = await fastify.prisma.enrollment.update({
        where: { id },
        data: { status: 'ACTIVE' },
        include: {
          student: true,
          courseSection: {
            include: { course: true },
          },
        },
      });

      await fastify.prisma.auditLog.create({
        data: {
          userId: (request as any).user?.id,
          action: 'APPROVE_ENROLLMENT',
          entity: 'Enrollment',
          entityId: id,
          details: JSON.stringify({ studentId: enrollment.studentId }),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        },
      });

      return { success: true, data: enrollment };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: 'Failed to approve enrollment' });
    }
  });

  fastify.get('/api/admin/reports/students-by-department', async (_request, reply) => {
    try {
      const students = await fastify.prisma.student.groupBy({
        by: ['departmentId'],
        _count: true,
      });

      const departmentIds = students.map((s) => s.departmentId).filter((id): id is string => id !== null) as string[];
      const departments = await fastify.prisma.department.findMany({
        where: {
          id: { in: departmentIds },
        },
      });

      const departmentMap = new Map(departments.map((d) => [d.id, d]));

      const data = students.map((s) => ({
        departmentId: s.departmentId,
        departmentName: departmentMap.get(s.departmentId || '')?.name || 'Unknown',
        count: s._count,
      }));

      return { success: true, data };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: 'Failed to generate report' });
    }
  });

  fastify.get('/api/admin/reports/grades-distribution', async (request, reply) => {
    const { courseSectionId } = request.query as { courseSectionId?: string };

    try {
      const where: any = {};
      if (courseSectionId) where.courseSectionId = courseSectionId;

      const grades = await fastify.prisma.grade.findMany({
        where,
        select: { letterGrade: true },
      });

      const distribution: Record<string, number> = {};
      for (const g of grades) {
        if (g.letterGrade) {
          distribution[g.letterGrade] = (distribution[g.letterGrade] || 0) + 1;
        }
      }

      return { success: true, data: distribution };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: 'Failed to generate grade distribution' });
    }
  });
}
