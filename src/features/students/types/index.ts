export interface Student {
  id: string
  name: string
  email: string
  university_id: string
  department: string
  year: number
  gpa: number
  enrolled_courses: string[]
  assigned_discounts?: string[]
  avatar?: string
  created_at?: string
}
