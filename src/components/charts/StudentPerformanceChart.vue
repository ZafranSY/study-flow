<template>
  <div class="card">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Student Performance</h3>
    <div class="h-64">
      <Line :data="chartData" :options="chartOptions" :key="chartKey" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'

// --- Chart.js Registration ---
// Registers all the necessary components for a line chart to function properly.
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

// --- Component Properties ---
// Defines the props that this component accepts from its parent.
// In this case, it expects a 'data' object containing labels and values for the chart.
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

// --- Reactive State ---
// A key to force re-rendering of the chart component if the data structure changes fundamentally.
const chartKey = ref(0)

// --- Computed Properties ---
// `chartData` is a computed property that formats the incoming props data into the structure Chart.js expects.
// This will automatically update whenever the `props.data` changes.
const chartData = computed(() => ({
  labels: props.data.labels, // Assigns the labels (e.g., dates or assessment names) from props to the chart's x-axis.
  datasets: [
    {
      label: 'Marks Over Time', // The label for this specific dataset, shown on hover.
      data: props.data.values, // The actual data points (e.g., scores) for the chart's y-axis.
      borderColor: '#3b82f6', // Sets the color of the line itself.
      backgroundColor: '#3b82f620', // Sets the background color under the line (with transparency).
      fill: true, // Instructs the chart to fill the area under the line.
      tension: 0.4, // Smoothes the line so it's not jagged.
      pointRadius: 4, // The size of the data point circles on the line.
      pointHoverRadius: 6, // The size of the data point circles when you hover over them.
    }
  ]
}))

// `chartOptions` contains all the configuration for the chart's appearance and behavior.
const chartOptions = ref({
  responsive: true, // Allows the chart to resize with its container.
  maintainAspectRatio: false, // Prevents the chart from maintaining a fixed aspect ratio, allowing it to fill the container's height.
  plugins: {
    title: {
      display: true,
      text: 'Performance Over Time' // The main title displayed above the chart.
    },
    tooltip: {
      mode: 'index' as const, // Shows tooltips for all datasets at a given x-axis index.
      intersect: false, // Tooltip will appear even if the mouse isn't directly over a point.
    }
  },
  scales: {
    y: {
      beginAtZero: true, // Ensures the y-axis starts at 0.
      max: 100, // Sets the maximum value of the y-axis to 100.
      grid: {
        color: '#f3f4f6' // Sets the color of the horizontal grid lines.
      },
      ticks: {
        // A callback function to format the y-axis labels.
        callback: function(value: any) {
          return value + '%' // Appends a '%' symbol to each y-axis tick.
        }
      }
    },
    x: {
      grid: {
        color: '#f3f4f6' // Sets the color of the vertical grid lines.
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index' as const,
  }
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
}
</style>