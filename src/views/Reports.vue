<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
    DocumentTextIcon,
    UsersIcon,
    UserIcon,
    DocumentArrowDownIcon,
    ShareIcon,
    TrashIcon,
    ChartBarIcon, // Re-added for overall performance tab
    TableCellsIcon // New icon for mark breakdown
} from '@heroicons/vue/24/outline';

// Import Navigation component (assuming it's a shared layout component)
import Navigation from '../components/shared/Navigation.vue';

// --- Inlined StatsCard Component (kept for structure, though not used in overview) ---
interface StatsCardProps {
    title: string;
    value: string | number;
    change?: string;
    icon: any; // Heroicons component
    variant: 'primary' | 'success' | 'danger' | 'secondary';
}

const getVariantClasses = (variant: StatsCardProps['variant']) => {
    switch (variant) {
        case 'primary': return 'bg-indigo-50 text-indigo-600';
        case 'success': return 'bg-green-50 text-green-600';
        case 'danger': return 'bg-red-50 text-red-600';
        case 'secondary': return 'bg-yellow-50 text-yellow-600';
        default: return 'bg-gray-50 text-gray-600';
    }
};
// --- End Inlined StatsCard Component ---

const router = useRouter();

// API Base URL
const API_BASE_URL = 'http://localhost:8219';

// Reactive state variables
const activeTab = ref<'generate' | 'overall-performance' | 'mark-breakdown'>('generate'); // New state for active tab
const selectedReportType = ref<'individual' | null>(null); // Only 'individual' is supported now
const showAllReports = ref(false);
const message = ref('');
const errorMessage = ref('');
const isLoadingReports = ref(false);
const isLoadingStudentData = ref(false); // New loading state for student-specific data

// Report configuration
const reportConfig = reactive({
    studentId: '',
    period: 'current',
    format: 'pdf',
    startDate: '',
    endDate: ''
});

// Advisee data for dropdowns
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
const advisees = ref<Advisee[]>([]);

// Interface for StudentMark (from API documentation)
interface StudentMark {
    mark_id: number;
    enrollment_id: number;
    component_id: number;
    mark_obtained: number;
    recorded_by: number;
    recorded_at: string;
    updated_at: string;
    student_id: number; // Manually added in fetchStudentMarks for consistency
    course_name: string;
    course_code: string; // Used as the identifier for courses
    component_name: string;
    max_mark: number;
    weight_percentage: number;
    recorded_by_name: string;
}

// Interface for AdvisorNote (from API documentation)
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
interface AssessmentComponent {
    component_id: number;
    course_id: number;
    component_name: string;
    max_mark: number;
    weight_percentage: number;
}
const assessmentComponents = ref<AssessmentComponent[]>([]);

// Data for new tabs
const selectedStudentForAnalysis = ref<number | null>(null);
const selectedCourseForBreakdown = ref<string | null>(null); // Changed to string for course_code
const studentMarksForAnalysis = ref<StudentMark[]>([]);
const studentCourses = ref<{ id: string, code: string, name: string }[]>([]); // Changed id to string

// Mock/simulated recent reports (will be populated with generated reports)
const generatedReports = ref<any[]>([]);

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
 * Fetches the list of advisees for the dropdowns.
 */
const fetchAdvisees = async () => {
    isLoadingReports.value = true;
    errorMessage.value = '';
    try {
        const headers = getAuthHeaders();
        if (!headers) return;

        const response = await fetch(`${API_BASE_URL}/advisor-student`, { headers });
        if (!response.ok) throw new Error('Failed to fetch advisee list.');

        advisees.value = await response.json();
    } catch (error: any) {
        errorMessage.value = error.message;
    } finally {
        isLoadingReports.value = false;
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
        if (!response.ok) {
            console.error(`Failed to fetch marks for student ${studentId}:`, response.statusText);
            return [];
        }
        const marks = await response.json();
        // Manually add student_id to each mark object as it's not directly returned by API in the mark object itself
        return marks.map((mark: any) => ({ ...mark, student_id: studentId }));
    } catch (error) {
        console.error(`Error fetching marks for student ${studentId}:`, error);
        return [];
    }
};

