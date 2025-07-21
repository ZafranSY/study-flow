
<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">
          Academic Advisor Dashboard
        </h1>
        <p class="text-gray-600">Monitor and support your advisee students</p>
      </div>

      <div v-if="message" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
        {{ message }}
      </div>
      <div v-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
        {{ errorMessage }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Advisees"
          :value="totalAdvisees"
          :icon="UsersIcon"
          variant="primary"
        />
        <StatsCard
          title="At-Risk Students"
          :value="atRiskStudents"
          :icon="ExclamationTriangleIcon"
          variant="danger"
        />
        <StatsCard
          title="Consultations This Month"
          :value="consultationsThisMonth"
          :icon="CalendarDaysIcon"
          variant="secondary"
        />
        <StatsCard
          title="Average Advisee GPA"
          :value="averageAdviseeGPA.toFixed(2)"
          :icon="AcademicCapIcon"
          variant="success"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Student Performance Overview</h3>
            <div class="h-64">
              <div v-if="advisees.length === 0" class="text-center text-gray-500 py-10">
                No advisees found for performance overview.
              </div>
              <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
                <div v-for="student in performanceOverview" :key="student.student_id" class="text-center">
                  <div class="mb-2">
                    <img :src="student.profile_picture || 'https://placehold.co/40x40/cccccc/000000?text=👤'" alt="" class="h-12 w-12 rounded-full mx-auto mb-1">
                    <div class="text-xs font-medium text-gray-900">{{ student.full_name ? student.full_name.split(' ')[0] : student.username }}</div>
                  </div>
                  <div class="relative">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        :class="getPerformanceColor(student.gpa)"
                        class="h-2 rounded-full transition-all duration-300"
                        :style="{ width: (student.gpa / 4.0) * 100 + '%' }"
                      ></div>
                    </div>
                    <div class="text-xs text-gray-600 mt-1">GPA: {{ student.gpa !== null && student.gpa !== undefined ? student.gpa.toFixed(2) : 'N/A' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <button
              @click="activeTab = 'advisees'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <UsersIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">View All Advisees</span>
              </div>
            </button>

            <button
              @click="activeTab = 'atrisk'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
                <span class="text-sm font-medium">At-Risk Students</span>
              </div>
            </button>

            <button
              @click="activeTab = 'consultations'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <DocumentTextIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">Consultation Records</span>
              </div>
            </button>

            <button
              @click="activeTab = 'reports'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <ChartBarIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">Generate Reports</span>
              </div>
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
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

import Navigation from '../components/shared/Navigation.vue'
import StatsCard from '../components/shared/StatsCard.vue'

const activeTab = ref('advisees')
const searchQuery = ref('')
const showNewConsultationForm = ref(false)
const API_BASE_URL = 'http://localhost:8219';
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

const getAuthHeaders = () => {
  const jwtToken = sessionStorage.getItem('token');
  if (!jwtToken) {
    console.error('JWT Token not found in sessionStorage. Redirecting to login.');
    setErrorMessage('You are not logged in or your session has expired. Please log in.');
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
    throw new Error('Authentication required.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  };
};

const advisees = ref<any[]>([])
const totalAdvisees = computed(() => advisees.value.length)
const atRiskStudents = computed(() => advisees.value.filter(student => student.gpa !== null && student.gpa < 2.5).length)
const consultationsThisMonth = ref(0)
const averageAdviseeGPA = computed(() => {
  if (advisees.value.length === 0) return 0;
  const studentsWithGpa = advisees.value.filter(student => typeof student.gpa === 'number');
  if (studentsWithGpa.length === 0) return 0;
  const totalGpa = studentsWithGpa.reduce((sum, student) => sum + student.gpa, 0);
  return totalGpa / studentsWithGpa.length;
})

const fetchUserDetails = async (userId: number) => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, { headers });
    const data = await response.json();

    if (!response.ok) {
      console.warn(`Failed to fetch details for user ${userId}:`, data.error || 'Unknown error');
      return null;
    }
    return data;
  } catch (error: any) {
    console.error(`Error fetching user details for ${userId}:`, error);
    return null;
  }
};

const fetchStudentMarks = async (studentId: number) => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/student-marks/all/${studentId}`, { headers });
    if (!response.ok) return [];
    return await response.json();
  } catch (error: any) {
    console.error(`Error fetching marks for student ${studentId}:`, error);
    return [];
  }
};

const calculateGPA = (studentMarks: any[]): number => {
  if (!studentMarks || studentMarks.length === 0) return 0.0;
  const courseData: { [key: number]: { totalWeightedScore: number; totalWeight: number; creditHours: number } } = {};

  studentMarks.forEach(mark => {
    const markObtainedNum = parseFloat(mark.mark_obtained) || 0;
    const maxMarkNum = parseFloat(mark.max_mark) || 0;
    const weightNum = parseFloat(mark.weight_percentage) || 0;
    const creditHoursNum = parseFloat(mark.credit_hours) || 0;

    if (maxMarkNum === 0 || creditHoursNum === 0) return;

    if (!courseData[mark.course_id]) {
      courseData[mark.course_id] = { totalWeightedScore: 0, totalWeight: 0, creditHours: creditHoursNum };
    }

    courseData[mark.course_id].totalWeightedScore += (markObtainedNum / maxMarkNum) * weightNum;
    courseData[mark.course_id].totalWeight += weightNum;
  });

  let totalGradePoints = 0;
  let totalCreditHours = 0;

  for (const courseId in courseData) {
    const course = courseData[courseId];
    if (course.totalWeight > 0) {
      const finalPercentage = (course.totalWeightedScore / course.totalWeight) * 100;
      const gradePoint = convertPercentageToGradePoint(finalPercentage);
      totalGradePoints += gradePoint * course.creditHours;
      totalCreditHours += course.creditHours;
    }
  }

  return totalCreditHours === 0 ? 0 : totalGradePoints / totalCreditHours;
};

const convertPercentageToGradePoint = (percentage: number): number => {
  if (percentage >= 90) return 4.0;
  if (percentage >= 80) return 3.0;
  if (percentage >= 70) return 2.0;
  if (percentage >= 60) return 1.0;
  return 0.0;
};

const fetchAdvisees = async () => {
  setMessage('')
  setErrorMessage('')
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/advisor-student`, { headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch advisees summary');
    }

    const detailedAdviseesPromises = data.map(async (adviseeSummary: any) => {
      const [studentMarks, userDetails] = await Promise.all([
        fetchStudentMarks(adviseeSummary.student_id),
        fetchUserDetails(adviseeSummary.student_id)
      ]);
      
      const gpa = calculateGPA(studentMarks);

      let status = 'N/A';
      if (gpa !== null && gpa !== undefined) {
          if (gpa >= 3.5) status = 'Excellent';
          else if (gpa >= 2.5) status = 'Good Standing';
          else if (gpa < 2.5 && gpa > 0) status = 'At Risk';
          else status = 'N/A';
      }

      return {
        ...adviseeSummary,
        full_name: adviseeSummary.student_name,
        profile_picture: userDetails?.profile_picture || null,
        gpa: gpa, 
        status: status,
        last_meeting: adviseeSummary.last_meeting_date || null,
        program: adviseeSummary.program || null,
      };
    });

    advisees.value = await Promise.all(detailedAdviseesPromises);

  } catch (error: any) {
    console.error('Error fetching advisees:', error);
    if (error.message !== 'Authentication required.') {
      setErrorMessage(error.message || 'Could not fetch advisees.');
    }
    advisees.value = [];
  }
};

