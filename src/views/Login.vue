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

// Initialize the router for navigation
const router = useRouter()

// Reactive state variables for loading status and error messages
const loading = ref(false)
const error   = ref('')

// Reactive form data for login
const loginForm = reactive({
  identifier: '', // This will map to 'username' in the API
  password:   ''
})

/**
 * Handles the login process:
 * 1. Sends login credentials to the backend API.
 * 2. Processes the API response, handling success and error states.
 * 3. Stores the JWT token and user information in session storage upon successful login.
 * 4. Redirects the user based on their role.
 */
const handleLogin = async () => {
  // Set loading state to true and clear previous errors
  loading.value = true
  error.value   = ''

  try {
    // Make the API call to the login endpoint
    const response = await fetch('http://localhost:8219/login', {
      method:   'POST',
      headers: { 'Content-Type': 'application/json' },
      body:     JSON.stringify({
        username: loginForm.identifier, // Map front-end 'identifier' to back-end 'username'
        password: loginForm.password
      })
    })

    // Parse the JSON response body
    const data = await response.json()

    // Check if the response was not OK (e.g., 400, 401 status codes)
    if (!response.ok) {
      // Set the error message from the API response or a generic message
      error.value = data.error || 'Login failed'
      return // Stop further execution on error
    }

    // --- Successful Login ---
    // Extract the token and user object from the successful response
    const token = data.token
    const user = data.user // The new user object returned by the API

    // Store JWT in session storage for authentication on subsequent requests
    sessionStorage.setItem('token', token)
    // Store the entire user object in session storage (stringified, as sessionStorage only stores strings)
    sessionStorage.setItem('user', JSON.stringify(user))

    // Determine the user's role for redirection
    // Prefer using the role directly from the 'user' object if available
    const userRole: string = user?.role || '' // Safely get role from the user object
    // If for some reason the 'user' object wasn't available or 'role' was missing,
    // you could fall back to decoding the JWT, but using the direct 'user' object is simpler and clearer.
    // If you need specific JWT payload details beyond the 'user' object:
    /*
    const payloadPart   = token.split('.')[1]
    const decodedJson   = JSON.parse(atob(payloadPart))
    const userRoleFromJwt: string = decodedJson.role
    */

    // Redirect the user based on their assigned role
    switch (userRole) {
      case 'student':   router.push('/student');   break
      case 'lecturer': router.push('/lecturer'); break
      case 'advisor':   router.push('/advisor');   break
      case 'admin':     router.push('/admin');     break
      default:          router.push('/login') // Default fallback for unknown roles
    }
    
  } catch (err) {
    // Catch any network errors or unexpected issues during the fetch operation
    console.error('Login error:', err) // Log the full error for debugging
    error.value = 'An error occurred during login. Please try again.'
  } finally {
    // Always set loading state back to false after the operation completes
    loading.value = false
  }
}
// You might want to export handleLogin or the loginForm for use in your Vue component
// For example:
// export { handleLogin, loginForm, loading, error }

</script>
