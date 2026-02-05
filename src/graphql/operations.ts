/**
 * @file graphql.ts
 * @description GraphQL types and operations (schema definitions)
 * This file provides type-safe GraphQL operation definitions
 * In production, use with Apollo Client or similar
 */

// Import types from existing types files
import type { Student } from '@/features/students/types';
import type { Course } from '@/features/courses/types';
import type { Grade } from '@/features/grades/types';
import type { Discount } from '@/services/mockApi';
import type { InventoryItem } from '@/features/inventory/types';

// GraphQL Query Types
export interface GetStudentsParams {
  limit?: number;
  offset?: number;
  search?: string;
  department?: string;
}

export interface GetStudentsResponse {
  students: {
    items: Student[];
    total: number;
    hasMore: boolean;
  };
}

export interface GetStudentByIdResponse {
  student: Student | null;
}

export interface GetCoursesParams {
  limit?: number;
  offset?: number;
  search?: string;
  department?: string;
}

export interface GetCoursesResponse {
  courses: {
    items: Course[];
    total: number;
    hasMore: boolean;
  };
}

export interface GetCourseByIdResponse {
  course: Course | null;
}

export interface GetStudentGradesResponse {
  studentGrades: Grade[];
}

export interface GetCourseGradesResponse {
  courseGrades: Array<{
    id: string;
    student_id: string;
    student_name: string;
    midterm_score: number;
    final_score: number;
    total_score: number;
    letter_grade: string;
  }>;
}

export interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalTeachers: number;
  totalStaff: number;
  recentEnrollments: number;
  pendingGrades: number;
  lowStockItems: number;
  upcomingExams: number;
}

export interface GetDashboardStatsResponse {
  dashboardStats: DashboardStats;
}

export interface GradeStatistics {
  average: number;
  highest: number;
  lowest: number;
  totalCredits: number;
  earnedCredits: number;
  gpa: number;
  coursesPassed: number;
  coursesFailed: number;
}

export interface GetGradeStatisticsResponse {
  gradeStatistics: GradeStatistics;
}

// GraphQL Mutation Types
export interface StudentInput {
  name: string;
  email: string;
  university_id: string;
  department: string;
  year: number;
  gpa?: number;
  status?: 'active' | 'inactive' | 'graduated' | 'suspended';
}

export interface CourseInput {
  code: string;
  name: string;
  description?: string;
  department: string;
  credits: number;
  teacher_id?: string;
  semester: string;
  year: number;
  max_students: number;
  schedule?: Array<{
    day: string;
    start_time: string;
    end_time: string;
    room: string;
  }>;
  prerequisites?: string[];
}

export interface GradeInput {
  student_id: string;
  course_id: string;
  assignments?: Array<{
    name: string;
    score: number;
    max_score: number;
    weight: number;
  }>;
  midterm_score?: number;
  final_score?: number;
}

export interface DiscountInput {
  name: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  description?: string;
  active?: boolean;
}

export interface InventoryItemInput {
  name: string;
  category: string;
  quantity: number;
  location?: string;
  status?: 'available' | 'borrowed' | 'under_maintenance';
  price?: number;
  sku?: string;
}

// GraphQL Operation Builders
export const QUERIES = {
  GET_STUDENTS: (params: GetStudentsParams) => ({
    query: `
      query GetStudents($limit: Int, $offset: Int, $search: String, $department: String) {
        students(limit: $limit, offset: $offset, search: $search, department: $department) {
          items {
            id
            name
            email
            university_id
            department
            year
            gpa
            enrolled_courses
            status
          }
          total
          hasMore
        }
      }
    `,
    variables: params,
  }),

  GET_STUDENT_BY_ID: (id: string) => ({
    query: `
      query GetStudentById($id: ID!) {
        student(id: $id) {
          id
          name
          email
          university_id
          department
          year
          gpa
          enrolled_courses
          status
          created_at
          updated_at
        }
      }
    `,
    variables: { id },
  }),

  GET_COURSES: (params: GetCoursesParams) => ({
    query: `
      query GetCourses($limit: Int, $offset: Int, $search: String, $department: String) {
        courses(limit: $limit, offset: $offset, search: $search, department: $department) {
          items {
            id
            code
            name
            description
            department
            credits
            teacher_id
            teacher_name
            semester
            year
            max_students
            enrolled_students
          }
          total
          hasMore
        }
      }
    `,
    variables: params,
  }),

  GET_COURSE_BY_ID: (id: string) => ({
    query: `
      query GetCourseById($id: ID!) {
        course(id: $id) {
          id
          code
          name
          description
          department
          credits
          teacher_id
          teacher_name
          semester
          year
          max_students
          enrolled_students
          schedule {
            day
            start_time
            end_time
            room
          }
          prerequisites
        }
      }
    `,
    variables: { id },
  }),

  GET_STUDENT_GRADES: (studentId: string) => ({
    query: `
      query GetStudentGrades($studentId: ID!) {
        studentGrades(studentId: $studentId) {
          id
          course_id
          course_name
          course_code
          semester
          year
          assignments {
            name
            score
            max_score
            weight
          }
          midterm_score
          final_score
          total_score
          letter_grade
          grade_points
          credits
        }
      }
    `,
    variables: { studentId },
  }),

  GET_COURSE_GRADES: (courseId: string) => ({
    query: `
      query GetCourseGrades($courseId: ID!) {
        courseGrades(courseId: $courseId) {
          id
          student_id
          student_name
          midterm_score
          final_score
          total_score
          letter_grade
        }
      }
    `,
    variables: { courseId },
  }),

  GET_DASHBOARD_STATS: () => ({
    query: `
      query GetDashboardStats {
        dashboardStats {
          totalStudents
          totalCourses
          totalTeachers
          totalStaff
          recentEnrollments
          pendingGrades
          lowStockItems
          upcomingExams
        }
      }
    `,
    variables: {},
  }),

  GET_GRADE_STATISTICS: (studentId: string) => ({
    query: `
      query GetGradeStatistics($studentId: ID!) {
        gradeStatistics(studentId: $studentId) {
          average
          highest
          lowest
          totalCredits
          earnedCredits
          gpa
          coursesPassed
          coursesFailed
        }
      }
    `,
    variables: { studentId },
  }),
};

