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
              @click="activeTab = 'upload'"
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
                <option value="CS101">CS101 - Programming Fundamentals</option>
                <option value="CS201">CS201 - Data Structures</option>
              </select>
              <button class="btn-primary text-sm">
                Add Student
              </button>
            </div>
          </div>
          
          <div v-if="isLoading"><p>Loading students...</p></div>
          <div v-else-if="students.length === 0" class="text-center py-8 text-gray-500">
            <p>No students found for this lecturer.</p>
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
                <tr v-for="student in students" :key="student.user_id" class="table-row">
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
                    <button class="text-primary-600 hover:text-primary-900">Edit</button>
                    <button class="text-secondary-600 hover:text-secondary-900">View Details</button>
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
              <label class="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <select v-model="gradeForm.courseId" class="input-field">
                <option value="">Select Course</option><option value="CS101">CS101</option><option value="CS201">CS201</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Assessment</label>
              <select v-model="gradeForm.assessmentId" class="input-field">
                <option value="">Select Assessment</option><option value="1">Quiz 1</option><option value="2">Assignment 1</option>
              </select>
            </div>
          </div>
          <div v-if="gradeForm.courseId && gradeForm.assessmentId" class="space-y-4">
            <h4 class="font-medium text-gray-700">Student Grades:</h4>
          </div>
        </div>

        <div v-if="activeTab === 'assessments'" class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Create New Assessment</h3>
          <form @submit.prevent="createAssessment" class="space-y-6">
          </form>
        </div>

        <div v-if="activeTab === 'upload'" class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Export Grades</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
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

// Interface for the user object from sessionStorage
interface User {
  id: string;
  username: string;
  name: string;
  user_id: string; 
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

const gradesStore = useGradesStore();
const currentUser = ref<User | null>(null);
const activeTab = ref('students');
const selectedCourse = ref('');

// This ref will hold the student data we fetch from the API
const students = ref<any[]>([]); 
const isLoading = ref(false); 
const studentGrades = reactive<Record<string, string>>({}); 

// All reactive variables needed by the template
const uploadedFile = ref<File | null>(null);
const gradeForm = reactive({ courseId: '', assessmentId: '' });
const assessmentForm = reactive({ title: '', type: '', courseId: '', totalMarks: '', weightage: '', dueDate: '', description: '' });
const uploadForm = reactive({ courseId: '', assessmentId: '' });

// Computed properties for the dashboard
const activeCourses = computed(() => 2); // Can be made dynamic later
const totalStudents = computed(() => students.value.length); // Now dynamic!
const pendingGrading = ref(12); // Mock
const classAverage = ref(78.5); // Mock

const classPerformanceData = { // Mock data for the chart
  labels: ['Quiz 1', 'Quiz 2', 'Assignment 1', 'Midterm', 'Assignment 2', 'Quiz 3', 'Final Exam'], // 7 elements
  values: [75, 78, 82, 76, 85, 79, 90] // 7 elements
};

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
    students.value = studentsData.students; // Populate students

  } catch (error) {
    console.error('Error fetching lecturer students:', error);
  } finally {
    isLoading.value = false; 
  }
}

async function fetchStudentMarks(studentId: string): Promise<Mark[]> {
  const token = sessionStorage.getItem('token'); 
  const response = await fetch(`http://localhost:8219/student-marks/all/${studentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Failed to fetch student marks:', response.statusText);
    return []; 
  }

  try {
    const data = await response.json();
    // Ensure the returned data is an array before processing
    if (Array.isArray(data)) {
      return data;
    } else {
      console.warn(`Expected an array of student marks, but received:`, data);
      // If it's a single object, wrap it in an array for calculateCurrentGrade
      if (typeof data === 'object' && data !== null) {
        return [data];
      }
      return []; 
    }
  } catch (error) {
    console.error('Error parsing student marks JSON:', error);
    return []; 
  }
}

function calculateCurrentGrade(studentMarks: Mark[]): string {
  let totalWeightedScoreSum = 0; 
  let totalWeightSum = 0;       

  studentMarks.forEach((mark: Mark) => {
    // Log the raw and parsed values for debugging
    console.log(`Processing mark:`, mark);
    const markObtained = parseFloat(mark.mark_obtained);
    const maxMark = parseFloat(mark.max_mark);
    const weightPercentage = parseFloat(mark.weight_percentage);

    console.log(`Parsed values - markObtained: ${markObtained}, maxMark: ${maxMark}, weightPercentage: ${weightPercentage}`);

    if (!isNaN(markObtained) && !isNaN(maxMark) && maxMark > 0 && !isNaN(weightPercentage)) {
      const scoreRatio = markObtained / maxMark; 
      const weightDecimal = weightPercentage / 100; 

      totalWeightedScoreSum += scoreRatio * weightDecimal;
      totalWeightSum += weightDecimal;
      console.log(`Valid mark - scoreRatio: ${scoreRatio}, weightDecimal: ${weightDecimal}, totalWeightedScoreSum: ${totalWeightedScoreSum}, totalWeightSum: ${totalWeightSum}`);
    } else {
      console.warn('Invalid mark data encountered (after parseFloat):', mark, { markObtained, maxMark, weightPercentage });
    }
  });

  if (totalWeightSum === 0) {
    console.log('Total weight sum is 0, returning 0.00%');
    return '0.00'; 
  }

  const finalGrade = (totalWeightedScoreSum / totalWeightSum) * 100;
  console.log(`Calculated final grade: ${finalGrade.toFixed(2)}%`);
  return finalGrade.toFixed(2);
}

async function getStudentCurrentGrade(studentId: string) {
  const marks = await fetchStudentMarks(studentId); 
  console.log(`Marks for student ${studentId}:`, marks);
  const grade = calculateCurrentGrade(marks); 
  console.log(`Grade for student ${studentId}:`, grade);

  studentGrades[studentId] = grade; 

  return grade; 
}

onMounted(async () => { 
  const userString = sessionStorage.getItem('user');
  if (userString) {
    try {
      currentUser.value = JSON.parse(userString);
      if (currentUser.value?.username) {
        await fetchLecturerStudents(); 
      }
    } catch (e) {
      console.error('Could not parse user from sessionStorage', e);
    }
  }

  for (const student of students.value) { 
    await getStudentCurrentGrade(student.user_id); 
  }
});

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
