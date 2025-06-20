export interface User {
  id: string
  name: string
  email?: string
  matricNumber?: string
  role: 'admin' | 'lecturer' | 'student' | 'advisor'
  profilePicture?: string
  courses?: string[]
  advisees?: string[]
}

export interface Course {
  id: string
  code: string
  name: string
  lecturer: string
  credits: number
  semester: string
  students: string[]
}

export interface Assessment {
  id: string
  title: string
  type: 'quiz' | 'assignment' | 'test' | 'exam'
  courseId: string
  totalMarks: number
  weightage: number
  dueDate: string
  description?: string
}

export interface Grade {
  id: string
  studentId: string
  assessmentId: string
  courseId: string
  marks: number
  submittedAt: string
  feedback?: string
}

export interface StudentRecord {
  studentId: string
  courseId: string
  grades: Grade[]
  totalMarks: number
  percentage: number
  grade: string
  rank?: number
}

export interface RemarkRequest {
  id: string
  studentId: string
  assessmentId: string
  courseId: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  response?: string
}

export interface Consultation {
  id: string
  advisorId: string
  studentId: string
  date: string
  notes: string
  recommendations: string[]
  followUpRequired: boolean
}