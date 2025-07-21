<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Edit Course</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">&times;</button>
      </div>
      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label for="editCourseCode" class="block text-sm font-medium text-gray-700">Course Code</label>
          <input type="text" id="editCourseCode" v-model="editableCourse.course_code" class="input-field" required>
        </div>
        <div>
          <label for="editCourseName" class="block text-sm font-medium text-gray-700">Course Name</label>
          <input type="text" id="editCourseName" v-model="editableCourse.course_name" class="input-field" required>
        </div>
        <div>
          <label for="editCreditHours" class="block text-sm font-medium text-gray-700">Credit Hours</label>
          <input type="number" id="editCreditHours" v-model.number="editableCourse.credit_hours" class="input-field" required min="1">
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  credit_hours: number; // **FIELD ADDED**
}

const props = defineProps<{ 
  show: boolean,
  course: Course | null
}>();
const emit = defineEmits(['close', 'course-updated']);

// **OBJECT UPDATED**
const editableCourse = reactive<Partial<Course>>({
  course_id: undefined,
  course_code: '',
  course_name: '',
  credit_hours: undefined
});

watch(() => props.course, (newVal) => {
  if (newVal) {
    Object.assign(editableCourse, newVal);
  }
}, { immediate: true });

const submitForm = () => {
  emit('course-updated', { ...editableCourse });
  emit('close');
};
</script>