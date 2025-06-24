<template>
    <div class="min-h-screen bg-gray-50">
        <Navigation />

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="mb-8">
                <h1 class="text-2xl font-bold text-gray-900">
                    Admin Dashboard
                </h1>
                <p class="text-gray-600">System management and user administration</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard title="Total Users" :value="totalUsers" change="+12 this month" :icon="UsersIcon"
                    variant="primary" />
                <StatsCard title="Active Courses" :value="activeCourses" :icon="BookOpenIcon" variant="secondary" />
                <StatsCard title="System Alerts" :value="systemAlerts" :icon="ExclamationTriangleIcon"
                    variant="warning" />
                <StatsCard title="Database Health" value="99.9%" change="Optimal" :icon="CircleStackIcon"
                    variant="success" />
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div class="lg:col-span-3">
                    <div v-if="activeTab === 'users'" class="card">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-lg font-semibold text-gray-900">User Management</h3>
                            <div class="flex items-center space-x-3">
                                <input v-model="userSearchQuery" type="text" placeholder="Search users..."
                                    class="input-field text-sm w-64">
                                <button @click="showUserForm = true" class="btn-primary">
                                    Add User
                                </button>
                            </div>
                        </div>

                        <!-- Add User Modal -->
                        <div v-if="showUserForm"
                            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div class="bg-white rounded-lg p-6 w-full max-w-md m-4">
                                <h4 class="text-lg font-semibold text-gray-900 mb-4">Add New User</h4>
                                <form @submit.prevent="addUser" class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input v-model="userForm.name" type="text" class="input-field" required>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                        <input v-model="userForm.username" type="text" class="input-field" required>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                        <input v-model="userForm.password" type="password" class="input-field" required>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Email
                                            (Optional)</label>
                                        <input v-model="userForm.email" type="email" class="input-field">
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
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Matric Number
                                            (Optional)</label>
                                        <input v-model="userForm.matricNumber" type="text" class="input-field">
                                    </div>

                                    <div class="flex justify-end space-x-3 pt-4">
                                        <button type="button" @click="showUserForm = false"
                                            class="btn-secondary">Cancel</button>
                                        <button type="submit" class="btn-primary">Add User</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <!-- Edit User Modal -->
                        <div v-if="showEditUserForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div class="bg-white rounded-lg p-6 w-full max-w-md m-4">
                                <h4 class="text-lg font-semibold text-gray-900 mb-4">Edit User</h4>
                                <form @submit.prevent="updateUser" class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input v-model="currentUser.name" type="text" class="input-field" required>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                        <input v-model="currentUser.username" type="text" class="input-field" required>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
                                        <input v-model="currentUser.password" type="password" class="input-field">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                                        <input v-model="currentUser.email" type="email" class="input-field">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <select v-model="currentUser.role" class="input-field" required>
                                            <option value="">Select Role</option>
                                            <option value="student">Student</option>
                                            <option value="lecturer">Lecturer</option>
                                            <option value="advisor">Academic Advisor</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </div>
                                    <div v-if="currentUser.role === 'student'">
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Matric Number (Optional)</label>
                                        <input v-model="currentUser.matricNumber" type="text" class="input-field">
                                    </div>
                                    <div class="flex justify-end space-x-3 pt-4">
                                        <button type="button" @click="showEditUserForm = false" class="btn-secondary">Cancel</button>
                                        <button type="submit" class="btn-primary">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th @click="sortUsers('name')"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                                            User
                                            <span v-if="userSortColumn === 'name'">
                                                {{ userSortDirection === 'asc' ? '▲' : '▼' }}
                                            </span>
                                        </th>
                                        <th @click="sortUsers('role')"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                                            Role
                                            <span v-if="userSortColumn === 'role'">
                                                {{ userSortDirection === 'asc' ? '▲' : '▼' }}
                                            </span>
                                        </th>
                                        <th @click="sortUsers('status')"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                                            Status
                                            <span v-if="userSortColumn === 'status'">
                                                {{ userSortDirection === 'asc' ? '▲' : '▼' }}
                                            </span>
                                        </th>
                                        <!-- <th @click="sortUsers('lastLogin')"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                                            Last Login
                                            <span v-if="userSortColumn === 'lastLogin'">
                                                {{ userSortDirection === 'asc' ? '▲' : '▼' }}
                                            </span>
                                        </th> -->
                                        <th
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="user in filteredAndSortedUsers" :key="user.id" class="table-row">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center">
                                                <img :src="user.profilePicture" alt="" class="h-8 w-8 rounded-full">
                                                <div class="ml-3">
                                                    <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                                                    <div class="text-sm text-gray-500">{{ user.email ||
                                                        user.matricNumber }}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span :class="getRoleBadgeColor(user.role)"
                                                class="px-2 py-1 text-xs font-medium rounded-full capitalize">
                                                {{ user.role }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span
                                                :class="user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                                                class="px-2 py-1 text-xs font-medium rounded-full">
                                                {{ user.status }}
                                            </span>
                                        </td>
                                        <!-- <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {{ user.lastLogin }}
                                        </td> -->
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button @click="openEditUserModal(user)" class="text-primary-600 hover:text-primary-900">Edit</button>
                                            <button @click="toggleUserStatus(user)"
                                                :class="user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'">
                                                {{ user.status === 'active' ? 'Deactivate' : 'Activate' }}
                                            </button>
                                            <!-- <button class="text-gray-600 hover:text-gray-900">Reset Password</button> -->
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div v-if="activeTab === 'logs'" class="card">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-lg font-semibold text-gray-900">System Activity Logs</h3>
                            <div class="flex items-center space-x-3">
                                <select v-model="logFilter"
                                    class="text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
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
                            <div v-for="log in filteredLogs" :key="log.id"
                                class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
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

                    <div v-if="activeTab === 'courses'" class="card">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-lg font-semibold text-gray-900">Course Management</h3>
                            <button @click="showCourseForm = true" class="btn-primary">Add New Course</button>
                        </div>

                        <!-- Add New Course Modal -->
                        <div v-if="showCourseForm"
                            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div class="bg-white rounded-lg p-6 w-full max-w-md m-4">
                                <h4 class="text-lg font-semibold text-gray-900 mb-4">Add New Course</h4>
                                <form @submit.prevent="addCourse" class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                                        <input v-model="courseForm.code" type="text" class="input-field" required>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                                        <input v-model="courseForm.name" type="text" class="input-field" required>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Lecturer</label>
                                        <select v-model="courseForm.lecturerId" class="input-field" required>
                                            <option :value="null" disabled>Select a Lecturer</option>
                                            <option v-for="lecturer in availableLecturers" :key="lecturer.id" :value="lecturer.id">
                                                {{ lecturer.name }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="flex justify-end space-x-3 pt-4">
                                        <button type="button" @click="showCourseForm = false"
                                            class="btn-secondary">Cancel</button>
                                        <button type="submit" class="btn-primary">Add Course</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <!-- Edit Course Modal -->
                        <div v-if="showEditCourseForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div class="bg-white rounded-lg p-6 w-full max-w-md m-4">
                                <h4 class="text-lg font-semibold text-gray-900 mb-4">Edit Course</h4>
                                <form @submit.prevent="updateCourse" class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                                        <input v-model="currentCourse.code" type="text" class="input-field" required>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                                        <input v-model="currentCourse.name" type="text" class="input-field" required>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Lecturer</label>
                                        <select v-model="currentCourse.lecturerId" class="input-field" required>
                                            <option :value="null" disabled>Select a Lecturer</option>
                                            <option v-for="lecturer in availableLecturers" :key="lecturer.id" :value="lecturer.id">
                                                {{ lecturer.name }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="flex justify-end space-x-3 pt-4">
                                        <button type="button" @click="showEditCourseForm = false" class="btn-secondary">Cancel</button>
                                        <button type="submit" class="btn-primary">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <!-- Assign Lecturer Modal -->
                        <div v-if="showAssignLecturerForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div class="bg-white rounded-lg p-6 w-full max-w-md m-4">
                                <h4 class="text-lg font-semibold text-gray-900 mb-4">Assign Lecturer to {{ courseToAssignLecturer.name }}</h4>
                                <form @submit.prevent="assignLecturer" class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                                        <input v-model="courseToAssignLecturer.code" type="text" class="input-field" disabled>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                                        <input v-model="courseToAssignLecturer.name" type="text" class="input-field" disabled>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">New Lecturer</label>
                                        <select v-model="courseToAssignLecturer.lecturerId" class="input-field" required>
                                            <option :value="null" disabled>Select a Lecturer</option>
                                            <option v-for="lecturer in availableLecturers" :key="lecturer.id" :value="lecturer.id">
                                                {{ lecturer.name }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="flex justify-end space-x-3 pt-4">
                                        <button type="button" @click="showAssignLecturerForm = false" class="btn-secondary">Cancel</button>
                                        <button type="submit" class="btn-primary">Assign Lecturer</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th @click="sortCourses('code')"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                                            Course Code
                                            <span v-if="courseSortColumn === 'code'">
                                                {{ courseSortDirection === 'asc' ? '▲' : '▼' }}
                                            </span>
                                        </th>
                                        <th @click="sortCourses('name')"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                                            Course Name
                                            <span v-if="courseSortColumn === 'name'">
                                                {{ courseSortDirection === 'asc' ? '▲' : '▼' }}
                                            </span>
                                        </th>
                                        <th @click="sortCourses('lecturer')"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                                            Lecturer
                                            <span v-if="courseSortColumn === 'lecturer'">
                                                {{ courseSortDirection === 'asc' ? '▲' : '▼' }}
                                            </span>
                                        </th>
                                        <th @click="sortCourses('studentCount')"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                                            Students
                                            <span v-if="courseSortColumn === 'studentCount'">
                                                {{ courseSortDirection === 'asc' ? '▲' : '▼' }}
                                            </span>
                                        </th>
                                        <th @click="sortCourses('status')"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                                            Status
                                            <span v-if="courseSortColumn === 'status'">
                                                {{ courseSortDirection === 'asc' ? '▲' : '▼' }}
                                            </span>
                                        </th>
                                        <th
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="course in filteredAndSortedCourses" :key="course.id" class="table-row">
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
                                            <span
                                                :class="course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                                                class="px-2 py-1 text-xs font-medium rounded-full">
                                                {{ course.status }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button @click="openEditCourseModal(course)" class="text-primary-600 hover:text-primary-900">Edit</button>
                                            <button @click="openAssignLecturerModal(course)" class="text-secondary-600 hover:text-secondary-900">Assign
                                                Lecturer</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="card h-fit">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Admin Tools</h3>
                    <div class="space-y-3">
                        <button @click="activeTab = 'users'"
                            :class="activeTab === 'users' ? 'bg-primary-50 text-primary-700 border-primary-200' : 'hover:bg-gray-50'"
                            class="w-full text-left px-3 py-2 rounded-lg border transition-colors">
                            <div class="flex items-center space-x-3">
                                <UsersIcon class="h-5 w-5" />
                                <span class="text-sm font-medium">User Management</span>
                            </div>
                        </button>

                        <button @click="activeTab = 'courses'"
                            :class="activeTab === 'courses' ? 'bg-primary-50 text-primary-700 border-primary-200' : 'hover:bg-gray-50'"
                            class="w-full text-left px-3 py-2 rounded-lg border transition-colors">
                            <div class="flex items-center space-x-3">
                                <BookOpenIcon class="h-5 w-5" />
                                <span class="text-sm font-medium">Course Management</span>
                            </div>
                        </button>

                        <button @click="activeTab = 'logs'"
                            :class="activeTab === 'logs' ? 'bg-primary-50 text-primary-700 border-primary-200' : 'hover:bg-gray-50'"
                            class="w-full text-left px-3 py-2 rounded-lg border transition-colors">
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
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
const showCourseForm = ref(false)
const showEditUserForm = ref(false) // New: Control visibility of edit user modal
const showEditCourseForm = ref(false) // New: Control visibility of edit course modal
const showAssignLecturerForm = ref(false) // New: Control visibility of assign lecturer modal

// Sorting state for users
const userSortColumn = ref<string | null>(null);
const userSortDirection = ref<'asc' | 'desc'>('asc');

// Sorting state for courses
const courseSortColumn = ref<string | null>(null);
const courseSortDirection = ref<'asc' | 'desc'>('asc');

// Mock data (will be replaced by API calls)
const totalUsers = ref(0)
const activeCourses = ref(0)
const systemAlerts = ref(2)

const mockUsers = ref<any[]>([])
const mockCourses = ref<any[]>([])
const availableLecturers = ref<any[]>([]); // New: To store only lecturers for dropdowns

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
    username: '',
    password: '',
    email: '',
    role: '',
    matricNumber: ''
})

const currentUser = reactive<any>({ // New: For editing users
    id: null,
    name: '',
    username: '',
    password: '',
    email: '',
    role: '',
    matricNumber: ''
})

const courseForm = reactive({
    code: '',
    name: '',
    lecturerId: null as number | null
})

const currentCourse = reactive<any>({ // New: For editing courses
    id: null,
    code: '',
    name: '',
    lecturerId: null,
    lecturerName: ''
})

const courseToAssignLecturer = reactive<any>({ // New: For assigning lecturer to a specific course
    id: null,
    code: '',
    name: '',
    lecturerId: null
})


// --- API Integration Functions ---

// Placeholder for getting authentication token
const getAuthToken = () => {
    console.warn("Using placeholder for getAuthToken(). Please implement actual token retrieval.");
    return sessionStorage.getItem('token');
}

const fetchUsers = async () => {
    try {
        const token = getAuthToken()
        if (!token) {
            console.error('Authentication token not found.')
            alert('Authentication required. Please log in.')
            return
        }

        const response = await fetch('http://localhost:8219/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to fetch users')
        }

        const data = await response.json()
        mockUsers.value = data.map((user: any) => ({
            id: user.user_id.toString(),
            name: user.full_name,
            username: user.username, // Ensure username is mapped
            email: user.email || '',
            matricNumber: user.matric_number || '',
            role: user.role,
            status: 'active', // API doesn't return status directly, assumes active
            lastLogin: 'N/A', // API doesn't return last login
            profilePicture: user.profile_picture || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
        }))
        totalUsers.value = mockUsers.value.length

        // Separate lecturers into a dedicated array for dropdowns
        availableLecturers.value = data
            .filter((user: any) => user.role === 'lecturer')
            .map((lecturer: any) => ({
                id: lecturer.user_id,
                name: lecturer.full_name
            }));

    } catch (error: any) {
        console.error('Error fetching users:', error.message)
        alert(`Error fetching users: ${error.message}`)
    }
}

const addUser = async () => {
    try {
        const token = getAuthToken()
        if (!token) {
            console.error('Authentication token not found.')
            alert('Authentication required. Please log in.')
            return
        }

        const response = await fetch('http://localhost:8219/users', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: userForm.username,
                password: userForm.password,
                role: userForm.role,
                full_name: userForm.name,
                email: userForm.email || null, // Use null for optional empty fields
                matric_number: userForm.role === 'student' ? (userForm.matricNumber || null) : null,
                pin: null, // Assuming pin is not part of add user form
                profile_picture: null // Assuming profile picture is not part of add user form
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to add user')
        }

        alert('User added successfully!')
        showUserForm.value = false
        fetchUsers() // Refresh the user list and available lecturers

        // Reset form
        Object.assign(userForm, { name: '', username: '', password: '', email: '', role: '', matricNumber: '' });

    } catch (error: any) {
        console.error('Error adding user:', error.message)
        alert(`Error adding user: ${error.message}`)
    }
}

const openEditUserModal = (user: any) => {
    // Copy user data to currentUser reactive object, clearing password for security
    Object.assign(currentUser, {
        id: user.id,
        name: user.name,
        username: user.username,
        password: '', // Never pre-fill password for security
        email: user.email,
        role: user.role,
        matricNumber: user.matricNumber
    })
    showEditUserForm.value = true
}

const updateUser = async () => {
    try {
        const token = getAuthToken()
        if (!token) {
            console.error('Authentication token not found.')
            alert('Authentication required. Please log in.')
            return
        }

        const payload: any = {
            full_name: currentUser.name,
            email: currentUser.email || null,
            role: currentUser.role,
            matric_number: currentUser.role === 'student' ? (currentUser.matricNumber || null) : null
        }
        if (currentUser.username) {
            payload.username = currentUser.username
        }
        if (currentUser.password) { // Only send password if it's changed/entered
            payload.password = currentUser.password
        }

        const response = await fetch(`http://localhost:8219/users/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to update user')
        }

        alert('User updated successfully!')
        showEditUserForm.value = false
        fetchUsers() // Refresh the user list and available lecturers
        // Reset form (optional, as it's closed)
        Object.assign(currentUser, { id: null, name: '', username: '', password: '', email: '', role: '', matricNumber: '' });

    } catch (error: any) {
        console.error('Error updating user:', error.message)
        alert(`Error updating user: ${error.message}`)
    }
}

const toggleUserStatus = async (user: any) => {
    // API does not directly support 'status' field for users.
    // This function would require a backend API endpoint to update user status/activity.
    // For now, it updates local state only.
    user.status = user.status === 'active' ? 'inactive' : 'active'
    alert(`User ${user.name} status toggled locally to ${user.status}. Note: This is not persisted via API. Backend doesnt support this`)

}

const fetchCourses = async () => {
    try {
        const token = getAuthToken()
        if (!token) {
            console.error('Authentication token not found.')
            alert('Authentication required. Please log in.')
            return
        }

        const response = await fetch('http://localhost:8219/courses', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to fetch courses')
        }

        const data = await response.json()
        mockCourses.value = data.map((course: any) => ({
            id: course.course_id.toString(),
            code: course.course_code,
            name: course.course_name,
            lecturer: course.lecturer_name, // API returns lecturer_name
            lecturerId: course.lecturer_id, // Store lecturer_id for editing
            studentCount: 0, // API does not return student count directly
            status: 'active' // API does not return course status directly, assumes active
        }))
        activeCourses.value = mockCourses.value.length
    } catch (error: any) {
        console.error('Error fetching courses:', error.message)
        alert(`Error fetching courses: ${error.message}`)
    }
}

const addCourse = async () => {
    try {
        const token = getAuthToken()
        if (!token) {
            console.error('Authentication token not found.')
            alert('Authentication required. Please log in.')
            return
        }

        if (courseForm.lecturerId === null) {
            alert('Lecturer is required.');
            return;
        }

        const response = await fetch('http://localhost:8219/courses', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                course_code: courseForm.code,
                course_name: courseForm.name,
                lecturer_id: courseForm.lecturerId
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to add course')
        }

        alert('Course added successfully!')
        showCourseForm.value = false
        fetchCourses() // Refresh the course list

        // Reset form
        Object.assign(courseForm, { code: '', name: '', lecturerId: null });
    } catch (error: any) {
        console.error('Error adding course:', error.message)
        alert(`Error adding course: ${error.message}`)
    }
}

const openEditCourseModal = (course: any) => {
    Object.assign(currentCourse, {
        id: course.id,
        code: course.code,
        name: course.name,
        lecturerId: course.lecturerId, // Use the stored lecturerId
        lecturerName: course.lecturer // Display name if needed in future
    });
    showEditCourseForm.value = true;
};

const updateCourse = async () => {
    try {
        const token = getAuthToken()
        if (!token) {
            console.error('Authentication token not found.')
            alert('Authentication required. Please log in.')
            return
        }

        if (currentCourse.lecturerId === null) {
            alert('Lecturer is required for the course.');
            return;
        }

        const response = await fetch(`http://localhost:8219/courses/${currentCourse.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                course_code: currentCourse.code,
                course_name: currentCourse.name,
                lecturer_id: currentCourse.lecturerId
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to update course')
        }

        alert('Course updated successfully!')
        showEditCourseForm.value = false
        fetchCourses() // Refresh the course list
        // Reset form
        Object.assign(currentCourse, { id: null, code: '', name: '', lecturerId: null, lecturerName: '' });

    } catch (error: any) {
        console.error('Error updating course:', error.message)
        alert(`Error updating course: ${error.message}`)
    }
}

const openAssignLecturerModal = (course: any) => {
    Object.assign(courseToAssignLecturer, {
        id: course.id,
        code: course.code,
        name: course.name,
        lecturerId: course.lecturerId // Pre-fill with current lecturer ID
    });
    showAssignLecturerForm.value = true;
};

const assignLecturer = async () => {
    try {
        const token = getAuthToken()
        if (!token) {
            console.error('Authentication token not found.')
            alert('Authentication required. Please log in.')
            return
        }

        if (courseToAssignLecturer.lecturerId === null) {
            alert('New Lecturer is required for assignment.');
            return;
        }

        const response = await fetch(`http://localhost:8219/courses/${courseToAssignLecturer.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Only send lecturer_id if that's the only field to update via this specific API call
                // If the API requires all fields, include course_code and course_name from courseToAssignLecturer
                course_code: courseToAssignLecturer.code,
                course_name: courseToAssignLecturer.name,
                lecturer_id: courseToAssignLecturer.lecturerId
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to assign lecturer')
        }

        alert('Lecturer assigned successfully!')
        showAssignLecturerForm.value = false
        fetchCourses() // Refresh the course list
        // Reset form
        Object.assign(courseToAssignLecturer, { id: null, code: '', name: '', lecturerId: null });

    } catch (error: any) {
        console.error('Error assigning lecturer:', error.message)
        alert(`Error assigning lecturer: ${error.message}`)
    }
}

// --- Sorting Functions ---
const sortUsers = (column: string) => {
    if (userSortColumn.value === column) {
        userSortDirection.value = userSortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        userSortColumn.value = column;
        userSortDirection.value = 'asc';
    }
};

const sortCourses = (column: string) => {
    if (courseSortColumn.value === column) {
        courseSortDirection.value = courseSortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        courseSortColumn.value = column;
        courseSortDirection.value = 'asc';
    }
};

// --- Computed Properties for Filtering and Sorting ---
const filteredAndSortedUsers = computed(() => {
    let users = filteredUsers.value; // Start with already filtered users

    if (userSortColumn.value) {
        users = [...users].sort((a, b) => {
            const aValue = a[userSortColumn.value as keyof typeof a];
            const bValue = b[userSortColumn.value as keyof typeof b];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return userSortDirection.value === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            // Handle numbers or other types
            if (aValue < bValue) return userSortDirection.value === 'asc' ? -1 : 1;
            if (aValue > bValue) return userSortDirection.value === 'asc' ? 1 : -1;
            return 0;
        });
    }
    return users;
});

const filteredAndSortedCourses = computed(() => {
    let courses = mockCourses.value; // Assuming no separate search filter for courses yet

    if (courseSortColumn.value) {
        courses = [...courses].sort((a, b) => {
            const aValue = a[courseSortColumn.value as keyof typeof a];
            const bValue = b[courseSortColumn.value as keyof typeof b];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return courseSortDirection.value === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            // Handle numbers or other types
            if (aValue < bValue) return courseSortDirection.value === 'asc' ? -1 : 1;
            if (aValue > bValue) return courseSortDirection.value === 'asc' ? 1 : -1;
            return 0;
        });
    }
    return courses;
});


const filteredUsers = computed(() => {
    if (!userSearchQuery.value) return mockUsers.value
    const query = userSearchQuery.value.toLowerCase()
    return mockUsers.value.filter(user =>
        user.name.toLowerCase().includes(query) ||
        (user.username && user.username.toLowerCase().includes(query)) || // Include username in search
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.matricNumber && user.matricNumber.toLowerCase().includes(query))
    )
})

const filteredLogs = computed(() => {
    if (!logFilter.value) return mockLogs
    return mockLogs.filter(log => log.type === logFilter.value)
})

// --- Helper Functions for UI ---
const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
        admin: 'bg-purple-100 text-purple-800',
        lecturer: 'bg-blue-100 text-blue-800',
        advisor: 'bg-green-100 text-green-800',
        student: 'bg-gray-100 text-gray-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
}

const getLogTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
        login: 'bg-blue-100 text-blue-600',
        grades: 'bg-green-100 text-green-600',
        system: 'bg-gray-100 text-gray-600',
        error: 'bg-red-100 text-red-600'
    }
    return colors[type] || 'bg-gray-100 text-gray-600'
}

const getLogIcon = (type: string) => {
    const icons: { [key: string]: any } = { // Use 'any' for component types
        login: UserIcon,
        grades: DocumentTextIcon,
        system: ComputerDesktopIcon,
        error: ExclamationCircleIcon
    }
    return icons[type] || ComputerDesktopIcon // Default to ComputerDesktopIcon if not found
}

// --- Lifecycle Hooks and Watchers ---
onMounted(() => {
    // Fetch users first to populate lecturers, then courses
    fetchUsers();
    fetchCourses(); // Fetch courses now too to ensure initial data
});

// Watch for changes in activeTab to fetch data for the new tab
watch(activeTab, (newTab) => {
    if (newTab === 'users') {
        fetchUsers();
    } else if (newTab === 'courses') {
        fetchCourses();
    }
});
</script>

<style>
/* Basic styles for the card, input, and button to match the existing component */
.card {
    @apply bg-white p-6 rounded-lg shadow-sm;
}

.input-field {
    @apply mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm;
}

.btn-primary {
    @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}

.btn-secondary {
    @apply inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}
/* Define primary colors for consistency (adjust as needed) */
.text-primary-600 { color: #4F46E5; } /* Indigo 600 */
.hover\:text-primary-900:hover { color: #3730A3; } /* Indigo 900 */
.bg-primary-50 { background-color: #EEF2FF; } /* Indigo 50 */
.text-primary-700 { color: #4338CA; } /* Indigo 700 */
.border-primary-200 { border-color: #C7D2FE; } /* Indigo 200 */
.bg-primary-600 { background-color: #4F46E5; } /* Indigo 600 */
.hover\:bg-primary-700:hover { background-color: #4338CA; } /* Indigo 700 */
.focus\:ring-primary-500:focus { --tw-ring-color: #6366F1; } /* Indigo 500 */

/* Define secondary colors (adjust as needed) */
.text-secondary-600 { color: #059669; } /* Emerald 600 */
.hover\:text-secondary-900:hover { color: #064E3B; } /* Emerald 900 */
</style>
