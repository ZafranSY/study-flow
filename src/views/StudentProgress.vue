<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Academic Progress</h1>
        <p class="text-gray-600">Track your academic journey and performance trends</p>
      </div>

      <!-- Overall Progress Summary -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Cumulative GPA"
          :value="cumulativeGPA.toFixed(2)"
          change="+0.15 this semester"
          :icon="AcademicCapIcon"
          variant="primary"
        />
        <StatsCard
          title="Credits Completed"
          :value="`${completedCredits}/${totalCredits}`"
          :icon="BookOpenIcon"
          variant="success"
        />
        <StatsCard
          title="Semester Progress"
          :value="`${semesterProgress}%`"
          :icon="ChartBarIcon"
          variant="secondary"
        />
        <StatsCard
          title="Class Ranking"
          :value="`#${classRank}`"
          change="↑ 3 positions"
          :icon="TrophyIcon"
          variant="warning"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- GPA Trend Chart -->
        <div class="lg:col-span-2">
          <PerformanceChart
            title="GPA Trend Over Time"
            :data="gpaData"
            color="#10b981"
          />
        </div>

        <!-- Semester Overview -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Current Semester</h3>
          <div class="space-y-4">
            <div v-for="course in currentSemesterCourses" :key="course.code" class="border-l-4 border-primary-500 pl-4">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h4 class="font-medium text-gray-900">{{ course.code }}</h4>
                  <p class="text-sm text-gray-600">{{ course.name }}</p>
                </div>
                <span :class="getGradeColor(course.currentGrade)" class="text-sm font-bold">
                  {{ course.currentGrade.toFixed(1) }}%
                </span>
              </div>
              
              <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  :class="getProgressColor(course.progress)"
                  class="h-2 rounded-full transition-all duration-300"
                  :style="{ width: course.progress + '%' }"
                ></div>
              </div>
              
              <div class="flex justify-between text-xs text-gray-500">
                <span>{{ course.completedAssessments }}/{{ course.totalAssessments }} completed</span>
                <span>{{ course.credits }} credits</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Progress Sections -->
      <div class="mt-8 space-y-8">
        <!-- Academic Timeline -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Academic Timeline</h3>
          
          <div class="relative">
            <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
            
            <div v-for="(milestone, index) in academicTimeline" :key="index" class="relative flex items-start mb-8">
              <div :class="milestone.completed ? 'bg-green-500' : 'bg-gray-300'" class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                <CheckIcon v-if="milestone.completed" class="h-4 w-4 text-white" />
                <span v-else class="text-xs text-gray-600">{{ index + 1 }}</span>
              </div>
              
              <div class="ml-4 flex-1">
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-medium text-gray-900">{{ milestone.title }}</h4>
                    <p class="text-sm text-gray-600">{{ milestone.description }}</p>
                  </div>
                  <span class="text-sm text-gray-500">{{ milestone.date }}</span>
                </div>
                
                <div v-if="milestone.details" class="mt-2 text-sm text-gray-600">
                  <ul class="list-disc list-inside space-y-1">
                    <li v-for="detail in milestone.details" :key="detail">{{ detail }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Course Progress Details -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Course Progress Details</h3>
          
          <div class="space-y-6">
            <div v-for="course in detailedCourseProgress" :key="course.code" class="border border-gray-200 rounded-lg p-4">
              <div class="flex justify-between items-center mb-4">
                <div>
                  <h4 class="font-medium text-gray-900">{{ course.code }} - {{ course.name }}</h4>
                  <p class="text-sm text-gray-600">{{ course.instructor }} • {{ course.credits }} Credits</p>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold" :class="getGradeColor(course.currentGrade)">
                    {{ course.currentGrade.toFixed(1) }}%
                  </div>
                  <div class="text-sm text-gray-500">{{ getLetterGrade(course.currentGrade) }}</div>
                </div>
              </div>
              
              <!-- Assessment Breakdown -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div v-for="component in course.components" :key="component.name" class="text-center">
                  <div class="text-sm text-gray-600 mb-1">{{ component.name }}</div>
                  <div class="text-lg font-semibold" :class="getGradeColor(component.score)">
                    {{ component.score.toFixed(1) }}%
                  </div>
                  <div class="text-xs text-gray-500">Weight: {{ component.weight }}%</div>
                </div>
              </div>
              
              <!-- Progress Bar -->
              <div class="mb-4">
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Course Progress</span>
                  <span>{{ course.progress }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    :class="getProgressColor(course.progress)"
                    class="h-2 rounded-full transition-all duration-300"
                    :style="{ width: course.progress + '%' }"
                  ></div>
                </div>
              </div>
              
              <!-- Upcoming Assessments -->
              <div v-if="course.upcoming.length > 0">
                <h5 class="font-medium text-gray-700 mb-2">Upcoming Assessments</h5>
                <div class="space-y-2">
                  <div v-for="assessment in course.upcoming" :key="assessment.title" class="flex justify-between items-center text-sm">
                    <span class="text-gray-600">{{ assessment.title }}</span>
                    <span class="text-red-600 font-medium">{{ assessment.dueDate }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Analytics -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Performance Analytics</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Strengths and Weaknesses -->
            <div>
              <h4 class="font-medium text-gray-700 mb-4">Academic Strengths & Areas for Improvement</h4>
              
              <div class="space-y-4">
                <div>
                  <h5 class="text-sm font-medium text-green-700 mb-2">Strengths</h5>
                  <ul class="space-y-1">
                    <li v-for="strength in academicStrengths" :key="strength" class="text-sm text-gray-600 flex items-center">
                      <CheckCircleIcon class="h-4 w-4 text-green-500 mr-2" />
                      {{ strength }}
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h5 class="text-sm font-medium text-yellow-700 mb-2">Areas for Improvement</h5>
                  <ul class="space-y-1">
                    <li v-for="area in improvementAreas" :key="area" class="text-sm text-gray-600 flex items-center">
                      <ExclamationTriangleIcon class="h-4 w-4 text-yellow-500 mr-2" />
                      {{ area }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <!-- Study Recommendations -->
            <div>
              <h4 class="font-medium text-gray-700 mb-4">Personalized Recommendations</h4>
              
              <div class="space-y-3">
                <div v-for="recommendation in studyRecommendations" :key="recommendation.title" class="p-3 bg-blue-50 rounded-lg">
                  <h5 class="text-sm font-medium text-blue-900">{{ recommendation.title }}</h5>
                  <p class="text-sm text-blue-700 mt-1">{{ recommendation.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  AcademicCapIcon, 
  BookOpenIcon, 
  ChartBarIcon, 
  TrophyIcon,
  CheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

import Navigation from '../components/shared/Navigation.vue'
import StatsCard from '../components/shared/StatsCard.vue'
import PerformanceChart from '../components/charts/PerformanceChart.vue'

// Mock data
const cumulativeGPA = ref(3.47)
const completedCredits = ref(45)
const totalCredits = ref(120)
const semesterProgress = ref(75)
const classRank = ref(15)

const gpaData = {
  labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Current'],
  values: [3.2, 3.35, 3.41, 3.38, 3.45, 3.47]
}

const currentSemesterCourses = [
  {
    code: 'CS101',
    name: 'Programming Fundamentals',
    currentGrade: 85.2,
    progress: 75,
    completedAssessments: 9,
    totalAssessments: 12,
    credits: 3
  },
  {
    code: 'CS201',
    name: 'Data Structures',
    currentGrade: 78.5,
    progress: 60,
    completedAssessments: 6,
    totalAssessments: 10,
    credits: 4
  },
  {
    code: 'MATH101',
    name: 'Calculus I',
    currentGrade: 92.1,
    progress: 83,
    completedAssessments: 10,
    totalAssessments: 12,
    credits: 3
  }
]

const academicTimeline = [
  {
    title: 'Semester 1 Completed',
    description: 'Successfully completed first semester with 3.2 GPA',
    date: 'May 2023',
    completed: true,
    details: ['Completed 15 credits', 'Dean\'s List recognition']
  },
  {
    title: 'Semester 2 Completed',
    description: 'Improved performance with 3.35 GPA',
    date: 'Dec 2023',
    completed: true,
    details: ['Completed 15 credits', 'Joined Programming Club']
  },
  {
    title: 'Current Semester',
    description: 'In progress - maintaining strong performance',
    date: 'Jan 2024',
    completed: false,
    details: ['15 credits enrolled', '75% completion rate']
  },
  {
    title: 'Semester 4 (Upcoming)',
    description: 'Advanced courses and specialization',
    date: 'Sep 2024',
    completed: false
  }
]

const detailedCourseProgress = [
  {
    code: 'CS101',
    name: 'Programming Fundamentals',
    instructor: 'Dr. John Smith',
    credits: 3,
    currentGrade: 85.2,
    progress: 75,
    components: [
      { name: 'Quizzes', score: 88.5, weight: 20 },
      { name: 'Assignments', score: 85.0, weight: 30 },
      { name: 'Midterm', score: 82.0, weight: 25 },
      { name: 'Final', score: 0, weight: 25 }
    ],
    upcoming: [
      { title: 'Final Project', dueDate: 'Mar 15' },
      { title: 'Final Exam', dueDate: 'Mar 22' }
    ]
  },
  {
    code: 'CS201',
    name: 'Data Structures',
    instructor: 'Dr. Sarah Lee',
    credits: 4,
    currentGrade: 78.5,
    progress: 60,
    components: [
      { name: 'Labs', score: 82.0, weight: 25 },
      { name: 'Projects', score: 75.0, weight: 35 },
      { name: 'Midterm', score: 78.0, weight: 20 },
      { name: 'Final', score: 0, weight: 20 }
    ],
    upcoming: [
      { title: 'Project 3', dueDate: 'Mar 10' },
      { title: 'Final Exam', dueDate: 'Mar 25' }
    ]
  }
]

const academicStrengths = [
  'Strong performance in programming assignments',
  'Consistent quiz scores above class average',
  'Good time management skills',
  'Active participation in class discussions'
]

const improvementAreas = [
  'Mathematical concepts in algorithms',
  'Code optimization techniques',
  'Test-taking strategies for exams'
]

const studyRecommendations = [
  {
    title: 'Focus on Algorithm Analysis',
    description: 'Spend extra time on Big O notation and complexity analysis to improve CS201 performance.'
  },
  {
    title: 'Join Study Groups',
    description: 'Collaborate with peers for better understanding of complex data structures.'
  },
  {
    title: 'Practice Coding Problems',
    description: 'Solve at least 3 coding problems weekly to strengthen programming skills.'
  }
]

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
</script>