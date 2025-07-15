<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">
          Lecturer Dashboard
        </h1>
        <p class="text-gray-600">Manage your courses and student assessments</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Active Courses"
          :value="activeCourses"
          :icon="BookOpenIcon"
          variant="primary"
        />
        <StatsCard
          title="Total Students"
          :value="totalStudents"
          :icon="UsersIcon"
          variant="secondary"
        />
        <StatsCard
          title="Pending Grading"
          :value="pendingGrading"
          :icon="ClipboardDocumentListIcon"
          variant="warning"
        />
        <StatsCard
          title="Class Average"
          :value="`${classAverage.toFixed(1)}%`"
          change=" "  
          :icon="ChartBarIcon"
          variant="success"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <!-- Safeguard for PerformanceChart to prevent "reading '6'" error -->
          <PerformanceChart
            v-if="classPerformanceData.labels.length > 0 && classPerformanceData.values.length > 0"
            title="Class Performance Analytics"
            :data="classPerformanceData"
            color="#10b981"
          />
          <div v-else class="card p-6 text-center text-gray-500">
            <p>Loading performance chart data or no data available.</p>
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <button
              @click="activeTab = 'students'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <UsersIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">Manage Students</span>
              </div>
            </button>
            
            <button
              @click="activeTab = 'grades'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <PencilSquareIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">Grade Assignments</span>
              </div>
            </button>
            
            <button
              @click="activeTab = 'assessments'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <DocumentPlusIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">Create Assessment</span>
              </div>
            </button>
            
            <button
              @click="activeTab = 'export'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <ArrowUpTrayIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">Export CSV</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <div v-if="activeTab === 'students'" class="card">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Student Records</h3>
            <div class="flex items-center space-x-3">
              <select v-model="selectedCourse" class="text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
                <option value="">All Courses</option>
                <option v-for="courseCode in availableCourses" :key="courseCode" :value="courseCode">
                  {{ courseCode }}
                </option>
              </select>
              <!-- Changed button text and click handler -->
              <button @click="openAssignStudentToCourseModal" class="btn-primary text-sm">
                Assign Student to Course
              </button>
            </div>
          </div>
          
          <div v-if="isLoading"><p>Loading students...</p></div>
          <div v-else-if="filteredStudents.length === 0" class="text-center py-8 text-gray-500">
            <p>No students found for the selected course or no students available.</p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matric No.</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Grade</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="student in filteredStudents" :key="student.user_id" class="table-row">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <img :src="student.profile_picture || 'https://placehold.co/32x32/E0E0E0/888888?text=DP'" alt="Profile" class="h-8 w-8 rounded-full">
                      <div class="ml-3">
                        <div class="text-sm font-medium text-gray-900">{{ student.full_name }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ student.matric_number || 'N/A' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ student.course_code || 'N/A' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ studentGrades[student.user_id] !== undefined ? studentGrades[student.user_id] : 'Loading...' }}%
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button @click="openEditStudentModal(student)" class="text-primary-600 hover:text-primary-900">Edit</button>
                    <button @click="openViewStudentDetailsModal(student)" class="text-secondary-600 hover:text-secondary-900">View Details</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="activeTab === 'grades'" class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Grade Entry & Management</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label for="gradeCourseSelect" class="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <select
                id="gradeCourseSelect"
                v-model="selectedCourseForGrades"
                @change="fetchAssessmentsForCourse"
                class="input-field"
              >
                <option value="">Select Course</option>
                <!-- Dynamically populate courses from lecturerCourses -->
                <option v-for="course in lecturerCourses" :key="course.course_id" :value="course.course_id">
                  {{ course.course_code }} - {{ course.course_name }}
                </option>
              </select>
            </div>
            <div>
              <label for="assessmentSelect" class="block text-sm font-medium text-gray-700 mb-2">Assessment</label>
              <select
                id="assessmentSelect"
                v-model="selectedAssessment"
                @change="fetchStudentMarks"
                :disabled="!selectedCourseForGrades || assessments.length === 0"
                class="input-field"
              >
                <option value="">Select Assessment</option>
                <!-- Dynamically populate assessments -->
                <option v-for="assessment in assessments" :key="assessment.component_id" :value="assessment.component_id">
                  {{ assessment.component_name }} ({{ assessment.weightage }}%)
                </option>
              </select>
            </div>
          </div>
          <div v-if="selectedCourseForGrades && selectedAssessment" class="space-y-4">
            <h4 class="font-medium text-gray-700">Student Grades:</h4>
            <div v-if="loadingStudentMarks" class="text-center py-4 text-gray-500">Loading student marks...</div>
            <div v-else-if="studentMarks.length === 0" class="text-center py-4 text-gray-500">
              No students found for this assessment or course.
            </div>
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matric Number</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mark (%)</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="mark in studentMarks" :key="mark.student_id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ mark.full_name }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ mark.matric_number }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="number"
                        v-model.number="mark.mark"
                        min="0"
                        max="100"
                        step="0.1"
                        class="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="mt-6 text-right">
                <button
                  @click="saveGrades"
                  :disabled="isSavingGrades"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span v-if="isSavingGrades">Saving Grades...</span>
                  <span v-else>Save Grades</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'assessments'" class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Create New Assessment</h3>
          <form @submit.prevent="createAssessment" class="space-y-6">
          </form>
        </div>

        <div v-if="activeTab === 'export'" class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Export Grades</h3>
        </div>
      </div>
    </div>

    <!-- Modals for Edit, View Student, and Assign Student -->
    <EditStudentModal :show="showEditStudentModal" :student="selectedStudent" @close="closeModals" @update-student="handleUpdateStudent" />
    <ViewStudentDetailsModal :show="showViewStudentDetailsModal" :student="selectedStudent" @close="closeModals" />

    <AssignStudentToCourseModal 
      :show="showAssignStudentToCourseModal" 
      :lecturerCourses="lecturerCourses"
      @close="closeAssignStudentToCourseModal" 
      @assign-students="handleAssignStudentsToCourse" 
    />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'; // Import useRouter
