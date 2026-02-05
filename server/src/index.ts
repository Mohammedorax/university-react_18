import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { PrismaClient } from '@prisma/client';
import { authRoutes } from './routes/auth.js';
import { studentRoutes } from './routes/students.js';
import { teacherRoutes } from './routes/teachers.js';
import { courseRoutes } from './routes/courses.js';
import { gradeRoutes } from './routes/grades.js';
import { enrollmentRoutes } from './routes/enrollments.js';
import { attendanceRoutes } from './routes/attendance.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import webhookRoutes from './routes/webhooks.js';

const fastify = Fastify({
  logger: true,
});

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

fastify.decorate('prisma', prisma);

await fastify.register(helmet, {
  contentSecurityPolicy: false,
});

await fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
});

await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  errorResponseBuilder: (_request, context) => ({
    statusCode: 429,
    error: 'Too Many Requests',
    message: `Rate limit exceeded. Try again in ${context.after}`,
  }),
});

fastify.addHook('onRequest', async (request, reply) => {
  const start = Date.now();
  const requestTime = Date.now();
  fastify.log.info(`${requestTime} ${request.method} ${request.url}`);
  request.log.info({ req: requestTime, method: request.method, url: request.url });
  
  reply.header('X-Response-Time', `${Date.now() - start}ms`);
});

fastify.addHook('onResponse', async (request, reply) => {
  fastify.log.info(`${request.method} ${request.url} - ${reply.statusCode}`);
});

fastify.addHook('onError', async (request, _reply, error) => {
  fastify.log.error(error);
  _reply.status(500).send({
    error: 'Internal Server Error',
    message: error.message,
  });
});

fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

fastify.get('/api/health', async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString() 
    };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      database: 'disconnected',
      error: (error as Error).message 
    };
  }
});

await fastify.register(authRoutes, { prefix: '/api/auth' });
await fastify.register(studentRoutes, { prefix: '/api/students' });
await fastify.register(teacherRoutes, { prefix: '/api/teachers' });
await fastify.register(courseRoutes, { prefix: '/api/courses' });
await fastify.register(gradeRoutes, { prefix: '/api/grades' });
await fastify.register(enrollmentRoutes, { prefix: '/api/enrollments' });
await fastify.register(attendanceRoutes, { prefix: '/api/attendance' });
await fastify.register(paymentRoutes, { prefix: '/api/payments' });
await fastify.register(adminRoutes, { prefix: '/api/admin' });
await fastify.register(webhookRoutes, { prefix: '/api/webhooks' });

fastify.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    error: 'Not Found',
    message: `Route ${request.method} ${request.url} not found`,
  });
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '4000', 10);
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    fastify.log.info(`🚀 Server running on http://${host}:${port}`);
    
    fastify.log.info(`
    📚 University Management System API
    ====================================
    🔗 Health:     http://${host}:${port}/health
    🔗 API Health: http://${host}:${port}/api/health
    📝 Documentation: See /api routes
    `);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

process.on('SIGINT', async () => {
  fastify.log.info('Received SIGINT. Graceful shutdown...');
  await fastify.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  fastify.log.info('Received SIGTERM. Graceful shutdown...');
  await fastify.close();
  await prisma.$disconnect();
  process.exit(0);
});

export { fastify, prisma };