/**
 * Fetches all advisor notes and filters them for a specific student.
 */
const fetchAdvisorNotesForStudent = async (studentId: number): Promise<AdvisorNote[]> => {
    try {
        const headers = getAuthHeaders();
        if (!headers) return [];

        const response = await fetch(`${API_BASE_URL}/advisor-notes`, { headers });
        if (!response.ok) {
            console.error('Failed to fetch advisor notes:', response.statusText);
            return [];
        }
        const allNotes: AdvisorNote[] = await response.json();
        // Filter notes by the specific student_id
        return allNotes.filter(note => note.student_id === studentId);
    } catch (error) {
        console.error('Error fetching advisor notes:', error);
        return [];
    }
};

const fetchAssessmentComponent = async (): Promise<void> => { // Changed return type to void
    try {
        const headers = getAuthHeaders(); // Assuming getAuthHeaders is defined in your scope
        if (!headers) return;

        const response = await fetch(`${API_BASE_URL}/assessment-components`, { headers }); // Assuming API_BASE_URL is defined
        if (!response.ok) {
            console.error('Failed to fetch assessment components:', response.statusText);
            return; // No return value needed as it updates the ref
        }
        const allComponents: AssessmentComponent[] = await response.json();
        assessmentComponents.value = allComponents; // Corrected assignment: Use .value for refs

    } catch (error) {
        console.error('Error fetching assessment components:', error); // Corrected error message for consistency
        // No return statement needed here as it's a void function populating a ref
    }
};


/**
 * Handles fetching student data for analysis tabs when a student is selected.
 */
watch(selectedStudentForAnalysis, async (newStudentId) => {
    studentMarksForAnalysis.value = [];
    studentCourses.value = [];
    selectedCourseForBreakdown.value = null; // Reset course selection

    if (newStudentId) {
        isLoadingStudentData.value = true;
        errorMessage.value = '';
        try {
            const marks = await fetchStudentMarks(newStudentId);
            studentMarksForAnalysis.value = marks;

            // Extract unique courses from marks for dropdowns using course_code as the identifier
            const uniqueCourses = new Map<string, { id: string, code: string, name: string }>();
            marks.forEach(mark => {
                if (!uniqueCourses.has(mark.course_code)) {
                    uniqueCourses.set(mark.course_code, {
                        id: mark.course_code, // Use course_code as the identifier
                        code: mark.course_code,
                        name: mark.course_name
                    });
                }
            });
            studentCourses.value = Array.from(uniqueCourses.values());
            console.log('Fetched studentMarksForAnalysis:', marks); // Added for debugging
        } catch (error: any) {
            errorMessage.value = `Error loading student data: ${error.message}`;
        } finally {
            isLoadingStudentData.value = false;
        }
    }
});

/**
 * Computed property to calculate overall course performance (percentage and GPA).
 */
const overallCoursePerformance = computed(() => {
    // Use course_code as the key for courseData
    const courseData: { [key: string]: { totalWeightedScore: number; totalWeight: number; courseName: string; courseCode: string } } = {};

    studentMarksForAnalysis.value.forEach(mark => {
        // Ensure numeric values and handle potential non-numeric or null/undefined inputs
        const markObtainedNum = Number(mark.mark_obtained) || 0;
        const maxMarkNum = Number(mark.max_mark) || 0;
        const weightNum = Number(mark.weight_percentage) || 0;

        if (maxMarkNum === 0) {
            return; // Avoid division by zero
        }

        if (!courseData[mark.course_code]) { // Use course_code as key
            courseData[mark.course_code] = {
                totalWeightedScore: 0,
                totalWeight: 0,
                courseName: mark.course_name,
                courseCode: mark.course_code
            };
        }

        // Accumulate weighted scores
        courseData[mark.course_code].totalWeightedScore += (markObtainedNum / maxMarkNum) * weightNum;
        courseData[mark.course_code].totalWeight += weightNum;
    });

    const results = Object.values(courseData).map(course => {
        const overallPercentage = course.totalWeight > 0 ? (course.totalWeightedScore / course.totalWeight) * 100 : 0;
        const gpaPoint = convertPercentageToGradePoint(overallPercentage);

        return {
            courseName: course.courseName,
            courseCode: course.courseCode,
            overallPercentage: parseFloat(overallPercentage.toFixed(2)),
            gpaPoint: parseFloat(gpaPoint.toFixed(2))
        };
    });

    return results;
});