import {
  BookOpenIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  PencilSquareIcon,
  DocumentPlusIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'

import Navigation from '../components/shared/Navigation.vue'
import StatsCard from '../components/shared/StatsCard.vue'
import PerformanceChart from '../components/charts/PerformanceChart.vue'
import { useGradesStore } from '../stores/grades'

import EditStudentModal from '../components/modals/EditStudentModal.vue';
import ViewStudentDetailsModal from '../components/modals/ViewStudentModal.vue'; // Corrected import
import AssignStudentToCourseModal from '../components/modals/AssignStudentToCourseModal.vue';


// Interface for the user object from sessionStorage
interface User {
  id: string;
  username: string;
  name: string;
  user_id: string; 
  role: string; // Ensure role is included
}
interface Mark {
  mark_id: number; 
  enrollment_id: number; 
  component_id: number; 
  mark_obtained: string; 
  recorded_by: number; 
  max_mark: string; 
  weight_percentage: string; 
}
// NEW: Interface for Course
interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
}

interface AssessmentComponent {
  component_id: number;
  course_id: number;
  component_name: string;
  weightage: number;
}

interface StudentMark {
  student_id: number;
  full_name: string;
  matric_number: string;
  mark: number | null; // Mark can be null if not yet assigned
  student_mark_id?: number | null; // Optional, for existing marks
}


const gradesStore = useGradesStore();
const router = useRouter(); // Initialize useRouter
const currentUser = ref<User | null>(null);
const activeTab = ref('students');
const selectedCourse = ref(''); 

// This ref will hold the student data we fetch from the API
const students = ref<any[]>([]); 
const isLoading = ref(false); 
const studentGrades = reactive<Record<string, string>>({}); 

// State for modals
const showEditStudentModal = ref(false);
const showViewStudentDetailsModal = ref(false);
const selectedStudent = ref<any | null>(null); // To hold the student object for edit/view
const showAssignStudentToCourseModal = ref(false);


// All reactive variables needed by the template
const uploadedFile = ref<File | null>(null);
const gradeForm = reactive({ courseId: '', assessmentId: '' }); // Used for grade entry section
const assessmentForm = reactive({ title: '', type: '', courseId: '', totalMarks: '', weightage: '', dueDate: '', description: '' });
const uploadForm = reactive({ courseId: '', assessmentId: '' });

// Computed properties for the dashboard
const activeCourses = computed(() => lecturerCourses.value.length); // Dynamic
const totalStudents = computed(() => students.value.length); // Now dynamic!
const pendingGrading = ref(12); // Mock - will need real logic
const classAverage = ref(78.5); // Mock - will need real logic

