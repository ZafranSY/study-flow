
<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-purple-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <!-- Animated background elements -->
        <div class="absolute inset-0 opacity-30">
            <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 4s;"></div>
        </div>

        <!-- Floating particles -->
        <div class="absolute inset-0 pointer-events-none">
            <div class="particle particle-1"></div>
            <div class="particle particle-2"></div>
            <div class="particle particle-3"></div>
            <div class="particle particle-4"></div>
            <div class="particle particle-5"></div>
            <div class="particle particle-6"></div>
        </div>

        <div class="max-w-md w-full space-y-8 relative z-10">
            <!-- Header with futuristic styling -->
            <div class="text-center">
                <div class="relative inline-block mb-6">
                    <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
                    <div class="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-full p-4 border border-gray-700/50">
                        <svg class="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                    </div>
                </div>
                <h2 class="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
                    Grade Management System
                </h2>
                <p class="text-gray-600 text-base relative">
                    <span class="inline-block px-4 py-1 rounded-full bg-white/50 backdrop-blur-sm border border-gray-200/50">
                        Sign in to your account to continue
                    </span>
                </p>
            </div>

            <!-- Futuristic form container -->
            <form class="mt-8 space-y-6 relative" @submit.prevent="handleLogin">
                <!-- Glassmorphism card with enhanced styling -->
                <div class="relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
                    <!-- Animated border -->
                    <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 p-[1px]">
                        <div class="w-full h-full bg-white/95 backdrop-blur-xl rounded-2xl"></div>
                    </div>
                    
                    <div class="relative z-10 space-y-6">
                        <!-- Username field -->
                        <div class="relative">
                            <label for="identifier" class="block text-sm font-semibold text-gray-700 mb-2">
                                <span class="flex items-center gap-2">
                                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                    Username
                                </span>
                            </label>
                            <div class="relative group">
                                <input 
                                    id="identifier" 
                                    v-model="loginForm.identifier" 
                                    type="text" 
                                    required 
                                    class="w-full px-4 py-3 bg-gray-50/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white/90 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-inner group-hover:border-gray-300"
                                    placeholder="Enter your username"
                                >
                                <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10"></div>
                            </div>
                        </div>

                        <!-- Password field -->
                        <div class="relative">
                            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
                                <span class="flex items-center gap-2">
                                    <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                    </svg>
                                    Password/PIN
                                </span>
                            </label>
                            <div class="relative group">
                                <input 
                                    id="password" 
                                    v-model="loginForm.password" 
                                    type="password" 
                                    required 
                                    class="w-full px-4 py-3 bg-gray-50/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white/90 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-inner group-hover:border-gray-300"
                                    placeholder="Enter your password/PIN"
                                >
                                <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10"></div>
                            </div>
                        </div>

                        <!-- Error message with enhanced styling -->
                        <div v-if="error" class="relative">
                            <div class="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-lg p-3 text-red-700 text-sm text-center shadow-inner">
                                <div class="flex items-center justify-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    {{ error }}
                                </div>
                            </div>
                        </div>

                        <!-- Futuristic submit button -->
                        <div class="relative">
                            <button 
                                type="submit" 
                                :disabled="loading"
                                class="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                            >
                                <!-- Animated background -->
                                <div class="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                
                                <!-- Button content -->
                                <div class="relative flex items-center justify-center gap-2">
                                    <svg v-if="loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                                    </svg>
                                    <span v-if="loading">Signing in...</span>
                                    <span v-else>Sign in</span>
                                </div>

                                <!-- Ripple effect -->
                                <div class="absolute inset-0 rounded-xl opacity-0 group-active:opacity-20 bg-white transition-opacity duration-150"></div>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Tech-inspired decorative elements -->
                <div class="flex justify-center space-x-4 mt-8">
                    <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div class="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style="animation-delay: 0.5s;"></div>
                    <div class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style="animation-delay: 1s;"></div>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'


const router = useRouter()


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
        const response = await fetch('http://localhost:8219/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: loginForm.identifier, 
                password: loginForm.password
            })
        })


        const data = await response.json()
        if (!response.ok) {
            error.value = data.error || 'Login failed'
            return 
        }


        const token = data.token
        const user = data.user 
        sessionStorage.setItem('token', token)
        sessionStorage.setItem('user', JSON.stringify(user))
        const userRole: string = user?.role || '' 
        console.log(userRole)
        switch (userRole) {
            case 'student': router.push('/student'); break
            case 'lecturer': router.push('/lecturer'); break
            case 'advisor': router.push('/advisor'); break
            case 'admin': router.push('/admin'); break
            default: router.push('/login') 
        }

    } catch (err) {
        console.error('Login error:', err) 
        error.value = 'An error occurred during login. Please try again.'
    } finally {
        loading.value = false
    }
}
</script>

 <style scoped>
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(120deg); }
            66% { transform: translateY(5px) rotate(240deg); }
        }

        @keyframes float-reverse {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(8px) rotate(-90deg); }
            66% { transform: translateY(-6px) rotate(-180deg); }
        }

        .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4);
            border-radius: 50%;
            opacity: 0.6;
        }

        .particle-1 {
            top: 20%;
            left: 15%;
            animation: float 6s ease-in-out infinite;
        }

        .particle-2 {
            top: 60%;
            right: 20%;
            animation: float-reverse 8s ease-in-out infinite;
        }

        .particle-3 {
            bottom: 30%;
            left: 25%;
            animation: float 7s ease-in-out infinite;
            animation-delay: 2s;
        }

        .particle-4 {
            top: 40%;
            right: 35%;
            animation: float-reverse 5s ease-in-out infinite;
            animation-delay: 1s;
        }

        .particle-5 {
            bottom: 50%;
            left: 60%;
            animation: float 9s ease-in-out infinite;
            animation-delay: 3s;
        }

        .particle-6 {
            top: 25%;
            right: 50%;
            animation: float-reverse 6s ease-in-out infinite;
            animation-delay: 4s;
        }

        /* Enhanced focus states */
        input:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 10px 25px -5px rgba(59, 130, 246, 0.1);
        }

        /* Custom scrollbar for future use */
        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
        </style>