<template> 
  <div class="peer-comparison-container">
    <div class="mb-4 flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Select Course
        </label>
        <select v-model="selectedCourse" @change="fetchPeerData" class="input-field w-full">
          <option value="">All Courses</option>
          <option v-for="course in availableCourses" :key="course" :value="course">
            {{ course }}
          </option>
        </select>
      </div>
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Select Assessment
        </label>
        <select v-model="selectedAssessment" @change="fetchPeerData" class="input-field w-full">
          <option value="">All Assessments</option>
          <option v-for="assessment in availableAssessments" :key="assessment.component_id" :value="assessment.component_id">
            {{ assessment.component_name }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      {{ error }}
    </div>

    <div v-else-if="peerData.length > 0" class="space-y-6">
      <!-- Chart Container -->
      <div class="bg-white p-4 rounded-lg border">
        <h4 class="text-lg font-semibold text-gray-900 mb-4">Performance Comparison</h4>
        <div class="relative h-96">
          <canvas ref="chartCanvas" id="peerComparisonChart"></canvas>
        </div>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <h5 class="font-medium text-blue-900">Your Position</h5>
          <div class="text-2xl font-bold text-blue-600">
            #{{ currentStudentRank }} of {{ peerData.length }}
          </div>
          <p class="text-sm text-blue-700">
            {{ getPercentileText() }}
          </p>
        </div>
        
        <div class="bg-green-50 p-4 rounded-lg">
          <h5 class="font-medium text-green-900">Class Average</h5>
          <div class="text-2xl font-bold text-green-600">
            {{ classAverage.toFixed(1) }}%
          </div>
          <p class="text-sm text-green-700">
            {{ yourPerformance >= classAverage ? 'Above' : 'Below' }} average
          </p>
        </div>
        
        <div class="bg-purple-50 p-4 rounded-lg">
          <h5 class="font-medium text-purple-900">Your Score</h5>
          <div class="text-2xl font-bold text-purple-600">
            {{ yourPerformance.toFixed(1) }}%
          </div>
          <p class="text-sm text-purple-700">
            {{ getPerformanceStatus() }}
          </p>
        </div>
      </div>

      <!-- Detailed Breakdown -->
      <div class="bg-white p-4 rounded-lg border">
        <h4 class="text-lg font-semibold text-gray-900 mb-4">Detailed Breakdown</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 class="font-medium text-gray-700 mb-3">Score Distribution</h5>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span>90-100%:</span>
                <span class="font-medium">{{ getScoreDistribution(90, 100) }} students</span>
              </div>
              <div class="flex justify-between text-sm">
                <span>80-89%:</span>
                <span class="font-medium">{{ getScoreDistribution(80, 89) }} students</span>
              </div>
              <div class="flex justify-between text-sm">
                <span>70-79%:</span>
                <span class="font-medium">{{ getScoreDistribution(70, 79) }} students</span>
              </div>
              <div class="flex justify-between text-sm">
                <span>60-69%:</span>
                <span class="font-medium">{{ getScoreDistribution(60, 69) }} students</span>
              </div>
              <div class="flex justify-between text-sm">
                <span>Below 60%:</span>
                <span class="font-medium">{{ getScoreDistribution(0, 59) }} students</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 class="font-medium text-gray-700 mb-3">Performance Insights</h5>
            <div class="space-y-2 text-sm">
              <div class="flex items-start space-x-2">
                <span class="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                <span>Highest Score: {{ Math.max(...peerData.map(p => p.percentage)).toFixed(1) }}%</span>
              </div>
              <div class="flex items-start space-x-2">
                <span class="w-2 h-2 bg-red-500 rounded-full mt-2"></span>
                <span>Lowest Score: {{ Math.min(...peerData.map(p => p.percentage)).toFixed(1) }}%</span>
              </div>
              <div class="flex items-start space-x-2">
                <span class="w-2 h-2 bg-green-500 rounded-full mt-2"></span>
                <span>Standard Deviation: {{ calculateStandardDeviation().toFixed(1) }}%</span>
              </div>
              <div class="flex items-start space-x-2">
                <span class="w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                <span>Median Score: {{ calculateMedian().toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      <p>No peer data available for comparison.</p>
      <p class="text-sm">Try selecting different filters above.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

interface PeerData {
  student_name: string;
  marks: number;
  course_name: string;
  component_name: string;
  component_id: string;
  percentage: number;
  isCurrentStudent: boolean;
}

interface AssessmentComponent {
  component_id: string;
  component_name: string;
}

interface Props {
  currentStudentId: string;
}

const props = defineProps<Props>();

// Reactive data
const peerData = ref<PeerData[]>([]);
const loading = ref(false);
const error = ref('');
const selectedCourse = ref('');
const selectedAssessment = ref('');
const availableCourses = ref<string[]>([]);
const availableAssessments = ref<AssessmentComponent[]>([]);
const chartCanvas = ref<HTMLCanvasElement>();
const chartInstance = ref<Chart | null>(null);

// Computed properties
const currentStudentRank = computed(() => {
  const sortedData = [...peerData.value].sort((a: PeerData, b: PeerData) => b.percentage - a.percentage);
  const currentStudentIndex = sortedData.findIndex((student: PeerData) => student.isCurrentStudent);
  return currentStudentIndex + 1;
});

const classAverage = computed(() => {
  if (peerData.value.length === 0) return 0;
  const total = peerData.value.reduce((sum: number, student: PeerData) => sum + student.percentage, 0);
  return total / peerData.value.length;
});

const yourPerformance = computed(() => {
  const currentStudent = peerData.value.find((student: PeerData) => student.isCurrentStudent);
  return currentStudent ? currentStudent.percentage : 0;
});

// Methods
const fetchPeerData = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await fetch('http://localhost:8219/all-student-marks', {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch peer data');
    }
    
    const data = await response.json();
    console.log('Raw API data:', data);
    
    // Process the data
    processPeerData(data);
    
    // Update available courses and assessments
    updateAvailableFilters(data);
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
    console.error('Error fetching peer data:', err);
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'An unexpected error occurred';
    }
  } finally {
    loading.value = false;
  }
};

