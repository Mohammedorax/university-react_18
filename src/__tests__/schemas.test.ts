import { describe, it, expect } from 'vitest';
import { commonSchemas } from '@/lib/schemas/common';
import { studentSchema } from '@/features/students/schemas/studentSchema';
import { teacherSchema } from '@/features/teachers/schemas/teacherSchema';
import { staffSchema } from '@/features/staff/schemas/staffSchema';
import { courseSchema } from '@/features/courses/schemas/courseSchema';

describe('Zod Schemas Validation', () => {
  describe('Common Schemas', () => {
    it('should validate name correctly', () => {
      expect(commonSchemas.name.safeParse('أحمد').success).toBe(true);
      expect(commonSchemas.name.safeParse('ab').success).toBe(false); // Too short
      expect(commonSchemas.name.safeParse('a'.repeat(101)).success).toBe(false); // Too long
    });

    it('should validate email correctly', () => {
      expect(commonSchemas.email.safeParse('test@example.com').success).toBe(true);
      expect(commonSchemas.email.safeParse('invalid-email').success).toBe(false);
    });

    it('should validate password correctly', () => {
      expect(commonSchemas.password.safeParse('Password123').success).toBe(true);
      expect(commonSchemas.password.safeParse('12345678').success).toBe(false); // No letters
      expect(commonSchemas.password.safeParse('password').success).toBe(false); // No numbers/caps
    });
  });

  describe('Student Schema', () => {
    const validStudent = {
      name: 'محمد علي',
      email: 'mohamed@example.com',
      university_id: '2024001',
      department: 'علوم الحاسب',
      year: 2,
      gpa: 3.5,
    };

    it('should validate a valid student', () => {
      const result = studentSchema.safeParse(validStudent);
      expect(result.success).toBe(true);
    });

    it('should fail if year is negative', () => {
      const result = studentSchema.safeParse({ ...validStudent, year: -1 });
      expect(result.success).toBe(false);
    });

    it('should fail if gpa is > 4', () => {
      const result = studentSchema.safeParse({ ...validStudent, gpa: 4.5 });
      expect(result.success).toBe(false);
    });
  });

  describe('Teacher Schema', () => {
    const validTeacher = {
      name: 'د. سارة أحمد',
      email: 'sara@example.com',
      department: 'علوم الحاسب',
      specialization: 'هندسة البرمجيات',
    };

    it('should validate a valid teacher', () => {
      const result = teacherSchema.safeParse(validTeacher);
      expect(result.success).toBe(true);
    });

    it('should fail if specialization is missing', () => {
      const { specialization: _, ...invalidTeacher } = validTeacher;
      const result = teacherSchema.safeParse(invalidTeacher);
      expect(result.success).toBe(false);
    });
  });

  describe('Staff Schema', () => {
    const validStaff = {
      name: 'سعيد محمد',
      email: 'saeed@example.com',
      job_title: 'مسجل',
      department: 'شؤون الطلاب',
      phone: '0501234567',
    };

    it('should validate a valid staff', () => {
      const result = staffSchema.safeParse(validStaff);
      expect(result.success).toBe(true);
    });
  });

  describe('Course Schema', () => {
    const validCourse = {
      code: 'CS101',
      name: 'مقدمة في البرمجة',
      description: 'أساسيات البرمجة',
      department: 'علوم الحاسب',
      credits: 3,
      max_students: 50,
    };

    it('should validate a valid course', () => {
      const result = courseSchema.safeParse(validCourse);
      expect(result.success).toBe(true);
    });

    it('should fail if credits is negative', () => {
      const result = courseSchema.safeParse({ ...validCourse, credits: -1 });
      expect(result.success).toBe(false);
    });
  });
});
