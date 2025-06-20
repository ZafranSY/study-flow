<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p class="text-gray-600">System management and user administration</p>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Users"
          :value="totalUsers"
          change="+12 this month"
          :icon="UsersIcon"
          variant="primary"
        />
        <StatsCard
          title="Active Courses"
          :value="activeCourses"
          :icon="BookOpenIcon"
          variant="secondary"
        />
        <StatsCard
          title="System Alerts"
          :value="systemAlerts"
          :icon="ExclamationTriangleIcon"
          variant="warning"
        />
        <StatsCard
          title="Database Health"
          value="99.9%"
          change="Optimal"
          :icon="CircleStackIcon"
          variant="success"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-3">
          <!-- User Management -->
          <div v-if="activeTab === 'users'" class="card">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-semibold text-gray-900">User Management</h3>
              <div class="flex items-center space-x-3">
                <input
                  v-model="userSearchQuery"
                  type="text"
                  placeholder="Search users..."
                  class="input-field text-sm w-64"
                >
                <button @click="showUserForm = true" class="btn-primary">
                  Add User
                </button>
              </div>
            </div>

            <!-- User Form Modal -->
            <div v-if="showUserForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div class="bg-white rounded-lg p-6 w-full max-w-md m-4">
                <h4 class="text-lg font-semibold text-gray-900 mb-4">Add New User</h4>
                <form @submit.prevent="addUser" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input v-model="userForm.name" type="text" class="input-field" required>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input v-model="userForm.email" type="email" class="input-field" required>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select v-model="userForm.role" class="input-field" required>
                      <option value="">Select Role</option>
                      <option value="student">Student</option>
                      <option value="lecturer">Lecturer</option>
                      <option value="advisor">Academic Advisor</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  
                  <div v-if="userForm.role === 'student'">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Matric Number</label>
                    <input v-model="userForm.matricNumber" type="text" class="input-field">
                  </div>
                  
                  <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" @click="showUserForm = false" class="btn-secondary">Cancel</button>
                    <button type="submit" class="btn-primary">Add User</button>
                  </div>
                </form>
              </div>
            </div>
            
            <!-- Users Table -->
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="user in filteredUsers" :key="user.id" class="table-row">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <img :src="user.profilePicture" alt="" class="h-8 w-8 rounded-full">
                        <div class="ml-3">
                          <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                          <div class="text-sm text-gray-500">{{ user.email || user.matricNumber }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getRoleBadgeColor(user.role)" class="px-2 py-1 text-xs font-medium rounded-full capitalize">
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                            class="px-2 py-1 text-xs font-medium rounded-full">
                        {{ user.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ user.lastLogin }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button class="text-primary-600 hover:text-primary-900">Edit</button>
                      <button 
                        @click="toggleUserStatus(user)"
                        :class="user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                      >
                        {{ user.status === 'active' ? 'Deactivate' : 'Activate' }}
                      </button>
                      <button class="text-gray-600 hover:text-gray-900">Reset Password</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- System Logs -->
          <div v-if="activeTab === 'logs'" class="card">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-semibold text-gray-900">System Activity Logs</h3>
              <div class="flex items-center space-x-3">
                <select v-model="logFilter" class="text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
                  <option value="">All Activities</option>
                  <option value="login">Login Events</option>
                  <option value="grades">Grade Updates</option>
                  <option value="system">System Events</option>
                  <option value="error">Errors</option>
                </select>
                <button class="btn-secondary text-sm">Export Logs</button>
              </div>
            </div>
            
            <div class="space-y-3">
              <div v-for="log in filteredLogs" :key="log.id" class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div :class="getLogTypeColor(log.type)" class="p-2 rounded-full">
                    <component :is="getLogIcon(log.type)" class="h-4 w-4" />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ log.action }}</div>
                    <div class="text-sm text-gray-500">{{ log.user }} • {{ log.timestamp }}</div>
                  </div>
                </div>
                <div class="text-sm text-gray-500">{{ log.ip }}</div>
              </div>
            </div>
          </div>

          <!-- Course Management -->
          <div v-if="activeTab === 'courses'" class="card">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Course Management</h3>
              <button class="btn-primary">Add New Course</button>
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course Code
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course Name
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lecturer
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Students
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="course in mockCourses" :key="course.id" class="table-row">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ course.code }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ course.name }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ course.lecturer }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ course.studentCount }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" 
                            class="px-2 py-1 text-xs font-medium rounded-full">
                        {{ course.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button class="text-primary-600 hover:text-primary-900">Edit</button>
                      <button class="text-secondary-600 hover:text-secondary-900">Assign Lecturer</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="card h-fit">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Admin Tools</h3>
          <div class="space-y-3">
            <button
              @click="activeTab = 'users'"
              :class="activeTab === 'users' ? 'bg-primary-50 text-primary-700 border-primary-200' : 'hover:bg-gray-50'"
              class="w-full text-left px-3 py-2 rounded-lg border transition-colors"
            >
              <div class="flex items-center space-x-3">
                <UsersIcon class="h-5 w-5" />
                <span class="text-sm font-medium">User Management</span>
              </div>
            </button>
            
            <button
              @click="activeTab = 'courses'"
              :class="activeTab === 'courses' ? 'bg-primary-50 text-primary-700 border-primary-200' : 'hover:bg-gray-50'"
              class="w-full text-left px-3 py-2 rounded-lg border transition-colors"
            >
              <div class="flex items-center space-x-3">
                <BookOpenIcon class="h-5 w-5" />
                <span class="text-sm font-medium">Course Management</span>
              </div>
            </button>
            
            <button
              @click="activeTab = 'logs'"
              :class="activeTab === 'logs' ? 'bg-primary-50 text-primary-700 border-primary-200' : 'hover:bg-gray-50'"
              class="w-full text-left px-3 py-2 rounded-lg border transition-colors"
            >
              <div class="flex items-center space-x-3">
                <DocumentTextIcon class="h-5 w-5" />
                <span class="text-sm font-medium">System Logs</span>
              </div>
            </button>
            
            <hr class="my-4">
            
            <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div class="flex items-center space-x-3">
                <Cog6ToothIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">System Settings</span>
              </div>
            </button>
            
            <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div class="flex items-center space-x-3">
                <ShieldCheckIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">Security</span>
              </div>
            </button>
            
            <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div class="flex items-center space-x-3">
                <ArrowDownTrayIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">Data Export</span>
              </div>
            </button>
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
  BookOpenIcon,
  ExclamationTriangleIcon,
  CircleStackIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  UserIcon,
  ComputerDesktopIcon,
  ExclamationCircleIcon
} from '@heroicons/vue/24/outline'

import Navigation from '../components/shared/Navigation.vue'
import StatsCard from '../components/shared/StatsCard.vue'

const activeTab = ref('users')
const userSearchQuery = ref('')
const logFilter = ref('')
const showUserForm = ref(false)

// Mock data
const totalUsers = ref(287)
const activeCourses = ref(45)
const systemAlerts = ref(2)

const mockUsers = ref([
  {
    id: '1',
    name: 'Dr. John Smith',
    email: 'john.smith@university.edu',
    role: 'lecturer',
    status: 'active',
    lastLogin: '2024-01-28 09:15',
    profilePicture: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '2',
    name: 'Alice Johnson',
    matricNumber: 'STU001',
    role: 'student',
    status: 'active',
    lastLogin: '2024-01-28 14:30',
    profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '3',
    name: 'Prof. Mary Wilson',
    email: 'mary.wilson@university.edu',
    role: 'advisor',
    status: 'active',
    lastLogin: '2024-01-27 16:45',
    profilePicture: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '4',
    name: 'Bob Davis',
    matricNumber: 'STU002',
    role: 'student',
    status: 'inactive',
    lastLogin: '2024-01-20 10:00',
    profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
])

const mockCourses = [
  {
    id: '1',
    code: 'CS101',
    name: 'Programming Fundamentals',
    lecturer: 'Dr. John Smith',
    studentCount: 85,
    status: 'active'
  },
  {
    id: '2',
    code: 'CS201',
    name: 'Data Structures and Algorithms',
    lecturer: 'Dr. Sarah Lee',
    studentCount: 65,
    status: 'active'
  },
  {
    id: '3',
    code: 'MATH101',
    name: 'Calculus I',
    lecturer: 'Prof. Michael Brown',
    studentCount: 120,
    status: 'active'
  }
]

const mockLogs = [
  {
    id: '1',
    type: 'login',
    action: 'User login successful',
    user: 'Alice Johnson (STU001)',
    timestamp: '2024-01-28 14:30:15',
    ip: '192.168.1.100'
  },
  {
    id: '2',
    type: 'grades',
    action: 'Grade updated for CS101 Quiz 1',
    user: 'Dr. John Smith',
    timestamp: '2024-01-28 13:45:22',
    ip: '192.168.1.102'
  },
  {
    id: '3',
    type: 'system',
    action: 'Database backup completed',
    user: 'System',
    timestamp: '2024-01-28 12:00:00',
    ip: 'localhost'
  },
  {
    id: '4',
    type: 'error',
    action: 'Failed login attempt',
    user: 'Unknown',
    timestamp: '2024-01-28 11:30:45',
    ip: '192.168.1.105'
  }
]

const userForm = reactive({
  name: '',
  email: '',
  role: '',
  matricNumber: ''
})

const filteredUsers = computed(() => {
  if (!userSearchQuery.value) return mockUsers.value
  return mockUsers.value.filter(user => 
    user.name.toLowerCase().includes(userSearchQuery.value.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(userSearchQuery.value.toLowerCase())) ||
    (user.matricNumber && user.matricNumber.toLowerCase().includes(userSearchQuery.value.toLowerCase()))
  )
})

const filteredLogs = computed(() => {
  if (!logFilter.value) return mockLogs
  return mockLogs.filter(log => log.type === logFilter.value)
})

const getRoleBadgeColor = (role: string) => {
  const colors = {
    admin: 'bg-purple-100 text-purple-800',
    lecturer: 'bg-blue-100 text-blue-800',
    advisor: 'bg-green-100 text-green-800',
    student: 'bg-gray-100 text-gray-800'
  }
  return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getLogTypeColor = (type: string) => {
  const colors = {
    login: 'bg-blue-100 text-blue-600',
    grades: 'bg-green-100 text-green-600',
    system: 'bg-gray-100 text-gray-600',
    error: 'bg-red-100 text-red-600'
  }
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-600'
}

const getLogIcon = (type: string) => {
  const icons = {
    login: UserIcon,
    grades: DocumentTextIcon,
    system: ComputerDesktopIcon,
    error: ExclamationCircleIcon
  }
  return icons[type as keyof typeof icons] || ComputerDes
}

const toggleUserStatus = (user: any) => {
  user.status = user.status === 'active' ? 'inactive' : 'active'
}

const addUser = () => {
  const newUser = {
    id: Date.now().toString(),
    name: userForm.name,
    email: userForm.email,
    matricNumber: userForm.matricNumber,
    role: userForm.role,
    status: 'active',
    lastLogin: 'Never',
    profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
  
  mockUsers.value.unshift(newUser)
  
  // Reset form
  Object.keys(userForm).forEach(key => {
    userForm[key as keyof typeof userForm] = ''
  })
  
  showUserForm.value = false
  alert('User added successfully!')
}
</script>