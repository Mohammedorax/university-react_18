import { describe, it, expect, beforeEach } from 'vitest'
import { mockApi } from '@/services/mockApi'

describe('mockApi basic operations', () => {
  beforeEach(async () => {
    // Reset storage for a clean slate per test run
    localStorage.clear()
    // Seed by calling any getter
    await mockApi.getTeachers()
    await mockApi.getStudents()
    await mockApi.getCourses()
    await mockApi.getStudentGrades('1')
  })

  it('updates teacher data', async () => {
    const before = await mockApi.getTeacherById('2')
    expect(before.name).toBeDefined()

    const updated = await mockApi.updateTeacher('2', { name: 'د. سارة المطيري' })
    expect(updated.name).toBe('د. سارة المطيري')

    const after = await mockApi.getTeacherById('2')
    expect(after.name).toBe('د. سارة المطيري')
  })

  it('creates and updates a grade', async () => {
    const newGrade = await mockApi.submitGrade({
      student_id: '1',
      course_id: 'c1',
      course_name: 'مقدمة في البرمجة',
      course_code: 'CS101',
      semester: 'الفصل الأول',
      year: 2024,
      total_score: 90,
      letter_grade: 'A',
      grade_points: 4.0,
      credits: 3,
      teacher_id: '2',
      teacher_name: 'د. سارة أحمد',
    })

    expect(newGrade.id).toBeTruthy()
    expect(newGrade.total_score).toBe(90)

    const updated = await mockApi.submitGrade({ id: newGrade.id, final_score: 95 })
    expect(updated.final_score).toBe(95)
  })
})
