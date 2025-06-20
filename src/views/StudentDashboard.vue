<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">
          Welcome back, {{ authStore.currentUser?.name }}
        </h1>
        <p class="text-gray-600">Track your academic progress and performance</p>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Overall GPA"
          :value="overallGPA.toFixed(2)"
          change="+0.2 from last semester"
          :icon="AcademicCapIcon"
          variant="primary"
        />
        <StatsCard
          title="Completed Assessments"
          :value="`${completedAssessments}/${totalAssessments}`"
          :icon="DocumentCheckIcon"
          variant="success"
        />
        <StatsCard
          title="Class Rank"
          :value="`#${classRank} of ${totalStudents}`"
          change="↑ 2 positions"
          :icon="TrophyIcon"
          variant="warning"
        />
        <StatsCard
          title="Upcoming Deadlines"
          :value="upcomingDeadlines"
          :icon="ClockIcon"
          variant="danger"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Performance Chart -->
        <div class="lg:col-span-2">
          <PerformanceChart
            title="Performance Trend"
            :data="performanceData"
            color="#3b82f6"
          />
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <button
              @click="activeTab = 'grades'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <DocumentTextIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">View All Grades</span>
              </div>
            </button>
            
            <button
              @click="activeTab = 'compare'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <ChartBarIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">Compare with Peers</span>
              </div>
            </button>
            
            <button
              @click="activeTab = 'whatif'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <CalculatorIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">What-If Tool</span>
              </div>
            </button>
            
            <button
              @click="activeTab = 'remark'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <ExclamationTriangleIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">Request Remark</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Detailed Views -->
      <div class="mt-8">
        <!-- Grades Table -->
        <div v-if="activeTab === 'grades'" class="card">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Grade Details</h3>
            <select v-model="selectedCourse" class="text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
              <option value="">All Courses</option>
              <option value="CS101">CS101 - Programming Fundamentals</option>
              <option value="CS201">CS201 - Data Structures</option>
              <option value="MATH101">MATH101 - Calculus I</option>
            </select>
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
                    Marks
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="grade in filteredGrades" :key="grade.id" class="table-row">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ getAssessmentTitle(grade.assessmentId) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ grade.courseId }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ grade.marks }}/{{ getAssessmentTotal(grade.assessmentId) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ ((grade.marks / getAssessmentTotal(grade.assessmentId)) * 100).toFixed(1) }}%
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getGradeStatus(grade.marks, getAssessmentTotal(grade.assessmentId))" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ getGradeLabel(grade.marks, getAssessmentTotal(grade.assessmentId)) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Peer Comparison -->
        <div v-if="activeTab === 'compare'" class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance Comparison</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="text-md font-medium text-gray-700 mb-3">Class Average vs Your Performance</h4>
              <div class="space-y-3">
                <div v-for="course in courses" :key="course" class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">{{ course }}</span>
                  <div class="flex items-center space-x-2">
                    <div class="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-primary-500 h-2 rounded-full" 
                        :style="{ width: getYourPerformance(course) + '%' }"
                      ></div>
                    </div>
                    <span class="text-sm font-medium text-gray-900">
                      {{ getYourPerformance(course).toFixed(0) }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 class="text-md font-medium text-gray-700 mb-3">Your Percentile Ranking</h4>
              <div class="text-center">
                <div class="text-3xl font-bold text-primary-600">78th</div>
                <p class="text-sm text-gray-600">Percentile</p>
                <p class="text-xs text-gray-500 mt-2">
                  You're performing better than 78% of your classmates
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- What-If Tool -->
        <div v-if="activeTab === 'whatif'" class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">What-If Grade Calculator</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Select Course
              </label>
              <select v-model="whatIfCourse" class="input-field">
                <option value="">Choose a course</option>
                <option value="CS101">CS101 - Programming Fundamentals</option>
                <option value="CS201">CS201 - Data Structures</option>
              </select>
            </div>
            
            <div v-if="whatIfCourse" class="space-y-3">
              <h4 class="font-medium text-gray-700">Adjust Future Assessment Scores:</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-600 mb-1">Final Exam (35%)</label>
                  <input 
                    v-model="whatIfScores.finalExam" 
                    type="number" 
                    min="0" 
                    max="100" 
                    class="input-field"
                    placeholder="Enter expected score"
                  >
                </div>
                <div>
                  <label class="block text-sm text-gray-600 mb-1">Project (15%)</label>
                  <input 
                    v-model="whatIfScores.project" 
                    type="number" 
                    min="0" 
                    max="100" 
                    class="input-field"
                    placeholder="Enter expected score"
                  >
                </div>
              </div>
              
              <div class="mt-4 p-4 bg-primary-50 rounded-lg">
                <h5 class="font-medium text-primary-900">Projected Final Grade:</h5>
                <div class="text-2xl font-bold text-primary-600">
                  {{ calculateProjectedGrade().toFixed(1) }}%
                </div>
                <p class="text-sm text-primary-700">
                  Grade: {{ getLetterGrade(calculateProjectedGrade()) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Remark Request -->
        <div v-if="activeTab === 'remark'" class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Request Grade Remark</h3>
          <form @submit.prevent="submitRemarkRequest" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Course
                </label>
                <select v-model="remarkForm.courseId" class="input-field" required>
                  <option value="">Select Course</option>
                  <option value="CS101">CS101 - Programming Fundamentals</option>
                  <option value="CS201">CS201 - Data Structures</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Assessment
                </label>
                <select v-model="remarkForm.assessmentId" class="input-field" required>
                  <option value="">Select Assessment</option>
                  <option value="1">Quiz 1: Variables and Data Types</option>
                  <option value="2">Assignment 1: Calculator App</option>
                </select>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Reason for Remark Request
              </label>
              <textarea 
                v-model="remarkForm.reason" 
                rows="4" 
                class="input-field" 
                placeholder="Please provide a detailed explanation for your remark request..."
                required
              ></textarea>
            </div>
            
            <button type="submit" class="btn-primary">
              Submit Remark Request
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { 
  AcademicCapIcon, 
  DocumentCheckIcon, 
  TrophyIcon, 
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CalculatorIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

import Navigation from '../components/shared/Navigation.vue'
import StatsCard from '../components/shared/StatsCard.vue'
import PerformanceChart from '../components/charts/PerformanceChart.vue'
import { useAuthStore } from '../stores/auth'
import { useGradesStore } from '../stores/grades'

const authStore = useAuthStore()
const gradesStore = useGradesStore()

const activeTab = ref('grades')
const selectedCourse = ref('')
const whatIfCourse = ref('')

const whatIfScores = reactive({
  finalExam: '',
  project: ''
})

const remarkForm = reactive({
  courseId: '',
  assessmentId: '',
  reason: ''
})

// Mock data
const overallGPA = ref(3.47)
const completedAssessments = ref(12)
const totalAssessments = ref(16)
const classRank = ref(15)
const totalStudents = ref(150)
const upcomingDeadlines = ref(3)
const courses = ['CS101', 'CS201', 'MATH101']

const performanceData = computed(() => ({
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
  values: [75, 82, 78, 85, 88, 92]
}))

const studentGrades = computed(() => {
  if (!authStore.currentUser) return []
  return gradesStore.getStudentGrades(authStore.currentUser.id)
})

const filteredGrades = computed(() => {
  if (!selectedCourse.value) return studentGrades.value
  return studentGrades.value.filter(grade => grade.courseId === selectedCourse.value)
})

const getAssessmentTitle = (assessmentId: string) => {
  const assessment = gradesStore.assessments.find(a => a.id === assessmentId)
  return assessment?.title || 'Unknown Assessment'
}

const getAssessmentTotal = (assessmentId: string) => {
  const assessment = gradesStore.assessments.find(a => a.id === assessmentId)
  return assessment?.totalMarks || 100
}

const getGradeStatus = (marks: number, total: number) => {
  const percentage = (marks / total) * 100
  if (percentage >= 80) return 'bg-green-100 text-green-800'
  if (percentage >= 70) return 'bg-blue-100 text-blue-800'
  if (percentage >= 60) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const getGradeLabel = (marks: number, total: number) => {
  const percentage = (marks / total) * 100
  if (percentage >= 80) return 'Excellent'
  if (percentage >= 70) return 'Good'
  if (percentage >= 60) return 'Satisfactory'
  return 'Needs Improvement'
}

const getYourPerformance = (course: string) => {
  // Mock performance data
  const performances = {
    'CS101': 85,
    'CS201': 78,
    'MATH101': 92
  }
  return performances[course as keyof typeof performances] || 0
}

const calculateProjectedGrade = () => {
  if (!whatIfScores.finalExam || !whatIfScores.project) return 0
  
  // Mock current grade calculation
  const currentGrade = 65 // Current accumulated grade
  const finalExamWeight = 0.35
  const projectWeight = 0.15
  
  const projectedGrade = currentGrade + 
    (parseInt(whatIfScores.finalExam) * finalExamWeight) + 
    (parseInt(whatIfScores.project) * projectWeight)
  
  return Math.min(projectedGrade, 100)
}

const getLetterGrade = (percentage: number) => {
  if (percentage >= 90) return 'A+'
  if (percentage >= 85) return 'A'
  if (percentage >= 80) return 'A-'
  if (percentage >= 75) return 'B+'
  if (percentage >= 70) return 'B'
  if (percentage >= 65) return 'B-'
  if (percentage >= 60) return 'C+'
  if (percentage >= 55) return 'C'
  if (percentage >= 50) return 'C-'
  return 'F'
}

const submitRemarkRequest = () => {
  if (!authStore.currentUser) return
  
  gradesStore.submitRemarkRequest({
    studentId: authStore.currentUser.id,
    assessmentId: remarkForm.assessmentId,
    courseId: remarkForm.courseId,
    reason: remarkForm.reason
  })
  
  // Reset form
  remarkForm.courseId = ''
  remarkForm.assessmentId = ''
  remarkForm.reason = ''
  
  alert('Remark request submitted successfully!')
}
</script>