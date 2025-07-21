<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Create New Course</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">&times;</button>
      </div>
      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label for="courseCode" class="block text-sm font-medium text-gray-700">Course Code</label>
          <input type="text" id="courseCode" v-model="form.course_code" class="input-field" required>
        </div>
        <div>
          <label for="courseName" class="block text-sm font-medium text-gray-700">Course Name</label>
          <input type="text" id="courseName" v-model="form.course_name" class="input-field" required>
        </div>
        <div>
          <label for="creditHours" class="block text-sm font-medium text-gray-700">Credit Hours</label>
          <input type="number" id="creditHours" v-model.number="form.credit_hours" class="input-field" required min="1">
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Create Course</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

const props = defineProps<{ show: boolean }>();
const emit = defineEmits(['close', 'course-created']);

// **FORM UPDATED**
const form = reactive({
  course_code: '',
  course_name: '',
  credit_hours: null as number | null
});

// **FORM RESET UPDATED**
watch(() => props.show, (newVal) => {
  if (!newVal) {
    form.course_code = '';
    form.course_name = '';
    form.credit_hours = null;
  }
});

const submitForm = () => {
  emit('course-created', { ...form });
  emit('close');
};
</script>