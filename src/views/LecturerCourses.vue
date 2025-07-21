<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Manage Your Courses</h1>
          <p class="text-gray-600">View, create, and manage your assigned courses.</p>
        </div>
        <button @click="openCreateModal" class="btn-primary">
          <PlusIcon class="h-5 w-5 mr-2" />
          Create New Course
        </button>
      </div>
      
      <div v-if="message" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md" role="alert">
        <p>{{ message }}</p>
      </div>
      <div v-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
        <p>{{ errorMessage }}</p>
      </div>


      <div v-if="isLoading" class="text-center py-10">
        <p class="text-gray-500">Loading courses...</p>
      </div>
      <div v-else-if="courses.length === 0" class="text-center py-10 card">
        <h3 class="text-lg font-medium text-gray-900">No courses found</h3>
        <p class="text-sm text-gray-500 mt-1">Get started by creating a new course.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="course in courses" :key="course.course_id" class="card flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-start">
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {{ course.course_code }}
              </span>
              <span class="text-sm text-gray-500">{{ course.credit_hours }} Credit Hours</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mt-3">{{ course.course_name }}</h3>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-100 flex items-center space-x-3">
            <button @click="openEditModal(course)" class="w-full btn-secondary text-sm">Edit</button>
            <button @click="confirmDelete(course)" class="w-full btn-danger text-sm">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <CreateCourseModal 
      :show="showCreateModal" 
      @close="closeCreateModal" 
      @course-created="handleCourseCreated" 
    />
    <EditCourseModal 
      :show="showEditModal" 
      :course="selectedCourse" 
      @close="closeEditModal" 
      @course-updated="handleCourseUpdated"
    />
    
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
        <p class="mt-2 text-sm text-gray-600">Are you sure you want to delete the course "{{ courseToDelete?.course_code }}"? This action cannot be undone.</p>
        <div class="mt-6 flex justify-end space-x-3">
          <button @click="showDeleteConfirm = false" class="btn-secondary">Cancel</button>
          <button @click="deleteCourse" class="btn-danger">Delete</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { PlusIcon } from '@heroicons/vue/24/outline';
import Navigation from '../components/shared/Navigation.vue';
import CreateCourseModal from '../components/modals/CreateCourseModal.vue';
import EditCourseModal from '../components/modals/EditCourseModal.vue';

interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  lecturer_id: number;
  credit_hours: number;
}

const router = useRouter();
const courses = ref<Course[]>([]);
const isLoading = ref(false);
const message = ref('');
const errorMessage = ref('');

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteConfirm = ref(false);
const selectedCourse = ref<Course | null>(null);
const courseToDelete = ref<Course | null>(null);

// --- API Configuration ---
const API_BASE_URL = 'http://localhost:8219';

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    errorMessage.value = 'Authentication error. Please log in again.';
    router.push('/login');
    return null;
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const clearMessages = () => {
    message.value = '';
    errorMessage.value = '';
}

// --- API Calls ---

const fetchLecturerCourses = async () => {
  isLoading.value = true;
  clearMessages();
  
  const userStr = sessionStorage.getItem('user');
  if (!userStr) {
    errorMessage.value = 'Could not find user data. Please log in again.';
    isLoading.value = false;
    router.push('/login');
    return;
  }

  try {
    const user = JSON.parse(userStr);
    const headers = getAuthHeaders();
    if (!headers) return;

    const response = await fetch(`${API_BASE_URL}/courses/lecturer/${user.username}`, { headers });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch courses');
    }
    
    const data = await response.json();
    courses.value = data.courses || [];
  } catch (error: any) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchLecturerCourses();
});

const handleCourseCreated = async (newCourseData: Omit<Course, 'course_id' | 'lecturer_id'>) => {
    clearMessages();
    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
        errorMessage.value = 'User session not found.';
        return;
    }
    
    try {
        const user = JSON.parse(userStr);
        const headers = getAuthHeaders();
        if (!headers) return;

        const payload = {
            ...newCourseData,
            lecturer_id: user.user_id // A lecturer can only assign themselves
        };

        const response = await fetch(`${API_BASE_URL}/courses`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to create course');
        }

        message.value = result.message || 'Course created successfully!';
        fetchLecturerCourses(); // Refresh the list from the server
    } catch (error: any) {
        errorMessage.value = error.message;
    }
};

const handleCourseUpdated = async (updatedCourseData: Course) => {
    clearMessages();
    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        const response = await fetch(`${API_BASE_URL}/courses/${updatedCourseData.course_id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(updatedCourseData),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to update course');
        }
        
        message.value = result.message || 'Course updated successfully!';
        fetchLecturerCourses();
    } catch (error: any) {
        errorMessage.value = error.message;
    }
};

const deleteCourse = async () => {
  if (!courseToDelete.value) return;
  clearMessages();
  
  try {
    const headers = getAuthHeaders();
    if (!headers) return;

    const response = await fetch(`${API_BASE_URL}/courses/${courseToDelete.value.course_id}`, {
      method: 'DELETE',
      headers,
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || 'Failed to delete course');
    }
    
    message.value = result.message || 'Course deleted successfully!';
    fetchLecturerCourses();
  } catch (error: any) {
    errorMessage.value = error.message;
  } finally {
    showDeleteConfirm.value = false;
    courseToDelete.value = null;
  }
};


// --- Modal Controls ---
const openCreateModal = () => showCreateModal.value = true;
const closeCreateModal = () => showCreateModal.value = false;
const openEditModal = (course: Course) => {
  selectedCourse.value = { ...course };
  showEditModal.value = true;
};
const closeEditModal = () => {
  showEditModal.value = false;
  selectedCourse.value = null;
};
const confirmDelete = (course: Course) => {
  courseToDelete.value = course;
  showDeleteConfirm.value = true;
};
</script>

<style scoped>
.btn-danger {
  @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500;
}
</style>