<template>
  <TransitionRoot as="template" :show="show">
    <Dialog as="div" class="relative z-10" @close="closeModal">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div>
                <div class="flex justify-between items-center mb-4">
                  <DialogTitle as="h3" class="text-lg font-semibold leading-6 text-gray-900">Edit Student Details</DialogTitle>
                  <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
                <form @submit.prevent="saveChanges" class="space-y-4">
                  <div>
                    <label for="fullName" class="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      v-model="editableStudent.full_name"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      id="username"
                      v-model="editableStudent.username"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm"
                      disabled
                    />
                    <p class="mt-1 text-xs text-gray-500">Username cannot be changed.</p>
                  </div>
                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      id="email"
                      v-model="editableStudent.email"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label for="matricNumber" class="block text-sm font-medium text-gray-700">Matric Number</label>
                    <input
                      type="text"
                      id="matricNumber"
                      v-model="editableStudent.matric_number"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label for="profilePictureUrl" class="block text-sm font-medium text-gray-700">Profile Picture URL</label>
                    <input
                      type="url"
                      id="profilePictureUrl"
                      v-model="editableStudent.profile_picture"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                      :disabled="isSaving"
                    >
                      <span v-if="isSaving">Saving...</span>
                      <span v-else>Save Changes</span>
                    </button>
                    <button
                      type="button"
                      class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                      @click="closeModal"
                      :disabled="isSaving"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script lang="ts">
import { defineComponent, ref, watch, reactive } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';

interface Student {
  user_id: number;
  full_name: string;
  username: string;
  email: string;
  matric_number: string;
  profile_picture: string;
  // Add other properties as they exist in your 'users' table for students
}

export default defineComponent({
  name: 'EditStudentDetailsModal',
  components: {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    student: {
      type: Object as () => Student | null,
      default: null,
    },
  },
  emits: ['close', 'updated'],
  setup(props, { emit }) {
    const isSaving = ref(false);
    // Use reactive to create a deep copy for editing
    const editableStudent = reactive<Student>({
      user_id: 0,
      full_name: '',
      username: '',
      email: '',
      matric_number: '',
      profile_picture: '',
    });

    // Watch for changes in the 'student' prop and update editableStudent
    watch(() => props.student, (newStudent) => {
      if (newStudent) {
        Object.assign(editableStudent, newStudent);
      } else {
        // Reset if student prop becomes null
        Object.assign(editableStudent, {
          user_id: 0,
          full_name: '',
          username: '',
          email: '',
          matric_number: '',
          profile_picture: '',
        });
      }
    }, { immediate: true }); // Run immediately on component mount

    const closeModal = () => {
      emit('close');
    };

    const saveChanges = async () => {
      if (!editableStudent.user_id) {
        alert('Student ID is missing. Cannot save changes.');
        return;
      }

      isSaving.value = true;
      const token = sessionStorage.getItem('token');

      if (!token) {
        alert('Authentication token missing. Please log in again.');
        isSaving.value = false;
        // You might want to redirect to login here
        return;
      }

      try {
        const response = await fetch(`http://localhost:8219/users/${editableStudent.user_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: editableStudent.full_name,
            email: editableStudent.email,
            matric_number: editableStudent.matric_number,
            profile_picture: editableStudent.profile_picture,
            // Do NOT send username as it's disabled and cannot be changed via PUT /users/{id}
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to update student: ${errorData.error || response.statusText}`);
        }

        const result = await response.json();
        alert(result.message || 'Student details updated successfully!');
        emit('updated'); // Emit event to notify parent of update
        closeModal();
      } catch (error) {
        console.error('Error saving student changes:', error);
        alert(`Error saving changes: ${error.message}`);
      } finally {
        isSaving.value = false;
      }
    };

    return {
      editableStudent,
      isSaving,
      closeModal,
      saveChanges,
    };
  },
});
</script>

<style scoped>
/* Tailwind CSS classes are used directly in the template, 
   but you can add custom styles here if needed. */
</style>
