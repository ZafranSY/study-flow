<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-bold text-gray-900">
          Grade Management System
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Sign in to your account to continue
        </p>
      </div>
      
      <form class="mt-8 space-y-6 card" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div>
            <label for="identifier" class="block text-sm font-medium text-gray-700">
              Email or Matric Number
            </label>
            <input
              id="identifier"
              v-model="loginForm.identifier"
              type="text"
              required
              class="input-field"
              placeholder="Enter your email or matric number"
            >
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              v-model="loginForm.password"
              type="password"
              required
              class="input-field"
              placeholder="Enter your password"
            >
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign in</span>
          </button>
        </div>

        <div class="text-center">
          <a href="#" class="text-sm text-primary-600 hover:text-primary-500">
            Forgot your password?
          </a>
        </div>

        <!-- Demo credentials -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h4>
          <div class="text-xs text-gray-600 space-y-1">
            <p><strong>Student:</strong> STU001 / password</p>
            <p><strong>Lecturer:</strong> john.smith@university.edu / password</p>
            <p><strong>Advisor:</strong> mary.wilson@university.edu / password</p>
            <p><strong>Admin:</strong> admin@university.edu / password</p>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')

const loginForm = reactive({
  identifier: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const result = await authStore.login(loginForm.identifier, loginForm.password)
    
    if (result.success) {
      // Redirect based on user role
      const role = authStore.currentUser?.role
      switch (role) {
        case 'student':
          router.push('/student')
          break
        case 'lecturer':
          router.push('/lecturer')
          break
        case 'advisor':
          router.push('/advisor')
          break
        case 'admin':
          router.push('/admin')
          break
        default:
          router.push('/login')
      }
    } else {
      error.value = result.error || 'Login failed'
    }
  } catch (err) {
    error.value = 'An error occurred during login'
  } finally {
    loading.value = false
  }
}
</script>