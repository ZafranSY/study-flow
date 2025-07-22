<script setup lang="ts">
import { ref, watch } from 'vue';

// Define interfaces for data structures
interface Advisee {
    advisor_student_id: number;
    student_id: number;
    student_name: string;
    matric_number: string;
    student_email: string;
    profile_picture?: string;
    gpa: number;
    status: string;
    last_meeting_date?: string;
}

// Interface for Advisor Note, matching the API response
interface AdvisorNote {
    note_id: number;
    advisor_student_id: number;
    note_content: string;
    meeting_date: string;
    recommendations?: string[];
    follow_up_required?: boolean;
    created_at: string; // This is a full ISO timestamp from the API
    updated_at: string;
    advisor_id: number;
    student_id: number;
    advisor_name: string;
    student_name: string;
    matric_number: string;
}

const props = defineProps<{
    show: boolean;
    student: Advisee | null;
    previousNotes: AdvisorNote[]; // Prop to receive previous notes
}>();

const emit = defineEmits(['close', 'save-note', 'update-note']); // Added 'update-note' emit event

const meetingDate = ref('');
const noteContent = ref('');
const recommendations = ref('');
const followUpRequired = ref(false);
const errorMessage = ref('');

const isEditing = ref(false); // New state to track if we are editing an existing note
const editingNoteId = ref<number | null>(null); // Stores the ID of the note being edited
const showAddForm = ref(false); // New state to control visibility of the add/edit form

// Watch for changes in the 'show' prop to reset the form when the modal opens
watch(() => props.show, (newVal) => {
    if (newVal) {
        resetForm(); // Reset form when modal opens
    }
});

/**
 * Resets the form fields and editing state.
 */
const resetForm = () => {
    meetingDate.value = new Date().toISOString().split('T')[0];
    noteContent.value = '';
    recommendations.value = '';
    followUpRequired.value = false;
    errorMessage.value = '';
    isEditing.value = false;
    editingNoteId.value = null;
    showAddForm.value = false; // Ensure the form is hidden when resetting
};

/**
 * Handles saving or updating a meeting note.
 */
const handleSave = () => {
    if (!meetingDate.value || !noteContent.value) {
        errorMessage.value = 'Please fill in both meeting date and note content.';
        return;
    }
    errorMessage.value = '';

    // Split recommendations by comma and trim whitespace, filter out empty strings
    const recsArray = recommendations.value
        .split(',')
        .map(rec => rec.trim())
        .filter(rec => rec.length > 0);

    const notePayload = {
        meeting_date: meetingDate.value,
        note_content: noteContent.value,
        recommendations: recsArray,
        follow_up_required: followUpRequired.value,
    };

    if (isEditing.value && editingNoteId.value !== null) {
        // If in edit mode, emit 'update-note' with the note ID
        emit('update-note', editingNoteId.value, notePayload);
    } else {
        // Otherwise, emit 'save-note' for a new note
        emit('save-note', notePayload);
    }
};

/**
 * Sets the modal to edit mode and populates the form with the selected note's data.
 * @param note The AdvisorNote object to be edited.
 */
const editNote = (note: AdvisorNote) => {
    isEditing.value = true;
    editingNoteId.value = note.note_id;
    meetingDate.value = note.meeting_date;
    noteContent.value = note.note_content;
    recommendations.value = note.recommendations ? note.recommendations.join(', ') : '';
    followUpRequired.value = note.follow_up_required || false;
    errorMessage.value = ''; // Clear any previous error messages
    showAddForm.value = true; // Show the form when editing an existing note
};

/**
 * Formats a date string into a readable format.
 * This function is robust to handle both YYYY-MM-DD and full ISO timestamps.
 */
const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        let date;
        // If the string contains 'T', it's likely a full ISO timestamp, parse directly.
        // Otherwise, assume it's YYYY-MM-DD and append UTC midnight for consistent parsing.
        if (dateString.includes('T')) {
            date = new Date(dateString);
        } else {
            date = new Date(dateString + 'T00:00:00Z');
        }

        // Check if the parsed date is valid
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date format');
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC' // Keep UTC to avoid local timezone shifts
        });
    } catch (e) {
        console.error("Error formatting date:", dateString, e); // Log error for debugging
        return 'Invalid Date';
    }
};

</script>