const processPeerData = (rawData: any[]) => {
  // Get current student's user ID from session or auth store
  const currentUserId = getCurrentUserId();
  console.log('Current User ID:', currentUserId);
  
  // Filter data based on selected course and assessment
  let filteredData = rawData;
  
  if (selectedCourse.value) {
    filteredData = filteredData.filter((item: any) => item.course_name === selectedCourse.value);
  }
  
  if (selectedAssessment.value) {
    filteredData = filteredData.filter((item: any) => item.component_id === selectedAssessment.value);
  }
  
  console.log('Filtered data:', filteredData);
  
  // Process the data to include percentage and identify current student
  const processedData = filteredData.map((item: any) => ({
    student_name: item.student_name,
    marks: parseFloat(item.mark_obtained) || 0,
    course_name: item.course_name,
    component_name: item.component_name,
    component_id: item.component_id,
    percentage: parseFloat(item.mark_obtained) || 0, // Assuming mark_obtained is already a percentage
    isCurrentStudent: item.student_id?.toString() === currentUserId || item.student_name === 'Current Student' // Adjust based on your data structure
  }));
  
  console.log('Processed data:', processedData);
  
  // Remove duplicates and anonymize other students
  peerData.value = removeDuplicatesAndAnonymize(processedData);
  
  console.log('Final peer data:', peerData.value);
  
  // Update chart after data processing
  nextTick(() => {
    updateChart();
  });
};

