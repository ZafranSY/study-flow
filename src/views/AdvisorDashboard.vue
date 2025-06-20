<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">
          Academic Advisor Dashboard
        </h1>
        <p class="text-gray-600">Monitor and support your advisee students</p>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Advisees"
          :value="totalAdvisees"
          :icon="UsersIcon"
          variant="primary"
        />
        <StatsCard
          title="At-Risk Students"
          :value="atRiskStudents"
          :icon="ExclamationTriangleIcon"
          variant="danger"
        />
        <StatsCard
          title="Consultations This Month"
          :value="consultationsThisMonth"
          change="+3 from last month"
          :icon="CalendarDaysIcon"
          variant="secondary"
        />
        <StatsCard
          title="Average Advisee GPA"
          :value="averageAdviseeGPA.toFixed(2)"
          change="+0.15 improvement"
          :icon="AcademicCapIcon"
          variant="success"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- At-Risk Students Chart -->
        <div class="lg:col-span-2">
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Student Performance Overview</h3>
            <div class="h-64">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
                <div v-for="student in performanceOverview" :key="student.id" class="text-center">
                  <div class="mb-2">
                    <img :src="student.profilePicture" alt="" class="h-12 w-12 rounded-full mx-auto mb-1">
                    <div class="text-xs font-medium text-gray-900">{{ student.name.split(' ')[0] }}</div>
                  </div>
                  <div class="relative">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        :class="getPerformanceColor(student.gpa)"
                        class="h-2 rounded-full transition-all duration-300"
                        :style="{ width: (student.gpa / 4.0) * 100 + '%' }"
                      ></div>
                    </div>
                    <div class="text-xs text-gray-600 mt-1">GPA: {{ student.gpa.toFixed(2) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <button
              @click="activeTab = 'advisees'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <UsersIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">View All Advisees</span>
              </div>
            </button>
            
            <button
              @click="activeTab = 'atrisk'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
                <span class="text-sm font-medium">At-Risk Students</span>
              </div>
            </button>
            
            <button
              @click="activeTab = 'consultations'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <DocumentTextIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">Consultation Records</span>
              </div>
            </button>
            
            <button
              @click="activeTab = 'reports'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <ChartBarIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">Generate Reports</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Detailed Views -->
      <div class="mt-8">
        <!-- All Advisees -->
        <div v-if="activeTab === 'advisees'" class="card">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">All Advisees</h3>
            <div class="flex items-center space-x-3">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search students..."
                class="input-field text-sm w-64"
              >
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
                    GPA
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Meeting
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="student in filteredAdvisees" :key="student.id" class="table-row">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <img :src="student.profilePicture" alt="" class="h-8 w-8 rounded-full">
                      <div class="ml-3">
                        <div class="text-sm font-medium text-gray-900">{{ student.name }}</div>
                        <div class="text-sm text-gray-500">{{ student.program }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ student.matricNumber }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ student.gpa.toFixed(2) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusColor(student.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ student.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ student.lastMeeting }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      @click="viewStudentDetails(student)"
                      class="text-primary-600 hover:text-primary-900"
                    >
                      View Details
                    </button>
                    <button 
                      @click="scheduleConsultation(student)"
                      class="text-secondary-600 hover:text-secondary-900"
                    >
                      Schedule Meeting
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- At-Risk Students -->
        <div v-if="activeTab === 'atrisk'" class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">At-Risk Students Requiring Attention</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="student in atRiskStudentsList" :key="student.id" class="border border-red-200 rounded-lg p-4 bg-red-50">
              <div class="flex items-start space-x-4">
                <img :src="student.profilePicture" alt="" class="h-12 w-12 rounded-full">
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <h4 class="text-sm font-medium text-gray-900">{{ student.name }}</h4>
                    <span class="text-xs text-red-600 font-medium">{{ student.matricNumber }}</span>
                  </div>
                  
                  <div class="mt-2 space-y-1">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-600">Current GPA:</span>
                      <span class="font-medium text-red-600">{{ student.gpa.toFixed(2) }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-600">Risk Factors:</span>
                      <span class="text-red-600">{{ student.riskFactors.join(', ') }}</span>
                    </div>
                  </div>
                  
                  <div class="mt-3 flex space-x-2">
                    <button class="text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700">
                      Schedule Urgent Meeting
                    </button>
                    <button class="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700">
                      Add Notes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Consultation Records -->
        <div v-if="activeTab === 'consultations'" class="card">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Consultation Records</h3>
            <button 
              @click="showNewConsultationForm = true"
              class="btn-primary"
            >
              Add New Record
            </button>
          </div>

          <!-- New Consultation Form -->
          <div v-if="showNewConsultationForm" class="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 class="font-medium text-gray-900 mb-3">New Consultation Record</h4>
            <form @submit.prevent="addConsultationRecord" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Student</label>
                  <select v-model="consultationForm.studentId" class="input-field" required>
                    <option value="">Select Student</option>
                    <option v-for="student in mockAdvisees" :key="student.id" :value="student.id">
                      {{ student.name }} ({{ student.matricNumber }})
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input v-model="consultationForm.date" type="date" class="input-field" required>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Meeting Notes</label>
                <textarea v-model="consultationForm.notes" rows="3" class="input-field" required></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                <textarea v-model="consultationForm.recommendations" rows="2" class="input-field" placeholder="Enter recommendations separated by commas"></textarea>
              </div>
              
              <div class="flex items-center">
                <input v-model="consultationForm.followUpRequired" type="checkbox" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                <label class="ml-2 text-sm text-gray-700">Follow-up required</label>
              </div>
              
              <div class="flex justify-end space-x-3">
                <button type="button" @click="showNewConsultationForm = false" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Save Record</button>
              </div>
            </form>
          </div>
          
          <!-- Consultation Records List -->
          <div class="space-y-4">
            <div v-for="record in consultationRecords" :key="record.id" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <h4 class="font-medium text-gray-900">{{ getStudentName(record.studentId) }}</h4>
                    <span class="text-sm text-gray-500">{{ formatDate(record.date) }}</span>
                    <span v-if="record.followUpRequired" class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      Follow-up Required
                    </span>
                  </div>
                  
                  <p class="text-sm text-gray-600 mb-2">{{ record.notes }}</p>
                  
                  <div v-if="record.recommendations.length > 0" class="text-sm">
                    <span class="font-medium text-gray-700">Recommendations:</span>
                    <ul class="list-disc list-inside text-gray-600 ml-4">
                      <li v-for="recommendation in record.recommendations" :key="recommendation">
                        {{ recommendation }}
                      </li>
                    </ul>
                  </div>
                </div>
                
                <button class="text-primary-600 hover:text-primary-900 text-sm">
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Reports -->
        <div v-if="activeTab === 'reports'" class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Generate Reports</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="border border-gray-200 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">Individual Student Report</h4>
              <div class="space-y-3">
                <select class="input-field">
                  <option value="">Select Student</option>
                  <option v-for="student in mockAdvisees" :key="student.id" :value="student.id">
                    {{ student.name }}
                  </option>
                </select>
                <button class="w-full btn-primary">Generate Student Report</button>
              </div>
            </div>
            
            <div class="border border-gray-200 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">Summary Report</h4>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm text-gray-600 mb-1">Report Period</label>
                  <select class="input-field">
                    <option value="current">Current Semester</option>
                    <option value="previous">Previous Semester</option>
                    <option value="academic_year">Academic Year</option>
                  </select>
                </div>
                <button class="w-full btn-primary">Generate Summary Report</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  UsersIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

import Navigation from '../components/shared/Navigation.vue'
import StatsCard from '../components/shared/StatsCard.vue'

const activeTab = ref('advisees')
const searchQuery = ref('')
const showNewConsultationForm = ref(false)

// Mock data
const totalAdvisees = ref(12)
const atRiskStudents = ref(3)
const consultationsThisMonth = ref(8)
const averageAdviseeGPA = ref(3.25)

const mockAdvisees = [
  {
    id: '1',
    name: 'Alice Johnson',
    matricNumber: 'STU001',
    program: 'Computer Science',
    gpa: 3.8,
    status: 'Good Standing',
    lastMeeting: '2024-01-15',
    profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '2',
    name: 'Bob Smith',
    matricNumber: 'STU002',
    program: 'Information Technology',
    gpa: 2.1,
    status: 'At Risk',
    lastMeeting: '2024-01-20',
    profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    riskFactors: ['Low GPA', 'Missing Classes']
  },
  {
    id: '3',
    name: 'Carol Davis',
    matricNumber: 'STU003',
    program: 'Software Engineering',
    gpa: 3.9,
    status: 'Excellent',
    lastMeeting: '2024-01-10',
    profilePicture: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '4',
    name: 'David Wilson',
    matricNumber: 'STU004',
    program: 'Computer Science',
    gpa: 1.9,
    status: 'At Risk',
    lastMeeting: '2024-01-25',
    profilePicture: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    riskFactors: ['Low GPA', 'Failed Assessments']
  }
]

const performanceOverview = computed(() => 
  mockAdvisees.slice(0, 8).map(student => ({
    id: student.id,
    name: student.name,
    gpa: student.gpa,
    profilePicture: student.profilePicture
  }))
)

const filteredAdvisees = computed(() => {
  if (!searchQuery.value) return mockAdvisees
  return mockAdvisees.filter(student => 
    student.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    student.matricNumber.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const atRiskStudentsList = computed(() => 
  mockAdvisees.filter(student => student.status === 'At Risk')
)

const consultationRecords = ref([
  {
    id: '1',
    studentId: '1',
    date: '2024-01-15',
    notes: 'Discussed course selection for next semester. Student is performing well and interested in advanced algorithms course.',
    recommendations: ['Enroll in CS301 Advanced Algorithms', 'Consider research opportunities'],
    followUpRequired: false
  },
  {
    id: '2',
    studentId: '2',
    date: '2024-01-20',
    notes: 'Student struggling with programming fundamentals. Discussed study strategies and time management.',
    recommendations: ['Attend supplementary tutoring sessions', 'Form study group', 'Reduce work hours if possible'],
    followUpRequired: true
  }
])

const consultationForm = reactive({
  studentId: '',
  date: '',
  notes: '',
  recommendations: '',
  followUpRequired: false
})

const getPerformanceColor = (gpa: number) => {
  if (gpa >= 3.5) return 'bg-green-500'
  if (gpa >= 3.0) return 'bg-blue-500'
  if (gpa >= 2.5) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Excellent':
      return 'bg-green-100 text-green-800'
    case 'Good Standing':
      return 'bg-blue-100 text-blue-800'
    case 'At Risk':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const viewStudentDetails = (student: any) => {
  alert(`Viewing details for ${student.name}`)
}

const scheduleConsultation = (student: any) => {
  alert(`Scheduling consultation for ${student.name}`)
}

const getStudentName = (studentId: string) => {
  const student = mockAdvisees.find(s => s.id === studentId)
  return student ? student.name : 'Unknown Student'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const addConsultationRecord = () => {
  const newRecord = {
    id: Date.now().toString(),
    studentId: consultationForm.studentId,
    date: consultationForm.date,
    notes: consultationForm.notes,
    recommendations: consultationForm.recommendations 
      ? consultationForm.recommendations.split(',').map(r => r.trim())
      : [],
    followUpRequired: consultationForm.followUpRequired
  }
  
  consultationRecords.value.unshift(newRecord)
  
  // Reset form
  Object.keys(consultationForm).forEach(key => {
    if (typeof consultationForm[key as keyof typeof consultationForm] === 'boolean') {
      consultationForm[key as keyof typeof consultationForm] = false
    } else {
      consultationForm[key as keyof typeof consultationForm] = ''
    }
  })
  
  showNewConsultationForm.value = false
  alert('Consultation record added successfully!')
}
</script>