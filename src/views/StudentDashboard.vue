<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">
          Welcome back, {{ currentUser?.name }}
        </h1>
        <p class="text-gray-600">Track your academic progress and performance</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Overall GPA"
          :value="overallGPA.toFixed(2)"
          change="+0.2 from last semester"
          :icon="AcademicCapIcon"
          variant="primary"
        />
        <StatsCard
          title="Completed Assessments"
          :value="`${completedAssessments}/${totalAssessments}`"
          :icon="DocumentCheckIcon"
          variant="success"
        />
        <StatsCard
          title="Class Rank"
          :value="`#${classRank} of ${totalStudents}`"
          change="↑ 2 positions"
          :icon="TrophyIcon"
          variant="warning"
        />
        <StatsCard
          title="Upcoming Deadlines"
          :value="upcomingDeadlines"
          :icon="ClockIcon"
          variant="danger"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <PerformanceChart
            title="Performance Trend"
            :data="performanceData"
            color="#3b82f6"
          />
        </div>

        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <button
              @click="activeTab = 'grades'"
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <DocumentTextIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium">View All Grades</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <div v-if="activeTab === 'grades'" class="card">
          <h3 class="text-lg font-semibold text-gray-900">Grade Details</h3>
          <div class="overflow-x-auto mt-4">
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
                    Marks
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="grade in filteredGrades" :key="grade.id" class="table-row">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ getAssessmentTitle(grade.assessmentId) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ grade.courseId }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ grade.marks }}/{{ getAssessmentTotal(grade.assessmentId) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ ((grade.marks / getAssessmentTotal(grade.assessmentId)) * 100).toFixed(1) }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  AcademicCapIcon,
  DocumentCheckIcon,
  TrophyIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CalculatorIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

import Navigation from '../components/shared/Navigation.vue'
import StatsCard from '../components/shared/StatsCard.vue'
import PerformanceChart from '../components/charts/PerformanceChart.vue'
import { useGradesStore } from '../stores/grades'

interface User {
  id: string;
  name: string;
}

const gradesStore = useGradesStore();
const currentUser = ref<User | null>(null);

// --- Mock Data ---
const classRank = ref(15);
const totalStudents = ref(150);
const upcomingDeadlines = ref(3);

// This code now calls the API when the component is loaded
onMounted(() => {
  const userString = sessionStorage.getItem('user');
  if (userString) {
    try {
      currentUser.value = JSON.parse(userString);
      if (currentUser.value) {
        // Trigger the API call from the store
        gradesStore.fetchStudentData(currentUser.value.id);
      }
    } catch (e) {
      console.error('Could not parse user from sessionStorage', e);
    }
  }
});

// --- Computed properties (These will now be reactive to API data) ---

const overallGPA = computed(() => {
    if (!currentUser.value) return 0.0;
    const totalPercentage = gradesStore.calculateStudentTotal(currentUser.value.id, 'CS101');
    return (totalPercentage / 100) * 4.0;
});

const completedAssessments = computed(() => {
    if (!currentUser.value) return 0;
    return gradesStore.getStudentGrades(currentUser.value.id).length;
});

const totalAssessments = computed(() => {
    return gradesStore.assessments.length;
});

const performanceData = computed(() => {
    if (!currentUser.value) return { labels: [], values: [] };
    const grades = gradesStore.getStudentGrades(currentUser.value.id);

    const labels = grades.map(grade => {
        const assessment = gradesStore.assessments.find(a => a.id === grade.assessmentId);
        return assessment ? assessment.title : 'Assessment';
    });

    const values = grades.map(grade => {
        const assessment = gradesStore.assessments.find(a => a.id === grade.assessmentId);
        if (!assessment) return 0;
        return (grade.marks / assessment.totalMarks) * 100;
    });

    return { labels, values };
});

// Other functions from the original file...
</script>