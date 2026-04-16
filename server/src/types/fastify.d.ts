import 'fastify'
import type { PrismaClient } from '@prisma/client'
import type { UserRole } from '@prisma/client'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
  interface FastifyRequest {
    user?: { id: string; role: UserRole; email: string }
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; role: UserRole; email: string }
    user: { id: string; role: UserRole; email: string }
  }
}
