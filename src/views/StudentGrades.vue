<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">My Grades</h1>
        <p class="text-gray-600">Detailed view of all your academic assessments and grades</p>
      </div>

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

      <div class="card mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select v-model="selectedCourse" class="input-field">
              <option value="">All Courses</option>
              <option v-for="course in uniqueCourses" :key="course" :value="course">{{ course }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Assessment Type</label>
            <select v-model="selectedType" class="input-field">
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

          </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div v-if="loadingCourseSummary" class="md:col-span-3 text-center text-gray-500">
          Loading course summaries...
        </div>
        <div v-else-if="courseSummaries.length === 0 && !loadingCourseSummary" class="md:col-span-3 text-center text-gray-500">
        
        </div>
        <div v-for="course in courseSummaries" :key="course.code" class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ course.code }}</h3>
            <span :class="getGradeColor(course.currentGrade)" class="px-3 py-1 rounded-full text-sm font-medium">
              {{ course.currentGrade !== null ? course.currentGrade.toFixed(1) : 'N/A' }}%
            </span>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Completed</span>
              <span class="font-medium">{{ course.completed }}/{{ course.total }}</span>
            </div>

            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                :class="getProgressColor(course.progress)"
                class="h-2 rounded-full transition-all duration-300"
                :style="{ width: course.progress + '%' }"
              ></div>
            </div>

            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Next Due</span>
              <span class="font-medium text-red-600">{{ course.nextDue || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Grade Details</h3>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">{{ filteredStudentMarks.length }} assessments</span>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assessment
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loadingStudentMarks">
                <td colspan="8" class="px-6 py-4 text-center text-gray-500">Loading grades...</td>
              </tr>
              <tr v-else-if="filteredStudentMarks.length === 0">
                <td colspan="8" class="px-6 py-4 text-center text-gray-500">No student marks found.</td>
              </tr>
              <tr v-for="mark in filteredStudentMarks" :key="mark.mark_id" class="table-row">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ mark.component_name }}</div>
                  <div class="text-sm text-gray-500"></div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ mark.course_name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getTypeColor(mark.component_name)" class="px-2 py-1 text-xs font-medium rounded-full capitalize">
                    {{ inferTypeFromComponentName(mark.component_name) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ parseFloat(mark.mark_obtained).toFixed(2) }} / {{ getAssessmentTotalMarks(mark.component_id) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getGradeColor(calculatePercentage(mark))" class="text-sm font-medium">
                    {{ calculatePercentage(mark).toFixed(1) }}%
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ getAssessmentWeightage(mark.component_id) }}%
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(mark.recorded_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewFeedback(mark)"
                    class="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    View Feedback
                  </button>
                  <button
                    @click="requestRemark(mark)"
                    class="text-secondary-600 hover:text-secondary-900"
                  >
                    Request Remark
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="showFeedbackModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md m-4">
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-semibold text-gray-900">Assessment Feedback</h4>
            <button @click="showFeedbackModal = false" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <div v-if="selectedMark" class="space-y-4">
            <div>
              <h5 class="font-medium text-gray-700">{{ selectedMark.component_name }}</h5>
              <p class="text-sm text-gray-500">{{ selectedMark.course_name }}</p>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-gray-700">Score:</span>
                <span class="text-lg font-bold text-primary-600">
                  {{ parseFloat(selectedMark.mark_obtained).toFixed(2) }} / {{ getAssessmentTotalMarks(selectedMark.component_id) }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">Percentage:</span>
                <span class="text-lg font-bold" :class="getGradeColor(calculatePercentage(selectedMark))">
                  {{ calculatePercentage(selectedMark).toFixed(1) }}%
                </span>
              </div>
            </div>

            <div>
              <h6 class="font-medium text-gray-700 mb-2">Instructor Feedback:</h6>
              <p class="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                {{ feedbackContent || 'No feedback provided yet.' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowDownTrayIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import Navigation from '../components/shared/Navigation.vue'

// --- API Configuration ---
const API_BASE_URL = 'http://localhost:8219';

// --- Reactive State & Interfaces ---

// StudentMark interface based on your `6.2. Get Student Mark by ID` endpoint response
interface StudentMark {
  mark_id: number;
  enrollment_id: number;
  component_id: number;
  mark_obtained: string; // API returns as string
  recorded_by: number;
  recorded_at: string;
  updated_at: string;
  student_id: number; // Included in 6.2 response
  lecturer_id: number; // Included in 6.2 response
  student_name: string;
  course_name: string;
  component_name: string;
  recorded_by_name: string;
}

// Interface for fetched assessment component details (max_marks, weightage)
interface AssessmentComponentDetails {
  component_id: number;
  max_marks: number;
  weightage: number;
  // Add other fields from your /assessment-components API if available
}

// Interface for fetched course summaries (currentGrade, completed, etc.)
interface CourseSummary {
  code: string;
  name: string;
  currentGrade: number | null;
  completed: number;
  total: number;
  progress: number;
  nextDue: string | null;
}

const selectedCourse = ref('')
const selectedType = ref('')
// Removed selectedSemester as the dropdown is removed from UI
// const selectedSemester = ref('')
const showFeedbackModal = ref(false)
const selectedMark = ref<StudentMark | null>(null)
const feedbackContent = ref<string | null>(null); // To store fetched feedback

const studentMarks = ref<StudentMark[]>([]); // To store the list of marks for the table
const courseSummaries = ref<CourseSummary[]>([]); // To store summaries for the cards
const assessmentComponentDetails = ref<AssessmentComponentDetails[]>([]); // To store component max_marks/weightage

const message = ref('');
const errorMessage = ref('');
const loadingStudentMarks = ref(false);
const loadingCourseSummary = ref(false);
const loadingAssessmentDetails = ref(false);

// --- Utility Functions (for messages and auth headers) ---
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
    // Optional: Redirect to login page after a delay
    // setTimeout(() => { window.location.href = '/login'; }, 2000);
    throw new Error('Authentication required.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  };
};

// --- API Calls ---

// Fetches the list of marks for the authenticated student
// Assumes this endpoint (/student-marks) without an ID implicitly filters by the student from JWT.
const fetchAllStudentMarks = async () => {
  loadingStudentMarks.value = true;
  setErrorMessage('');
  try {
    const headers = getAuthHeaders();
    // This endpoint should return an ARRAY of StudentMark objects
    const response = await fetch(`${API_BASE_URL}/student-marks`, { headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch student marks');
    }
    // Ensure the data is an array
    if (!Array.isArray(data)) {
        console.warn('API /student-marks did not return an array. Assuming single object for now.');
        studentMarks.value = [data]; // Wrap in array if API returns single object by mistake
    } else {
        studentMarks.value = data;
    }
  } catch (error: any) {
    console.error('Error fetching all student marks:', error);
    if (error.message !== 'Authentication required.') {
      setErrorMessage(error.message || 'Could not fetch student marks.');
    }
    studentMarks.value = [];
  } finally {
    loadingStudentMarks.value = false;
  }
};

// Fetches aggregated course summaries for the student
// You need to implement this endpoint on your backend.
const fetchCourseSummaries = async () => {
  loadingCourseSummary.value = true;
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/student/course-summaries`, { headers }); // Placeholder endpoint
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch course summaries');
    }
    courseSummaries.value = data;
  } catch (error: any) {
    console.error('Error fetching course summaries:', error);
    // setErrorMessage(error.message || 'Could not fetch course summaries.'); // Decide if this error needs to be shown for summaries
    courseSummaries.value = [];
  } finally {
    loadingCourseSummary.value = false;
  }
};

// Fetches details for all assessment components (max_marks, weightage)
// You need to implement this endpoint on your backend.
const fetchAssessmentComponentDetails = async () => {
  loadingAssessmentDetails.value = true;
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/assessment-components`, { headers }); // Placeholder endpoint
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch assessment component details');
    }
    assessmentComponentDetails.value = data;
  } catch (error: any) {
    console.error('Error fetching assessment component details:', error);
    // setErrorMessage(error.message || 'Could not fetch assessment component details.'); // Decide if this error needs to be shown
    assessmentComponentDetails.value = [];
  } finally {
    loadingAssessmentDetails.value = false;
  }
};

