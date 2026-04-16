import type { FastifyReply, FastifyRequest } from 'fastify'
import type { UserRole } from '@prisma/client'

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    return reply.unauthorized('Invalid or missing token')
  }
}

export function requireRole(...roles: UserRole[]) {
  return async function (req: FastifyRequest, reply: FastifyReply) {
    try {
      await req.jwtVerify()
    } catch {
      return reply.unauthorized('Invalid or missing token')
    }
    if (!req.user || !roles.includes(req.user.role)) {
      return reply.forbidden('Insufficient permissions')
    }
  }
}