const performanceOverview = computed(() =>
  advisees.value.slice(0, 8).map(student => ({
    student_id: student.student_id,
    full_name: student.full_name,
    gpa: student.gpa,
    profile_picture: student.profile_picture
  }))
)

const getPerformanceColor = (gpa: number | undefined) => {
  if (gpa === undefined || gpa < 0 || gpa === null) return 'bg-gray-500';
  if (gpa >= 3.5) return 'bg-green-500';
  if (gpa >= 3.0) return 'bg-blue-500';
  if (gpa >= 2.5) return 'bg-yellow-500';
  return 'bg-red-500';
}

const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'Excellent':
      return 'bg-green-100 text-green-800'
    case 'Good Standing':
      return 'bg-blue-100 text-blue-800'
    case 'At Risk':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const viewStudentDetails = (student: any) => {
  alert(`Viewing details for ${student.full_name || student.matric_number}`)
}

const scheduleConsultation = (student: any) => {
  alert(`Scheduling consultation for ${student.full_name || student.matric_number}`)
}

const getStudentName = (student_id: string) => {
  const student = advisees.value.find(s => s.student_id === student_id)
  return student ? student.full_name : 'Unknown Student'
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (e) {
    console.error("Invalid date string:", dateString);
    return 'Invalid Date';
  }
}

