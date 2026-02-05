import { FastifyInstance } from 'fastify';

export default async function webhooksRoutes(fastify: FastifyInstance) {
  fastify.post('/api/webhooks/payment', async (request, reply) => {
    try {
      const payload = request.body as any;
      const { event, data } = payload;

      switch (event) {
        case 'payment.completed':
          await fastify.prisma.payment.update({
            where: { id: data.paymentId },
            data: {
              status: 'PAID',
              paidDate: new Date(),
              receiptNumber: data.receiptNumber,
            },
          });
          fastify.log.info(`Payment ${data.paymentId} marked as completed`);
          break;

        case 'payment.failed':
          await fastify.prisma.payment.update({
            where: { id: data.paymentId },
            data: { status: 'FAILED' },
          });
          fastify.log.warn(`Payment ${data.paymentId} failed`);
          break;

        case 'payment.refunded':
          await fastify.prisma.payment.update({
            where: { id: data.paymentId },
            data: { status: 'REFUNDED' },
          });
          fastify.log.info(`Payment ${data.paymentId} refunded`);
          break;

        default:
          fastify.log.warn(`Unknown webhook event: ${event}`);
      }

      return { received: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: 'Webhook processing failed' });
    }
  });

  fastify.post('/api/webhooks/attendance', async (request, reply) => {
    try {
      const payload = request.body as any;
      const { event, data } = payload;

      switch (event) {
        case 'attendance.recorded':
          const existing = await fastify.prisma.attendance.findFirst({
            where: {
              studentId: data.studentId,
              courseSectionId: data.courseSectionId,
              date: new Date(data.date),
            },
          });

          if (!existing) {
            await fastify.prisma.attendance.create({
              data: {
                studentId: data.studentId,
                courseSectionId: data.courseSectionId,
                teacherId: data.teacherId,
                date: new Date(data.date),
                status: data.status,
                remarks: data.remarks,
              },
            });
            fastify.log.info(`Attendance recorded for student ${data.studentId}`);
          }
          break;

        default:
          fastify.log.warn(`Unknown attendance webhook event: ${event}`);
      }

      return { received: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: 'Webhook processing failed' });
    }
  });

  fastify.post('/api/webhooks/grade', async (request, reply) => {
    try {
      const payload = request.body as any;
      const { event, data } = payload;

      switch (event) {
        case 'grade.updated':
          await fastify.prisma.grade.upsert({
            where: {
              studentId_courseSectionId_semester_year: {
                studentId: data.studentId,
                courseSectionId: data.courseSectionId,
                semester: data.semester,
                year: data.year,
              },
            },
            update: {
              midterm: data.midterm,
              final: data.final,
              coursework: data.coursework,
              total: data.total,
              letterGrade: data.letterGrade,
              remarks: data.remarks,
            },
            create: {
              studentId: data.studentId,
              courseSectionId: data.courseSectionId,
              semester: data.semester,
              year: data.year,
              midterm: data.midterm,
              final: data.final,
              coursework: data.coursework,
              total: data.total,
              letterGrade: data.letterGrade,
              remarks: data.remarks,
            },
          });

          const enrollment = await fastify.prisma.enrollment.findUnique({
            where: {
              studentId_courseSectionId: {
                studentId: data.studentId,
                courseSectionId: data.courseSectionId,
              },
            },
          });

          if (enrollment && data.letterGrade) {
            await fastify.prisma.enrollment.update({
              where: { id: enrollment.id },
              data: {
                letterGrade: data.letterGrade,
                completedAt: new Date(),
                grade: data.total,
              },
            });
          }

          fastify.log.info(`Grade updated for student ${data.studentId}`);
          break;

        default:
          fastify.log.warn(`Unknown grade webhook event: ${event}`);
      }

      return { received: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: 'Webhook processing failed' });
    }
  });

  fastify.post('/api/webhooks/enrollment', async (request, reply) => {
    try {
      const payload = request.body as any;
      const { event, data } = payload;

      switch (event) {
        case 'enrollment.completed':
          await fastify.prisma.enrollment.update({
            where: { id: data.enrollmentId },
            data: {
              status: 'ACTIVE',
              enrolledAt: new Date(),
            },
          });
          fastify.log.info(`Enrollment ${data.enrollmentId} completed`);
          break;

        case 'enrollment.cancelled':
          await fastify.prisma.enrollment.update({
            where: { id: data.enrollmentId },
            data: { status: 'INACTIVE' },
          });
          fastify.log.info(`Enrollment ${data.enrollmentId} cancelled`);
          break;

        default:
          fastify.log.warn(`Unknown enrollment webhook event: ${event}`);
      }

      return { received: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: 'Webhook processing failed' });
    }
  });
}