/**
 * Converts a percentage mark to a GPA grade point.
 */
const convertPercentageToGradePoint = (percentage: number): number => {
    if (percentage >= 90) return 4.0;
    if (percentage >= 80) return 3.0;
    if (percentage >= 70) return 2.0;
    if (percentage >= 60) return 1.0;
    return 0.0;
};

/**
 * Computed property for detailed mark breakdown for a selected course.
 */
const detailedMarkBreakdown = computed(() => {
    console.log('--- Detailed Mark Breakdown Debug ---');
    console.log('Selected Student ID (selectedStudentForAnalysis.value):', selectedStudentForAnalysis.value, 'Type:', typeof selectedStudentForAnalysis.value);
    console.log('Selected Course ID (selectedCourseForBreakdown.value):', selectedCourseForBreakdown.value, 'Type:', typeof selectedCourseForBreakdown.value);
    console.log('All Student Marks for Analysis (studentMarksForAnalysis.value):', studentMarksForAnalysis.value);
    console.log('All Assessment Components (assessmentComponents.value):', assessmentComponents.value); // Added for debugging

    if (selectedStudentForAnalysis.value === null || selectedCourseForBreakdown.value === null) {
        console.log('Filter skipped: Student or Course not selected (null).');
        return [];
    }

    // Correctly access the array of assessment components from the ref's _rawValue or _value
    const actualAssessmentComponents = assessmentComponents.value.assessmentComponents || assessmentComponents.value;

    // Log the actual array to confirm its content and type
    console.log('Actual Assessment Components (after extraction):', actualAssessmentComponents, 'Type:', typeof actualAssessmentComponents, 'Is Array:', Array.isArray(actualAssessmentComponents));

    const filteredAndEnrichedMarks = studentMarksForAnalysis.value
        .filter(mark => {
            // Filter by course_id, as studentMarksForAnalysis already contains marks for the selected student.
            const isCourseMatch = mark.course_code === selectedCourseForBreakdown.value;

            return isCourseMatch;
        })
        .map(mark => {
            let componentName = 'Unknown Component'; // Default value

            // Iterate through actualAssessmentComponents to find the matching component
            if (Array.isArray(actualAssessmentComponents)) {
                for (let i = 0; i < actualAssessmentComponents.length; i++) {
                    const comp = actualAssessmentComponents[i];
                    if (comp.component_id === mark.component_id) {
                        componentName = comp.component_name;
                        break; // Found the component, no need to continue iterating
                    }
                }
            } else {
                console.warn('actualAssessmentComponents is not an array, cannot map component_name.');
            }

            return {
                ...mark,
                component_name: componentName
            };
        });

    console.log('Filtered and Enriched Marks (Breakdown) Result:', filteredAndEnrichedMarks);
    return filteredAndEnrichedMarks;
});



/**
 * Generates a report based on the selected type and configuration.
 */