export const MUTATIONS = {
  ADD_STUDENT: (input: StudentInput) => ({
    query: `
      mutation AddStudent($input: StudentInput!) {
        addStudent(input: $input) {
          id
          name
          email
          university_id
          department
          year
          gpa
          status
        }
      }
    `,
    variables: { input },
  }),

  UPDATE_STUDENT: (id: string, input: StudentInput) => ({
    query: `
      mutation UpdateStudent($id: ID!, $input: StudentInput!) {
        updateStudent(id: $id, input: $input) {
          id
          name
          email
          university_id
          department
          year
          gpa
          status
        }
      }
    `,
    variables: { id, input },
  }),

  DELETE_STUDENT: (id: string) => ({
    query: `
      mutation DeleteStudent($id: ID!) {
        deleteStudent(id: $id)
      }
    `,
    variables: { id },
  }),

  ENROLL_IN_COURSE: (studentId: string, courseId: string) => ({
    query: `
      mutation EnrollInCourse($studentId: ID!, $courseId: ID!) {
        enrollInCourse(studentId: $studentId, courseId: $courseId) {
          success
          student {
            id
            enrolled_courses
          }
        }
      }
    `,
    variables: { studentId, courseId },
  }),

  UNENROLL_FROM_COURSE: (studentId: string, courseId: string) => ({
    query: `
      mutation UnenrollFromCourse($studentId: ID!, $courseId: ID!) {
        unenrollFromCourse(studentId: $studentId, courseId: $courseId) {
          success
          student {
            id
            enrolled_courses
          }
        }
      }
    `,
    variables: { studentId, courseId },
  }),

  ADD_COURSE: (input: CourseInput) => ({
    query: `
      mutation AddCourse($input: CourseInput!) {
        addCourse(input: $input) {
          id
          code
          name
          description
          department
          credits
          semester
          year
          max_students
        }
      }
    `,
    variables: { input },
  }),

  UPDATE_COURSE: (id: string, input: CourseInput) => ({
    query: `
      mutation UpdateCourse($id: ID!, $input: CourseInput!) {
        updateCourse(id: $id, input: $input) {
          id
          code
          name
          description
          department
          credits
          semester
          year
          max_students
        }
      }
    `,
    variables: { id, input },
  }),

  DELETE_COURSE: (id: string) => ({
    query: `
      mutation DeleteCourse($id: ID!) {
        deleteCourse(id: $id)
      }
    `,
    variables: { id },
  }),

  ADD_GRADE: (input: GradeInput) => ({
    query: `
      mutation AddGrade($input: GradeInput!) {
        addGrade(input: $input) {
          id
          student_id
          course_id
          total_score
          letter_grade
        }
      }
    `,
    variables: { input },
  }),

  UPDATE_GRADE: (id: string, input: GradeInput) => ({
    query: `
      mutation UpdateGrade($id: ID!, $input: GradeInput!) {
        updateGrade(id: $id, input: $input) {
          id
          student_id
          course_id
          total_score
          letter_grade
        }
      }
    `,
    variables: { id, input },
  }),

  ADD_DISCOUNT: (input: DiscountInput) => ({
    query: `
      mutation AddDiscount($input: DiscountInput!) {
        addDiscount(input: $input) {
          id
          name
          type
          value
          active
        }
      }
    `,
    variables: { input },
  }),

  DELETE_DISCOUNT: (id: string) => ({
    query: `
      mutation DeleteDiscount($id: ID!) {
        deleteDiscount(id: $id)
      }
    `,
    variables: { id },
  }),

  ADD_INVENTORY_ITEM: (input: InventoryItemInput) => ({
    query: `
      mutation AddInventoryItem($input: InventoryItemInput!) {
        addInventoryItem(input: $input) {
          id
          name
          category
          quantity
          status
        }
      }
    `,
    variables: { input },
  }),

  UPDATE_INVENTORY_ITEM: (id: string, input: InventoryItemInput) => ({
    query: `
      mutation UpdateInventoryItem($id: ID!, $input: InventoryItemInput!) {
        updateInventoryItem(id: $id, input: $input) {
          id
          name
          category
          quantity
          status
        }
      }
    `,
    variables: { id, input },
  }),

  DELETE_INVENTORY_ITEM: (id: string) => ({
    query: `
      mutation DeleteInventoryItem($id: ID!) {
        deleteInventoryItem(id: $id)
      }
    `,
    variables: { id },
  }),
};

export const SUBSCRIPTIONS = {
  STUDENT_UPDATED: {
    query: `
      subscription OnStudentUpdated {
        studentUpdated {
          id
          name
          status
          enrolled_courses
        }
      }
    `,
  },

  COURSE_UPDATED: {
    query: `
      subscription OnCourseUpdated {
        courseUpdated {
          id
          enrolled_students
          max_students
        }
      }
    `,
  },

  NEW_NOTIFICATION: {
    query: `
      subscription OnNewNotification {
        newNotification {
          id
          title
          message
          type
          createdAt
        }
      }
    `,
  },
};

export default { QUERIES, MUTATIONS, SUBSCRIPTIONS };
