<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation /> 
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
        <p class="text-gray-600">Manage system users, roles, and permissions</p>
      </div>

      <div v-if="message" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
        {{ message }}
      </div>
      <div v-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
        {{ errorMessage }}
      </div>

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
            
            <!-- Removed Status Filter Dropdown -->
          </div>
          
          <div class="flex items-center space-x-3">
            <!-- Removed Export Button -->
            <button @click="openAddUserModal" class="btn-primary">
              <PlusIcon class="h-4 w-4 mr-2" />
              Add User
            </button>
          </div>
        </div>
      </div>

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
                <!-- Removed Status Column Header -->
                <!-- Removed Last Login Column Header -->
                <!-- Removed Created Column Header -->
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
               <tr v-if="filteredUsers.length === 0">
                 <!-- Colspan adjusted from 7 to 4 -->
                <td colspan="4" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  No users found.
                </td>
              </tr>
              <tr v-else v-for="user in filteredUsers" :key="user.user_id" class="table-row">
                <td class="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    :value="user.user_id"
                    v-model="selectedUsers"
                    class="rounded border-gray-300"
                  >
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img :src="user.profile_picture || 'https://placehold.co/40x40/cccccc/000000?text=👤'" alt="Profile Picture" class="h-10 w-10 rounded-full">
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                      <div class="text-sm text-gray-500">{{ user.email || user.matric_number }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getRoleBadgeColor(user.role)" class="px-2 py-1 text-xs font-medium rounded-full capitalize">
                    {{ user.role }}
                  </span>
                </td>
                <!-- Removed Status Column Data -->
                <!-- Removed Last Login Column Data -->
                <!-- Removed Created Column Data -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <button 
                      @click="openEditUserModal(user)"
                      class="text-primary-600 hover:text-primary-900"
                    >
                      Edit
                    </button>
                    <!-- Removed Deactivate/Activate Button -->
                    <!-- Removed Reset Password Button -->
                    <button 
                      @click="confirmDeleteUser(user.user_id)"
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

        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button class="btn-secondary">Previous</button>
            <button class="btn-secondary">Next</button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">1</span> to <span class="font-medium">{{ filteredUsers.length }}</span> of
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

      <!-- Removed Bulk Action Bar -->
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
                <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input v-model="userForm.username" type="text" class="input-field" required>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input v-model="userForm.full_name" type="text" class="input-field" required>
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

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Password <span v-if="userForm.user_id" class="text-gray-500 text-xs">(Leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  v-model="userForm.password"
                  class="input-field"
                  :required="!userForm.user_id"
                />
              </div>
              
              <div v-if="userForm.role === 'student'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Matric Number</label>
                <input v-model="userForm.matric_number" type="text" class="input-field">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">PIN</label>
                <input v-model="userForm.pin" type="text" class="input-field">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
                <input v-model="userForm.profile_picture" type="text" class="input-field">
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

      <div v-if="showDeleteConfirmModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-sm mx-auto p-6 transform transition-all scale-100 opacity-100">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
          <p class="text-gray-600 mb-6">Are you sure you want to delete this user?</p>
          <div class="flex justify-end space-x-3">
            <button @click="cancelDelete" class="btn-secondary">
              Cancel
            </button>
            <button @click="deleteUserConfirm(userToDeleteId)" class="btn-danger">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  UsersIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ClockIcon,
  // Removed ArrowDownTrayIcon as Export button is removed
  PlusIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

import Navigation from '../components/shared/Navigation.vue'
import StatsCard from '../components/shared/StatsCard.vue'

// Reactive state variables
const searchQuery = ref('')
const roleFilter = ref('')
// Removed statusFilter as the dropdown is removed
// const statusFilter = ref('') 
const selectedUsers = ref<string[]>([])
const showAddUserModal = ref(false)
const showEditUserModal = ref(false)
const showDeleteConfirmModal = ref(false) // For delete confirmation
const userToDeleteId = ref<string | null>(null) // Stores ID of user to delete

// Stats - These are now static or require new API calls if they need to be dynamic
const totalUsers = ref(0)
const activeStudents = ref(0)
const facultyMembers = ref(0)
const pendingApprovals = ref(0)

// Users data from API
const users = ref<any[]>([]) // Will be populated by fetchUsers

// Message handling
const message = ref('')
const errorMessage = ref('')

const setMessage = (msg: string) => {
  message.value = msg;
  errorMessage.value = '';
  if (msg) setTimeout(() => message.value = '', 5000);
};

const setErrorMessage = (msg: string) => {
  errorMessage.value = msg;
  message.value = '';
  if (msg) setTimeout(() => errorMessage.value = '', 7000);
};


// User form for add/edit operations - Mapped to backend fields
const userForm = reactive({
  user_id: null as number | null, // Used for edit, maps to backend user_id
  username: '',
  password: '', // Only sent on add or when explicitly changed
  full_name: '', // Maps to backend 'full_name'
  email: '',
  role: '', // Maps to backend 'role'
  matric_number: '', // Maps to backend 'matric_number'
  pin: '', // Maps to backend 'pin'
  profile_picture: '', // Maps to backend 'profile_picture'

  // Original UI fields from your template that are NOT directly in our backend schema:
  // employeeId: '',
  // phone: '',
  // program: '',
  // department: ''
  // These will not be sent to the backend unless you modify the backend to accept them.
  // For the UI to show them, they'd need to be part of the fetched user object too.
});

// API Base URL
const API_BASE_URL = 'http://localhost:8219';

// --- Authentication Helper ---
const getAuthHeaders = () => {
  const jwtToken = sessionStorage.getItem('token'); // Correctly using 'token' as per your screenshot

  if (!jwtToken) {
    console.error('JWT Token not found in sessionStorage. Redirecting to login.');
    setErrorMessage('You are not logged in or your session has expired. Please log in.');
    setTimeout(() => {
      window.location.href = '/login'; // Adjust to your actual login route
    }, 2000);
    throw new Error('Authentication required.');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  };
};

// --- API Interactions ---

/**
 * Fetches all users from the backend.
 */
const fetchUsers = async () => {
  setMessage('')
  setErrorMessage('')
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users`, { headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch users');
    }
    users.value = data; // Assign fetched data to the reactive 'users' ref

    // Update stats based on fetched data if needed (example, adjust as per your backend's actual data)
    totalUsers.value = users.value.length;
    // Removed logic related to 'status' as column is removed, assuming users are active for stats
    activeStudents.value = users.value.filter(u => u.role === 'student').length;
    facultyMembers.value = users.value.filter(u => u.role === 'lecturer' || u.role === 'advisor').length;
    // pendingApprovals - Requires a backend field for 'pending' status users or specific logic
    pendingApprovals.value = 0; // Default to 0 or implement specific API for this stat

  } catch (error: any) {
    console.error('Error fetching users:', error);
    if (error.message !== 'Authentication required.') {
      setErrorMessage(error.message || 'Could not fetch users.');
    }
    users.value = []; // Clear users on error
  }
};

/**
 * Saves a user (add new or update existing).
 */
const saveUser = async () => {
  setMessage('')
  setErrorMessage('')
  try {
    const headers = getAuthHeaders();
    const method = userForm.user_id ? 'PUT' : 'POST';
    const url = userForm.user_id ? `${API_BASE_URL}/users/${userForm.user_id}` : `${API_BASE_URL}/users`;

    const payload: { [key: string]: any } = {
      username: userForm.username,
      full_name: userForm.full_name,
      email: userForm.email,
      role: userForm.role,
      matric_number: userForm.matric_number || null, // Ensure null for non-students
      pin: userForm.pin || null,
      profile_picture: userForm.profile_picture || null,
    };

    // Only include password if adding or if it's explicitly set for update
    if (!userForm.user_id || userForm.password) {
      payload.password = userForm.password;
    }

    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Failed to ${method === 'POST' ? 'add' : 'update'} user`);
    }

    setMessage(data.message || `User ${method === 'POST' ? 'added' : 'updated'} successfully!`);
    closeUserModal();
    fetchUsers(); // Re-fetch users to update the table
  } catch (error: any) {
    console.error(`Error ${userForm.user_id ? 'updating' : 'adding'} user:`, error);
    if (error.message !== 'Authentication required.') {
      setErrorMessage(error.message || `Could not ${userForm.user_id ? 'update' : 'add'} user.`);
    }
  }
};