const generateReport = async () => {
    message.value = '';
    errorMessage.value = '';

    if (selectedReportType.value === 'individual') {
        if (!reportConfig.studentId) {
            errorMessage.value = 'Please select a student for the individual report.';
            return;
        }

        const student = advisees.value.find(adv => adv.student_id === parseInt(reportConfig.studentId));
        if (!student) {
            errorMessage.value = 'Selected student not found.';
            return;
        }

        isLoadingReports.value = true;
        try {
            const studentMarks = await fetchStudentMarks(student.student_id);
            const advisorNotes = await fetchAdvisorNotesForStudent(student.student_id);

            // Simulate report generation with fetched data
            const reportContent = {
                student: {
                    id: student.student_id,
                    name: student.student_name,
                    matricNumber: student.matric_number,
                    email: student.student_email,
                    gpa: student.gpa, // This GPA is from advisee list, might be overall
                    status: student.status,
                },
                marks: studentMarks,
                consultationNotes: advisorNotes,
                period: reportConfig.period,
                format: reportConfig.format,
                generatedAt: new Date().toISOString()
            };

            const newReport = {
                id: `report-${Date.now()}`,
                title: `${student.student_name} - Individual Academic Report`,
                description: `Detailed academic and consultation report for ${student.student_name}.`,
                type: 'individual',
                format: reportConfig.format,
                size: `${(Math.random() * 5 + 1).toFixed(1)} MB`, // Mock size
                createdAt: new Date().toISOString(),
                content: reportContent // Store the actual data for potential download simulation
            };
            generatedReports.value.unshift(newReport); // Add to the beginning of the list
            message.value = `Successfully generated report for ${student.student_name}!`;

        } catch (error: any) {
            errorMessage.value = `Error generating report: ${error.message}`;
        } finally {
            isLoadingReports.value = false;
        }
    } else {
        errorMessage.value = 'Please select a valid report type.';
    }
};

/**
 * Computed property to display a limited number of recent reports or all reports.
 */
const displayedReports = computed(() => {
    return showAllReports.value ? generatedReports.value : generatedReports.value.slice(0, 3);
});

/**
 * Returns Tailwind CSS classes for report type color.
 */
const getReportTypeColor = (type: string) => {
    const colors = {
        individual: 'bg-blue-100 text-blue-600',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-600';
};

/**
 * Returns the Heroicon component for the report type.
 */
const getReportIcon = (type: string) => {
    const icons = {
        individual: UserIcon,
    };
    return icons[type as keyof typeof icons] || DocumentTextIcon;
};

/**
 * Formats a date string into a readable format.
 */
const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date format');
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return 'Invalid Date';
    }
};

/**
 * Converts an array of objects to a CSV string.
 */
const convertToCSV = (arr: any[]) => {
    if (!arr || arr.length === 0) return '';

    const header = Object.keys(arr[0]).join(',');
    const rows = arr.map(obj =>
        Object.values(obj)
            .map(value => {
                // Handle values that might contain commas or newlines by enclosing them in quotes
                const stringValue = String(value);
                return stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')
                    ? `"${stringValue.replace(/"/g, '""')}"`
                    : stringValue;
            })
            .join(',')
    );
    return [header, ...rows].join('\n');
};

/**
 * Handles downloading a report based on its format.
 */