// Fetches specific feedback for an assessment using mark_id
// This assumes an endpoint like /feedback/{mark_id} or a field in /student-marks/{id}
const fetchFeedbackForMark = async (markId: number) => {
  feedbackContent.value = null; // Clear previous feedback
  try {
    const headers = getAuthHeaders();
    // This is a placeholder. If feedback is part of `GET /student-marks/{id}`:
    // const response = await fetch(`${API_BASE_URL}/student-marks/${markId}`, { headers });
    // const data = await response.json();
    // feedbackContent.value = data.feedback_field_name || 'No feedback provided yet.';

    // If feedback is from a dedicated endpoint:
    const response = await fetch(`${API_BASE_URL}/feedback/${markId}`, { headers }); // Placeholder endpoint
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch feedback');
    }
    feedbackContent.value = data.feedback_text || 'No feedback provided yet.'; // Assuming response has 'feedback_text'
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    setErrorMessage(error.message || 'Could not fetch feedback for this assessment.');
    feedbackContent.value = 'Error loading feedback.';
  }
};

// --- Computed Properties for Filtering & Display ---
const uniqueCourses = computed(() => {
  const coursesSet = new Set<string>();
  studentMarks.value.forEach(mark => coursesSet.add(mark.course_name));
  return Array.from(coursesSet);
});

