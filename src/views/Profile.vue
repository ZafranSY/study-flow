<template>
    <div class="min-h-screen bg-gray-50">
        <Navigation />

        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="mb-8">
                <h1 class="text-2xl font-bold text-gray-900">Profile</h1>
                <p class="text-gray-600">View your complete account information</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-1">
                    <div class="card text-center">
                        <div class="mb-6">
                            <img :src="profileData.profilePicture" alt="Profile Picture"
                                class="h-32 w-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg">
                            <!-- <button @click="showImageUpload = true" class="mt-4 btn-secondary text-sm">
                                Change Photo
                            </button> -->
                        </div>

                        <h3 class="text-xl font-semibold text-gray-900">{{ profileData.name }}</h3>
                        <p class="text-gray-600 capitalize">{{ profileData.role }}</p>
                        <p v-if="profileData.email" class="text-sm text-gray-500">
                            {{ profileData.email }}
                        </p>

                        <div class="mt-4">
                            <span :class="getRoleBadgeColor(profileData.role)"
                                class="px-3 py-1 text-sm font-medium rounded-full capitalize">
                                {{ profileData.role }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-2">
                    <div class="card">
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold text-gray-900">Personal Information</h3>
                        </div>

                        <div class="space-y-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <p class="input-field-display">{{ profileData.name }}</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                <p class="input-field-display">{{ profileData.username || 'N/A' }}</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <p class="input-field-display">{{ profileData.email }}</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Matric Number</label>
                                <p class="input-field-display">{{ profileData.matricNumber || 'N/A' }}</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">PIN</label>
                                <p class="input-field-display">{{ profileData.pin || 'N/A' }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="card mt-8">
                        <h3 class="text-lg font-semibold text-gray-900 mb-6">Security Information</h3>

                        <div class="space-y-6">
                            <div>
                                <h4 class="text-md font-medium text-gray-900">Password</h4>
                                <p class="text-sm text-gray-600">Your password is securely managed. Please contact
                                    support to change it.</p>
                            </div>

                            <div class="border-t border-gray-200 pt-6">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <h4 class="text-md font-medium text-gray-900">Two-Factor Authentication</h4>
                                        <p class="text-sm text-gray-600">
                                            Status:
                                            <span :class="twoFactorEnabled ? 'text-green-600' : 'text-red-600'"
                                                class="font-medium">
                                                {{ twoFactorEnabled ? 'Enabled' : 'Disabled' }}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="showImageUpload"
                class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-md m-4">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="text-lg font-semibold text-gray-900">Change Profile Picture</h4>
                        <button @click="showImageUpload = false" class="text-gray-400 hover:text-gray-600">
                            <XMarkIcon class="h-6 w-6" />
                        </button>
                    </div>

                    <div class="space-y-4">
                        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <CameraIcon class="mx-auto h-12 w-12 text-gray-400" />
                            <div class="mt-2">
                                <label class="cursor-pointer">
                                    <span class="text-sm text-primary-600 hover:text-primary-500">Upload a file</span>
                                    <input type="file" class="sr-only" accept="image/*" @change="handleImageUpload">
                                </label>
                                <p class="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        </div>

                        <div class="flex justify-end space-x-3">
                            <button @click="showImageUpload = false" class="btn-secondary">Cancel</button>
                            <button class="btn-primary">Save Photo</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { XMarkIcon, CameraIcon } from '@heroicons/vue/24/outline';
import Navigation from '../components/shared/Navigation.vue';
import { useAuthStore } from '../stores/auth'; // Keeping this if it's used elsewhere

const authStore = useAuthStore();
const showImageUpload = ref(false);
const twoFactorEnabled = ref(false); // Can be set dynamically if 2FA status is in user data

const profileData = ref({
    name: '',
    email: '',
    username: '', // Added username
    role: '',
    matricNumber: null as string | null, // Explicitly allow null
    pin: null as string | null, // Explicitly allow null
    profilePicture: ''
});

onMounted(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
        try {
            const userData = JSON.parse(storedUser);
            const userProfile = userData;

            if (userProfile) {
                profileData.value = {
                    name: userProfile.full_name || userProfile.username || '',
                    email: userProfile.email || '',
                    username: userProfile.username || '', // Map username
                    role: userProfile.role || '',
                    matricNumber: userProfile.matric_number,
                    pin: userProfile.pin,
                    profilePicture: userProfile.profile_picture || ''
                };

            }
        } catch (e) {
            console.error("Failed to parse user data from session storage:", e);
        }
    } else {
        console.warn("No user data found in session storage.");
    }
});

const getRoleBadgeColor = (role: string) => {
    const colors = {
        admin: 'bg-purple-100 text-purple-800',
        lecturer: 'bg-blue-100 text-blue-800',
        advisor: 'bg-green-100 text-green-800',
        student: 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

// const handleImageUpload = (event: Event) => {
//     const target = event.target as HTMLInputElement;
//     if (target.files && target.files[0]) {
//         const file = target.files[0];

//         console.log('Attempting to upload image:', file.name);

//         alert('Image upload simulated. In a real app, this would send to a server.');
//         showImageUpload.value = false; 
//     }
// };
</script>
