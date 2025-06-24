<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Manage Student Marks</h1>
        <p class="text-gray-600">Record, update, and delete student assessment marks for your courses.</p>
      </div>

      <!-- Messages & Errors -->
      <div v-if="message" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
        <span class="block sm:inline">{{ message }}</span>
        <span @click="message = ''" class="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer">
          <XMarkIcon class="h-5 w-5 text-green-700" />
        </span>
      </div>
      <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <span class="block sm:inline">{{ errorMessage }}</span>
        <span @click="errorMessage = ''" class="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer">
          <XMarkIcon class="h-5 w-5 text-red-700" />
        </span>
      </div>

      <!-- Filter Controls and Add Mark Button -->
      <div class="card mb-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center space-x-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select v-model="selectedCourseFilter" class="input-field">
                <option value="">All Courses</option>
                <option v-for="course in uniqueCoursesForFilter" :key="course" :value="course">{{ course }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Assessment Type</label>
              <select v-model="selectedTypeFilter" class="input-field">
                <option value="">All Types</option>
                <option value="Quiz">Quiz</option>
                <option value="Assignment">Assignment</option>
                <option value="Test">Test</option>
                <option value="Exam">Exam</option>
                <option value="Project">Project</option>
                <option value="Midterm">Midterm</option>
                <option value="Final">Final</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Student Search</label>
              <input
                v-model="studentSearchQuery"
                type="text"
                placeholder="Search student name..."
                class="input-field w-48"
              >
            </div>
          </div>

          <div class="flex items-end">
            <button @click="openAddMarkModal" class="btn-primary">
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Student Mark
            </button>
          </div>
        </div>
      </div>

      <!-- Detailed Marks Table -->
      <div class="card">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Recorded Marks</h3>
          <span class="text-sm text-gray-500">{{ filteredStudentMarks.length }} marks recorded</span>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assessment
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mark Obtained
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recorded By
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recorded At
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loadingStudentMarks">
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">Loading student marks...</td>
              </tr>
              <tr v-else-if="filteredStudentMarks.length === 0">
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">No student marks found for your courses.</td>
              </tr>
              <tr v-for="mark in filteredStudentMarks" :key="mark.mark_id" class="table-row">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ mark.student_name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ mark.course_name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ mark.component_name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ parseFloat(mark.mark_obtained).toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ mark.recorded_by_name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(mark.recorded_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="openEditMarkModal(mark)"
                    class="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    @click="confirmDeleteMark(mark.mark_id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Student Mark Modal -->
      <div v-if="showMarkModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md m-4">
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-semibold text-gray-900">{{ isEditMode ? 'Edit Student Mark' : 'Add New Student Mark' }}</h4>
            <button @click="closeMarkModal" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <form @submit.prevent="saveStudentMark" class="space-y-4">
            <div>
              <label for="enrollment_id" class="block text-sm font-medium text-gray-700">Enrollment (Student - Course)</label>
              <select id="enrollment_id" v-model.number="markForm.enrollment_id" required class="input-field">
                <option value="" disabled>Select an enrollment</option>
                <option v-if="loadingEnrollments" disabled>Loading enrollments...</option>
                <option v-else-if="enrollments.length === 0" disabled>No enrollments found.</option>
                <option v-for="enrollment in enrollments" :key="enrollment.enrollment_id" :value="enrollment.enrollment_id">
                  {{ enrollment.student_name }} - {{ enrollment.course_name }} (ID: {{ enrollment.enrollment_id }})
                </option>
              </select>
            </div>
            <div>
              <label for="component_id" class="block text-sm font-medium text-gray-700">Assessment Component</label>
              <select id="component_id" v-model.number="markForm.component_id" required class="input-field">
                <option value="" disabled>Select an assessment component</option>
                <option v-if="loadingAssessmentComponents" disabled>Loading components...</option>
                <option v-else-if="assessmentComponents.length === 0" disabled>No components found.</option>
                <option v-for="component in assessmentComponents" :key="component.component_id" :value="component.component_id">
                  {{ component.component_name }} (Max Marks: {{ component.max_marks || 'N/A' }})
                </option>
              </select>
            </div>
            <div>
              <label for="mark_obtained" class="block text-sm font-medium text-gray-700">Mark Obtained</label>
              <input type="number" step="0.01" id="mark_obtained" v-model.number="markForm.mark_obtained" required class="input-field" min="0">
              <p v-if="currentSelectedComponentMaxMarks !== null && currentSelectedComponentMaxMarks !== 'N/A'" class="text-xs text-gray-500 mt-1">
                Max Marks for selected component: {{ currentSelectedComponentMaxMarks }}
              </p>
              <p v-if="markForm.mark_obtained !== null && typeof currentSelectedComponentMaxMarks === 'number' && markForm.mark_obtained > currentSelectedComponentMaxMarks" class="text-red-500 text-sm mt-1">
                Mark cannot exceed max marks!
              </p>
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button type="button" @click="closeMarkModal" class="btn-secondary">Cancel</button>
              <button type="submit" class="btn-primary">
                {{ isEditMode ? 'Update Mark' : 'Add Mark' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md m-4">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h4>
          <p class="text-gray-600 mb-6">Are you sure you want to delete this student mark? This action cannot be undone.</p>
          <div class="flex justify-end space-x-3">
            <button @click="cancelDelete" class="btn-secondary">Cancel</button>
            <button @click="deleteStudentMarkConfirmed" class="btn-danger">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { PlusIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import Navigation from '../components/shared/Navigation.vue';

// --- API Configuration ---
const API_BASE_URL = 'http://localhost:8219';

// --- Reactive State & Interfaces ---

// StudentMark interface based on your `6.1. Get All Student Marks` endpoint response
interface StudentMark {
  mark_id: number;
  enrollment_id: number;
  component_id: number;
  mark_obtained: string; // API returns as string
  recorded_by: number;
  recorded_at: string;
  updated_at: string;
  student_name: string; // Included from JOIN in API
  course_name: string;   // Included from JOIN in API
  component_name: string; // Included from JOIN in API
  recorded_by_name: string; // Included from JOIN in API
  // `student_id` and `lecturer_id` are specific to 6.2 Get by ID, not 6.1 Get All. Removed for precision.
}

// Interface for fetched assessment component details (max_marks, weightage, etc.)
interface AssessmentComponent {
  component_id: number;
  component_name: string; // Added for dropdown
  max_marks: number;
  weightage: number;
  // Add other relevant fields if your API provides them
}

// Interface for fetched enrollments (student_name, course_name for dropdown)
interface Enrollment {
  enrollment_id: number;
  student_id: number;
  course_id: number;
  // Assuming your /enrollments API might return these joined fields:
  student_name: string;
  course_name: string;
}

const studentMarks = ref<StudentMark[]>([]); // All marks the lecturer can see
const enrollments = ref<Enrollment[]>([]); // For enrollment dropdown
const assessmentComponents = ref<AssessmentComponent[]>([]); // For component dropdown

const message = ref('');
const errorMessage = ref('');
const loadingStudentMarks = ref(false);
const loadingEnrollments = ref(false);
const loadingAssessmentComponents = ref(false);

const selectedCourseFilter = ref('');
const selectedTypeFilter = ref('');
const studentSearchQuery = ref('');

const showMarkModal = ref(false);
const isEditMode = ref(false);
const markForm = reactive({
  mark_id: null as number | null,
  enrollment_id: null as number | null,
  component_id: null as number | null,
  mark_obtained: null as number | null, // Use number for input binding
});

const showDeleteConfirmModal = ref(false);
const markToDeleteId = ref<number | null>(null);

// --- Utility Functions ---
const setErrorMessage = (msg: string) => {
  errorMessage.value = msg;
  setTimeout(() => {
    errorMessage.value = '';
  }, 5000);
};

const setMessage = (msg: string) => {
  message.value = msg;
  setTimeout(() => {
    message.value = '';
  }, 5000);
};

const getAuthHeaders = () => {
  const jwtToken = sessionStorage.getItem('token');
  if (!jwtToken) {
    console.error('JWT Token not found in sessionStorage. Redirecting to login.');
    setErrorMessage('You are not logged in or your session has expired. Please log in.');
    setTimeout(() => { window.location.href = '/login'; }, 2000);
    throw new Error('Authentication required.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  };
};

const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date string passed to formatDate:", dateString);
      return 'N/A';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    console.error("Error parsing date:", dateString, e);
    return 'N/A';
  }
};

// --- API Calls ---

/**
 * Fetches all student marks that the authenticated lecturer/admin can access.
 * Corresponds to 6.1. Get All Student Marks.
 */
const fetchAllStudentMarks = async () => {
  loadingStudentMarks.value = true;
  setErrorMessage('');
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/student-marks`, { headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch student marks');
    }
    studentMarks.value = Array.isArray(data) ? data : []; // Ensure it's an array
  } catch (error: any) {
    console.error('Error fetching student marks:', error);
    if (error.message !== 'Authentication required.') {
      setErrorMessage(error.message || 'Could not fetch student marks.');
    }
    studentMarks.value = [];
  } finally {
    loadingStudentMarks.value = false;
  }
};

/**
 * Saves a student mark (Add or Update).
 * Corresponds to 6.3. Add New Student Mark (POST) and 6.4. Update Student Mark (PUT).
 */
const saveStudentMark = async () => {
  setMessage('');
  setErrorMessage('');

  // Client-side validation: Mark Obtained vs Max Marks
  const selectedComponent = assessmentComponents.value.find(
    comp => comp.component_id === markForm.component_id
  );
  if (selectedComponent && markForm.mark_obtained !== null && markForm.mark_obtained > selectedComponent.max_marks) {
    setErrorMessage(`Mark obtained (${markForm.mark_obtained}) exceeds the maximum mark allowed (${selectedComponent.max_marks}) for this component.`);
    return;
  }

  try {
    const headers = getAuthHeaders();
    const method = markForm.mark_id ? 'PUT' : 'POST';
    const url = markForm.mark_id ? `${API_BASE_URL}/student-marks/${markForm.mark_id}` : `${API_BASE_URL}/student-marks`;

    const payload = {
      enrollment_id: markForm.enrollment_id,
      component_id: markForm.component_id,
      mark_obtained: markForm.mark_obtained, // Send as number, backend will convert if needed
    };

    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Failed to ${method === 'POST' ? 'add' : 'update'} student mark`);
    }

    setMessage(data.message || `Student mark ${method === 'POST' ? 'added' : 'updated'} successfully!`);
    closeMarkModal();
    fetchAllStudentMarks(); // Re-fetch marks to update the table
  } catch (error: any) {
    console.error(`Error ${isEditMode.value ? 'updating' : 'adding'} student mark:`, error);
    if (error.message !== 'Authentication required.') {
      setErrorMessage(error.message || `Could not ${isEditMode.value ? 'update' : 'add'} student mark.`);
    }
  }
};

/**
 * Deletes a student mark.
 * Corresponds to 6.5. Delete Student Mark.
 */
const deleteStudentMarkConfirmed = async () => {
  if (!markToDeleteId.value) return;
  setMessage('');
  setErrorMessage('');
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/student-marks/${markToDeleteId.value}`, {
      method: 'DELETE',
      headers: headers
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete student mark');
    }
    setMessage(data.message || 'Student mark deleted successfully!');
    cancelDelete();
    fetchAllStudentMarks(); // Re-fetch marks to update the table
  } catch (error: any) {
    console.error(`Error deleting student mark ${markToDeleteId.value}:`, error);
    if (error.message !== 'Authentication required.') {
      setErrorMessage(error.message || 'Could not delete student mark.');
    }
  }
};

/**
 * Fetches all enrollments to populate the dropdown in the Add/Edit modal.
 * Placeholder endpoint. You MUST implement this on your backend.
 * Expected response: Array of { enrollment_id, student_id, course_id, student_name, course_name }
 */
const fetchEnrollments = async () => {
  loadingEnrollments.value = true;
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/enrollments`, { headers }); // Placeholder API for enrollments
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch enrollments');
    }
    enrollments.value = Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Error fetching enrollments:', error);
    setErrorMessage('Could not load enrollments for mark entry.');
    enrollments.value = [];
  } finally {
    loadingEnrollments.value = false;
  }
};