onMounted(async () => {
  await fetchAdvisees();
});
</script>




<!-- <template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">
          Academic Advisor Dashboard
        </h1>
        <p class="text-gray-600">Monitor and support your advisee students</p>
      </div>

      <div v-if="message" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
        {{ message }}
      </div>
      <div v-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
        {{ errorMessage }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Advisees"
          :value="totalAdvisees"
          :icon="UsersIcon"
          variant="primary"
        />
        <StatsCard
          title="At-Risk Students"
          :value="atRiskStudents"
          :icon="ExclamationTriangleIcon"
          variant="danger"
        />
        <StatsCard
          title="Consultations This Month"
          :value="consultationsThisMonth"
          :icon="CalendarDaysIcon"
          variant="secondary"
        />
        <StatsCard
          title="Average Advisee GPA"
          :value="averageAdviseeGPA.toFixed(2)"
          :icon="AcademicCapIcon"
          variant="success"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Student Performance Overview</h3>
            <div class="h-64">
              <div v-if="advisees.length === 0" class="text-center text-gray-500 py-10">
                No advisees found for performance overview.
              </div>
              <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
                <div v-for="student in performanceOverview" :key="student.student_id" class="text-center">
                  <div class="mb-2">
                    <img :src="student.profile_picture || 'https://placehold.co/40x40/cccccc/000000?text=👤'" alt="" class="h-12 w-12 rounded-full mx-auto mb-1">
                    <div class="text-xs font-medium text-gray-900">{{ student.full_name ? student.full_name.split(' ')[0] : student.username }}</div>
                  </div>
                  <div class="relative">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        :class="getPerformanceColor(student.gpa)"
                        class="h-2 rounded-full transition-all duration-300"
                        :style="{ width: (student.gpa / 4.0) * 100 + '%' }"
                      ></div>
                    </div>
                    <div class="text-xs text-gray-600 mt-1">GPA: {{ student.gpa !== null && student.gpa !== undefined ? student.gpa.toFixed(2) : 'N/A' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <button
              @click="activeTab = 'advisees'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <UsersIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">View All Advisees</span>
              </div>
            </button>

            <button
              @click="activeTab = 'atrisk'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
                <span class="text-sm font-medium">At-Risk Students</span>
              </div>
            </button>

            <button
              @click="activeTab = 'consultations'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <DocumentTextIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">Consultation Records</span>
              </div>
            </button>

            <button
              @click="activeTab = 'reports'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <ChartBarIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">Generate Reports</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <div v-if="activeTab === 'advisees'" class="card">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">All Advisees</h3>
            <div class="flex items-center space-x-3">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search students..."
                class="input-field text-sm w-64"
              >
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matric No.
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GPA
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Meeting
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="filteredAdvisees.length === 0">
                  <td colspan="6" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No advisees found.
                  </td>
                </tr>
                <tr v-else v-for="student in filteredAdvisees" :key="student.student_id" class="table-row">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <img :src="student.profile_picture || 'https://placehold.co/40x40/cccccc/000000?text=👤'" alt="Profile Picture" class="h-8 w-8 rounded-full">
                      <div class="ml-3">
                        <div class="text-sm font-medium text-gray-900">{{ student.full_name }}</div>
                        <div class="text-sm text-gray-500">{{ student.program }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ student.matric_number }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ student.gpa !== null && student.gpa !== undefined ? student.gpa.toFixed(2) : 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusColor(student.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ student.status || 'N/A' }} </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(student.last_meeting) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      @click="viewStudentDetails(student)"
                      class="text-primary-600 hover:text-primary-900"
                    >
                      View Details
                    </button>
                    <button
                      @click="scheduleConsultation(student)"
                      class="text-secondary-600 hover:text-secondary-900"
                    >
                      Schedule Meeting
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="activeTab === 'atrisk'" class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">At-Risk Students Requiring Attention</h3>

          <div v-if="atRiskStudentsList.length === 0" class="text-center text-gray-500 py-10">
            No at-risk advisees found.
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="student in atRiskStudentsList" :key="student.student_id" class="border border-red-200 rounded-lg p-4 bg-red-50">
              <div class="flex items-start space-x-4">
                <img :src="student.profile_picture || 'https://placehold.co/40x40/cccccc/000000?text=👤'" alt="" class="h-12 w-12 rounded-full">
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <h4 class="text-sm font-medium text-gray-900">{{ student.full_name }}</h4>
                    <span class="text-xs text-red-600 font-medium">{{ student.matric_number }}</span>
                  </div>

                  <div class="mt-2 space-y-1">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-600">Current GPA:</span>
                      <span class="font-medium text-red-600">{{ student.gpa !== null && student.gpa !== undefined ? student.gpa.toFixed(2) : 'N/A' }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-600">Risk Factors:</span>
                      <span class="text-red-600">{{ student.risk_factors && student.risk_factors.length > 0 ? student.risk_factors.join(', ') : 'N/A' }}</span>
                    </div>
                  </div>

                  <div class="mt-3 flex space-x-2">
                    <button class="text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700">
                      Schedule Urgent Meeting
                    </button>
                    <button class="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700">
                      Add Notes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'consultations'" class="card">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Consultation Records</h3>
            <button
              @click="showNewConsultationForm = true"
              class="btn-primary"
            >
              Add New Record
            </button>
          </div>

          <div v-if="showNewConsultationForm" class="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 class="font-medium text-gray-900 mb-3">New Consultation Record</h4>
            <form @submit.prevent="addConsultationRecord" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Student</label>
                  <select v-model="consultationForm.student_id" class="input-field" required>
                    <option value="">Select Student</option>
                    <option v-for="student in advisees" :key="student.student_id" :value="student.student_id">
                      {{ student.full_name }} ({{ student.matric_number }})
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input v-model="consultationForm.date" type="date" class="input-field" required>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Meeting Notes</label>
                <textarea v-model="consultationForm.notes" rows="3" class="input-field" required></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                <textarea v-model="consultationForm.recommendations" rows="2" class="input-field" placeholder="Enter recommendations separated by commas"></textarea>
              </div>

              <div class="flex items-center">
                <input v-model="consultationForm.follow_up_required" type="checkbox" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                <label class="ml-2 text-sm text-gray-700">Follow-up required</label>
              </div>

              <div class="flex justify-end space-x-3">
                <button type="button" @click="showNewConsultationForm = false" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Save Record</button>
              </div>
            </form>
          </div>

          <div class="space-y-4">
            <div v-if="consultationRecords.length === 0" class="text-center text-gray-500 py-10">
              No consultation records found.
            </div>
            <div v-else v-for="record in consultationRecords" :key="record.id" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <h4 class="font-medium text-gray-900">{{ getStudentName(record.student_id) }}</h4>
                    <span class="text-sm text-gray-500">{{ formatDate(record.date) }}</span>
                    <span v-if="record.follow_up_required" class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      Follow-up Required
                    </span>
                  </div>

                  <p class="text-sm text-gray-600 mb-2">{{ record.notes }}</p>

                  <div v-if="record.recommendations && record.recommendations.length > 0" class="text-sm">
                    <span class="font-medium text-gray-700">Recommendations:</span>
                    <ul class="list-disc list-inside text-gray-600 ml-4">
                      <li v-for="recommendation in record.recommendations" :key="recommendation">
                        {{ recommendation }}
                      </li>
                    </ul>
                  </div>
                </div>

                <button class="text-primary-600 hover:text-primary-900 text-sm">
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'reports'" class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Generate Reports</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="border border-gray-200 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">Individual Student Report</h4>
              <div class="space-y-3">
                <select class="input-field">
                  <option value="">Select Student</option>
                  <option v-for="student in advisees" :key="student.student_id" :value="student.student_id">
                    {{ student.full_name }}
                  </option>
                </select>
                <button class="w-full btn-primary">Generate Student Report</button>
              </div>
            </div>

            <div class="border border-gray-200 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">Summary Report</h4>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm text-gray-600 mb-1">Report Period</label>
                  <select class="input-field">
                    <option value="current">Current Semester</option>
                    <option value="previous">Previous Semester</option>
                    <option value="academic_year">Academic Year</option>
                  </select>
                </div>
                <button class="w-full btn-primary">Generate Summary Report</button>
              </div>
            </div>
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
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

import Navigation from '../components/shared/Navigation.vue'
import StatsCard from '../components/shared/StatsCard.vue'

const activeTab = ref('advisees')
const searchQuery = ref('')
const showNewConsultationForm = ref(false)

// API Base URL
const API_BASE_URL = 'http://localhost:8219';

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

// Reactive data for advisees (will be populated by API)
const advisees = ref<any[]>([])

// Stats - now computed from fetched data
const totalAdvisees = computed(() => advisees.value.length)
const atRiskStudents = computed(() => advisees.value.filter(student => student.gpa !== null && student.gpa < 2.5).length) // Assuming GPA < 2.5 is "At Risk"
const consultationsThisMonth = ref(0) // This would require a separate API call or more complex filtering on fetched consultation records
const averageAdviseeGPA = computed(() => {
  if (advisees.value.length === 0) return 0;
  // Filter out students with null/undefined GPA before calculating average
  const studentsWithGpa = advisees.value.filter(student => typeof student.gpa === 'number');
  if (studentsWithGpa.length === 0) return 0;
  const totalGpa = studentsWithGpa.reduce((sum, student) => sum + student.gpa, 0);
  return totalGpa / studentsWithGpa.length;
})

// --- API Interactions ---

/**
 * Fetches user details by ID, specifically for profile_picture and other potential fields.
 * This function is now optional and will only be called if you need specific user details
 * that are NOT provided by the student-marks/student/{id} endpoint.
 * @param {number} userId - The ID of the user (student) to fetch.
 * @returns {Promise<object|null>} - The user object or null if an error occurs.
 */
const fetchUserDetails = async (userId: number) => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, { headers });
    const data = await response.json();

    if (!response.ok) {
      console.warn(`Failed to fetch details for user ${userId}:`, data.error || 'Unknown error');
      return null;
    }
    return data;
  } catch (error: any) {
    console.error(`Error fetching user details for ${userId}:`, error);
    return null;
  }
};

