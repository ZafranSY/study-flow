<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
        <p class="text-gray-600">Manage system users, roles, and permissions</p>
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
          title="Active Students"
          :value="activeStudents"
          :icon="AcademicCapIcon"
          variant="success"
        />
        <StatsCard
          title="Faculty Members"
          :value="facultyMembers"
          :icon="UserGroupIcon"
          variant="secondary"
        />
        <StatsCard
          title="Pending Approvals"
          :value="pendingApprovals"
          :icon="ClockIcon"
          variant="warning"
        />
      </div>

      <!-- Controls -->
      <div class="card mb-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center space-x-4">
            <div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search users..."
                class="input-field w-64"
              >
            </div>
            
            <div>
              <select v-model="roleFilter" class="input-field">
                <option value="">All Roles</option>
                <option value="student">Students</option>
                <option value="lecturer">Lecturers</option>
                <option value="advisor">Advisors</option>
                <option value="admin">Administrators</option>
              </select>
            </div>
            
            <div>
              <select v-model="statusFilter" class="input-field">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <button @click="exportUsers" class="btn-secondary">
              <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
              Export
            </button>
            <button @click="showAddUserModal = true" class="btn-primary">
              <PlusIcon class="h-4 w-4 mr-2" />
              Add User
            </button>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" @change="toggleSelectAll" class="rounded border-gray-300">
                </th>
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
                  Created
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in filteredUsers" :key="user.id" class="table-row">
                <td class="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    :value="user.id"
                    v-model="selectedUsers"
                    class="rounded border-gray-300"
                  >
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img :src="user.profilePicture" alt="" class="h-10 w-10 rounded-full">
                    <div class="ml-4">
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
                  <span :class="getStatusColor(user.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ user.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ user.lastLogin }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(user.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <button 
                      @click="editUser(user)"
                      class="text-primary-600 hover:text-primary-900"
                    >
                      Edit
                    </button>
                    <button 
                      @click="toggleUserStatus(user)"
                      :class="user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                    >
                      {{ user.status === 'active' ? 'Deactivate' : 'Activate' }}
                    </button>
                    <button 
                      @click="resetPassword(user)"
                      class="text-yellow-600 hover:text-yellow-900"
                    >
                      Reset Password
                    </button>
                    <button 
                      @click="deleteUser(user)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button class="btn-secondary">Previous</button>
            <button class="btn-secondary">Next</button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of{' '}
                <span class="font-medium">{{ filteredUsers.length }}</span> results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Previous
                </button>
                <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  2
                </button>
                <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedUsers.length > 0" class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600">{{ selectedUsers.length }} users selected</span>
          <button @click="bulkActivate" class="btn-secondary text-sm">Activate</button>
          <button @click="bulkDeactivate" class="btn-secondary text-sm">Deactivate</button>
          <button @click="bulkDelete" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">Delete</button>
          <button @click="selectedUsers = []" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Add/Edit User Modal -->
      <div v-if="showAddUserModal || showEditUserModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-2xl m-4 max-h-screen overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h4 class="text-lg font-semibold text-gray-900">
              {{ showAddUserModal ? 'Add New User' : 'Edit User' }}
            </h4>
            <button @click="closeUserModal" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
          
          <form @submit.prevent="saveUser" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
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
              
              <div v-if="userForm.role !== 'student'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                <input v-model="userForm.employeeId" type="text" class="input-field">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input v-model="userForm.phone" type="tel" class="input-field">
              </div>
              
              <div v-if="userForm.role === 'student'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Program</label>
                <select v-model="userForm.program" class="input-field">
                  <option value="">Select Program</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Software Engineering">Software Engineering</option>
                </select>
              </div>
              
              <div v-if="userForm.role === 'lecturer'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input v-model="userForm.department" type="text" class="input-field">
              </div>
            </div>
            
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeUserModal" class="btn-secondary">Cancel</button>
              <button type="submit" class="btn-primary">
                {{ showAddUserModal ? 'Add User' : 'Update User' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  UsersIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

import Navigation from '../components/shared/Navigation.vue'
import StatsCard from '../components/shared/StatsCard.vue'

const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const selectedUsers = ref<string[]>([])
const showAddUserModal = ref(false)
const showEditUserModal = ref(false)

// Stats
const totalUsers = ref(287)
const activeStudents = ref(245)
const facultyMembers = ref(32)
const pendingApprovals = ref(5)

// Mock users data
const users = ref([
  {
    id: '1',
    name: 'Dr. John Smith',
    email: 'john.smith@university.edu',
    role: 'lecturer',
    status: 'active',
    lastLogin: '2024-01-28 09:15',
    createdAt: '2023-08-15',
    profilePicture: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '2',
    name: 'Alice Johnson',
    matricNumber: 'STU001',
    role: 'student',
    status: 'active',
    lastLogin: '2024-01-28 14:30',
    createdAt: '2023-09-01',
    profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '3',
    name: 'Prof. Mary Wilson',
    email: 'mary.wilson@university.edu',
    role: 'advisor',
    status: 'active',
    lastLogin: '2024-01-27 16:45',
    createdAt: '2023-07-20',
    profilePicture: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '4',
    name: 'Bob Davis',
    matricNumber: 'STU002',
    role: 'student',
    status: 'inactive',
    lastLogin: '2024-01-20 10:00',
    createdAt: '2023-09-01',
    profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '5',
    name: 'System Admin',
    email: 'admin@university.edu',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-01-28 08:00',
    createdAt: '2023-06-01',
    profilePicture: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
])

const userForm = reactive({
  name: '',
  email: '',
  role: '',
  matricNumber: '',
  employeeId: '',
  phone: '',
  program: '',
  department: ''
})

const filteredUsers = computed(() => {
  let filtered = users.value
  
  if (searchQuery.value) {
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (user.matricNumber && user.matricNumber.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  }
  
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }
  
  if (statusFilter.value) {
    filtered = filtered.filter(user => user.status === statusFilter.value)
  }
  
  return filtered
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

const getStatusColor = (status: string) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const toggleSelectAll = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.checked) {
    selectedUsers.value = filteredUsers.value.map(user => user.id)
  } else {
    selectedUsers.value = []
  }
}

const editUser = (user: any) => {
  Object.assign(userForm, user)
  showEditUserModal.value = true
}

const toggleUserStatus = (user: any) => {
  user.status = user.status === 'active' ? 'inactive' : 'active'
  alert(`User ${user.status === 'active' ? 'activated' : 'deactivated'} successfully!`)
}

const resetPassword = (user: any) => {
  alert(`Password reset email sent to ${user.name}`)
}

const deleteUser = (user: any) => {
  if (confirm(`Are you sure you want to delete ${user.name}?`)) {
    const index = users.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users.value.splice(index, 1)
      alert('User deleted successfully!')
    }
  }
}

const closeUserModal = () => {
  showAddUserModal.value = false
  showEditUserModal.value = false
  Object.keys(userForm).forEach(key => {
    userForm[key as keyof typeof userForm] = ''
  })
}

const saveUser = () => {
  if (showAddUserModal.value) {
    const newUser = {
      id: Date.now().toString(),
      ...userForm,
      status: 'active',
      lastLogin: 'Never',
      createdAt: new Date().toISOString(),
      profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
    users.value.unshift(newUser)
    alert('User added successfully!')
  } else {
    // Update existing user logic
    alert('User updated successfully!')
  }
  
  closeUserModal()
}

const bulkActivate = () => {
  selectedUsers.value.forEach(userId => {
    const user = users.value.find(u => u.id === userId)
    if (user) user.status = 'active'
  })
  selectedUsers.value = []
  alert('Selected users activated!')
}

const bulkDeactivate = () => {
  selectedUsers.value.forEach(userId => {
    const user = users.value.find(u => u.id === userId)
    if (user) user.status = 'inactive'
  })
  selectedUsers.value = []
  alert('Selected users deactivated!')
}

const bulkDelete = () => {
  if (confirm(`Are you sure you want to delete ${selectedUsers.value.length} users?`)) {
    users.value = users.value.filter(user => !selectedUsers.value.includes(user.id))
    selectedUsers.value = []
    alert('Selected users deleted!')
  }
}

const exportUsers = () => {
  alert('Users exported successfully!')
}
</script>