const downloadReport = (report: any) => {
    if (!report.content) {
        errorMessage.value = 'Report content is missing for download.';
        return;
    }

    if (report.format === 'json') {
        const jsonContent = JSON.stringify(report.content, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.title.replace(/[^a-z0-9]/gi, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        message.value = `Downloading ${report.title} as JSON...`;
    } else if (report.format === 'csv') {
        // Download marks as CSV
        if (report.content.marks && report.content.marks.length > 0) {
            const marksCsv = convertToCSV(report.content.marks);
            const marksBlob = new Blob([marksCsv], { type: 'text/csv' });
            const marksUrl = URL.createObjectURL(marksBlob);
            const marksA = document.createElement('a');
            marksA.href = marksUrl;
            marksA.download = `${report.title.replace(/[^a-z0-9]/gi, '_')}_marks.csv`;
            document.body.appendChild(marksA);
            marksA.click();
            document.body.removeChild(marksA);
            URL.revokeObjectURL(marksUrl);
        } else {
            console.warn('No marks data to download as CSV.');
        }

        // Download consultation notes as CSV
        if (report.content.consultationNotes && report.content.consultationNotes.length > 0) {
            const notesCsv = convertToCSV(report.content.consultationNotes);
            const notesBlob = new Blob([notesCsv], { type: 'text/csv' });
            const notesUrl = URL.createObjectURL(notesBlob);
            const notesA = document.createElement('a');
            notesA.href = notesUrl;
            notesA.download = `${report.title.replace(/[^a-z0-9]/gi, '_')}_notes.csv`;
            document.body.appendChild(notesA);
            notesA.click();
            document.body.removeChild(notesA);
            URL.revokeObjectURL(notesUrl);
        } else {
            console.warn('No consultation notes data to download as CSV.');
        }

        message.value = `Downloading ${report.title} data as CSV files...`;
    } else {
        // For other formats like PDF, Excel, etc., just simulate
        alert(`Downloading ${report.title} (${report.format.toUpperCase()})... (Simulation)`);
    }
};

/**
 * Simulates sharing a report.
 */
const shareReport = (report: any) => {
    alert(`Simulating sharing of ${report.title}.`);
};

/**
 * Deletes a report from the local list.
 */
const deleteReport = (report: any) => {
    // Using a custom modal-like confirmation instead of browser's confirm()
    const confirmDelete = window.confirm(`Are you sure you want to delete "${report.title}"? This action cannot be undone.`);
    if (confirmDelete) {
        const index = generatedReports.value.findIndex(r => r.id === report.id);
        if (index !== -1) {
            generatedReports.value.splice(index, 1);
            message.value = 'Report deleted successfully!';
        } else {
            errorMessage.value = 'Report not found.';
        }
    }
};

// Fetch advisees on component mount
onMounted(async () => { // Made onMounted async
    await fetchAssessmentComponent(); // Ensure this completes before marks are fetched
    await fetchAdvisees();

});
</script>

<template>
    <div class="min-h-screen bg-gray-50 font-inter antialiased">
        <Navigation />

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-extrabold text-gray-900 mb-2">Academic Reports & Analysis</h1>
                <p class="text-lg text-gray-600">Generate comprehensive reports and view detailed student performance
                    analytics.</p>
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

            <!-- Tabs for different functionalities -->
            <div class="mb-6 bg-white shadow-lg rounded-xl p-4 flex flex-wrap gap-4">
                <button @click="activeTab = 'generate'; selectedReportType = null;"
                    :class="activeTab === 'generate' ? 'bg-primary-100 text-primary-800 font-semibold' : 'text-gray-700 hover:bg-gray-100'"
                    class="px-5 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                    <DocumentArrowDownIcon class="h-5 w-5" />
                    <span>Generate Report</span>
                </button>
                <button
                    @click="activeTab = 'overall-performance'; selectedStudentForAnalysis = null; studentMarksForAnalysis = []; studentCourses = [];"
                    :class="activeTab === 'overall-performance' ? 'bg-primary-100 text-primary-800 font-semibold' : 'text-gray-700 hover:bg-gray-100'"
                    class="px-5 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                    <ChartBarIcon class="h-5 w-5" />
                    <span>Overall Course Performance</span>
                </button>
                <button
                    @click="activeTab = 'mark-breakdown'; selectedStudentForAnalysis = null; studentMarksForAnalysis = []; studentCourses = []; selectedCourseForBreakdown = null;"
                    :class="activeTab === 'mark-breakdown' ? 'bg-primary-100 text-primary-800 font-semibold' : 'text-gray-700 hover:bg-gray-100'"
                    class="px-5 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                    <TableCellsIcon class="h-5 w-5" />
                    <span>Full Mark Breakdown</span>
                </button>
            </div>

            <!-- Content based on active tab -->
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <!-- Generate Report Tab Content -->
                <div v-if="activeTab === 'generate'" class="lg:col-span-4">
                    <!-- Report Type Selection -->
                    <div class="bg-white shadow-lg rounded-xl p-6 mb-6">
                        <h3 class="text-xl font-semibold text-gray-900 mb-4">Generate New Report</h3>

                        <div class="grid grid-cols-1 gap-4 mb-6">
                            <button @click="selectedReportType = 'individual'"
                                :class="selectedReportType === 'individual' ? 'bg-primary-50 border-primary-200 text-primary-700' : 'hover:bg-gray-50 border-gray-200'"
                                class="p-4 border rounded-lg text-left transition-colors flex items-start space-x-3">
                                <UserIcon class="h-8 w-8 text-primary-600 flex-shrink-0" />
                                <div>
                                    <h4 class="font-medium text-lg">Individual Student Report</h4>
                                    <p class="text-sm text-gray-600">Detailed analysis of a single student's academic
                                        performance and consultation history.</p>
                                </div>
                            </button>
                        </div>

                        <!-- Report Configuration -->
                        <div v-if="selectedReportType === 'individual'" class="space-y-4 border-t pt-6">
                            <h4 class="text-lg font-semibold text-gray-800">Configure Individual Report</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="studentSelect"
                                        class="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                                    <select id="studentSelect" v-model="reportConfig.studentId" class="input-field">
                                        <option value="">Choose Student</option>
                                        <option v-for="advisee in advisees" :key="advisee.student_id"
                                            :value="advisee.student_id">
                                            {{ advisee.student_name }} ({{ advisee.matric_number }})
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label for="timePeriod" class="block text-sm font-medium text-gray-700 mb-1">Time
                                        Period</label>
                                    <select id="timePeriod" v-model="reportConfig.period" class="input-field">
                                        <option value="current">Current Semester</option>
                                        <option value="previous">Previous Semester</option>
                                        <option value="academic_year">Academic Year</option>
                                        <option value="custom">Custom Range</option>
                                    </select>
                                </div>

                                <div>
                                    <label for="reportFormat"
                                        class="block text-sm font-medium text-gray-700 mb-1">Report Format</label>
                                    <select id="reportFormat" v-model="reportConfig.format" class="input-field">
                                        <option value="pdf">PDF Document</option>
                                        <option value="excel">Excel Spreadsheet</option>
                                        <option value="csv">CSV File</option>
                                        <option value="json">JSON File</option>
                                    </select>
                                </div>
                            </div>

                            <div v-if="reportConfig.period === 'custom'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Start
                                        Date</label>
                                    <input id="startDate" v-model="reportConfig.startDate" type="date"
                                        class="input-field">
                                </div>
                                <div>
                                    <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">End
                                        Date</label>
                                    <input id="endDate" v-model="reportConfig.endDate" type="date" class="input-field">
                                </div>
                            </div>

                            <div class="flex justify-end pt-4">
                                <button @click="generateReport" :disabled="isLoadingReports" class="btn-primary">
                                    <DocumentArrowDownIcon class="h-4 w-4 mr-2" />
                                    {{ isLoadingReports ? 'Generating...' : 'Generate Report' }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Reports -->
                    <div class="bg-white shadow-lg rounded-xl p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-semibold text-gray-900">Recent Reports</h3>
                            <button @click="showAllReports = !showAllReports"
                                class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                {{ showAllReports ? 'Show Less' : 'View All' }}
                            </button>
                        </div>

                        <div v-if="generatedReports.length === 0" class="text-center py-8 text-gray-500">
                            <p>No reports generated yet. Generate one above!</p>
                        </div>
                        <div v-else class="space-y-4">
                            <div v-for="report in displayedReports" :key="report.id"
                                class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <div class="flex items-start space-x-4 mb-3 sm:mb-0">
                                    <div :class="getReportTypeColor(report.type)"
                                        class="p-2 rounded-full flex-shrink-0">
                                        <component :is="getReportIcon(report.type)" class="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h4 class="font-medium text-gray-900">{{ report.title }}</h4>
                                        <p class="text-sm text-gray-600">{{ report.description }}</p>
                                        <div class="flex flex-wrap items-center space-x-4 text-xs text-gray-500 mt-1">
                                            <span>Generated: {{ formatDate(report.createdAt) }}</span>
                                            <span>{{ report.format.toUpperCase() }}</span>
                                            <span>{{ report.size }}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex items-center space-x-2 sm:ml-auto">
                                    <button @click="downloadReport(report)"
                                        class="text-primary-600 hover:text-primary-800 text-sm font-medium px-2 py-1 rounded-md transition duration-150 ease-in-out">
                                        Download
                                    </button>
                                    <button @click="shareReport(report)"
                                        class="text-secondary-600 hover:text-secondary-800 text-sm font-medium px-2 py-1 rounded-md transition duration-150 ease-in-out">
                                        Share
                                    </button>
                                    <button @click="deleteReport(report)"
                                        class="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded-md transition duration-150 ease-in-out">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Overall Course Performance Tab Content -->
                <div v-if="activeTab === 'overall-performance'" class="lg:col-span-4">
                    <div class="bg-white shadow-lg rounded-xl p-6">
                        <h3 class="text-xl font-semibold text-gray-900 mb-4">Overall Course Performance</h3>
                        <div class="mb-4">
                            <label for="studentSelectOverall"
                                class="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                            <select id="studentSelectOverall" v-model="selectedStudentForAnalysis" class="input-field">
                                <option :value="null">Choose Student</option>
                                <option v-for="advisee in advisees" :key="advisee.student_id"
                                    :value="advisee.student_id">
                                    {{ advisee.student_name }} ({{ advisee.matric_number }})
                                </option>
                            </select>
                        </div>

                        <div v-if="isLoadingStudentData" class="text-center py-8 text-gray-500">
                            <p>Loading student performance data...</p>
                            <div class="mt-4 animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto">
                            </div>
                        </div>
                        <div v-else-if="selectedStudentForAnalysis && overallCoursePerformance.length === 0"
                            class="text-center py-8 text-gray-500">
                            <p>No course performance data available for this student.</p>
                        </div>
                        <div v-else-if="selectedStudentForAnalysis" class="mt-6">
                            <h4 class="text-lg font-semibold text-gray-800 mb-4">Course Performance Overview
                                (Percentage)</h4>
                            <div class="relative h-64 w-full">
                                <div class="absolute inset-0 flex items-end px-4 pb-8"> <!-- Added pb-8 for labels -->
                                    <div v-for="(course, index) in overallCoursePerformance" :key="index"
                                        class="flex flex-col items-center flex-grow mx-1 h-full justify-end">
                                        <!-- Added h-full and justify-end -->
                                        <div :style="{ height: (course.overallPercentage) + '%', minHeight: course.overallPercentage > 0 ? '2px' : '0px' }"
                                            class="w-8 bg-blue-500 rounded-t-lg shadow-md transition-all duration-300 ease-in-out">
                                        </div>
                                        <span class="mt-2 text-xs font-medium text-gray-700">{{ course.overallPercentage
                                            }}%</span>
                                        <span class="text-xs text-gray-500 text-center mt-1">{{ course.courseCode
                                            }}</span>
                                    </div>
                                </div>
                                <!-- Y-axis labels (simplified) -->
                                <div
                                    class="absolute inset-y-0 left-0 w-8 flex flex-col justify-between py-4 text-xs text-gray-500">
                                    <span>100%</span>
                                    <span>75%</span>
                                    <span>50%</span>
                                    <span>25%</span>
                                    <span>0%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Full Mark Breakdown Tab Content -->
                <div v-if="activeTab === 'mark-breakdown'" class="lg:col-span-4">
                    <div class="bg-white shadow-lg rounded-xl p-6">
                        <h3 class="text-xl font-semibold text-gray-900 mb-4">Full Mark Breakdown</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label for="studentSelectBreakdown"
                                    class="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                                <select id="studentSelectBreakdown" v-model="selectedStudentForAnalysis"
                                    class="input-field">
                                    <option :value="null">Choose Student</option>
                                    <option v-for="advisee in advisees" :key="advisee.student_id"
                                        :value="advisee.student_id">
                                        {{ advisee.student_name }} ({{ advisee.matric_number }})
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label for="courseSelectBreakdown"
                                    class="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                                <select id="courseSelectBreakdown" v-model="selectedCourseForBreakdown"
                                    :disabled="!selectedStudentForAnalysis || studentCourses.length === 0"
                                    class="input-field">
                                    <option :value="null">Choose Course</option>
                                    <option v-for="course in studentCourses" :key="course.id" :value="course.id">
                                        {{ course.code }} - {{ course.name }}
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div v-if="isLoadingStudentData" class="text-center py-8 text-gray-500">
                            <p>Loading student data...</p>
                            <div class="mt-4 animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto">
                            </div>
                        </div>
                        <div v-else-if="!selectedStudentForAnalysis" class="text-center py-8 text-gray-500">
                            <p>Please select a student to view their mark breakdown.</p>
                        </div>
                        <div v-else-if="studentCourses.length === 0" class="text-center py-8 text-gray-500">
                            <p>No courses found for the selected student, or data is still loading.</p>
                        </div>
                        <div v-else-if="!selectedCourseForBreakdown" class="text-center py-8 text-gray-500">
                            <p>Please select a course to view the detailed mark breakdown.</p>
                        </div>
                        <div v-else-if="selectedStudentForAnalysis && selectedCourseForBreakdown && detailedMarkBreakdown.length === 0"
                            class="text-center py-8 text-gray-500">
                            <p>No mark breakdown data available for this course and student.</p>
                        </div>
                        <div v-else-if="selectedStudentForAnalysis && selectedCourseForBreakdown"
                            class="mt-6 overflow-x-auto">
                            <h4 class="text-lg font-semibold text-gray-800 mb-4">Mark Breakdown for Selected Course</h4>
                            <table class="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Component</th>
                                        <th
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Max Mark</th>
                                        <th
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Weight (%)</th>
                                        <th
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mark Obtained</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="mark in detailedMarkBreakdown" :key="mark.mark_id">
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{
                                            mark.component_name }}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ mark.max_mark
                                            }}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{
                                            mark.weight_percentage }}%</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{
                                            mark.mark_obtained }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Sidebar (Remains simplified and always visible) -->
                <div class="space-y-6 lg:col-span-1" :class="{ 'hidden': activeTab !== 'generate', 'lg:block': true }">
                    <!-- Quick Info (Simplified from Quick Stats) -->
                    <div class="bg-white shadow-lg rounded-xl p-6">
                        <h3 class="text-xl font-semibold text-gray-900 mb-4">Overview</h3>
                        <div class="space-y-3">
                            <div class="flex items-center space-x-3">
                                <UsersIcon class="h-5 w-5 text-indigo-500" />
                                <span class="text-sm font-medium text-gray-700">Total Advisees: {{ advisees.length
                                    }}</span>
                            </div>
                            <div class="flex items-center space-x-3">
                                <DocumentTextIcon class="h-5 w-5 text-blue-500" />
                                <span class="text-sm font-medium text-gray-700">Reports Generated: {{
                                    generatedReports.length }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Base styles */
.font-inter {
    font-family: 'Inter', sans-serif;
}

.card {
    @apply bg-white shadow-lg rounded-xl p-6;
}

.input-field {
    @apply block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm;
}

/* Button styles */
.btn-primary {
    @apply inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out;
}

.btn-secondary {
    @apply inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out;
}

/* Custom Primary and Secondary Colors */
.text-primary-600 {
    color: #4F46E5;
}

/* Indigo */
.hover:text-primary-700:hover {
    color: #4338CA;
}

.hover:text-primary-800:hover {
    color: #3730A3;
}

.bg-primary-600 {
    background-color: #4F46E5;
}

.hover:bg-primary-700:hover {
    background-color: #4338CA;
}

.bg-primary-50 {
    background-color: #EEF2FF;
}

/* Light Indigo */
.border-primary-200 {
    border-color: #C7D2FE;
}

.text-primary-700 {
    color: #4338CA;
}

.bg-primary-100 {
    background-color: #E0E7FF;
}

/* Lighter Indigo for active tab */
.text-primary-800 {
    color: #3730A3;
}

.text-secondary-600 {
    color: #10B981;
}

/* Emerald */
.hover:text-secondary-800:hover {
    color: #065F46;
}

.bg-secondary-600 {
    background-color: #10B981;
}

.hover:bg-secondary-700:hover {
    background-color: #0B7A58;
}

.text-red-600 {
    color: #DC2626;
}

.hover:text-red-800:hover {
    color: #991B1B;
}
</style>