const classPerformanceData = { // Mock data for the chart
  labels: ['Quiz 1', 'Quiz 2', 'Assignment 1', 'Midterm', 'Assignment 2', 'Quiz 3', 'Final Exam'], // 7 elements
  values: [75, 78, 82, 76, 85, 79, 90] // 7 elements
};

const filteredStudents = computed(() => {
  if (!selectedCourse.value) {
    return students.value; 
  }
  return students.value.filter(student => student.course_code === selectedCourse.value);
});

const availableCourses = computed(() => {
  const courses = new Set<string>();
  students.value.forEach(student => {
    if (student.course_code) {
      courses.add(student.course_code);
    }
  });
  return Array.from(courses);
});

// NEW: Ref to hold lecturer's courses
const lecturerCourses = ref<Course[]>([]);
// Declare `courses` ref for the "Your Courses" section
const courses = ref<Course[]>([]);


// Grade Entry & Management specific refs
const selectedCourseForGrades = ref<number | ''>('');
const selectedAssessment = ref<number | ''>('');
const assessments = ref<AssessmentComponent[]>([]);
const studentMarks = ref<StudentMark[]>([]);
const loadingStudentMarks = ref(false);
const isSavingGrades = ref(false);


// NEW: Function to fetch lecturer's courses
async function fetchLecturerCourses() {
  // Ensure isLoading is true at the start of the fetch
  isLoading.value = true; 
  const token = sessionStorage.getItem('token');
  const userString = sessionStorage.getItem('user');
  let user: User | null = null;

  if (userString) {
    try {
      user = JSON.parse(userString);
      currentUser.value = user; // Set currentUser here
    } catch (e) {
      console.error('Error parsing user from sessionStorage:', e);
      alert('User session data corrupted. Please log in again.');
      router.push('/login');
      isLoading.value = false; // Set loading to false on error
      return;
    }
  }

  if (!token || !user || user.role !== 'lecturer' || !user.username) {
    console.error('Authentication token or lecturer user information missing/invalid.');
    alert('Authentication required or not authorized as a lecturer. Please log in.');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    router.push('/login');
    isLoading.value = false; // Set loading to false on error
    return;
  }

  try {
    const response = await fetch(`http://localhost:8219/courses/lecturer/${user.username}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Token expired or invalid. Redirecting to login.');
        alert('Your session has expired or is invalid. Please log in again.');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        router.push('/login');
      }
      const errorData = await response.json();
      throw new Error(`Failed to fetch lecturer courses: ${errorData.error || response.statusText}`);
    }
    const data = await response.json();
    lecturerCourses.value = data.courses || [];
    // The `courses` ref is used for the "Your Courses" section, ensure it's also updated
    courses.value = data.courses || []; 

  } catch (error) {
    console.error('Error fetching lecturer courses:', error);
    alert(`Error fetching lecturer courses: ${error.message}`);
  } finally {
    isLoading.value = false; // Set loading to false after fetch completes (success or error)
  }
}

async function fetchLecturerStudents() {
  const token = sessionStorage.getItem('token');

  if (!token) {
    console.error('No authentication token found.');
    return;
  }

  try {
    isLoading.value = true; 

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(`${"http://localhost:8219"}/users/lecturer/${currentUser.value?.username}/students`, { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch lecturer students: ${response.statusText}`);
    }
    
    const studentsData = await response.json();
    students.value = studentsData.students; 

  } catch (error) {
    console.error('Error fetching lecturer students:', error);
  } finally {
    isLoading.value = false; 
  }
}