<template>
    <Transition name="modal">
        <div v-if="show"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75 transition-opacity duration-300 ease-in-out"
            @click.self="emit('close')">
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 transform transition-all duration-300 ease-in-out scale-95 opacity-0"
                :class="{ 'scale-100 opacity-100': show }" @click.stop>

                <div class="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 class="text-2xl font-bold text-gray-900">Log Meeting for {{ student?.student_name }}</h3>
                    <button @click="emit('close')"
                        class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Error Message -->
                <div v-if="errorMessage"
                    class="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded-md text-sm" role="alert">
                    <p>{{ errorMessage }}</p>
                </div>

                <!-- Previous Meeting Notes Section -->
                <div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">Previous Meeting Notes</h4>
                    <!-- Dynamic max-height based on showAddForm -->
                    <div :class="{ 'max-h-96': !showAddForm, 'max-h-60': showAddForm }"
                        class="mb-6 overflow-y-auto pr-2 transition-all duration-300 ease-in-out">
                        <ul class="space-y-4">
                            <li v-for="note in previousNotes" :key="note.note_id"
                                class="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                                <div class="flex justify-between items-center mb-2">
                                    <p class="text-sm font-medium text-gray-600">Date: <span
                                            class="text-gray-800 font-semibold">{{ formatDate(note.meeting_date)
                                            }}</span></p>
                                    <p class="text-xs text-gray-500">Last updated: {{ note.updated_at }}</p>
                                </div>
                                <p class="text-gray-700 leading-relaxed">{{ note.note_content }}</p>
                                <div v-if="note.recommendations && note.recommendations.length > 0"
                                    class="mt-2 text-sm text-gray-600">
                                    <p class="font-medium">Recommendations:</p>
                                    <ul class="list-disc list-inside ml-2 text-gray-600">
                                        <li v-for="(rec, index) in note.recommendations" :key="index">{{ rec }}</li>
                                    </ul>
                                </div>
                                <p v-if="note.follow_up_required" class="mt-2 text-sm text-blue-600 font-medium">
                                    Follow-up required.</p>
                                <div class="mt-3 text-right">
                                    <button @click="editNote(note)"
                                        class="text-primary-600 hover:text-primary-800 text-sm font-medium transition duration-150 ease-in-out">
                                        Edit
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                    
                </div>

                <!-- Add New Note Button (Moved to bottom of previous notes section) -->
                <div class="flex justify-center mt-4 mb-6" v-if="!showAddForm">
                    <button @click="showAddForm = true"
                        class="px-6 py-2.5 rounded-lg text-white bg-secondary-600 hover:bg-secondary-700 font-medium transition duration-150 ease-in-out shadow-md">
                        Add New Note
                    </button>
                </div>

                <!-- Log New Meeting Form (Conditionally rendered) -->
                <div v-if="showAddForm" class="mt-6 border-t pt-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-4">{{ isEditing ? 'Edit Meeting Note' : 'Log New Meeting' }}</h4>
                    <div class="mb-4">
                        <label for="meetingDate" class="block text-sm font-medium text-gray-700 mb-1">Meeting
                            Date</label>
                        <input type="date" id="meetingDate" v-model="meetingDate"
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                    </div>
                    <div class="mb-6">
                        <label for="noteContent" class="block text-sm font-medium text-gray-700 mb-1">Meeting
                            Notes</label>
                        <textarea id="noteContent" v-model="noteContent" rows="5"
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm resize-y"
                            placeholder="Enter detailed notes about the meeting..."></textarea>
                    </div>

                    <div class="mb-6">
                        <label for="recommendations"
                            class="block text-sm font-medium text-gray-700 mb-1">Recommendations
                            (comma-separated)</label>
                        <textarea id="recommendations" v-model="recommendations" rows="2"
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm resize-y"
                            placeholder="e.g., Review calculus concepts, Attend career fair"></textarea>
                    </div>

                    <div class="mb-6 flex items-center">
                        <input type="checkbox" id="followUpRequired" v-model="followUpRequired"
                            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
                        <label for="followUpRequired" class="ml-2 block text-sm text-gray-900">Follow-up
                            required</label>
                    </div>

                    <div class="flex justify-end space-x-3">
                        <button @click="emit('close')"
                            class="px-5 py-2.5 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 font-medium transition duration-150 ease-in-out shadow-sm">
                            Cancel
                        </button>
                        <!-- Moved Hide Form button here -->
                        <button v-if="!isEditing" @click="resetForm"
                            class="px-5 py-2.5 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 font-medium transition duration-150 ease-in-out shadow-sm">
                            Hide Form
                        </button>
                        <button v-if="isEditing" @click="resetForm"
                            class="px-5 py-2.5 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 font-medium transition duration-150 ease-in-out shadow-sm">
                            Cancel Edit
                        </button>
                        <button @click="handleSave"
                            class="px-5 py-2.5 rounded-lg text-white bg-primary-600 hover:bg-primary-700 font-medium transition duration-150 ease-in-out shadow-md">
                            {{ isEditing ? 'Update Note' : 'Save Note' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
/* Modal Transition Styles */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

/* Specific styles for the modal content transition */
.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
    transition: all 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
    transform: scale(0.95);
    opacity: 0;
}

/* Custom Primary Color (adjust as needed) */
.text-primary-600 {
    color: #4F46E5;
}

/* Indigo */
.focus:ring-primary-500 {
    --tw-ring-color: #6366F1;
}

.focus:border-primary-500 {
    border-color: #6366F1;
}

.bg-primary-600 {
    background-color: #4F46E5;
}

.hover:bg-primary-700:hover {
    background-color: #4338CA;
}

.bg-secondary-600 {
    background-color: #10B981;
}

/* Emerald */
.hover:bg-secondary-700:hover {
    background-color: #0B7A58;
}
</style>