/**
 * Handles single user deletion via API.
 */
const deleteUserConfirm = async (id: string | null) => {
  if (!id) return;
  setMessage('');
  setErrorMessage('');
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: headers
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete user');
    }
    setMessage(data.message || 'User deleted successfully!');
    showDeleteConfirmModal.value = false;
    userToDeleteId.value = null;
    fetchUsers(); // Re-fetch users to update the table
  } catch (error: any) {
    console.error(`Error deleting user ${id}:`, error);
    if (error.message !== 'Authentication required.') {
      setErrorMessage(error.message || 'Could not delete user.');
    }
  }
};


// --- Modal and Form Management ---

/**
 * Resets the userForm to its initial state.
 */
const resetUserForm = () => {
  Object.assign(userForm, {
    user_id: null,
    username: '',
    password: '',
    full_name: '',
    email: '',
    role: '',
    matric_number: '',
    pin: '',
    profile_picture: ''
  });
};

const openAddUserModal = () => {
  resetUserForm();
  showAddUserModal.value = true;
  showEditUserModal.value = false;
};

const openEditUserModal = (user: any) => {
  resetUserForm(); // Start clean
  // Map backend fields to userForm fields for editing
  Object.assign(userForm, {
    user_id: user.user_id,
    username: user.username || '',
    password: '', // Keep password blank for security, user must type new one to change
    full_name: user.full_name || '',
    email: user.email || '',
    role: user.role || '',
    matric_number: user.matric_number || '',
    pin: user.pin || '',
    profile_picture: user.profile_picture || ''
  });
  showEditUserModal.value = true;
  showAddUserModal.value = false;
};

const closeUserModal = () => {
  showAddUserModal.value = false;
  showEditUserModal.value = false;
  resetUserForm(); 
};

const confirmDeleteUser = (id: string) => {
  userToDeleteId.value = id;
  showDeleteConfirmModal.value = true;
};

const cancelDelete = () => {
  showDeleteConfirmModal.value = false;
  userToDeleteId.value = null;
};




const filteredUsers = computed(() => {
  let filtered = users.value;
  
  if (searchQuery.value) {
    filtered = filtered.filter(user => 
      user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (user.matric_number && user.matric_number.toLowerCase().includes(searchQuery.value.toLowerCase()))
    );
  }
  
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value);
  }
  

  return filtered;
});

const getRoleBadgeColor = (role: string) => {
  const colors: { [key: string]: string } = {
    admin: 'bg-purple-100 text-purple-800',
    lecturer: 'bg-blue-100 text-blue-800',
    advisor: 'bg-green-100 text-green-800',
    student: 'bg-gray-100 text-gray-800'
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};



const formatDate = (dateString: string) => {

  if (!dateString || dateString === 'Never') return 'N/A'; 
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    console.error("Invalid date string:", dateString);
    return 'Invalid Date';
  }
};

const toggleSelectAll = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.checked) {
    selectedUsers.value = filteredUsers.value.map(user => user.user_id.toString()); // Ensure user_id is string
  } else {
    selectedUsers.value = [];
  }
};


onMounted(() => {
  fetchUsers();
});
</script>