/**
 * Fetches all assessment components to populate the dropdown in the Add/Edit modal.
 * Placeholder endpoint. You MUST implement this on your backend.
 * Expected response: Array of { component_id, component_name, max_marks, weightage, ... }
 */
const fetchAssessmentComponents = async () => {
  loadingAssessmentComponents.value = true;
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/assessment-components`, { headers }); // Placeholder API for components
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch assessment components');
    }
    assessmentComponents.value = Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Error fetching assessment components:', error);
    setErrorMessage('Could not load assessment components for mark entry.');
    assessmentComponents.value = [];
  } finally {
    loadingAssessmentComponents.value = false;
  }
};

// --- Modal Management Functions ---
const resetMarkForm = () => {
  markForm.mark_id = null;
  markForm.enrollment_id = null;
  markForm.component_id = null;
  markForm.mark_obtained = null;
};

const openAddMarkModal = () => {
  isEditMode.value = false;
  resetMarkForm();
  showMarkModal.value = true;
};

const openEditMarkModal = async (mark: StudentMark) => {
  isEditMode.value = true;
  // For now, directly assign from the table data assuming it's complete enough
  markForm.mark_id = mark.mark_id;
  markForm.enrollment_id = mark.enrollment_id;
  markForm.component_id = mark.component_id;
  markForm.mark_obtained = parseFloat(mark.mark_obtained);

  showMarkModal.value = true;
};

const closeMarkModal = () => {
  showMarkModal.value = false;
  resetMarkForm();
};

const confirmDeleteMark = (markId: number) => {
  markToDeleteId.value = markId;
  showDeleteConfirmModal.value = true;
};

const cancelDelete = () => {
  showDeleteConfirmModal.value = false;
  markToDeleteId.value = null;
};

// --- Computed Properties for Filtering & Display ---

// Unique courses for the course filter dropdown
const uniqueCoursesForFilter = computed(() => {
  const coursesSet = new Set<string>();
  studentMarks.value.forEach(mark => coursesSet.add(mark.course_name));
  return Array.from(coursesSet);
});

// Used in the Add/Edit modal to show max marks for selected component
const currentSelectedComponentMaxMarks = computed(() => {
  if (markForm.component_id === null) return null;
  const component = assessmentComponents.value.find(comp => comp.component_id === markForm.component_id);
  return component ? component.max_marks : 'N/A';
});


const filteredStudentMarks = computed(() => {
  let filtered = studentMarks.value;

  if (selectedCourseFilter.value) {
    filtered = filtered.filter(mark => mark.course_name === selectedCourseFilter.value);
  }

  if (selectedTypeFilter.value) {
    filtered = filtered.filter(mark =>
      mark.component_name.toLowerCase().includes(selectedTypeFilter.value.toLowerCase())
    );
  }

  if (studentSearchQuery.value) {
    filtered = filtered.filter(mark =>
      mark.student_name.toLowerCase().includes(studentSearchQuery.value.toLowerCase())
    );
  }

  return filtered;
});

// --- Component Lifecycle Hooks ---
onMounted(() => {
  fetchAllStudentMarks();
  fetchEnrollments(); // Fetch enrollments for the Add/Edit modal
  fetchAssessmentComponents(); // Fetch assessment components for the Add/Edit modal
});
</script>

<style scoped>
/* Reusing styles from previous components for consistency */
.card {
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
}

.input-field {
  @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm;
}
.btn-primary {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
}
.btn-secondary {
  @apply inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
}
.btn-danger {
  @apply inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500;
}

.table-row:hover {
  background-color: #f9fafb;
}
</style>