async function fetchStudentMarksForCalculation(studentId: string): Promise<Mark[]> {
  const token = sessionStorage.getItem('token'); 
  const response = await fetch(`http://localhost:8219/student-marks/all/${studentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Failed to fetch student marks for calculation:', response.statusText);
    return []; 
  }

  try {
    const data = await response.json();
    if (Array.isArray(data)) {
      return data;
    } else {
      console.warn(`Expected an array of student marks, but received:`, data);
      if (typeof data === 'object' && data !== null) {
        return [data];
      }
      return []; 
    }
  }
  catch (error) {
    console.error('Error parsing student marks JSON for calculation:', error);
    return []; 
  }
}

function calculateCurrentGrade(studentMarks: Mark[]): string {
  let totalWeightedScoreSum = 0; 
  let totalWeightSum = 0;       

  studentMarks.forEach((mark: Mark) => {
    const markObtained = parseFloat(mark.mark_obtained);
    const maxMark = parseFloat(mark.max_mark);
    const weightPercentage = parseFloat(mark.weight_percentage);

    if (!isNaN(markObtained) && !isNaN(maxMark) && maxMark > 0 && !isNaN(weightPercentage)) {
      const scoreRatio = markObtained / maxMark; 
      const weightDecimal = weightPercentage / 100; 

      totalWeightedScoreSum += scoreRatio * weightDecimal;
      totalWeightSum += weightDecimal;
    } else {
      console.warn('Invalid mark data encountered (after parseFloat):', mark, { markObtained, maxMark, weightPercentage });
    }
  });

  if (totalWeightSum === 0) {
    return '0.00'; 
  }

  const finalGrade = (totalWeightedScoreSum / totalWeightSum) * 100;
  return finalGrade.toFixed(2);
}

async function getStudentCurrentGrade(studentId: string) {
  const marks = await fetchStudentMarksForCalculation(studentId); 
  const grade = calculateCurrentGrade(marks); 

  studentGrades[studentId] = grade; 

  return grade; 
}

// Grade Entry & Management Functions
async function fetchAssessmentsForCourse() {
  assessments.value = [];
  selectedAssessment.value = ''; // Reset selected assessment
  studentMarks.value = []; // Clear student marks when course changes

  if (!selectedCourseForGrades.value) {
    return;
  }

  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Authentication token missing. Please log in again.');
    router.push('/login');
    return;
  }

  try {
    const response = await fetch(`http://localhost:8219/assessment-components/course/${selectedCourseForGrades.value}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Response (Assessments):', errorData); // Debugging
      throw new Error(`Failed to fetch assessments: ${errorData.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('Fetched assessments data:', data); // Debugging
    assessments.value = data.assessmentComponents || [];
  } catch (error) {
    console.error('Error fetching assessments:', error);
    alert(`Error fetching assessments: ${error.message}`);
  }
}
async function fetchStudentMarks() {
  studentMarks.value = [];
  if (!selectedCourseForGrades.value || !selectedAssessment.value) {
    return;
  }

  loadingStudentMarks.value = true;
  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Authentication token missing. Please log in again.');
    router.push('/login');
    loadingStudentMarks.value = false;
    return;
  }

  try {
    console.log(`Fetching student marks for course: ${selectedCourseForGrades.value}, assessment: ${selectedAssessment.value}`); // Debugging
    const response = await fetch(`http://localhost:8219/student-marks/course/${selectedCourseForGrades.value}/assessment/${selectedAssessment.value}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
      
    });
console.log('Headers:', {
  'Authorization': `Bearer ${token}`
});

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Response (Student Marks):', errorData); // Debugging

      // Specific error handling for 401 Unauthorized
      if (response.status === 401) {
        alert('Your session has expired. Please log in again.');
        router.push('/login');
      }
      throw new Error(`Failed to fetch student marks: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('Fetched student marks data:', data); // Debugging

    // Ensure data.studentMarks is an array before mapping
    if (data.studentMarks && Array.isArray(data.studentMarks)) {
      studentMarks.value = data.studentMarks.map((sm: any) => ({
        student_id: sm.student_id,
        full_name: sm.full_name,
        matric_number: sm.matric_number,
        mark: sm.mark !== undefined && sm.mark !== null ? parseFloat(sm.mark) : null,
        student_mark_id: sm.student_mark_id || null // Include student_mark_id for updates
      }));
    } else {
      console.warn('Expected data.studentMarks to be an array, but received:', data);
      studentMarks.value = [];
    }
  } catch (error) {
    console.error('Error fetching student marks:', error);
    alert(`Error fetching student marks: ${error.message}`);
    studentMarks.value = [];
  } finally {
    loadingStudentMarks.value = false;
  }
}


async function saveGrades() {
  if (!selectedCourseForGrades.value || !selectedAssessment.value || studentMarks.value.length === 0) {
    alert('Please select a course and an assessment, and ensure there are students to grade.');
    return;
  }

  isSavingGrades.value = true;
  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Authentication token missing. Please log in again.');
    router.push('/login');
    isSavingGrades.value = false;
    return;
  }

  const marksToSubmit = studentMarks.value.map(mark => ({
    student_id: mark.student_id,
    assessment_component_id: selectedAssessment.value,
    course_id: selectedCourseForGrades.value,
    mark: typeof mark.mark === 'number' ? mark.mark : null,
    student_mark_id: mark.student_mark_id // Include for updates
  }));

  try {
    const response = await fetch(`http://localhost:8219/student-marks/batch-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ marks: marksToSubmit })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to save grades: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    alert(result.message || 'Grades saved successfully!');
    fetchStudentMarks(); // Re-fetch marks to ensure UI is updated
  } catch (error) {
    console.error('Error saving grades:', error);
    alert(`Error saving grades: ${error.message}`);
  } finally {
    isSavingGrades.value = false;
  }
}