const filteredStudentMarks = computed(() => {
  let filtered = studentMarks.value;

  if (selectedCourse.value) {
    filtered = filtered.filter(mark => mark.course_name === selectedCourse.value);
  }

  if (selectedType.value) {
    filtered = filtered.filter(mark =>
      mark.component_name.toLowerCase().includes(selectedType.value.toLowerCase())
    );
  }

  // Semester filtering logic removed as the dropdown is removed
  // if (selectedSemester.value) { /* ... logic ... */ }

  return filtered;
});

// Helper to get total marks for an assessment component
const getAssessmentTotalMarks = (componentId: number): number | string => {
  const component = assessmentComponentDetails.value.find(c => c.component_id === componentId);
  return component ? component.max_marks : 'N/A';
};

// Helper to get weightage for an assessment component
const getAssessmentWeightage = (componentId: number): number | string => {
  const component = assessmentComponentDetails.value.find(c => c.component_id === componentId);
  return component ? component.weightage : 'N/A';
};

// Calculates percentage based on fetched mark and dynamically looked-up total marks
const calculatePercentage = (mark: StudentMark): number => {
  const totalMarks = getAssessmentTotalMarks(mark.component_id);
  const markObtained = parseFloat(mark.mark_obtained);

  if (typeof totalMarks === 'number' && totalMarks > 0) {
    return (markObtained / totalMarks) * 100;
  }
  return 0; // Return 0 if totalMarks is not a valid number or is zero/unavailable
};

// Infers assessment type from component name for display and coloring
const inferTypeFromComponentName = (componentName: string): string => {
  const lowerCaseName = componentName.toLowerCase();
  if (lowerCaseName.includes('quiz')) return 'quiz';
  if (lowerCaseName.includes('assignment')) return 'assignment';
  if (lowerCaseName.includes('test')) return 'test';
  if (lowerCaseName.includes('exam') || lowerCaseName.includes('midterm') || lowerCaseName.includes('final')) return 'exam';
  if (lowerCaseName.includes('project')) return 'project';
  return 'other';
};

// --- Styling Helper Functions ---
const getGradeColor = (percentage: number | null) => {
  if (percentage === null) return 'text-gray-500'; // For N/A
  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 80) return 'text-blue-600';
  if (percentage >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 60) return 'bg-blue-500';
  if (progress >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getTypeColor = (componentName: string) => {
  const type = inferTypeFromComponentName(componentName);
  const colors: { [key: string]: string } = {
    quiz: 'bg-blue-100 text-blue-800',
    assignment: 'bg-green-100 text-green-800',
    test: 'bg-yellow-100 text-yellow-800',
    exam: 'bg-red-100 text-red-800',
    project: 'bg-purple-100 text-purple-800',
    other: 'bg-gray-100 text-gray-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800';
};

const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    // Check for invalid date (e.g., "0000-00-00" might parse to an invalid date)
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

// --- UI Action Handlers ---
const viewFeedback = async (mark: StudentMark) => {
  selectedMark.value = mark;
  // Use the mark_id to fetch specific feedback
  await fetchFeedbackForMark(mark.mark_id);
  showFeedbackModal.value = true;
};

const requestRemark = (mark: StudentMark) => {
  alert(`Remark request initiated for ${mark.component_name} (Mark ID: ${mark.mark_id}).\n\nThis would trigger an API call to record the request.`);
  // Implement actual API call here, e.g.:
  // submitRemarkRequest(mark.mark_id);
};

// Removed exportGrades function as the button is removed
// const exportGrades = () => {
//   alert('Grades export initiated! (Frontend simulation)');
//   // Implement actual API call for export here, potentially with filters
// };

// --- Component Lifecycle Hooks ---
onMounted(() => {
  fetchAllStudentMarks(); // Fetch the list of all student marks
  fetchCourseSummaries(); // Fetch aggregated course summaries
  fetchAssessmentComponentDetails(); // Fetch component details (max_marks, weightage)
});
</script>

<style scoped>
/* Your existing styles from the original UI */
.card {
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
}

.input-field {
  @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm;
}

.btn-primary {
  @apply inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}

.btn-secondary {
  @apply inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}

.table-row:hover {
  background-color: #f9fafb;
}
</style>