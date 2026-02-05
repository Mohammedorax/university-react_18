import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const paymentCreateSchema = z.object({
  studentId: z.string().uuid(),
  enrollmentId: z.string().uuid().optional(),
  amount: z.number().positive(),
  type: z.string().min(1),
  dueDate: z.string().datetime(),
  description: z.string().optional(),
});

const paymentUpdateSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  paidDate: z.string().datetime().optional(),
  receiptNumber: z.string().optional(),
});

export default async function paymentsRoutes(fastify: FastifyInstance) {
  fastify.get('/api/payments', async (_request, reply) => {
    try {
      const payments = await fastify.prisma.payment.findMany({
        include: {
          student: true,
          enrollment: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return { success: true, data: payments };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: 'Failed to fetch payments' });
    }
  });

  fastify.get('/api/payments/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const payment = await fastify.prisma.payment.findUnique({
        where: { id },
        include: {
          student: true,
          enrollment: true,
        },
      });
      if (!payment) {
        return reply.status(404).send({ success: false, error: 'Payment not found' });
      }
      return { success: true, data: payment };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: 'Failed to fetch payment' });
    }
  });

  fastify.get('/api/students/:studentId/payments', async (request, reply) => {
    const { studentId } = request.params as { studentId: string };
    try {
      const payments = await fastify.prisma.payment.findMany({
        where: { studentId },
        include: {
          enrollment: {
            include: {
              courseSection: {
                include: {
                  course: true,
                },
              },
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      });
      return { success: true, data: payments };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: 'Failed to fetch student payments' });
    }
  });

  fastify.post('/api/payments', async (request, reply) => {
    try {
      const data = paymentCreateSchema.parse(request.body);
      const payment = await fastify.prisma.payment.create({
        data: {
          studentId: data.studentId,
          enrollmentId: data.enrollmentId,
          amount: data.amount,
          type: data.type,
          dueDate: new Date(data.dueDate),
          description: data.description,
        },
        include: {
          student: true,
        },
      });

      await fastify.prisma.auditLog.create({
        data: {
          userId: (request as any).user?.id,
          action: 'CREATE',
          entity: 'Payment',
          entityId: payment.id,
          details: JSON.stringify(data),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        },
      });

      return { success: true, data: payment };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ success: false, error: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: 'Failed to create payment' });
    }
  });

  fastify.put('/api/payments/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const data = paymentUpdateSchema.parse(request.body);
      const payment = await fastify.prisma.payment.update({
        where: { id },
        data: {
          status: data.status,
          paidDate: data.paidDate ? new Date(data.paidDate) : undefined,
          receiptNumber: data.receiptNumber,
        },
        include: {
          student: true,
        },
      });

      await fastify.prisma.auditLog.create({
        data: {
          userId: (request as any).user?.id,
          action: 'UPDATE',
          entity: 'Payment',
          entityId: payment.id,
          details: JSON.stringify(data),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        },
      });

      return { success: true, data: payment };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ success: false, error: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: 'Failed to update payment' });
    }
  });

  fastify.delete('/api/payments/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await fastify.prisma.payment.delete({
        where: { id },
      });

      await fastify.prisma.auditLog.create({
        data: {
          userId: (request as any).user?.id,
          action: 'DELETE',
          entity: 'Payment',
          entityId: id,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        },
      });

      return { success: true, message: 'Payment deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: 'Failed to delete payment' });
    }
  });

  fastify.get('/api/payments/stats/summary', async (_request, reply) => {
    try {
      const totalCollected = await fastify.prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      });

      const totalPending = await fastify.prisma.payment.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      });

      const pendingCount = await fastify.prisma.payment.count({
        where: { status: 'PENDING' },
      });

      return {
        success: true,
        data: {
          totalCollected: totalCollected._sum.amount || 0,
          totalPending: totalPending._sum.amount || 0,
          pendingCount,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false, error: 'Failed to fetch payment stats' });
    }
  });
}
