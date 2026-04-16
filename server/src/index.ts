import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import sensible from '@fastify/sensible'
import rateLimit from '@fastify/rate-limit'
import jwt from '@fastify/jwt'

import { env } from './env.js'
import { prisma, disconnectPrisma } from './prisma.js'
import { authRoutes } from './routes/auth.js'
import { healthRoutes } from './routes/health.js'
import { coursesRoutes } from './routes/courses.js'
import { studentsRoutes } from './routes/students.js'

export async function buildServer() {
  const app = Fastify({
    logger:
      env.NODE_ENV === 'development'
        ? { transport: { target: 'pino-pretty' } }
        : true,
  })

  await app.register(helmet, { contentSecurityPolicy: false })
  await app.register(cors, {
    origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  })
  await app.register(sensible)
  await app.register(rateLimit, { max: 200, timeWindow: '1 minute' })
  await app.register(jwt, { secret: env.JWT_SECRET })

  app.decorate('prisma', prisma)

  app.register(healthRoutes, { prefix: '/health' })
  app.register(authRoutes, { prefix: '/api/auth' })
  app.register(coursesRoutes, { prefix: '/api/courses' })
  app.register(studentsRoutes, { prefix: '/api/students' })

  app.addHook('onClose', async () => {
    await disconnectPrisma()
  })

  return app
}

async function main() {
  const app = await buildServer()
  try {
    await app.listen({ host: env.HOST, port: env.PORT })
    app.log.info(`🚀 API ready at http://${env.HOST}:${env.PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

main()
