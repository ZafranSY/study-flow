<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">My Advisees</h1>
        <p class="text-gray-600">A complete list of students you are advising.</p>
      </div>

      <div v-if="message" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md" role="alert">
        <p>{{ message }}</p>
      </div>
      <div v-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
        <p>{{ errorMessage }}</p>
      </div>

      <div class="card">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Student Records</h3>
          <div class="flex items-center space-x-3">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name or matric no..."
              class="input-field text-sm w-64"
            >
          </div>
        </div>

        <div v-if="isLoading" class="text-center py-10 text-gray-500">
          <p>Loading advisee data...</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GPA</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="filteredAdvisees.length === 0">
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                  No advisees found matching your search.
                </td>
              </tr>
              <tr v-for="student in filteredAdvisees" :key="student.student_id" class="table-row">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img :src="student.profile_picture || 'https://placehold.co/40x40/cccccc/000000?text=👤'" alt="Profile" class="h-10 w-10 rounded-full">
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ student.student_name }}</div>
                      <div class="text-sm text-gray-500">{{ student.matric_number }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ student.student_email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold" :class="getGpaColor(student.gpa)">
                  {{ student.gpa !== undefined ? student.gpa.toFixed(2) : 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusColor(student.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ student.status || 'N/A' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  <button @click="viewStudentDetails(student)" class="text-primary-600 hover:text-primary-900">View Details</button>
                  <button @click="logConsultation(student)" class="text-secondary-600 hover:text-secondary-900">Log Meeting</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ViewStudentDetailsModal :show="showViewStudentModal" :student="selectedStudent" @close="closeModals" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Navigation from '../components/shared/Navigation.vue';
import ViewStudentDetailsModal from '../components/modals/ViewStudentModal.vue';

interface Advisee {
  student_id: number;
  student_name: string;
  matric_number: string;
  student_email: string;
  profile_picture?: string;
  gpa?: number;
  status?: string;
}

const router = useRouter();
const advisees = ref<Advisee[]>([]);
const isLoading = ref(false);
const message = ref('');
const errorMessage = ref('');
const searchQuery = ref('');

const showViewStudentModal = ref(false);
const selectedStudent = ref<Advisee | null>(null);

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

const fetchAdvisees = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const headers = getAuthHeaders();
    if (!headers) return;

    const response = await fetch(`${API_BASE_URL}/advisor-student`, { headers });
    if (!response.ok) throw new Error('Failed to fetch advisee list.');
    
    const data = await response.json();
    
    // Fetch GPA for each student concurrently
    const adviseesWithDetails = await Promise.all(
      data.map(async (advisee: any) => {
        const marks = await fetchStudentMarks(advisee.student_id);
        const gpa = calculateGPA(marks);
        const status = gpa >= 2.5 ? 'Good Standing' : 'At Risk';
        
        // We need user details for the profile picture
        const userDetails = await fetchUserDetails(advisee.student_id);

        return {
            ...advisee,
            gpa,
            status,
            profile_picture: userDetails?.profile_picture,
        };
      })
    );
    advisees.value = adviseesWithDetails;

  } catch (error: any) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};

const fetchUserDetails = async (userId: number) => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return null;
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, { headers });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error(`Error fetching user details for ${userId}:`, error);
        return null;
    }
};

const fetchStudentMarks = async (studentId: number) => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return [];
        const response = await fetch(`${API_BASE_URL}/student-marks/all/${studentId}`, { headers });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error(`Error fetching marks for student ${studentId}:`, error);
        return [];
    }
};

const calculateGPA = (studentMarks: any[]): number => {
  const courseGrades: { [courseId: number]: { totalWeightedScore: number; totalWeight: number; creditHours: number } } = {};

  studentMarks.forEach(mark => {
    const { course_id, mark_obtained, max_mark, weight_percentage, credit_hours } = mark;
    const markObtainedNum = parseFloat(mark_obtained);
    const maxMarkNum = parseFloat(max_mark);
    const weightNum = parseFloat(weight_percentage);
    const creditHoursNum = parseFloat(credit_hours);

    if (isNaN(markObtainedNum) || isNaN(maxMarkNum) || isNaN(weightNum) || isNaN(creditHoursNum) || maxMarkNum === 0) return;

    if (!courseGrades[course_id]) {
      courseGrades[course_id] = { totalWeightedScore: 0, totalWeight: 0, creditHours: creditHoursNum };
    }

    courseGrades[course_id].totalWeightedScore += (markObtainedNum / maxMarkNum) * weightNum;
    courseGrades[course_id].totalWeight += weightNum;
  });

  let totalGradePoints = 0;
  let totalCreditHours = 0;

  for (const courseId in courseGrades) {
    const course = courseGrades[courseId];
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

const filteredAdvisees = computed(() => {
  if (!searchQuery.value) return advisees.value;
  const query = searchQuery.value.toLowerCase();
  return advisees.value.filter(student =>
    student.student_name?.toLowerCase().includes(query) ||
    student.matric_number?.toLowerCase().includes(query)
  );
});

const getStatusColor = (status?: string) => {
  if (status === 'At Risk') return 'bg-red-100 text-red-800';
  if (status === 'Good Standing') return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-800';
};

const getGpaColor = (gpa?: number) => {
  if (gpa === undefined) return 'text-gray-500';
  if (gpa < 2.5) return 'text-red-600';
  if (gpa < 3.5) return 'text-yellow-600';
  return 'text-green-600';
}

const viewStudentDetails = (student: Advisee) => {
    // The backend /users/{id} endpoint expects a `user_id`, which is `student_id` here
    const userPayload = { ...student, user_id: student.student_id, full_name: student.student_name, course_code: '' };
    selectedStudent.value = userPayload;
    showViewStudentModal.value = true;
};

const logConsultation = (student: Advisee) => {
    // This could open a new modal or navigate to a different page
    alert(`Navigating to log consultation for ${student.student_name}.`);
    // Example navigation: router.push(`/advisor/consultations/${student.student_id}`);
};

const closeModals = () => {
    showViewStudentModal.value = false;
    selectedStudent.value = null;
};

onMounted(fetchAdvisees);

</script>