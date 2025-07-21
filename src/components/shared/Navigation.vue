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
                            <router-link to="/lecturer/marks" class="nav-link">
                                Grades
                            </router-link>
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
                    <!-- Notification Bell Icon with Dropdown -->
                    <Menu as="div" class="relative">
                        <MenuButton @click="fetchNotifications" class="p-2 text-gray-400 hover:text-gray-500 relative">
                            <BellIcon class="h-6 w-6" />
                            <span v-if="unreadNotificationCount > 0"
                                class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                                {{ unreadNotificationCount }}
                            </span>
                        </MenuButton>

                        <transition enter-active-class="transition ease-out duration-100"
                            enter-from-class="transform opacity-0 scale-95"
                            enter-to-class="transform opacity-100 scale-100"
                            leave-active-class="transition ease-in duration-75"
                            leave-from-class="transform opacity-100 scale-100"
                            leave-to-class="transform opacity-0 scale-95">
                            <MenuItems
                                class="absolute right-0 z-20 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-96 overflow-y-auto">
                                <div class="px-4 py-2 text-sm font-semibold text-gray-900 border-b border-gray-100">
                                    Notifications
                                </div>
                                <template v-if="notifications.length > 0">
                                    <MenuItem v-for="notification in notifications" :key="notification.notification_id" v-slot="{ active }">
                                        <a href="#" @click.prevent="markNotificationAsRead(notification.notification_id)"
                                            :class="[
                                                active ? 'bg-gray-100' : '',
                                                notification.is_read === 0 ? 'bg-blue-50' : '', // Highlight unread
                                                'block px-4 py-3 text-sm border-b border-gray-100 last:border-b-0 cursor-pointer'
                                            ]">
                                            <p class="font-medium text-gray-900">{{ notification.title }}</p>
                                            <p class="text-gray-600 text-xs mt-1">{{ notification.message }}</p>
                                            <p class="text-gray-500 text-xs mt-1">{{ new Date(notification.created_at).toLocaleString() }}</p>
                                        </a>
                                    </MenuItem>
                                    <MenuItem v-if="unreadNotificationCount > 0" v-slot="{ active }">
                                        <button @click="markAllAsRead"
                                            :class="[active ? 'bg-gray-100' : '', 'block w-full text-center px-4 py-2 text-sm text-primary-600 font-medium border-t border-gray-100']">
                                            Mark all as read
                                        </button>
                                    </MenuItem>
                                </template>
                                <template v-else>
                                    <div class="px-4 py-3 text-sm text-gray-500">No new notifications.</div>
                                </template>
                            </MenuItems>
                        </transition>
                    </Menu>

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
    token?: string; // Add token property
    user_id?: number; // Add user_id property for notification filtering
    // Add other properties you expect in the user object
}

// Define an interface for a notification
interface Notification {
    notification_id: number;
    user_id: number;
    title: string;
    message: string;
    type: string;
    related_id: number | null;
    is_read: 0 | 1; // 0 for unread, 1 for read
    created_at: string;
}

const router = useRouter()
const currentUser = ref<User | null>(null) // Initialize as null or default user object
const notifications = ref<Notification[]>([]); // To store all fetched notifications
const unreadNotificationCount = ref(0); // To store the count of unread notifications

const API_BASE_URL = 'http://localhost:8219'; // Your backend API base URL

onMounted(() => {
    // Retrieve user data from sessionStorage on component mount
    const userData = sessionStorage.getItem("user");
    if (userData) {
        try {
            currentUser.value = JSON.parse(userData);
            // Fetch notifications only if a user is logged in
            if (currentUser.value?.token) {
                fetchNotifications();
            }
        } catch (e) {
            console.error("Failed to parse user data from sessionStorage:", e);
            currentUser.value = null;
        }
    }
});

/**
 * Fetches notifications from the backend API.
 */
const fetchNotifications = async () => {
    if (!sessionStorage.getItem('token')) {
        console.warn("No authentication token found. Cannot fetch notifications.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/notifications`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}` // Include JWT token
            }
        });

        if (!response.ok) {
            // Handle HTTP errors
            const errorData = await response.json();
            console.error('Failed to fetch notifications:', response.status, errorData);
            notifications.value = []; // Clear notifications on error
            unreadNotificationCount.value = 0;
            return;
        }

        const data: Notification[] = await response.json();
        // Filter notifications to only show those for the current user (backend should already do this, but as a client-side safeguard)
        notifications.value = data.filter(n => n.user_id === currentUser.value?.user_id);
        unreadNotificationCount.value = notifications.value.filter(n => n.is_read === 0).length;
        console.log("Notifications fetched:", notifications.value); // For debugging
        console.log("Unread count:", unreadNotificationCount.value); // For debugging

    } catch (error) {
        console.error('Error fetching notifications:', error);
        notifications.value = []; // Clear notifications on error
        unreadNotificationCount.value = 0;
    }
};

/**
 * Marks a specific notification as read.
 * @param notificationId The ID of the notification to mark as read.
 */
const markNotificationAsRead = async (notificationId: number) => {
    if (!currentUser.value?.token) {
        console.warn("No authentication token found. Cannot mark notification as read.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`Failed to mark notification ${notificationId} as read:`, response.status, errorData);
            return;
        }

        console.log(`Notification ${notificationId} marked as read.`);
        // Optimistically update the UI or re-fetch notifications
        const index = notifications.value.findIndex(n => n.notification_id === notificationId);
        if (index !== -1) {
            notifications.value[index].is_read = 1;
            unreadNotificationCount.value = notifications.value.filter(n => n.is_read === 0).length;
        }

    } catch (error) {
        console.error(`Error marking notification ${notificationId} as read:`, error);
    }
};

/**
 * Marks all unread notifications for the current user as read.
 */
const markAllAsRead = async () => {
    if (!currentUser.value?.token) {
        console.warn("No authentication token found. Cannot mark all notifications as read.");
        return;
    }

    const unreadNotifications = notifications.value.filter(n => n.is_read === 0);
    for (const notification of unreadNotifications) {
        await markNotificationAsRead(notification.notification_id);
    }
    // Re-fetch to ensure consistency, though optimistic updates should mostly cover it
    fetchNotifications();
};

/**
 * Handles the click event on the bell icon.
 * This now directly calls the API to refresh notifications and opens the dropdown.
 */
const handleBellClick = () => {
    // The MenuButton itself handles opening/closing the dropdown.
    // fetchNotifications is already bound to the @click of MenuButton.
    // No additional logic needed here for toggling, just ensuring fetch happens.
    console.log("Bell icon clicked. Notifications re-fetched (by MenuButton click).");
};

/**
 * Handles user logout.
 */
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
