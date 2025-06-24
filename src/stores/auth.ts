import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const isAuthenticated = computed(() => !!currentUser.value)

  // Mock users for demo
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Dr. John Smith',
      email: 'john.smith@university.edu',
      role: 'lecturer',
      profilePicture: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      courses: ['CS101', 'CS201']
    },
    {
      id: '2',
      name: 'Alice Johnson',
      matricNumber: 'STU001',
      role: 'student',
      profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      courses: ['CS101', 'CS201', 'MATH101']
    },
    {
      id: '3',
      name: 'Prof. Mary Wilson',
      email: 'mary.wilson@university.edu',
      role: 'advisor',
      profilePicture: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      advisees: ['2', '4', '5']
    },
    {
      id: '4',
      name: 'System Admin',
      email: 'admin@university.edu',  
      role: 'admin',
      profilePicture: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ]

  const login = async (identifier: string, password: string) => {
    // Mock login logic
    const user = mockUsers.find(u => 
      u.email === identifier || u.matricNumber === identifier
    )
    
    if (user && password === 'password') {
      currentUser.value = user
      return { success: true }
    }
    
    return { success: false, error: 'Invalid credentials' }
  }

  const logout = () => {
    currentUser.value = null
  }

  const hasRole = (role: string) => {
    return currentUser.value?.role === role
  }

  return {
    currentUser,
    isAuthenticated,
    login,
    logout,
    hasRole
  }
})
