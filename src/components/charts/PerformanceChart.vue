<template>
  <div class="card p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ title }}</h3>
    <div v-if="chartData.labels.length > 0 && chartData.values.length > 0">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <div v-else class="text-center py-8 text-gray-500">
      <p>No performance data available.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

const props = defineProps<{
  title: string;
  data: {
    labels: string[];
    values: number[];
  };
  color: string;
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let myChart: Chart | null = null;

const chartData = ref({
  labels: props.data.labels || [],
  values: props.data.values || []
});

const createChart = () => {
  if (myChart) {
    myChart.destroy(); // Destroy existing chart instance before creating a new one
  }

  if (chartCanvas.value && chartData.value.labels.length > 0 && chartData.value.values.length > 0) {
    const ctx = chartCanvas.value.getContext('2d');
    if (ctx) {
      myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.value.labels,
          datasets: [{
            label: 'Performance',
            data: chartData.value.values,
            borderColor: props.color,
            backgroundColor: `${props.color}40`, // Add some transparency
            tension: 0.3,
            fill: true,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100 // Assuming grades are out of 100
            }
          },
          plugins: {
            legend: {
              display: false // Hide legend if only one dataset
            }
          }
        }
      });
    }
  }
};

onMounted(() => {
  createChart();
});

// Watch for changes in the data prop and re-render the chart
watch(() => props.data, (newData) => {
  chartData.value.labels = newData.labels || [];
  chartData.value.values = newData.values || [];
  if (myChart) {
    myChart.data.labels = chartData.value.labels;
    myChart.data.datasets[0].data = chartData.value.values;
    myChart.update();
  } else {
    createChart(); // Recreate if chart was not initialized
  }
}, { deep: true }); // Deep watch for nested changes in data object

onBeforeUnmount(() => {
  if (myChart) {
    myChart.destroy(); // Clean up chart instance
  }
});
</script>

<style scoped>
/* Add any component-specific styles here if needed */
.card {
  @apply bg-white shadow overflow-hidden sm:rounded-lg p-6;
}
</style>