/**
 * Fetches student marks for a given student ID.
 * This endpoint now returns marks, max_mark, weight_percentage, and credit_hours.
 * @param {number} studentId - The ID of the student.
 * @returns {Promise<Array<any>>} - An array of mark objects or empty array.
 */
const fetchStudentMarks = async (studentId: number) => {
  try {
    const headers = getAuthHeaders();
const response = await fetch(`${API_BASE_URL}/student-marks/all/${studentId}`, { headers });
    const data = await response.json();

    // Check if the response is not OK (e.g., 403, 405, 500)
    if (!response.ok) {
        // If the server returns HTML instead of JSON (e.g., for 405 Method Not Allowed)
        // the .json() parsing will fail, leading to SyntaxError.
        // We can try to read it as text to log the actual server response.
        const errorText = await response.text();
        console.error(`Failed to fetch marks for student ${studentId}: Status ${response.status}, Error: ${errorText}`);
        setErrorMessage(`Failed to load student marks. Server responded with: ${response.status} ${response.statusText}. Please check backend logs.`);
        return [];
    }
    return data;
  } catch (error: any) {
    // This catch block will handle network errors or JSON parsing errors (like SyntaxError)
    console.error(`Error fetching marks for student ${studentId}:`, error);
    setErrorMessage(`Network error or data parsing issue for student marks. Details: ${error.message}`);
    return [];
  }
};

