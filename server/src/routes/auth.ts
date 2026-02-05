import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.REFRESH_EXPIRY || '7d';

function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 900;
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 24 * 60 * 60;
    default: return 900;
  }
}

const JWT_EXPIRY_SECONDS = parseExpiry(JWT_EXPIRY);
const REFRESH_EXPIRY_SECONDS = parseExpiry(REFRESH_EXPIRY);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'STAFF']).default('STUDENT'),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});

interface LoginBody {
  email: string;
  password: string;
}

interface RegisterBody {
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
}

async function authRoutes(fastify: FastifyInstance) {
  const prisma = fastify.prisma;

  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            token: { type: 'string' },
            refreshToken: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
    try {
      const { email, password } = request.body;

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          student: true,
          teacher: true,
          admin: true,
        },
      });

      if (!user) {
        return reply.status(401).send({
          success: false,
          error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        });
      }

      if (!user.isActive) {
        return reply.status(403).send({
          success: false,
          error: 'الحساب غير نشط. يرجى التواصل مع الإدارة',
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        return reply.status(401).send({
          success: false,
          error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        });
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY_SECONDS }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRY_SECONDS }
      );

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          entity: 'User',
          entityId: user.id,
          details: 'User logged in successfully',
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        },
      });

      const userResponse = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.student 
          ? `${user.student.firstName} ${user.student.lastName}`
          : user.teacher
          ? `${user.teacher.firstName} ${user.teacher.lastName}`
          : user.admin
          ? `${user.admin.firstName} ${user.admin.lastName}`
          : user.email,
      };

      return {
        success: true,
        token,
        refreshToken,
        user: userResponse,
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'حدث خطأ أثناء تسجيل الدخول',
      });
    }
  });

  fastify.post('/register', async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
    try {
      const { email, password, role, firstName, lastName } = request.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return reply.status(409).send({
          success: false,
          error: 'البريد الإلكتروني مسجل بالفعل',
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: role as any,
          emailVerified: false,
        },
      });

      switch (role) {
        case 'STUDENT':
          await prisma.student.create({
            data: {
              userId: user.id,
              studentId: `STU-${Date.now()}`,
              firstName,
              lastName,
              dateOfBirth: new Date(),
              gender: 'MALE',
            },
          });
          break;
        case 'TEACHER':
          await prisma.teacher.create({
            data: {
              userId: user.id,
              employeeId: `TCH-${Date.now()}`,
              firstName,
              lastName,
              dateOfBirth: new Date(),
              gender: 'MALE',
              specialization: 'General',
            },
          });
          break;
        case 'ADMIN':
          await prisma.admin.create({
            data: {
              userId: user.id,
              firstName,
              lastName,
            },
          });
          break;
      }

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'REGISTER',
          entity: 'User',
          entityId: user.id,
          details: `New ${role} registered`,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        },
      });

      return {
        success: true,
        message: 'تم إنشاء الحساب بنجاح',
        userId: user.id,
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'حدث خطأ أثناء إنشاء الحساب',
      });
    }
  });

  fastify.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { refreshToken } = request.body as { refreshToken: string };

      if (!refreshToken) {
        return reply.status(400).send({
          success: false,
          error: 'Refresh token مطلوب',
        });
      }

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.revokedAt) {
        return reply.status(401).send({
          success: false,
          error: 'Refresh token غير صالح أو منتهي',
        });
      }

      if (storedToken.expiresAt < new Date()) {
        return reply.status(401).send({
          success: false,
          error: 'Refresh token منتهي',
        });
      }

      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };

      const newToken = jwt.sign(
        {
          userId: storedToken.user.id,
          email: storedToken.user.email,
          role: storedToken.user.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY_SECONDS }
      );

      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });

      const newRefreshToken = jwt.sign(
        { userId: storedToken.user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRY_SECONDS }
      );

      await prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: storedToken.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        success: true,
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'حدث خطأ أثناء تجديد token',
      });
    }
  });

  fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { refreshToken } = request.body as { refreshToken: string };

      if (refreshToken) {
        await prisma.refreshToken.update({
          where: { token: refreshToken },
          data: { revokedAt: new Date() },
        });
      }

      const userId = (request as any).user?.userId;
      if (userId) {
        await prisma.auditLog.create({
          data: {
            userId,
            action: 'LOGOUT',
            entity: 'User',
            entityId: userId,
            details: 'User logged out',
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
          },
        });
      }

      return { success: true, message: 'تم تسجيل الخروج بنجاح' };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'حدث خطأ أثناء تسجيل الخروج',
      });
    }
  });

  fastify.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user?.userId;

      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: 'غير مصرح',
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          student: {
            select: {
              id: true,
              studentId: true,
              firstName: true,
              lastName: true,
              arabicName: true,
              departmentId: true,
              year: true,
              gpa: true,
              status: true,
            },
          },
          teacher: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              specialization: true,
              departmentId: true,
            },
          },
          admin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              position: true,
            },
          },
        },
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: 'المستخدم غير موجود',
        });
      }

      return { success: true, user };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'حدث خطأ',
      });
    }
  });
}

export { authRoutes };
