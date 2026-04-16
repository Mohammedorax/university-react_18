import { Grade } from '@/features/grades/types'
import { initialGrades, initialStudents } from './data'
import { getStorageData, setStorageData, delay, calculateGradeLetter } from './utils'
import { addAuditLog } from './auditLog'

export const gradeApi = {
    getAllGrades: async () => {
        await delay(300)
        return getStorageData('grades', initialGrades)
    },

    getStudentGrades: async (studentId: string) => {
        await delay(300)
        const grades = getStorageData('grades', initialGrades)
        return grades.filter(g => g.student_id === studentId)
    },

    getCourseGrades: async (courseId: string) => {
        await delay(300)
        const grades = getStorageData('grades', initialGrades)
        return grades.filter(g => g.course_id === courseId)
    },

    getGradeStatistics: async (studentId: string) => {
        await delay(300)
        const allGrades = getStorageData('grades', initialGrades)
        const studentGrades = allGrades.filter(g => g.student_id === studentId)

        if (studentGrades.length === 0) {
            return {
                total_courses: 0,
                completed_courses: 0,
                current_gpa: 0,
                cumulative_gpa: 0,
                total_credits: 0,
                earned_credits: 0,
                semester_gpa: {},
            }
        }

        const totalPoints = studentGrades.reduce((sum, g) => sum + g.grade_points * g.credits, 0)
        const totalCredits = studentGrades.reduce((sum, g) => sum + g.credits, 0)
        const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0

        return {
            total_courses: studentGrades.length,
            completed_courses: studentGrades.length,
            current_gpa: gpa,
            cumulative_gpa: gpa,
            total_credits: totalCredits,
            earned_credits: totalCredits,
            semester_gpa: {
                'الفصل الأول 2024': 3.5,
                'الفصل الثاني 2023': 4.0,
            },
            rank: 1,
            total_students: 100,
        }
    },

    submitGrade: async (gradeData: Partial<Grade> & { id?: string }) => {
        await delay(300)
        const grades = getStorageData('grades', initialGrades)
        
        if (gradeData.total_score !== undefined) {
            const { letter, points } = calculateGradeLetter(gradeData.total_score);
            gradeData.letter_grade = letter;
            gradeData.grade_points = points;
        }

        if (gradeData.id) {
            const index = grades.findIndex(g => g.id === gradeData.id)
            if (index !== -1) {
                const oldGrade = grades[index];
                grades[index] = { ...oldGrade, ...gradeData }
                setStorageData('grades', grades)
                if (addAuditLog) {
                    await addAuditLog('Update Grade', `Updated grade for student ID: ${oldGrade.student_id} in course: ${oldGrade.course_code}`);
                }
                return grades[index]
            }
        }
        
        const newGrade: Grade = { 
            ...gradeData as Grade, 
            id: 'g' + (grades.length + 1),
        }
        grades.push(newGrade)
        setStorageData('grades', grades)
        if (addAuditLog) {
            await addAuditLog('Submit Grade', `New grade submitted for student ID: ${gradeData.student_id}`);
        }
        return newGrade
    },

    deleteGrade: async (id: string) => {
        await delay(300)
        let grades = getStorageData('grades', initialGrades)
        grades = grades.filter(g => g.id !== id)
        setStorageData('grades', grades)
        return id
    },
}
