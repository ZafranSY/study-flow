<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Edit Student Details</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <form @submit.prevent="submitForm" class="space-y-4" v-if="localStudent">
        <div>
          <label for="editFullName" class="block text-sm font-medium text-gray-700">Full Name</label>
          <input type="text" id="editFullName" v-model="localStudent.full_name" class="input-field" required>
        </div>
        <div>
          <label for="editUsername" class="block text-sm font-medium text-gray-700">Username</label>
          <input type="text" id="editUsername" v-model="localStudent.username" class="input-field" disabled>
          <p class="text-xs text-gray-500 mt-1">Username cannot be changed.</p>
        </div>
        <div>
          <label for="editEmail" class="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="editEmail" v-model="localStudent.email" class="input-field" required>
        </div>
        <div>
          <label for="editMatricNumber" class="block text-sm font-medium text-gray-700">Matric Number</label>
          <input type="text" id="editMatricNumber" v-model="localStudent.matric_number" class="input-field">
        </div>
        <div>
          <label for="editProfilePicture" class="block text-sm font-medium text-gray-700">Profile Picture URL</label>
          <input type="url" id="editProfilePicture" v-model="localStudent.profile_picture" class="input-field">
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Save Changes</button>
        </div>
      </form>
      <div v-else class="text-center text-gray-500 py-4">
        No student selected for editing.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  student: any | null; // The student object to edit
}>();

const emit = defineEmits(['close', 'update-student']);

// Create a local copy of the student data to prevent direct prop mutation
const localStudent = ref<any | null>(null);

watch(() => props.student, (newStudent) => {
  if (newStudent) {
    localStudent.value = { ...newStudent }; // Deep copy if nested objects need independent editing
  } else {
    localStudent.value = null;
  }
}, { immediate: true }); // Run immediately on component mount

const submitForm = () => {
  if (localStudent.value) {
    emit('update-student', { ...localStudent.value }); // Emit a copy of the updated data
  }
};
</script>

<style scoped>
.input-field {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm;
}
.btn-primary {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500;
}
.btn-secondary {
  @apply inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500;
}
</style>
