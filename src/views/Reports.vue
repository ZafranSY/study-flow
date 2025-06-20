<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Academic Reports</h1>
        <p class="text-gray-600">Generate comprehensive reports and analytics</p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Reports Generated"
          :value="totalReports"
          change="+15 this month"
          :icon="DocumentTextIcon"
          variant="primary"
        />
        <StatsCard
          title="Students Analyzed"
          :value="studentsAnalyzed"
          :icon="UsersIcon"
          variant="success"
        />
        <StatsCard
          title="At-Risk Students"
          :value="atRiskStudents"
          :icon="ExclamationTriangleIcon"
          variant="danger"
        />
        <StatsCard
          title="Average GPA"
          :value="averageGPA.toFixed(2)"
          change="+0.12 improvement"
          :icon="ChartBarIcon"
          variant="secondary"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Report Generation Panel -->
        <div class="lg:col-span-3">
          <!-- Report Type Selection -->
          <div class="card mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                @click="selectedReportType = 'individual'"
                :class="selectedReportType === 'individual' ? 'bg-primary-50 border-primary-200 text-primary-700' : 'hover:bg-gray-50'"
                class="p-4 border rounded-lg text-left transition-colors"
              >
                <UserIcon class="h-8 w-8 mb-2" />
                <h4 class="font-medium">Individual Student Report</h4>
                <p class="text-sm text-gray-600">Detailed analysis of a single student</p>
              </button>
              
              <button
                @click="selectedReportType = 'class'"
                :class="selectedReportType === 'class' ? 'bg-primary-50 border-primary-200 text-primary-700' : 'hover:bg-gray-50'"
                class="p-4 border rounded-lg text-left transition-colors"
              >
                <UserGroupIcon class="h-8 w-8 mb-2" />
                <h4 class="font-medium">Class Performance Report</h4>
                <p class="text-sm text-gray-600">Overall class statistics and trends</p>
              </button>
              
              <button
                @click="selectedReportType = 'comparative'"
                :class="selectedReportType === 'comparative' ? 'bg-primary-50 border-primary-200 text-primary-700' : 'hover:bg-gray-50'"
                class="p-4 border rounded-lg text-left transition-colors"
              >
                <ChartBarIcon class="h-8 w-8 mb-2" />
                <h4 class="font-medium">Comparative Analysis</h4>
                <p class="text-sm text-gray-600">Compare multiple students or classes</p>
              </button>
            </div>

            <!-- Report Configuration -->
            <div v-if="selectedReportType" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-if="selectedReportType === 'individual'">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                  <select v-model="reportConfig.studentId" class="input-field">
                    <option value="">Choose Student</option>
                    <option v-for="student in mockStudents" :key="student.id" :value="student.id">
                      {{ student.name }} ({{ student.matricNumber }})
                    </option>
                  </select>
                </div>
                
                <div v-if="selectedReportType === 'class'">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                  <select v-model="reportConfig.courseId" class="input-field">
                    <option value="">Choose Course</option>
                    <option value="CS101">CS101 - Programming Fundamentals</option>
                    <option value="CS201">CS201 - Data Structures</option>
                    <option value="MATH101">MATH101 - Calculus I</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                  <select v-model="reportConfig.period" class="input-field">
                    <option value="current">Current Semester</option>
                    <option value="previous">Previous Semester</option>
                    <option value="academic_year">Academic Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Report Format</label>
                  <select v-model="reportConfig.format" class="input-field">
                    <option value="pdf">PDF Document</option>
                    <option value="excel">Excel Spreadsheet</option>
                    <option value="csv">CSV File</option>
                  </select>
                </div>
              </div>
              
              <div v-if="reportConfig.period === 'custom'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input v-model="reportConfig.startDate" type="date" class="input-field">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input v-model="reportConfig.endDate" type="date" class="input-field">
                </div>
              </div>
              
              <div class="flex justify-end">
                <button @click="generateReport" class="btn-primary">
                  <DocumentArrowDownIcon class="h-4 w-4 mr-2" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          <!-- Recent Reports -->
          <div class="card">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Recent Reports</h3>
              <button @click="showAllReports = !showAllReports" class="text-primary-600 hover:text-primary-700 text-sm">
                {{ showAllReports ? 'Show Less' : 'View All' }}
              </button>
            </div>
            
            <div class="space-y-4">
              <div v-for="report in displayedReports" :key="report.id" class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div class="flex items-center space-x-4">
                  <div :class="getReportTypeColor(report.type)" class="p-2 rounded-full">
                    <component :is="getReportIcon(report.type)" class="h-5 w-5" />
                  </div>
                  
                  <div>
                    <h4 class="font-medium text-gray-900">{{ report.title }}</h4>
                    <p class="text-sm text-gray-600">{{ report.description }}</p>
                    <div class="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span>Generated: {{ formatDate(report.createdAt) }}</span>
                      <span>{{ report.format.toUpperCase() }}</span>
                      <span>{{ report.size }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <button 
                    @click="downloadReport(report)"
                    class="text-primary-600 hover:text-primary-900 text-sm"
                  >
                    Download
                  </button>
                  <button 
                    @click="shareReport(report)"
                    class="text-secondary-600 hover:text-secondary-900 text-sm"
                  >
                    Share
                  </button>
                  <button 
                    @click="deleteReport(report)"
                    class="text-red-600 hover:text-red-900 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div class="space-y-3">
              <button
                @click="generateQuickReport('at-risk')"
                class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
                  <span class="text-sm font-medium">At-Risk Students</span>
                </div>
              </button>
              
              <button
                @click="generateQuickReport('top-performers')"
                class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <TrophyIcon class="h-5 w-5 text-yellow-400" />
                  <span class="text-sm font-medium">Top Performers</span>
                </div>
              </button>
              
              <button
                @click="generateQuickReport('attendance')"
                class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <ClockIcon class="h-5 w-5 text-blue-400" />
                  <span class="text-sm font-medium">Attendance Summary</span>
                </div>
              </button>
              
              <button
                @click="generateQuickReport('grade-distribution')"
                class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <ChartPieIcon class="h-5 w-5 text-green-400" />
                  <span class="text-sm font-medium">Grade Distribution</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Report Templates -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Report Templates</h3>
            <div class="space-y-2">
              <div v-for="template in reportTemplates" :key="template.id" class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <h4 class="text-sm font-medium text-gray-900">{{ template.name }}</h4>
                <p class="text-xs text-gray-600">{{ template.description }}</p>
              </div>
            </div>
          </div>

          <!-- Export Options -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
            <div class="space-y-3">
              <button class="w-full btn-secondary text-sm">
                <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
                Export All Reports
              </button>
              <button class="w-full btn-secondary text-sm">
                <ShareIcon class="h-4 w-4 mr-2" />
                Share Dashboard
              </button>
              <button class="w-full btn-secondary text-sm">
                <Cog6ToothIcon class="h-4 w-4 mr-2" />
                Report Settings
              </button>
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
  DocumentTextIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserIcon,
  UserGroupIcon,
  DocumentArrowDownIcon,
  TrophyIcon,
  ClockIcon,
  ChartPieIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'

import Navigation from '../components/shared/Navigation.vue'
import StatsCard from '../components/shared/StatsCard.vue'

const selectedReportType = ref('')
const showAllReports = ref(false)

// Stats
const totalReports = ref(156)
const studentsAnalyzed = ref(245)
const atRiskStudents = ref(18)
const averageGPA = ref(3.24)

const reportConfig = reactive({
  studentId: '',
  courseId: '',
  period: 'current',
  format: 'pdf',
  startDate: '',
  endDate: ''
})

const mockStudents = [
  { id: '1', name: 'Alice Johnson', matricNumber: 'STU001' },
  { id: '2', name: 'Bob Smith', matricNumber: 'STU002' },
  { id: '3', name: 'Carol Davis', matricNumber: 'STU003' }
]

const recentReports = [
  {
    id: '1',
    title: 'CS101 Class Performance Report',
    description: 'Semester 1 2024 comprehensive analysis',
    type: 'class',
    format: 'pdf',
    size: '2.4 MB',
    createdAt: '2024-01-28'
  },
  {
    id: '2',
    title: 'Alice Johnson Individual Report',
    description: 'Academic progress and recommendations',
    type: 'individual',
    format: 'pdf',
    size: '1.8 MB',
    createdAt: '2024-01-27'
  },
  {
    id: '3',
    title: 'At-Risk Students Analysis',
    description: 'Students requiring immediate attention',
    type: 'comparative',
    format: 'excel',
    size: '3.2 MB',
    createdAt: '2024-01-26'
  },
  {
    id: '4',
    title: 'Grade Distribution Report',
    description: 'Statistical analysis of grade patterns',
    type: 'class',
    format: 'csv',
    size: '856 KB',
    createdAt: '2024-01-25'
  },
  {
    id: '5',
    title: 'Top Performers Report',
    description: 'Recognition and analysis of high achievers',
    type: 'comparative',
    format: 'pdf',
    size: '2.1 MB',
    createdAt: '2024-01-24'
  }
]

const reportTemplates = [
  {
    id: '1',
    name: 'Standard Progress Report',
    description: 'Basic academic progress template'
  },
  {
    id: '2',
    name: 'Detailed Analytics',
    description: 'Comprehensive performance analysis'
  },
  {
    id: '3',
    name: 'Parent Communication',
    description: 'Student progress for parents'
  },
  {
    id: '4',
    name: 'Administrative Summary',
    description: 'High-level overview for administration'
  }
]

const displayedReports = computed(() => {
  return showAllReports.value ? recentReports : recentReports.slice(0, 3)
})

const getReportTypeColor = (type: string) => {
  const colors = {
    individual: 'bg-blue-100 text-blue-600',
    class: 'bg-green-100 text-green-600',
    comparative: 'bg-purple-100 text-purple-600'
  }
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-600'
}

const getReportIcon = (type: string) => {
  const icons = {
    individual: UserIcon,
    class: UserGroupIcon,
    comparative: ChartBarIcon
  }
  return icons[type as keyof typeof icons] || DocumentTextIcon
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const generateReport = () => {
  alert(`Generating ${selectedReportType.value} report...`)
  // Add report generation logic here
}

const generateQuickReport = (type: string) => {
  alert(`Generating ${type} report...`)
}

const downloadReport = (report: any) => {
  alert(`Downloading ${report.title}...`)
}

const shareReport = (report: any) => {
  alert(`Sharing ${report.title}...`)
}

const deleteReport = (report: any) => {
  if (confirm(`Are you sure you want to delete "${report.title}"?`)) {
    const index = recentReports.findIndex(r => r.id === report.id)
    if (index !== -1) {
      recentReports.splice(index, 1)
      alert('Report deleted successfully!')
    }
  }
}
</script>