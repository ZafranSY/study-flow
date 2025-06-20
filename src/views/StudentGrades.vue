<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">My Grades</h1>
        <p class="text-gray-600">Detailed view of all your academic assessments and grades</p>
      </div>

      <!-- Filter Controls -->
      <div class="card mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select v-model="selectedCourse" class="input-field">
              <option value="">All Courses</option>
              <option v-for="course in courses" :key="course" :value="course">{{ course }}</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Assessment Type</label>
            <select v-model="selectedType" class="input-field">
              <option value="">All Types</option>
              <option value="quiz">Quiz</option>
              <option value="assignment">Assignment</option>
              <option value="test">Test</option>
              <option value="exam">Exam</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select v-model="selectedSemester" class="input-field">
              <option value="">Current Semester</option>
              <option value="2024-1">Semester 1, 2024</option>
              <option value="2023-2">Semester 2, 2023</option>
            </select>
          </div>
          
          <div class="flex items-end">
            <button @click="exportGrades" class="btn-secondary">
              <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      <!-- Course Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div v-for="course in courseSummary" :key="course.code" class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ course.code }}</h3>
            <span :class="getGradeColor(course.currentGrade)" class="px-3 py-1 rounded-full text-sm font-medium">
              {{ course.currentGrade }}%
            </span>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Completed</span>
              <span class="font-medium">{{ course.completed }}/{{ course.total }}</span>
            </div>
            
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                :class="getProgressColor(course.progress)"
                class="h-2 rounded-full transition-all duration-300"
                :style="{ width: course.progress + '%' }"
              ></div>
            </div>
            
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Next Due</span>
              <span class="font-medium text-red-600">{{ course.nextDue }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Grades Table -->
      <div class="card">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Grade Details</h3>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">{{ filteredGrades.length }} assessments</span>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assessment
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="grade in filteredGrades" :key="grade.id" class="table-row">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ grade.title }}</div>
                  <div class="text-sm text-gray-500">{{ grade.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ grade.courseId }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getTypeColor(grade.type)" class="px-2 py-1 text-xs font-medium rounded-full capitalize">
                    {{ grade.type }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ grade.marks }}/{{ grade.totalMarks }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getGradeColor(grade.percentage)" class="text-sm font-medium">
                    {{ grade.percentage.toFixed(1) }}%
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ grade.weightage }}%
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(grade.submittedAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    @click="viewFeedback(grade)"
                    class="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    View Feedback
                  </button>
                  <button 
                    @click="requestRemark(grade)"
                    class="text-secondary-600 hover:text-secondary-900"
                  >
                    Request Remark
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Feedback Modal -->
      <div v-if="showFeedbackModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md m-4">
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-semibold text-gray-900">Assessment Feedback</h4>
            <button @click="showFeedbackModal = false" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
          
          <div v-if="selectedGrade" class="space-y-4">
            <div>
              <h5 class="font-medium text-gray-700">{{ selectedGrade.title }}</h5>
              <p class="text-sm text-gray-500">{{ selectedGrade.courseId }}</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-gray-700">Score:</span>
                <span class="text-lg font-bold text-primary-600">
                  {{ selectedGrade.marks }}/{{ selectedGrade.totalMarks }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">Percentage:</span>
                <span class="text-lg font-bold" :class="getGradeColor(selectedGrade.percentage)">
                  {{ selectedGrade.percentage.toFixed(1) }}%
                </span>
              </div>
            </div>
            
            <div>
              <h6 class="font-medium text-gray-700 mb-2">Instructor Feedback:</h6>
              <p class="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                {{ selectedGrade.feedback || 'No feedback provided yet.' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowDownTrayIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import Navigation from '../components/shared/Navigation.vue'

const selectedCourse = ref('')
const selectedType = ref('')
const selectedSemester = ref('')
const showFeedbackModal = ref(false)
const selectedGrade = ref(null)

const courses = ['CS101', 'CS201', 'MATH101']

const courseSummary = [
  {
    code: 'CS101',
    name: 'Programming Fundamentals',
    currentGrade: 85.2,
    completed: 8,
    total: 12,
    progress: 67,
    nextDue: 'Feb 15'
  },
  {
    code: 'CS201',
    name: 'Data Structures',
    currentGrade: 78.5,
    completed: 6,
    total: 10,
    progress: 60,
    nextDue: 'Feb 20'
  },
  {
    code: 'MATH101',
    name: 'Calculus I',
    currentGrade: 92.1,
    completed: 10,
    total: 12,
    progress: 83,
    nextDue: 'Feb 18'
  }
]

const mockGrades = [
  {
    id: '1',
    title: 'Quiz 1: Variables and Data Types',
    description: 'Basic programming concepts',
    courseId: 'CS101',
    type: 'quiz',
    marks: 18,
    totalMarks: 20,
    percentage: 90,
    weightage: 10,
    submittedAt: '2024-01-15',
    feedback: 'Excellent understanding of variable declarations and data type conversions. Keep up the good work!'
  },
  {
    id: '2',
    title: 'Assignment 1: Calculator App',
    description: 'Build a simple calculator',
    courseId: 'CS101',
    type: 'assignment',
    marks: 85,
    totalMarks: 100,
    percentage: 85,
    weightage: 25,
    submittedAt: '2024-02-01',
    feedback: 'Good implementation of basic operations. Consider adding error handling for edge cases.'
  },
  {
    id: '3',
    title: 'Midterm Exam',
    description: 'Comprehensive midterm examination',
    courseId: 'CS101',
    type: 'exam',
    marks: 76,
    totalMarks: 100,
    percentage: 76,
    weightage: 35,
    submittedAt: '2024-03-15',
    feedback: 'Solid performance overall. Review recursion concepts for better understanding.'
  }
]

const filteredGrades = computed(() => {
  let filtered = mockGrades
  
  if (selectedCourse.value) {
    filtered = filtered.filter(grade => grade.courseId === selectedCourse.value)
  }
  
  if (selectedType.value) {
    filtered = filtered.filter(grade => grade.type === selectedType.value)
  }
  
  return filtered
})

const getGradeColor = (percentage: number) => {
  if (percentage >= 90) return 'text-green-600'
  if (percentage >= 80) return 'text-blue-600'
  if (percentage >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'bg-green-500'
  if (progress >= 60) return 'bg-blue-500'
  if (progress >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getTypeColor = (type: string) => {
  const colors = {
    quiz: 'bg-blue-100 text-blue-800',
    assignment: 'bg-green-100 text-green-800',
    test: 'bg-yellow-100 text-yellow-800',
    exam: 'bg-red-100 text-red-800'
  }
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const viewFeedback = (grade: any) => {
  selectedGrade.value = grade
  showFeedbackModal.value = true
}

const requestRemark = (grade: any) => {
  alert(`Remark request initiated for ${grade.title}`)
}

const exportGrades = () => {
  alert('Grades exported successfully!')
}
</script>