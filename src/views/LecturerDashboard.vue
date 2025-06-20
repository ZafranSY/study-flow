<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">
          Lecturer Dashboard
        </h1>
        <p class="text-gray-600">Manage your courses and student assessments</p>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Active Courses"
          :value="activeCourses"
          :icon="BookOpenIcon"
          variant="primary"
        />
        <StatsCard
          title="Total Students"
          :value="totalStudents"
          :icon="UsersIcon"
          variant="secondary"
        />
        <StatsCard
          title="Pending Grading"
          :value="pendingGrading"
          :icon="ClipboardDocumentListIcon"
          variant="warning"
        />
        <StatsCard
          title="Class Average"
          :value="`${classAverage.toFixed(1)}%`"
          change="+2.3% from last month"
          :icon="ChartBarIcon"
          variant="success"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Performance Analytics -->
        <div class="lg:col-span-2">
          <PerformanceChart
            title="Class Performance Analytics"
            :data="classPerformanceData"
            color="#10b981"
          />
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <button
              @click="activeTab = 'students'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <UsersIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">Manage Students</span>
              </div>
            </button>
            
            <button
              @click="activeTab = 'grades'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <PencilSquareIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">Grade Assignments</span>
              </div>
            </button>
            
            <button
              @click="activeTab = 'assessments'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <DocumentPlusIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">Create Assessment</span>
              </div>
            </button>
            
            <button
              @click="activeTab = 'upload'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <ArrowUpTrayIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">Bulk Upload CSV</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Detailed Views -->
      <div class="mt-8">
        <!-- Student Management -->
        <div v-if="activeTab === 'students'" class="card">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Student Records</h3>
            <div class="flex items-center space-x-3">
              <select v-model="selectedCourse" class="text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
                <option value="">All Courses</option>
                <option value="CS101">CS101 - Programming Fundamentals</option>
                <option value="CS201">CS201 - Data Structures</option>
              </select>
              <button class="btn-primary text-sm">
                Add Student
              </button>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matric No.
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Grade
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="student in mockStudents" :key="student.id" class="table-row">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <img :src="student.profilePicture" alt="" class="h-8 w-8 rounded-full">
                      <div class="ml-3">
                        <div class="text-sm font-medium text-gray-900">{{ student.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ student.matricNumber }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ student.course }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ student.currentGrade }}%
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button class="text-primary-600 hover:text-primary-900">Edit</button>
                    <button class="text-secondary-600 hover:text-secondary-900">View Details</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Grade Entry -->
        <div v-if="activeTab === 'grades'" class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Grade Entry & Management</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <select v-model="gradeForm.courseId" class="input-field">
                <option value="">Select Course</option>
                <option value="CS101">CS101 - Programming Fundamentals</option>
                <option value="CS201">CS201 - Data Structures</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Assessment</label>
              <select v-model="gradeForm.assessmentId" class="input-field">
                <option value="">Select Assessment</option>
                <option value="1">Quiz 1: Variables and Data Types</option>
                <option value="2">Assignment 1: Calculator App</option>
              </select>
            </div>
          </div>

          <div v-if="gradeForm.courseId && gradeForm.assessmentId" class="space-y-4">
            <h4 class="font-medium text-gray-700">Student Grades:</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="student in mockStudents.slice(0, 6)" :key="student.id" class="p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center space-x-3 mb-3">
                  <img :src="student.profilePicture" alt="" class="h-6 w-6 rounded-full">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ student.name }}</div>
                    <div class="text-xs text-gray-500">{{ student.matricNumber }}</div>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <input 
                    type="number" 
                    class="input-field text-sm" 
                    placeholder="0"
                    min="0" 
                    max="100"
                    :value="student.currentGrade"
                  >
                  <span class="text-sm text-gray-500">/100</span>
                </div>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button class="btn-secondary">Save Draft</button>
              <button class="btn-primary">Publish Grades</button>
            </div>
          </div>
        </div>

        <!-- Create Assessment -->
        <div v-if="activeTab === 'assessments'" class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Create New Assessment</h3>
          
          <form @submit.prevent="createAssessment" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Assessment Title</label>
                <input v-model="assessmentForm.title" type="text" class="input-field" required>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select v-model="assessmentForm.type" class="input-field" required>
                  <option value="">Select Type</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                  <option value="test">Test</option>
                  <option value="exam">Exam</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select v-model="assessmentForm.courseId" class="input-field" required>
                  <option value="">Select Course</option>
                  <option value="CS101">CS101 - Programming Fundamentals</option>
                  <option value="CS201">CS201 - Data Structures</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input v-model="assessmentForm.dueDate" type="date" class="input-field" required>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Total Marks</label>
                <input v-model="assessmentForm.totalMarks" type="number" class="input-field" required>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Weightage (%)</label>
                <input v-model="assessmentForm.weightage" type="number" class="input-field" required>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea v-model="assessmentForm.description" rows="3" class="input-field"></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button type="button" class="btn-secondary">Save as Draft</button>
              <button type="submit" class="btn-primary">Create Assessment</button>
            </div>
          </form>
        </div>

        <!-- CSV Upload -->
        <div v-if="activeTab === 'upload'" class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Bulk Upload Grades</h3>
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Select Course & Assessment</label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select v-model="uploadForm.courseId" class="input-field">
                  <option value="">Select Course</option>
                  <option value="CS101">CS101 - Programming Fundamentals</option>
                  <option value="CS201">CS201 - Data Structures</option>
                </select>
                
                <select v-model="uploadForm.assessmentId" class="input-field">
                  <option value="">Select Assessment</option>
                  <option value="1">Quiz 1: Variables and Data Types</option>
                  <option value="2">Assignment 1: Calculator App</option>
                </select>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div class="space-y-1 text-center">
                  <ArrowUpTrayIcon class="mx-auto h-12 w-12 text-gray-400" />
                  <div class="flex text-sm text-gray-600">
                    <label class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                      <span>Upload a file</span>
                      <input type="file" class="sr-only" accept=".csv" @change="handleFileUpload">
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs text-gray-500">CSV files only</p>
                </div>
              </div>
            </div>
            
            <div v-if="uploadedFile" class="p-4 bg-green-50 rounded-lg">
              <div class="flex items-center">
                <CheckCircleIcon class="h-5 w-5 text-green-400" />
                <span class="ml-2 text-sm text-green-800">{{ uploadedFile.name }} uploaded successfully</span>
              </div>
            </div>
            
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 class="text-sm font-medium text-yellow-800 mb-2">CSV Format Requirements:</h4>
              <ul class="text-sm text-yellow-700 space-y-1">
                <li>• Column 1: Student Matric Number</li>
                <li>• Column 2: Student Name</li>
                <li>• Column 3: Marks (numeric)</li>
                <li>• No headers required</li>
              </ul>
            </div>
            
            <div class="flex justify-end">
              <button class="btn-primary" :disabled="!uploadedFile">
                Process Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  BookOpenIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  PencilSquareIcon,
  DocumentPlusIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'

