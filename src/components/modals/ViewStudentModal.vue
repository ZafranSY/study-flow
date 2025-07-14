<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Student Details</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <div v-if="student" class="space-y-3 text-gray-700">
        <div class="flex items-center space-x-4 mb-4">
          <img :src="student.profile_picture || 'https://placehold.co/64x64/E0E0E0/888888?text=DP'" alt="Profile" class="h-16 w-16 rounded-full object-cover">
          <div>
            <p class="text-xl font-bold text-gray-900">{{ student.full_name }}</p>
            <p class="text-sm text-gray-600">{{ student.username }}</p>
          </div>
        </div>
        <p><strong>Matric No.:</strong> {{ student.matric_number || 'N/A' }}</p>
        <p><strong>Email:</strong> {{ student.email || 'N/A' }}</p>
        <p><strong>Course:</strong> {{ student.course_code || 'N/A' }}</p>
        <p><strong>Role:</strong> <span class="capitalize">{{ student.role || 'N/A' }}</span></p>
        <p><strong>User ID:</strong> {{ student.user_id || 'N/A' }}</p>
        <!-- You can add more details here, e.g., calculated grade if passed -->
        <p v-if="student.current_grade"><strong>Current Grade:</strong> {{ student.current_grade }}%</p>
      </div>
      <div v-else class="text-center text-gray-500 py-4">
        No student details available.
      </div>
      <div class="flex justify-end mt-6">
        <button @click="$emit('close')" class="btn-primary">Close</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ViewStudentDetailsModal', // Optional: give it a name
  props: {
    show: {
      type: Boolean,
      required: true
    },
    student: {
      type: Object, // Use Object for any, or define a more specific interface
      default: null
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    // You can move the logic from script setup here if needed,
    // but for simple props/emits, defineProps/defineEmits are sufficient.
    // For this modal, no complex setup logic is required beyond props/emits.
    return {}; // Return empty object for setup
  }
});
</script>

<style scoped>
.btn-primary {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500;
}
</style>