onMounted(async () => { 
  const userString = sessionStorage.getItem('user');
  if (userString) {
    try {
      currentUser.value = JSON.parse(userString);
      if (currentUser.value?.username) {
        await fetchLecturerCourses(); // Fetch courses first
        await fetchLecturerStudents(); // Then fetch students
      }
    } catch (e) {
      console.error('Could not parse user from sessionStorage', e);
    }
  }

  // After students are fetched, calculate their grades
  watch(students, async (newStudents) => {
    for (const student of newStudents) { 
      await getStudentCurrentGrade(student.user_id); 
    }
  }, { immediate: true }); // Run immediately if students are already loaded
});

// Modal control functions
const openEditStudentModal = (student: any) => {
  selectedStudent.value = { ...student }; 
  showEditStudentModal.value = true;
};

const openViewStudentDetailsModal = (student: any) => {
  selectedStudent.value = { ...student }; 
  showViewStudentDetailsModal.value = true;
};

const closeModals = () => {
  showEditStudentModal.value = false;
  showViewStudentDetailsModal.value = false;
  selectedStudent.value = null; 
};

// Functions for Assign Student to Course Modal
const openAssignStudentToCourseModal = () => {
  showAssignStudentToCourseModal.value = true;
};

const closeAssignStudentToCourseModal = () => {
  showAssignStudentToCourseModal.value = false;
  fetchLecturerCourses(); // Refresh the course list if needed
  fetchLecturerStudents(); // Refresh the student list after new enrollments
};

const handleAssignStudentsToCourse = async (payload: { courseId: number; studentIds: number[] }) => {
  console.log('Attempting to assign students:', payload.studentIds, 'to course:', payload.courseId);
  const token = sessionStorage.getItem('token');

  if (!token) {
    alert('Authentication token missing. Please log in again.');
    return;
  }

  try {
    const response = await fetch(`http://localhost:8219/courses/${payload.courseId}/add-students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ student_ids: payload.studentIds })
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message || 'Students assigned to course successfully!');
      closeAssignStudentToCourseModal();
      // Re-fetch all data that might be affected by new enrollments
      await fetchLecturerCourses(); 
      await fetchLecturerStudents(); 
    } else {
      alert(`Failed to assign students: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error assigning students to course:', error);
    alert('An error occurred while assigning students.');
  }
};


const handleUpdateStudent = async (updatedStudentData: any) => {
  console.log('Updating student:', updatedStudentData);
  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Authentication token missing. Please log in again.');
    return;
  }

  try {
    const response = await fetch(`http://localhost:8219/users/${updatedStudentData.user_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedStudentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to update student: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    alert(result.message || 'Student details updated successfully!');
    closeModals();
    await fetchLecturerStudents(); // Refresh the student list
  } catch (error) {
    console.error('Error updating student:', error);
    alert(`Error updating student: ${error.message}`);
  }
};

const createAssessment = () => {
  alert('Create Assessment logic goes here.');
};
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    uploadedFile.value = target.files[0];
    alert(`File "${uploadedFile.value.name}" selected.`);
  }
};
</script>

<style scoped>
/* Add any component-specific styles here if needed */
/* Example for input-field and btn-primary classes */
.input-field {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm;
}

.btn-primary {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500;
}

.btn-secondary {
  @apply inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500;
}

.card {
  @apply bg-white shadow overflow-hidden sm:rounded-lg p-6;
}

.table-row:hover {
  background-color: #f9fafb; /* Light gray on hover */
}
</style>
