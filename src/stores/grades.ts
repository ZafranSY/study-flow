import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Assessment, Grade, RemarkRequest } from '../types'

// Define the base URL for your API to match the backend routes
const API_BASE_URL = 'http://localhost:8219/api';

export const useGradesStore = defineStore('grades', () => {
  // --- STATE ---
  // These refs will hold the data fetched from the backend
  const assessments = ref<Assessment[]>([])
  const grades = ref<Grade[]>([])
  const students = ref<any[]>([]) // For the lecturer's student list
  const isLoading = ref(false)

  // --- ACTIONS ---

  /**
   * Fetches all students for a specific lecturer.
   * @param lecturerUsername - The username of the lecturer.
   */
  async function fetchLecturerData(lecturerUsername: string) {
    isLoading.value = true;
    const token = sessionStorage.getItem('token');

    if (!token) {
      console.error('No authentication token found.');
      isLoading.value = false;
      return null;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_BASE_URL}/lecturers/${lecturerUsername}/students`, { headers });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch lecturer data. Status: ${response.status}`);
      }

      const lecturerData = await response.json();
      console.log("Data for lecturer:", lecturerData);
      students.value = lecturerData; // Store the fetched students
      return lecturerData;

    } catch (error) {
      console.error('Error fetching lecturer data:', error);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetches all necessary data (grades, assessments) for the logged-in student.
   */
  async function fetchStudentData() {
    isLoading.value = true;
    const token = sessionStorage.getItem('token');

    if (!token) {
      console.error('No authentication token found.');
      isLoading.value = false;
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Fetch grades and assessments in parallel using existing backend endpoints.
      // The backend will automatically filter by the student's token.
      const [gradesResponse, assessmentsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/student-marks`, { headers }),
        fetch(`${API_BASE_URL}/assessment-components`, { headers })
      ]);

      if (!gradesResponse.ok || !assessmentsResponse.ok) {
        throw new Error('Failed to fetch data from the server.');
      }

      // Update the store's state with data from the API
      grades.value = await gradesResponse.json();
      assessments.value = await assessmentsResponse.json();

    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      isLoading.value = false;
    }
  }

  // --- GETTERS (Functions to process the data) ---

  const getStudentGrades = (studentId: string, courseId?: string) => {
    return grades.value.filter(g =>
      g.studentId === studentId && (!courseId || g.courseId === courseId)
    )
  }

  const calculateStudentTotal = (studentId: string, courseId: string) => {
    const studentGrades = getStudentGrades(studentId, courseId)
    const courseAssessments = assessments.value.filter(a => a.courseId === courseId);

    let totalWeightedMarks = 0
    let totalWeightage = 0

    courseAssessments.forEach(assessment => {
      const grade = studentGrades.find(g => g.assessmentId === assessment.id)
      if (grade) {
        const percentage = (grade.marks / assessment.totalMarks) * 100
        totalWeightedMarks += (percentage * assessment.weightage) / 100
        totalWeightage += assessment.weightage
      }
    })

    return totalWeightage > 0 ? (totalWeightedMarks / totalWeightage) * 100 : 0
  }

  // --- RETURN ---
  // Export everything so your components can use it.
  return {
    assessments,
    grades,
    students,
    isLoading,
    fetchLecturerData,
    fetchStudentData,
    getStudentGrades,
    calculateStudentTotal,
  }
})
