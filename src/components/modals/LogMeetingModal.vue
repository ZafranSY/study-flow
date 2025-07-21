<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Log Meeting for {{ student?.student_name }}</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">&times;</button>
      </div>
      <form @submit.prevent="submitNote" class="space-y-4">
        <div>
          <label for="meetingDate" class="block text-sm font-medium text-gray-700">Meeting Date</label>
          <input type="date" id="meetingDate" v-model="formData.meeting_date" class="input-field" required>
        </div>
        <div>
          <label for="noteContent" class="block text-sm font-medium text-gray-700">Meeting Notes</label>
          <textarea
            id="noteContent"
            v-model="formData.note_content"
            rows="5"
            class="input-field"
            placeholder="Enter details about the consultation..."
            required
          ></textarea>
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
          <button type="submit" :disabled="!formData.note_content.trim()" class="btn-primary">Save Note</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

interface Student {
  student_id: number;
  student_name: string;
}

const props = defineProps<{ 
  show: boolean;
  student: Student | null;
}>();

const emit = defineEmits(['close', 'save-note']);

// CORRECTED: The keys now match the database schema
const formData = reactive({
  meeting_date: new Date().toISOString().slice(0, 10),
  note_content: ''
});

watch(() => props.show, (newVal) => {
  if (newVal) {
    formData.meeting_date = new Date().toISOString().slice(0, 10);
  } else {
    formData.note_content = '';
  }
});

const submitNote = () => {
  if (props.student) {
    emit('save-note', { ...formData });
  }
};
</script>