import Navigation from '../components/shared/Navigation.vue'
import StatsCard from '../components/shared/StatsCard.vue'
import PerformanceChart from '../components/charts/PerformanceChart.vue'
import { useGradesStore } from '../stores/grades'

const gradesStore = useGradesStore()

const activeTab = ref('students')
const selectedCourse = ref('')
const uploadedFile = ref<File | null>(null)

// Mock data
const activeCourses = ref(2)
const totalStudents = ref(85)
const pendingGrading = ref(12)
const classAverage = ref(78.5)

const classPerformanceData = {
  labels: ['Quiz 1', 'Quiz 2', 'Assignment 1', 'Midterm', 'Assignment 2', 'Quiz 3'],
  values: [75, 78, 82, 76, 85, 79]
}

const mockStudents = [
  {
    id: '1',
    name: 'Alice Johnson',
    matricNumber: 'STU001',
    course: 'CS101',
    currentGrade: 85,
    profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '2',
    name: 'Bob Smith',
    matricNumber: 'STU002',
    course: 'CS101',
    currentGrade: 78,
    profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '3',
    name: 'Carol Davis',
    matricNumber: 'STU003',
    course: 'CS201',
    currentGrade: 92,
    profilePicture: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '4',
    name: 'David Wilson',
    matricNumber: 'STU004',
    course: 'CS101',
    currentGrade: 73,
    profilePicture: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '5',
    name: 'Emma Brown',
    matricNumber: 'STU005',
    course: 'CS201',
    currentGrade: 88,
    profilePicture: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '6',
    name: 'Frank Miller',
    matricNumber: 'STU006',
    course: 'CS101',
    currentGrade: 81,
    profilePicture: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
]

const gradeForm = reactive({
  courseId: '',
  assessmentId: ''
})

const assessmentForm = reactive({
  title: '',
  type: '',
  courseId: '',
  totalMarks: '',
  weightage: '',
  dueDate: '',
  description: ''
})

const uploadForm = reactive({
  courseId: '',
  assessmentId: ''
})

const createAssessment = () => {
  gradesStore.addAssessment({
    title: assessmentForm.title,
    type: assessmentForm.type as any,
    courseId: assessmentForm.courseId,
    totalMarks: parseInt(assessmentForm.totalMarks),
    weightage: parseInt(assessmentForm.weightage),
    dueDate: assessmentForm.dueDate,
    description: assessmentForm.description
  })
  
  // Reset form
  Object.keys(assessmentForm).forEach(key => {
    assessmentForm[key as keyof typeof assessmentForm] = ''
  })
  
  alert('Assessment created successfully!')
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    uploadedFile.value = target.files[0]
  }
}
</script>