<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Navigation from '../components/shared/Navigation.vue';
import ViewStudentDetailsModal from '../components/modals/ViewStudentModal.vue';
import LogMeetingModal from '../components/modals/LogMeetingModal.vue';

// Define interfaces for data structures
interface Advisee {
    advisor_student_id: number;
    student_id: number;
    student_name: string;
    matric_number: string;
    student_email: string;
    profile_picture?: string;
    gpa: number;
    status: string;
    last_meeting_date?: string;
}

interface StudentMark {
    course_id: number;
    mark_obtained: string;
    max_mark: string;
    weight_percentage: string;
    credit_hours: string;
}

// Interface for Advisor Note, matching the API response
interface AdvisorNote {
    note_id: number;
    advisor_student_id: number;
    note_content: string;
    meeting_date: string;
    recommendations?: string[];
    follow_up_required?: boolean;
    created_at: string;
    updated_at: string;
    advisor_id: number;
    student_id: number;
    advisor_name: string;
    student_name: string;
    matric_number: string;
}

const router = useRouter();
const advisees = ref<Advisee[]>([]);
const isLoading = ref(false);
const message = ref('');
const errorMessage = ref('');
const searchQuery = ref('');
const showViewStudentModal = ref(false);
const selectedStudent = ref<any | null>(null);
const showLogMeetingModal = ref(false);
const studentToLogMeeting = ref<Advisee | null>(null);
const previousAdvisorNotes = ref<AdvisorNote[]>([]); // New state for previous notes

const API_BASE_URL = 'http://localhost:8219';

/**
 * Retrieves authentication headers from session storage.
 * Redirects to login if token is missing.
 */
const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        errorMessage.value = 'Authentication error. Please log in again.';
        router.push('/login');
        return null;
    }
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
};

/**
 * Handles the 'save-note' event from the modal and sends data to the backend.
 * This function is for creating NEW notes.
 */
const handleSaveNote = async (noteData: { meeting_date: string, note_content: string, recommendations: string[], follow_up_required: boolean }) => {
    if (!studentToLogMeeting.value) return;

    message.value = '';
    errorMessage.value = '';

    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        // Payload for saving a new note to match the API specification
        const payload = {
            student_id: studentToLogMeeting.value.student_id, // Use student_id as per API
            date: noteData.meeting_date, // Use 'date' as per API
            notes: noteData.note_content, // Use 'notes' as per API
            recommendations: noteData.recommendations,
            follow_up_required: noteData.follow_up_required,
        };

        const response = await fetch(`${API_BASE_URL}/advisor-notes`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to save note');
        }

        message.value = result.message || 'Meeting note saved successfully!';
        closeLogMeetingModal();
        fetchAdvisees(); // Re-fetch advisees to update last meeting date if applicable

    } catch (error: any) {
        errorMessage.value = error.message;
    }
};

/**
 * Handles the 'update-note' event from the modal and sends data to the backend.
 * This function is for updating EXISTING notes.
 */
