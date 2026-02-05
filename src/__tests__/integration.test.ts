import { describe, it, expect, beforeEach } from 'vitest'
import { mockApi } from '@/services/mockApi'

describe('System Integration Tests', () => {
  beforeEach(async () => {
    localStorage.clear()
  })

  describe('Student Management', () => {
    it('should create and retrieve a student', async () => {
      const newStudent = {
        name: 'أحمد علي',
        email: 'ahmed@test.com',
        university_id: '2024999',
        department: 'علوم الحاسب',
        year: 1,
        gpa: 0,
        enrolled_courses: []
      }
      
      const created = await mockApi.addStudent(newStudent)
      expect(created.id).toBeDefined()
      expect(created.name).toBe(newStudent.name)

      const retrieved = await mockApi.getStudentById(created.id)
      expect(retrieved.university_id).toBe(newStudent.university_id)
    })
  })

  describe('Course Management', () => {
    it('should create a course and enroll a student', async () => {
      // 1. Create a course
      const newCourse = {
        name: 'برمجة متقدمة',
        code: 'CS202',
        description: 'Advanced programming course',
        department: 'علوم الحاسب',
        credits: 3,
        teacher_id: 't1',
        teacher_name: 'د. خالد',
        semester: 'Fall 2024',
        year: 2024,
        max_students: 30,
        schedule: [],
        instructor: 'د. خالد'
      }
      
      const course = await mockApi.addCourse(newCourse)
      
      // 2. Create a student
      const student = await mockApi.addStudent({
        name: 'طالب تجريبي',
        email: 'test@student.com',
        university_id: '2024888',
        department: 'علوم الحاسب',
        year: 2,
        gpa: 0,
        enrolled_courses: []
      })

      // 3. Enroll student
      await mockApi.enrollInCourse(student.id, course.id)
      
      // 4. Verify enrollment
      const updatedStudent = await mockApi.getStudentById(student.id)
      expect(updatedStudent.enrolled_courses).toContain(course.id)
      
      const updatedCourse = await mockApi.getCourseById(course.id)
      expect(updatedCourse.enrolled_students).toBeGreaterThan(0)
      expect(updatedStudent.enrolled_courses.length).toBeGreaterThan(0)
    })
  })

  describe('Inventory Management', () => {
    it('should manage inventory items and categories', async () => {
      // 1. Add category
      await mockApi.addCategory('أثاث مكتبي')
      const categories = await mockApi.getCategories()
      expect(categories).toContain('أثاث مكتبي')

      // 2. Add item
      const newItem = {
        name: 'كرسي مريح',
        category: 'أثاث مكتبي',
        quantity: 10,
        location: 'المبنى أ',
        status: 'available' as const,
        price: 250,
        sku: 'OFF-CHR-01'
      }
      
      const item = await mockApi.addInventoryItem(newItem)
      expect(item.id).toBeDefined()

      // 3. Update quantity
      await mockApi.updateInventoryItem(item.id, { quantity: 5 })
      const updated = (await mockApi.getInventory()).find(i => i.id === item.id)
      expect(updated?.quantity).toBe(5)
    })
  })
})
