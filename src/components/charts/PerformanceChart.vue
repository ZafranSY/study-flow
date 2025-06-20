<template>
  <div class="card">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ title }}</h3>
    <div class="h-64">
      <Line
        :data="chartData"
        :options="chartOptions"
        :key="chartKey"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface Props {
  title: string
  data: {
    labels: string[]
    values: number[]
  }
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: '#3b82f6'
})

const chartKey = ref(0)

const chartData = computed(() => ({
  labels: props.data.labels,
  datasets: [
    {
      label: 'Performance',
      data: props.data.values,
      borderColor: props.color,
      backgroundColor: props.color + '20',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    }
  ]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
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
}))
</script>