/**
 * Calculates the GPA for a single student based on their marks, component weights, and course credit hours.
 * @param {Array<any>} studentMarks - Array of mark objects for a student.
 * @returns {number} - The calculated GPA.
 */
const calculateGPA = (studentMarks: any[]): number => {
  const courseGrades: { [courseId: number]: { totalWeightedScore: number; totalWeight: number; creditHours: number } } = {};

  studentMarks.forEach(mark => {
    const courseId = mark.course_id;
    const markObtained = parseFloat(mark.mark_obtained);
    const maxMark = parseFloat(mark.max_mark);
    const weightPercentage = parseFloat(mark.weight_percentage);
    const creditHours = parseFloat(mark.credit_hours);

    // Skip if essential data is missing or invalid
    if (isNaN(markObtained) || isNaN(maxMark) || isNaN(weightPercentage) || isNaN(creditHours) || maxMark === 0) {
      console.warn(`Skipping invalid mark data for course ${courseId}, component ${mark.component_id}:`, mark);
      return;
    }

    // Convert mark to a percentage of the component's max mark
    const componentScore = (markObtained / maxMark) * weightPercentage;

    if (!courseGrades[courseId]) {
      courseGrades[courseId] = {
        totalWeightedScore: 0,
        totalWeight: 0,
        creditHours: creditHours // Store credit hours for the course
      };
    }

    courseGrades[courseId].totalWeightedScore += componentScore;
    courseGrades[courseId].totalWeight += weightPercentage;
  });

  let totalGradePoints = 0;
  let totalCreditHours = 0;

  for (const courseId in courseGrades) {
    const course = courseGrades[courseId];
    // Ensure totalWeight is not zero to avoid division by zero
    if (course.totalWeight > 0) {
      const finalCoursePercentage = (course.totalWeightedScore / course.totalWeight) * 100;
      const gradePoint = convertPercentageToGradePoint(finalCoursePercentage);
      totalGradePoints += gradePoint * course.creditHours;
      totalCreditHours += course.creditHours;
    }
  }

  if (totalCreditHours === 0) {
    return 0; // Avoid division by zero if no valid courses with credit hours
  }

  return totalGradePoints / totalCreditHours;
};

