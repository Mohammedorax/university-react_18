export interface Grade {
    id: string
    student_id: string
    course_id: string
    course_name?: string
    course_code?: string
    semester: string
    year: number
    assignments: {
        name: string
        score: number
        max_score: number
        weight: number
    }[]
    midterm_score?: number
    final_score?: number
    total_score: number
    letter_grade: string
    grade_points: number
    credits: number
    teacher_id?: string
    teacher_name?: string
    submitted_at?: string
    updated_at?: string
}

export interface GradeStatistics {
  total_courses: number
  completed_courses: number
  current_gpa: number
  cumulative_gpa: number
  total_credits: number
  earned_credits: number
  semester_gpa: { [key: string]: number }
  rank: number
  total_students: number
}
