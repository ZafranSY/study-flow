<template>
  <div class="card">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-600">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900">{{ value }}</p>
        <p v-if="change" class="text-sm" :class="changeColor">
          {{ change }}
        </p>
      </div>
      <div :class="iconBgColor" class="p-3 rounded-full">
        <component :is="icon" class="h-6 w-6" :class="iconColor" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: string | number
  change?: string
  icon: any
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary'
})

const iconBgColor = computed(() => {
  const colors = {
    primary: 'bg-primary-100',
    secondary: 'bg-secondary-100',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    danger: 'bg-red-100'
  }
  return colors[props.variant]
})

const iconColor = computed(() => {
  const colors = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600'
  }
  return colors[props.variant]
})

const changeColor = computed(() => {
  if (!props.change) return ''
  const isPositive = props.change.includes('+') || props.change.includes('↑')
  return isPositive ? 'text-green-600' : 'text-red-600'
})
</script>