/**
 * Converts a percentage score to a GPA grade point (e.g., 90% -> 4.0, 80% -> 3.0).
 * This is a simplified example and should be adjusted to your institution's grading scale.
 * @param {number} percentage - The final percentage score for a course.
 * @returns {number} - The corresponding grade point.
 */
const convertPercentageToGradePoint = (percentage: number): number => {
  if (percentage >= 90) return 4.0;
  if (percentage >= 80) return 3.0;
  if (percentage >= 70) return 2.0;
  if (percentage >= 60) return 1.0;
  return 0.0;
};


/**
 * Fetches advisee students from the backend and then fetches their full user details and calculates GPA.
 */
const fetchAdvisees = async () => {
  setMessage('')
  setErrorMessage('')
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/advisor-student`, { headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch advisees summary');
    }

    // Use Promise.all to fetch all marks and user details concurrently
    const detailedAdviseesPromises = data.map(async (adviseeSummary: any) => {
      // Concurrently fetch student marks and user details (for the profile picture)
      const [studentMarks, userDetails] = await Promise.all([
        fetchStudentMarks(adviseeSummary.student_id),
        fetchUserDetails(adviseeSummary.student_id)
      ]);
      
      // Calculate GPA for the student
      const gpa = calculateGPA(studentMarks);

      // Determine student status based on GPA (example logic)
      let status = 'N/A';
      if (gpa !== null && gpa !== undefined) {
          if (gpa >= 3.5) status = 'Excellent';
          else if (gpa >= 2.5) status = 'Good Standing';
          else if (gpa < 2.5 && gpa > 0) status = 'At Risk'; // Consider 0 GPA as also at risk if no courses
          else status = 'N/A'; // For cases where GPA is 0 due to no courses/marks
      }

      // We can get full_name and matric_number directly from adviseeSummary
      // If profile_picture is not available from student-marks endpoint, you might need
      // to rely on a placeholder or a separate /users/{id} call if absolutely necessary
      // and if that endpoint's permissions are adjusted.
      return {
        ...adviseeSummary, // Keep all fields from /advisor-student
        full_name: adviseeSummary.student_name, // Use student_name from advisor-student endpoint
        profile_picture: userDetails?.profile_picture || null, // Use profile_picture from the user details API call
        gpa: gpa, 
        status: status, // Dynamically set status based on calculated GPA
        last_meeting: adviseeSummary.last_meeting_date || null, // Use last_meeting_date from the updated backend API response
        program: adviseeSummary.program || null, // Assuming this comes from advisor-student
      };
    });

    advisees.value = await Promise.all(detailedAdviseesPromises);

  } catch (error: any) {
    console.error('Error fetching advisees:', error);
    if (error.message !== 'Authentication required.') {
      setErrorMessage(error.message || 'Could not fetch advisees.');
    }
    advisees.value = []; // Clear advisees on error
  }
};

/**
 * Fetches consultation records (advisor notes) from the backend.
 */
const fetchConsultationRecords = async () => {
  setMessage('')
  setErrorMessage('')
  try {
    const headers = getAuthHeaders();
    // Updated API endpoint from /consultations to /advisor-notes
    const response = await fetch(`${API_BASE_URL}/advisor-notes`, { headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch consultation records');
    }
    consultationRecords.value = data;
    // You might also update consultationsThisMonth here by filtering 'data'

  } catch (error: any) {
    console.error('Error fetching consultation records:', error);
    if (error.message !== 'Authentication required.') {
      setErrorMessage(error.message || 'Could not fetch consultation record.');
    }
    consultationRecords.value = [];
  }
};

// Initial state for the consultation form (fields updated to match potential backend)
const consultationForm = reactive({
  student_id: '', // Changed from studentId to student_id for backend consistency
  date: '',
  notes: '',
  recommendations: '', // Will send as comma-separated string, backend should parse or array
  follow_up_required: false // Changed from followUpRequired to follow_up_required
});


/**
 * Adds a new consultation record (advisor note) via API.
 */
const addConsultationRecord = async () => {
  setMessage('')
  setErrorMessage('')
  try {
    const headers = getAuthHeaders();
    const payload = {
      // Assuming 'advisor_student_id' is needed based on your backend table 'advisor_notes'
      // You'll need to fetch or derive this from the selected student_id and advisor_id.
      // For now, let's assume `student_id` directly maps or is used to find it on the backend.
      // If your 'advisor_notes' table requires 'advisor_student_id', you will need to add logic
      // to retrieve that ID from your 'advisees' data or from another API call.
      // For simplicity, I'm mapping `student_id` directly to a hypothetical `student_id` field in the payload
      // that your backend might use to derive `advisor_student_id`.
      student_id: consultationForm.student_id,
      date: consultationForm.date,
      notes: consultationForm.notes,
      recommendations: consultationForm.recommendations ? consultationForm.recommendations.split(',').map(r => r.trim()) : [],
      follow_up_required: consultationForm.follow_up_required
    };

    // Updated API endpoint from /consultations to /advisor-notes
    const response = await fetch(`${API_BASE_URL}/advisor-notes`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to add consultation record');
    }

    setMessage(data.message || 'Consultation record added successfully!');
    showNewConsultationForm.value = false;
    // Reset form
    Object.assign(consultationForm, {
      student_id: '',
      date: '',
      notes: '',
      recommendations: '',
      follow_up_required: false
    });
    fetchConsultationRecords(); // Re-fetch to update the list

  } catch (error: any) {
    console.error('Error adding consultation record:', error);
    if (error.message !== 'Authentication required.') {
      setErrorMessage(error.message || 'Could not add consultation record.');
    }
  }
};


// Computed properties that now use `advisees.value`
const performanceOverview = computed(() =>
  advisees.value.slice(0, 8).map(student => ({
    student_id: student.student_id,
    full_name: student.full_name,
    gpa: student.gpa,
    profile_picture: student.profile_picture
  }))
)

const filteredAdvisees = computed(() => {
  if (!searchQuery.value) return advisees.value;
  return advisees.value.filter(student =>
    (student.full_name && student.full_name.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
    (student.matric_number && student.matric_number.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
})

const atRiskStudentsList = computed(() =>
  advisees.value.filter(student => student.gpa !== null && student.gpa < 2.5) // Filter based on calculated GPA
)

// Reactive data for consultation records (will be populated by API)
const consultationRecords = ref<any[]>([])


const getPerformanceColor = (gpa: number | undefined) => {
  if (gpa === undefined || gpa < 0 || gpa === null) return 'bg-gray-500'; // Handle undefined, negative, or null GPA
  if (gpa >= 3.5) return 'bg-green-500';
  if (gpa >= 3.0) return 'bg-blue-500';
  if (gpa >= 2.5) return 'bg-yellow-500';
  return 'bg-red-500';
}

const getStatusColor = (status: string | null) => { // Added null to type
  switch (status) {
    case 'Excellent':
      return 'bg-green-100 text-green-800'
    case 'Good Standing':
      return 'bg-blue-100 text-blue-800'
    case 'At Risk':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const viewStudentDetails = (student: any) => {
  alert(`Viewing details for ${student.full_name || student.matric_number}`)
}

const scheduleConsultation = (student: any) => {
  alert(`Scheduling consultation for ${student.full_name || student.matric_number}`)
}

const getStudentName = (student_id: string) => {
  const student = advisees.value.find(s => s.student_id === student_id)
  return student ? student.full_name : 'Unknown Student'
}

const formatDate = (dateString: string | null) => { // Added null to type
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (e) {
    console.error("Invalid date string:", dateString);
    return 'Invalid Date';
  }
}

// Fetch data when the component is mounted
onMounted(async () => {
  await fetchAdvisees(); // Wait for advisees to be fetched first
  await fetchConsultationRecords(); // Then fetch consultation records
});
</script>

<style scoped>
/* Scoped styles remain as they are, no changes needed for GPA functionality */
.card {
  @apply bg-white p-6 rounded-lg shadow-md;
}

.input-field {
  @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm;
}

.btn-primary {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}

.btn-secondary {
  @apply inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}

.table-row:hover {
  background-color: #f5f5f5;
}
</style> -->
