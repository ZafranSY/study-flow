import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Assessment, Grade, StudentRecord, RemarkRequest } from '../types'

export const useGradesStore = defineStore('grades', () => {
  const assessments = ref<Assessment[]>([
    {
      id: '1',
      title: 'Quiz 1: Variables and Data Types',
      type: 'quiz',
      courseId: 'CS101',
      totalMarks: 20,
      weightage: 10,
      dueDate: '2024-01-15',
      description: 'Basic programming concepts'
    },
    {
      id: '2',
      title: 'Assignment 1: Calculator App',
      type: 'assignment',
      courseId: 'CS101',
      totalMarks: 100,
      weightage: 25,
      dueDate: '2024-02-01',
      description: 'Build a simple calculator'
    },
    {
      id: '3',
      title: 'Midterm Exam',
      type: 'exam',
      courseId: 'CS101',
      totalMarks: 100,
      weightage: 35,
      dueDate: '2024-03-15',
      description: 'Comprehensive midterm examination'
    }
  ])

  const grades = ref<Grade[]>([
    {
      id: '1',
      studentId: '2',
      assessmentId: '1',
      courseId: 'CS101',
      marks: 18,
      submittedAt: '2024-01-15',
      feedback: 'Good understanding of concepts'
    },
    {
      id: '2',
      studentId: '2',
      assessmentId: '2',
      courseId: 'CS101',
      marks: 85,
      submittedAt: '2024-02-01',
      feedback: 'Excellent implementation'
    }
  ])

  const remarkRequests = ref<RemarkRequest[]>([])

  const getStudentGrades = (studentId: string, courseId?: string) => {
    return grades.value.filter(g => 
      g.studentId === studentId && (!courseId || g.courseId === courseId)
    )
  }

  const getCourseAssessments = (courseId: string) => {
    return assessments.value.filter(a => a.courseId === courseId)
  }

  const addGrade = (grade: Omit<Grade, 'id'>) => {
    const newGrade: Grade = {
      ...grade,
      id: Date.now().toString()
    }
    grades.value.push(newGrade)
    return newGrade
  }

  const updateGrade = (gradeId: string, updates: Partial<Grade>) => {
    const index = grades.value.findIndex(g => g.id === gradeId)
    if (index !== -1) {
      grades.value[index] = { ...grades.value[index], ...updates }
    }
  }

  const addAssessment = (assessment: Omit<Assessment, 'id'>) => {
    const newAssessment: Assessment = {
      ...assessment,
      id: Date.now().toString()
    }
    assessments.value.push(newAssessment)
    return newAssessment
  }

  const submitRemarkRequest = (request: Omit<RemarkRequest, 'id' | 'createdAt' | 'status'>) => {
    const newRequest: RemarkRequest = {
      ...request,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    remarkRequests.value.push(newRequest)
    return newRequest
  }

  const calculateStudentTotal = (studentId: string, courseId: string) => {
    const studentGrades = getStudentGrades(studentId, courseId)
    const courseAssessments = getCourseAssessments(courseId)
    
    let totalWeightedMarks = 0
    let totalWeightage = 0

    courseAssessments.forEach(assessment => {
      const grade = studentGrades.find(g => g.assessmentId === assessment.id)
      if (grade) {
        const percentage = (grade.marks / assessment.totalMarks) * 100
        totalWeightedMarks += (percentage * assessment.weightage) / 100
        totalWeightage += assessment.weightage
      }
    })

    return totalWeightage > 0 ? (totalWeightedMarks / totalWeightage) * 100 : 0
  }

  return {
    assessments,
    grades,
    remarkRequests,
    getStudentGrades,
    getCourseAssessments,
    addGrade,
    updateGrade,
    addAssessment,
    submitRemarkRequest,
    calculateStudentTotal
  }
})