<template>
    <nav class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                        <h1 class="text-xl font-bold text-gray-900">
                            Grade Management System
                        </h1>
                    </div>

                    <div class="hidden md:flex space-x-8">
                        <template v-if="currentUser?.role === 'student'">
                            <router-link to="/student" class="nav-link">
                                Dashboard
                            </router-link>
                            <router-link to="/student/grades" class="nav-link">
                                Grades
                            </router-link>
                            <router-link to="/student/progress" class="nav-link">
                                Progress
                            </router-link>
                        </template>

                        <template v-if="currentUser?.role === 'lecturer'">
                            <router-link to="/lecturer" class="nav-link">
                                Dashboard
                            </router-link>
                            <a href="#" class="nav-link">
                                Courses
                            </a>
                            <a href="#" class="nav-link">
                                Students
                            </a>
                            <a href="#" class="nav-link">
                                Analytics
                            </a>
                        </template>

                        <template v-if="currentUser?.role === 'advisor'">
                            <router-link to="/advisor" class="nav-link">
                                Dashboard
                            </router-link>
                            <a href="#" class="nav-link">
                                Advisees
                            </a>
                            <router-link to="/advisor/reports" class="nav-link">
                                Reports
                            </router-link>
                        </template>

                        <template v-if="currentUser?.role === 'admin'">
                            <router-link to="/admin" class="nav-link">
                                Dashboard
                            </router-link>
                            <router-link to="/admin/users" class="nav-link">
                                Users
                            </router-link>
                            <a href="#" class="nav-link">
                                System
                            </a>
                        </template>
                    </div>
                </div>

                <div class="flex items-center space-x-4">
                    <button class="p-2 text-gray-400 hover:text-gray-500 relative">
                        <BellIcon class="h-6 w-6" />
                        <span
                            class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                            3
                        </span>
                    </button>

                    <Menu as="div" class="relative">
                        <MenuButton
                            class="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            <img :src="currentUser?.profilePicture || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'"
                                alt="Profile" class="h-8 w-8 rounded-full object-cover">
                            <span class="text-gray-700 font-medium">{{ currentUser?.name }}</span>
                            <ChevronDownIcon class="h-4 w-4 text-gray-400" />
                        </MenuButton>

                        <transition enter-active-class="transition ease-out duration-100"
                            enter-from-class="transform opacity-0 scale-95"
                            enter-to-class="transform opacity-100 scale-100"
                            leave-active-class="transition ease-in duration-75"
                            leave-from-class="transform opacity-100 scale-100"
                            leave-to-class="transform opacity-0 scale-95">
                            <MenuItems
                                class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <MenuItem v-slot="{ active }">
                                <router-link to="/profile"
                                    :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">
                                    Your Profile
                                </router-link>
                                </MenuItem>
                                <MenuItem v-slot="{ active }">
                                <a href="#"
                                    :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">
                                    Settings
                                </a>
                                </MenuItem>
                                <MenuItem v-slot="{ active }">
                                <button @click="handleLogout"
                                    :class="[active ? 'bg-gray-100' : '', 'block w-full text-left px-4 py-2 text-sm text-gray-700']">
                                    Sign out
                                </button>
                                </MenuItem>
                            </MenuItems>
                        </transition>
                    </Menu>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { BellIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'

// Define an interface for the user object stored in sessionStorage
interface User {
    role: string;
    name?: string; // Optional, as it might not always be present or needed
    profilePicture?: string; // Optional
    // Add other properties you expect in the user object
}

const router = useRouter()
const currentUser = ref<User | null>(null) // Initialize as null or default user object

onMounted(() => {
    // Retrieve user data from sessionStorage on component mount
    const userData = sessionStorage.getItem("user");
    if (userData) {
        try {
            currentUser.value = JSON.parse(userData);
        } catch (e) {
            console.error("Failed to parse user data from sessionStorage:", e);
            currentUser.value = null;
        }
    }
});

const handleLogout = () => {
    // Clear user data from sessionStorage
    sessionStorage.removeItem("user");
    // Redirect to login page
    router.push('/login');
}
</script>

<style scoped>
/* Assuming Tailwind CSS is configured correctly.
     These classes are typically provided by Tailwind utility-first approach.
     If you have specific base styles for .nav-link, define them here. */
.nav-link {
    @apply text-gray-500 hover:text-gray-900 hover:border-gray-300 border-b-2 border-transparent px-1 pt-1 text-sm font-medium;
}

.router-link-active {
    @apply border-primary-500 text-gray-900;
}
</style>