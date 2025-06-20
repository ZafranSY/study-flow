<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and Title -->
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            <h1 class="text-xl font-bold text-gray-900">
              Grade Management System
            </h1>
          </div>
          
          <!-- Role-based Navigation -->
          <div class="hidden md:flex space-x-8">
            <template v-if="authStore.hasRole('student')">
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
            
            <template v-if="authStore.hasRole('lecturer')">
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
            
            <template v-if="authStore.hasRole('advisor')">
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
            
            <template v-if="authStore.hasRole('admin')">
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

        <!-- User Profile and Actions -->
        <div class="flex items-center space-x-4">
          <!-- Notifications -->
          <button class="p-2 text-gray-400 hover:text-gray-500 relative">
            <BellIcon class="h-6 w-6" />
            <span class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>

          <!-- Profile Dropdown -->
          <Menu as="div" class="relative">
            <MenuButton class="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <img 
                :src="authStore.currentUser?.profilePicture || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'" 
                alt="Profile" 
                class="h-8 w-8 rounded-full object-cover"
              >
              <span class="text-gray-700 font-medium">{{ authStore.currentUser?.name }}</span>
              <ChevronDownIcon class="h-4 w-4 text-gray-400" />
            </MenuButton>
            
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <MenuItem v-slot="{ active }">
                  <router-link 
                    to="/profile" 
                    :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                  >
                    Your Profile
                  </router-link>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">
                    Settings
                  </a>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <button 
                    @click="handleLogout"
                    :class="[active ? 'bg-gray-100' : '', 'block w-full text-left px-4 py-2 text-sm text-gray-700']"
                  >
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
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { BellIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.nav-link {
  @apply text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors;
}

.nav-link.router-link-active {
  @apply text-primary-600 border-b-2 border-primary-600;
}
</style>