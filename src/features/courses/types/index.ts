export interface Course {
  id: string
  code: string
  name: string
  description: string
  department: string
  credits: number
  teacher_id: string
  teacher_name: string
  semester: string
  year: number
  max_students: number
  enrolled_students: number
  schedule: {
    day: string
    start_time: string
    end_time: string
    room: string
  }[]
  prerequisites?: string[]
  resources?: {
    id: string
    title: string
    channel: string
    embedUrl: string
  }[]
  created_at?: string
}
