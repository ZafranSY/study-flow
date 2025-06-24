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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

// Props received from the parent
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const chartKey = ref(0)
const chartData = computed(() => ({
  labels: props.data.labels, // Using data passed from the parent
  datasets: [
    {
      label: 'Marks Over Time',
      data: props.data.values, // Using data passed from the parent
      borderColor: '#3b82f6',
      backgroundColor: '#3b82f620',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    }
  ]
}))

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: 'Performance Over Time'
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      grid: {
        color: '#f3f4f6'
      },
      ticks: {
        callback: function(value: any) {
          return value + '%'
        }
      }
    },
    x: {
      grid: {
        color: '#f3f4f6'
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
