<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Assign Student to Course</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <form @submit.prevent="submitAssignment" class="space-y-4">
        <div>
          <label for="courseSelect" class="block text-sm font-medium text-gray-700">Select Course</label>
          <select id="courseSelect" v-model="selectedCourseId" @change="fetchEligibleStudents" class="input-field" required>
            <option value="">-- Select a Course --</option>
            <option v-for="course in lecturerCourses" :key="course.course_id" :value="course.course_id">
              {{ course.course_code }} - {{ course.course_name }}
            </option>
          </select>
        </div>

        <div v-if="selectedCourseId">
          <label class="block text-sm font-medium text-gray-700">Eligible Students (Select one or more)</label>
          <div v-if="loadingEligibleStudents" class="text-center py-4">Loading eligible students...</div>
          <div v-else-if="eligibleStudents.length === 0" class="text-center py-4 text-gray-500">
            No eligible students found for this course.
          </div>
          <div v-else class="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
            <div v-for="student in eligibleStudents" :key="student.user_id" class="flex items-center py-2 border-b last:border-b-0 border-gray-100">
              <input type="checkbox" :id="`student-${student.user_id}`" :value="student.user_id" v-model="selectedStudentIds" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
              <label :for="`student-${student.user_id}`" class="ml-3 text-sm font-medium text-gray-700 flex items-center">
                <img :src="student.profile_picture || 'https://placehold.co/24x24/E0E0E0/888888?text=DP'" alt="Profile" class="h-6 w-6 rounded-full mr-2">
                {{ student.full_name }} ({{ student.matric_number || student.username }})
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
          <button type="submit" :disabled="!selectedCourseId || selectedStudentIds.length === 0" class="btn-primary">
            Assign Selected Students
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

// --- Type Definitions ---
// Defines the structure for a Course object.
interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
}

// Defines the structure for a Student object.
interface Student {
  user_id: number;
  username: string;
  full_name: string;
  matric_number: string;
  email: string;
  profile_picture: string;
}

export default defineComponent({
  name: 'AssignStudentToCourseModal',
  // --- Component Properties ---
  props: {
    // A boolean to control the visibility of the modal from the parent.
    show: {
      type: Boolean,
      required: true
    },
    // An array of courses taught by the lecturer, passed from the parent.
    lecturerCourses: { 
      type: Array as () => Course[],
      default: () => []
    }
  },
  // --- Component Events ---
  // Declares the events this component can emit to its parent.
  emits: ['close', 'assign-students'],
  // --- Component Logic ---
  setup(props, { emit }) {
    // --- Reactive State ---
    const selectedCourseId = ref<number | ''>(''); // Stores the ID of the selected course.
    const eligibleStudents = ref<Student[]>([]); // Stores the list of students eligible for the selected course.
    const selectedStudentIds = ref<number[]>([]); // Stores the IDs of the students selected via checkbox.
    const loadingEligibleStudents = ref(false); // A flag to indicate when the student list is being fetched.

    // --- Watcher ---
    // Watches the 'show' prop to reset the form's state whenever the modal is closed.
    watch(() => props.show, (newValue) => {
      if (!newValue) {
        selectedCourseId.value = '';
        eligibleStudents.value = [];
        selectedStudentIds.value = [];
        loadingEligibleStudents.value = false;
      }
    });

    // --- API Call ---
    // Fetches students who are not yet enrolled in the selected course.
    const fetchEligibleStudents = async () => {
      // If no course is selected, clear the student list.
      if (!selectedCourseId.value) {
        eligibleStudents.value = [];
        selectedStudentIds.value = [];
        return;
      }

      loadingEligibleStudents.value = true;
      const token = sessionStorage.getItem('token'); // Retrieve auth token for the API request.

      try {
        // Makes a GET request to the backend endpoint.
        const response = await fetch(`http://localhost:8219/enrollments/${selectedCourseId.value}/eligible-students`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch eligible students: ${response.statusText}`);
        }
        const data = await response.json();
        // Updates the reactive state with the fetched students.
        eligibleStudents.value = data.eligibleStudents || [];
        selectedStudentIds.value = []; // Clear previous selections when the course changes.
      } catch (error) {
        console.error('Error fetching eligible students:', error);
        alert('Failed to load eligible students.');
        eligibleStudents.value = [];
      } finally {
        loadingEligibleStudents.value = false; // Set loading state to false.
      }
    };

    // --- Form Submission ---
    // Handles the form submission logic.
    const submitAssignment = () => {
      // Validates that a course and at least one student are selected.
      if (selectedCourseId.value && selectedStudentIds.value.length > 0) {
        // Emits an event to the parent component with the selected data.
        emit('assign-students', {
          courseId: selectedCourseId.value,
          studentIds: selectedStudentIds.value
        });
      } else {
        alert('Please select a course and at least one student.');
      }
    };

    // Exposes the state and methods to the template.
    return {
      selectedCourseId,
      eligibleStudents,
      selectedStudentIds,
      loadingEligibleStudents,
      fetchEligibleStudents,
      submitAssignment
    };
  }
});
</script>

<style scoped>
.input-field {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm;
}
.btn-primary {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500;
}
.btn-secondary {
  @apply inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500;
}
</style>