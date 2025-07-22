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

            <div v-if="message"
                class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow-sm"
                role="alert">
                {{ message }}
            </div>
            <div v-if="errorMessage"
                class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
                {{ errorMessage }}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard title="Total Advisees" :value="totalAdvisees" :icon="UsersIcon" variant="primary" />
                <StatsCard title="At-Risk Students" :value="atRiskStudents" :icon="ExclamationTriangleIcon"
                    variant="danger" />
                <StatsCard title="Consultations This Month" :value="consultationsThisMonth" :icon="CalendarDaysIcon"
                    variant="secondary" />
                <StatsCard title="Average Advisee GPA" :value="averageAdviseeGPA.toFixed(2)" :icon="AcademicCapIcon"
                    variant="success" />
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
                                <div v-for="student in performanceOverview" :key="student.student_id"
                                    class="text-center">
                                    <div class="mb-2">
                                        <img :src="student.profile_picture || 'https://placehold.co/40x40/cccccc/000000?text=👤'"
                                            alt="" class="h-12 w-12 rounded-full mx-auto mb-1">
                                        <div class="text-xs font-medium text-gray-900">{{ student.full_name ?
                                            student.full_name.split(' ')[0] : student.username }}</div>
                                    </div>
                                    <div class="relative">
                                        <div class="w-full bg-gray-200 rounded-full h-2">
                                            <div :class="getPerformanceColor(student.gpa)"
                                                class="h-2 rounded-full transition-all duration-300"
                                                :style="{ width: (student.gpa / 4.0) * 100 + '%' }"></div>
                                        </div>
                                        <div class="text-xs text-gray-600 mt-1">GPA: {{ student.gpa !== null &&
                                            student.gpa !== undefined ? student.gpa.toFixed(2) : 'N/A' }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div class="space-y-3">
                        <button @click="activeTab = 'advisees'"
                            class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <div class="flex items-center space-x-3">
                                <UsersIcon class="h-5 w-5 text-gray-400" />
                                <span class="text-sm font-medium">View All Advisees</span>
                            </div>
                        </button>

                        <button @click="activeTab = 'atrisk'"
                            class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <div class="flex items-center space-x-3">
                                <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
                                <span class="text-sm font-medium">At-Risk Students</span>
                            </div>
                        </button>

                        <button @click="activeTab = 'consultations'"
                            class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <div class="flex items-center space-x-3">
                                <DocumentTextIcon class="h-5 w-5 text-gray-400" />
                                <span class="text-sm font-medium">Consultation Records</span>
                            </div>
                        </button>

                        <button @click="activeTab = 'reports'"
                            class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
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
    if (percentage >= 90) {
        return 4.00;
    } else if (percentage >= 80) { // 80-89
        return 4.00; // Note: A and A+ both give 4.00 based on your table
    } else if (percentage >= 75) { // 75-79
        return 3.67;
    } else if (percentage >= 70) { // 70-74
        return 3.33;
    } else if (percentage >= 65) { // 65-69
        return 3.00;
    } else if (percentage >= 60) { // 60-64
        return 2.67;
    } else if (percentage >= 55) { // 55-59
        return 2.33;
    } else if (percentage >= 50) { // 50-54
        return 2.00;
    } else if (percentage >= 45) { // 45-49
        return 1.67;
    } else if (percentage >= 40) { // 40-44
        return 1.33;
    } else if (percentage >= 35) { // 35-39
        return 1.00;
    } else if (percentage >= 30) { // 30-34
        return 0.67;
    } else { // 00-29
        return 0.00;
    }
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