const removeDuplicatesAndAnonymize = (data: PeerData[]) => {
  const uniqueStudents = new Map();
  let studentCounter = 1;
  
  data.forEach((item: PeerData) => {
    const key = `${item.student_name}_${item.course_name}_${item.component_name}`;
    if (!uniqueStudents.has(key)) {
      uniqueStudents.set(key, {
        ...item,
        student_name: item.isCurrentStudent ? 'You' : `Student ${studentCounter++}`
      });
    }
  });
  
  return Array.from(uniqueStudents.values()) as PeerData[];
};

const updateAvailableFilters = (rawData: any[]) => {
  // Extract unique courses
  const courses = [...new Set(rawData.map((item: any) => item.course_name))];
  availableCourses.value = courses;
  
  // Extract unique assessments
  const assessments = rawData.reduce((acc: AssessmentComponent[], item: any) => {
    const exists = acc.find((a: AssessmentComponent) => a.component_id === item.component_id);
    if (!exists) {
      acc.push({
        component_id: item.component_id,
        component_name: item.component_name
      });
    }
    return acc;
  }, []);
  
  availableAssessments.value = assessments;
};

const getCurrentUserId = () => {
  // Try different ways to get the current user ID
  const userId = sessionStorage.getItem('userId') || 
                 sessionStorage.getItem('currentUserId') || 
                 props.currentStudentId;
  
  console.log('Retrieved user ID:', userId);
  return userId;
};

const updateChart = () => {
  if (!chartCanvas.value || peerData.value.length === 0) {
    console.log('Cannot update chart - no canvas or no data');
    return;
  }
  
  // Destroy existing chart
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }
  
  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;
  
  // Sort data by percentage for better visualization
  const sortedData = [...peerData.value].sort((a: PeerData, b: PeerData) => b.percentage - a.percentage);
  
  const labels = sortedData.map((item: PeerData) => item.student_name);
  const scores = sortedData.map((item: PeerData) => item.percentage);
  const backgroundColors = sortedData.map((item: PeerData) => 
    item.isCurrentStudent ? 'rgba(59, 130, 246, 0.8)' : 'rgba(156, 163, 175, 0.6)'
  );
  const borderColors = sortedData.map((item: PeerData) => 
    item.isCurrentStudent ? 'rgba(59, 130, 246, 1)' : 'rgba(156, 163, 175, 0.8)'
  );
  
  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Score (%)',
        data: scores,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              return `Score: ${context.raw}%`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value: any) {
              return value + '%';
            }
          },
          title: {
            display: true,
            text: 'Score (%)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Students'
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      }
    }
  });
};

const getPercentileText = () => {
  const percentile = Math.round(((peerData.value.length - currentStudentRank.value + 1) / peerData.value.length) * 100);
  return `${percentile}th percentile`;
};

const getPerformanceStatus = () => {
  if (yourPerformance.value >= 90) return 'Excellent';
  if (yourPerformance.value >= 80) return 'Very Good';
  if (yourPerformance.value >= 70) return 'Good';
  if (yourPerformance.value >= 60) return 'Satisfactory';
  return 'Needs Improvement';
};

const getScoreDistribution = (min: number, max: number) => {
  return peerData.value.filter((student: PeerData) => 
    student.percentage >= min && student.percentage <= max
  ).length;
};

const calculateStandardDeviation = () => {
  const scores = peerData.value.map((student: PeerData) => student.percentage);
  const mean = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum: number, score: number) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  return Math.sqrt(variance);
};

const calculateMedian = () => {
  const sortedScores = peerData.value.map((student: PeerData) => student.percentage).sort((a: number, b: number) => a - b);
  const mid = Math.floor(sortedScores.length / 2);
  return sortedScores.length % 2 !== 0 
    ? sortedScores[mid] 
    : (sortedScores[mid - 1] + sortedScores[mid]) / 2;
};

// Watchers
watch([selectedCourse, selectedAssessment], () => {
  fetchPeerData();
});

// Lifecycle
onMounted(() => {
  fetchPeerData();
});
</script>

<style scoped>
.peer-comparison-container {
  width: 100%;
}

.input-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>