const handleUpdateNote = async (noteId: number, noteData: { meeting_date: string, note_content: string, recommendations: string[], follow_up_required: boolean }) => {
    message.value = '';
    errorMessage.value = '';

    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        // Payload for updating an existing note - only 'notes', 'date', 'recommendations', 'follow_up_required' are updated
        const payload = {
            notes: noteData.note_content,
            date: noteData.meeting_date,
            recommendations: noteData.recommendations,
            follow_up_required: noteData.follow_up_required,
        };

        const response = await fetch(`${API_BASE_URL}/advisor-notes/${noteId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to update note');
        }

        message.value = result.message || 'Meeting note updated successfully!';
        closeLogMeetingModal();
        fetchAdvisees(); // Re-fetch advisees to ensure updated data is displayed
    } catch (error: any) {
        errorMessage.value = error.message;
    }
};


/**
 * Fetches the list of advisees and their details (GPA, status, profile picture).
 */
const fetchAdvisees = async () => {
    isLoading.value = true;
    errorMessage.value = '';
    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        const response = await fetch(`${API_BASE_URL}/advisor-student`, { headers });
        if (!response.ok) throw new Error('Failed to fetch advisee list.');

        const baseAdvisees = await response.json();

        const detailedAdvisees = await Promise.all(
            baseAdvisees.map(async (advisee: any) => {
                const [marks, userDetails] = await Promise.all([
                    fetchStudentMarks(advisee.student_id),
                    fetchUserDetails(advisee.student_id)
                ]);

                const gpa = calculateGPA(marks);
                const status = gpa >= 2.5 ? 'Good Standing' : 'At Risk';

                return {
                    ...advisee,
                    gpa,
                    status,
                    profile_picture: userDetails?.profile_picture,
                };
            })
        );
        advisees.value = detailedAdvisees;

    } catch (error: any) {
        errorMessage.value = error.message;
    } finally {
        isLoading.value = false;
    }
};

/**
 * Fetches user details for a given user ID.
 */
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

/**
 * Fetches all student marks for a given student ID.
 */
const fetchStudentMarks = async (studentId: number): Promise<StudentMark[]> => {
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

/**
 * Fetches all advisor notes and filters them for a specific student.
 */
const fetchAdvisorNotesForStudent = async (advisorStudentId: number): Promise<AdvisorNote[]> => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return [];

        const response = await fetch(`${API_BASE_URL}/advisor-notes`, { headers });
        if (!response.ok) {
            throw new Error('Failed to fetch advisor notes.');
        }
        const allNotes: AdvisorNote[] = await response.json();
        // Filter notes by the specific advisor_student_id
        return allNotes.filter(note => note.advisor_student_id === advisorStudentId);
    } catch (error) {
        console.error('Error fetching advisor notes:', error);
        errorMessage.value = 'Failed to load previous meeting notes.';
        return [];
    }
};

/**
 * Calculates GPA based on student marks.
 */
const calculateGPA = (studentMarks: StudentMark[]): number => {
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

/**
 * Converts a percentage mark to a GPA grade point.
 */
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

/**
 * Computes filtered advisee list based on search query.
 */
const filteredAdvisees = computed(() => {
    if (!searchQuery.value) return advisees.value;
    const query = searchQuery.value.toLowerCase();
    return advisees.value.filter(student =>
        student.student_name?.toLowerCase().includes(query) ||
        student.matric_number?.toLowerCase().includes(query)
    );
});

/**
 * Returns Tailwind CSS classes for student status color.
 */
const getStatusColor = (status?: string) => {
    if (status === 'At Risk') return 'bg-red-100 text-red-800';
    if (status === 'Good Standing') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
};

/**
 * Returns Tailwind CSS classes for GPA color.
 */
const getGpaColor = (gpa?: number) => {
    if (gpa === undefined) return 'text-gray-500';
    if (gpa < 2.5) return 'text-red-600';
    if (gpa < 3.5) return 'text-yellow-600';
    return 'text-green-600';
}

/**
 * Formats a date string into a readable format.
 */
const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString + 'T00:00:00Z'); // Add T00:00:00Z to ensure UTC interpretation
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC' // Specify UTC to avoid timezone issues with date-only strings
        });
    } catch (e) {
        return 'Invalid Date';
    }
};

/**
 * Opens the student details modal.
 */
const viewStudentDetails = (student: Advisee) => {
    const modalPayload = {
        user_id: student.student_id,
        full_name: student.student_name,
        username: student.student_name, // Assuming username is same as full_name for now
        email: student.student_email,
        matric_number: student.matric_number,
        profile_picture: student.profile_picture,
        role: 'student',
        course_code: 'Multiple', // Placeholder, as GPA is calculated across courses
        current_grade: student.gpa.toFixed(2) + ' GPA'
    };
    selectedStudent.value = modalPayload;
    showViewStudentModal.value = true;
};

/**
 * Opens the log meeting modal and fetches previous notes for the selected student.
 */
const openLogMeetingModal = async (student: Advisee) => {
    studentToLogMeeting.value = student;
    // Fetch previous notes for the selected student
    previousAdvisorNotes.value = await fetchAdvisorNotesForStudent(student.advisor_student_id);
    showLogMeetingModal.value = true;
};

/**
 * Closes the log meeting modal and resets related state.
 */
const closeLogMeetingModal = () => {
    showLogMeetingModal.value = false;
    studentToLogMeeting.value = null;
    previousAdvisorNotes.value = []; // Clear previous notes when modal closes
};

/**
 * Closes all modals and resets related state.
 */
const closeModals = () => {
    showViewStudentModal.value = false;
    selectedStudent.value = null;
};

// Fetch advisees data when the component is mounted
onMounted(fetchAdvisees);

</script>

<template>
    <div class="min-h-screen bg-gray-50 font-inter antialiased">
        <Navigation />

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="mb-8">
                <h1 class="text-3xl font-extrabold text-gray-900 mb-2">My Advisees</h1>
                <p class="text-lg text-gray-600">A complete list of students you are advising, with their academic
                    progress and meeting history.</p>
            </div>

            <!-- Success and Error Messages -->
            <div v-if="message"
                class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow-sm"
                role="alert">
                <p class="font-medium">{{ message }}</p>
            </div>
            <div v-if="errorMessage"
                class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
                <p class="font-medium">{{ errorMessage }}</p>
            </div>

            <div class="bg-white shadow-lg rounded-xl p-6">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h3 class="text-xl font-semibold text-gray-900 mb-3 sm:mb-0">Student Records</h3>
                    <div class="flex items-center space-x-3 w-full sm:w-auto">
                        <input v-model="searchQuery" type="text" placeholder="Search by name or matric no..."
                            class="flex-grow input-field text-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out">
                    </div>
                </div>

                <div v-if="isLoading" class="text-center py-10 text-gray-500">
                    <p class="text-lg">Loading advisee data...</p>
                    <div class="mt-4 animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                </div>
                <div v-else class="overflow-x-auto -mx-6 sm:-mx-0">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    GPA</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Meeting</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-if="filteredAdvisees.length === 0">
                                <td colspan="6" class="px-6 py-8 text-center text-gray-500 text-lg">
                                    No advisees found matching your search criteria.
                                </td>
                            </tr>
                            <tr v-for="student in filteredAdvisees" :key="student.student_id"
                                class="hover:bg-gray-50 transition duration-150 ease-in-out">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <img :src="student.profile_picture || 'https://placehold.co/40x40/cccccc/000000?text=👤'"
                                            alt="Profile"
                                            class="h-10 w-10 rounded-full object-cover border border-gray-200">
                                        <div class="ml-4">
                                            <div class="text-sm font-medium text-gray-900">{{ student.student_name }}
                                            </div>
                                            <div class="text-sm text-gray-500">{{ student.matric_number }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {{ student.student_email }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold"
                                    :class="getGpaColor(student.gpa)">
                                    {{ student.gpa !== undefined ? student.gpa.toFixed(2) : 'N/A' }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span :class="getStatusColor(student.status)"
                                        class="px-2.5 py-0.5 text-xs font-semibold rounded-full">
                                        {{ student.status || 'N/A' }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {{ formatDate(student.last_meeting_date) }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                    <button @click="viewStudentDetails(student)"
                                        class="text-primary-600 hover:text-primary-800 font-medium transition duration-150 ease-in-out">View
                                        Details</button>
                                    <button @click="openLogMeetingModal(student)"
                                        class="text-secondary-600 hover:text-secondary-800 font-medium transition duration-150 ease-in-out">Log
                                        Meeting</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modals -->
        <ViewStudentDetailsModal :show="showViewStudentModal" :student="selectedStudent" @close="closeModals" />

        <LogMeetingModal :show="showLogMeetingModal" :student="studentToLogMeeting"
            :previousNotes="previousAdvisorNotes" @close="closeLogMeetingModal" @save-note="handleSaveNote"
            @update-note="handleUpdateNote" />
    </div>
</template>

<style scoped>
/* Custom styles for better aesthetics */
.font-inter {
    font-family: 'Inter', sans-serif;
}

.card {
    @apply bg-white shadow-lg rounded-xl p-6;
}

.input-field {
    @apply block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm;
}

/* Primary and Secondary button colors (example, adjust as needed) */
.text-primary-600 {
    color: #4F46E5;
}

/* Indigo */
.hover:text-primary-800:hover {
    color: #3730A3;
}

.text-secondary-600 {
    color: #10B981;
}

/* Emerald */
.hover:text-secondary-800:hover {
    color: #065F46;
}

/* Table specific styles for better mobile experience */
@media (max-width: 640px) {
    table {
        display: block;
        width: 100%;
    }

    thead {
        display: none;
        /* Hide table header on small screens */
    }

    tbody,
    tr,
    td {
        display: block;
        width: 100%;
    }

    tr {
        margin-bottom: 1rem;
        border: 1px solid #e5e7eb;
        /* Add border to rows */
        border-radius: 0.5rem;
        overflow: hidden;
    }

    td {
        text-align: right;
        padding-left: 50%;
        /* Space for pseudo-element label */
        position: relative;
    }

    td::before {
        content: attr(data-label);
        /* Use data-label for content */
        position: absolute;
        left: 0;
        width: 45%;
        padding-left: 1rem;
        font-weight: bold;
        text-align: left;
    }

    /* Assign data-label to each td for responsive table headers */
    td:nth-of-type(1):before {
        content: "Student";
    }

    td:nth-of-type(2):before {
        content: "Contact";
    }

    td:nth-of-type(3):before {
        content: "GPA";
    }

    td:nth-of-type(4):before {
        content: "Status";
    }

    td:nth-of-type(5):before {
        content: "Last Meeting";
    }

    td:nth-of-type(6):before {
        content: "Actions";
    }

    /* Adjust action buttons for mobile */
    td:nth-of-type(6) {
        text-align: left;
        padding-left: 1rem;
        display: flex;
        justify-content: flex-start;
        gap: 0.75rem;
        padding-top: 0.75rem;
        padding-bottom: 0.75rem;
    }
}
</style>
