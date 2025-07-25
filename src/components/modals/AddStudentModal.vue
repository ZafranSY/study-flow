<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Add New Student</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label for="fullName" class="block text-sm font-medium text-gray-700">Full Name</label>
          <input type="text" id="fullName" v-model="form.full_name" class="input-field" required>
        </div>
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input type="text" id="username" v-model="form.username" class="input-field" required>
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="email" v-model="form.email" class="input-field" required>
        </div>
        <div>
          <label for="matricNumber" class="block text-sm font-medium text-gray-700">Matric Number</label>
          <input type="text" id="matricNumber" v-model="form.matric_number" class="input-field">
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" id="password" v-model="form.password" class="input-field" required>
        </div>
        <div>
          <label for="profilePicture" class="block text-sm font-medium text-gray-700">Profile Picture URL (Optional)</label>
          <input type="url" id="profilePicture" v-model="form.profile_picture" class="input-field">
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Add Student</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';

// --- Component Properties ---
// Defines the props this modal component accepts from its parent.
// 'show': A boolean to control the visibility of the modal.
const props = defineProps<{
  show: boolean;
}>();

// --- Component Events ---
// Declares the custom events that this component can emit to its parent.
// 'close': Emitted when the modal should be closed (e.g., clicking cancel).
// 'add-student': Emitted when the form is submitted, carrying the new student's data.
const emit = defineEmits(['close', 'add-student']);

// --- Reactive Form State ---
// Uses Vue's `reactive` to create an object that holds the form's input values.
// This object will be two-way bound to the input fields in the template.
const form = reactive({
  full_name: '',
  username: '',
  email: '',
  matric_number: '',
  password: '',
  role: 'student', // Sets a default role for any new user created through this form.
  profile_picture: ''
});

// --- Watcher for Form Reset ---
// Watches the `show` prop. When the modal is closed (`show` becomes false),
// this function triggers and resets all the fields in the form to their initial state.
// This ensures the form is clean every time it's opened.
watch(() => props.show, (newValue) => {
  if (!newValue) {
    Object.assign(form, {
      full_name: '',
      username: '',
      email: '',
      matric_number: '',
      password: '',
      role: 'student',
      profile_picture: ''
    });
  }
});

// --- Form Submission Handler ---
// This function is called when the form's submit button is clicked.
// It prevents the default browser form submission and instead emits the 'add-student' event.
// A copy of the form data is sent as the event's payload to the parent component.
const submitForm = () => {
  emit('add-student', { ...form }); // Emit a copy of the form data
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