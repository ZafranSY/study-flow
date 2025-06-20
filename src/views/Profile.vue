<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />
    
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p class="text-gray-600">Manage your account information and preferences</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Profile Picture and Basic Info -->
        <div class="lg:col-span-1">
          <div class="card text-center">
            <div class="mb-6">
              <img 
                :src="profileData.profilePicture" 
                alt="Profile Picture" 
                class="h-32 w-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
              >
              <button 
                @click="showImageUpload = true"
                class="mt-4 btn-secondary text-sm"
              >
                Change Photo
              </button>
            </div>
            
            <h3 class="text-xl font-semibold text-gray-900">{{ profileData.name }}</h3>
            <p class="text-gray-600 capitalize">{{ profileData.role }}</p>
            <p v-if="profileData.matricNumber" class="text-sm text-gray-500 mt-1">
              {{ profileData.matricNumber }}
            </p>
            <p v-if="profileData.email" class="text-sm text-gray-500">
              {{ profileData.email }}
            </p>
            
            <!-- Role-specific badges -->
            <div class="mt-4">
              <span :class="getRoleBadgeColor(profileData.role)" class="px-3 py-1 text-sm font-medium rounded-full capitalize">
                {{ profileData.role }}
              </span>
            </div>
          </div>

          <!-- Quick Stats (Role-specific) -->
          <div v-if="profileData.role === 'student'" class="card mt-6">
            <h4 class="font-semibold text-gray-900 mb-4">Academic Summary</h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Current GPA</span>
                <span class="font-medium">{{ studentStats.gpa }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Credits Completed</span>
                <span class="font-medium">{{ studentStats.credits }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Class Rank</span>
                <span class="font-medium">#{{ studentStats.rank }}</span>
              </div>
            </div>
          </div>

          <div v-if="profileData.role === 'lecturer'" class="card mt-6">
            <h4 class="font-semibold text-gray-900 mb-4">Teaching Summary</h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Courses Teaching</span>
                <span class="font-medium">{{ lecturerStats.courses }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Total Students</span>
                <span class="font-medium">{{ lecturerStats.students }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Years Experience</span>
                <span class="font-medium">{{ lecturerStats.experience }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Profile Form -->
        <div class="lg:col-span-2">
          <div class="card">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Personal Information</h3>
              <button 
                v-if="!editMode"
                @click="editMode = true"
                class="btn-primary"
              >
                Edit Profile
              </button>
            </div>

            <form @submit.prevent="saveProfile" class="space-y-6">
              <!-- Basic Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input 
                    v-model="profileForm.name"
                    type="text" 
                    class="input-field"
                    :disabled="!editMode"
                    required
                  >
                </div>
                
                <div v-if="profileData.role === 'student'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Matric Number</label>
                  <input 
                    v-model="profileForm.matricNumber"
                    type="text" 
                    class="input-field"
                    disabled
                  >
                </div>
                
                <div v-else>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                  <input 
                    v-model="profileForm.employeeId"
                    type="text" 
                    class="input-field"
                    disabled
                  >
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input 
                    v-model="profileForm.email"
                    type="email" 
                    class="input-field"
                    :disabled="!editMode"
                    required
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input 
                    v-model="profileForm.phone"
                    type="tel" 
                    class="input-field"
                    :disabled="!editMode"
                  >
                </div>
              </div>

              <!-- Role-specific fields -->
              <div v-if="profileData.role === 'student'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Program</label>
                  <select 
                    v-model="profileForm.program"
                    class="input-field"
                    :disabled="!editMode"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Software Engineering">Software Engineering</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Year of Study</label>
                  <select 
                    v-model="profileForm.yearOfStudy"
                    class="input-field"
                    :disabled="!editMode"
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
              </div>

              <div v-if="profileData.role === 'lecturer'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input 
                    v-model="profileForm.department"
                    type="text" 
                    class="input-field"
                    :disabled="!editMode"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Office Location</label>
                  <input 
                    v-model="profileForm.office"
                    type="text" 
                    class="input-field"
                    :disabled="!editMode"
                  >
                </div>
              </div>

              <!-- Address Information -->
              <div>
                <h4 class="text-md font-medium text-gray-900 mb-4">Address Information</h4>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input 
                      v-model="profileForm.address.street"
                      type="text" 
                      class="input-field"
                      :disabled="!editMode"
                    >
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input 
                        v-model="profileForm.address.city"
                        type="text" 
                        class="input-field"
                        :disabled="!editMode"
                      >
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input 
                        v-model="profileForm.address.state"
                        type="text" 
                        class="input-field"
                        :disabled="!editMode"
                      >
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                      <input 
                        v-model="profileForm.address.postalCode"
                        type="text" 
                        class="input-field"
                        :disabled="!editMode"
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- Emergency Contact (for students) -->
              <div v-if="profileData.role === 'student'">
                <h4 class="text-md font-medium text-gray-900 mb-4">Emergency Contact</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                    <input 
                      v-model="profileForm.emergencyContact.name"
                      type="text" 
                      class="input-field"
                      :disabled="!editMode"
                    >
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                    <input 
                      v-model="profileForm.emergencyContact.relationship"
                      type="text" 
                      class="input-field"
                      :disabled="!editMode"
                    >
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input 
                      v-model="profileForm.emergencyContact.phone"
                      type="tel" 
                      class="input-field"
                      :disabled="!editMode"
                    >
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div v-if="editMode" class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button 
                  type="button"
                  @click="cancelEdit"
                  class="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  class="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <!-- Security Settings -->
          <div class="card mt-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
            
            <div class="space-y-6">
              <div>
                <h4 class="text-md font-medium text-gray-900 mb-4">Change Password</h4>
                <form @submit.prevent="changePassword" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input 
                      v-model="passwordForm.current"
                      type="password" 
                      class="input-field"
                      required
                    >
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input 
                        v-model="passwordForm.new"
                        type="password" 
                        class="input-field"
                        required
                      >
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input 
                        v-model="passwordForm.confirm"
                        type="password" 
                        class="input-field"
                        required
                      >
                    </div>
                  </div>
                  
                  <button type="submit" class="btn-primary">
                    Update Password
                  </button>
                </form>
              </div>

              <!-- Two-Factor Authentication -->
              <div class="border-t border-gray-200 pt-6">
                <div class="flex justify-between items-center">
                  <div>
                    <h4 class="text-md font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p class="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <button 
                    @click="toggle2FA"
                    :class="twoFactorEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'"
                    class="px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {{ twoFactorEnabled ? 'Enabled' : 'Enable 2FA' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Image Upload Modal -->
      <div v-if="showImageUpload" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
import { ref, reactive, onMounted } from 'vue'
import { XMarkIcon, CameraIcon } from '@heroicons/vue/24/outline'
import Navigation from '../components/shared/Navigation.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const editMode = ref(false)
const showImageUpload = ref(false)
const twoFactorEnabled = ref(false)

const profileData = ref({
  name: '',
  email: '',
  matricNumber: '',
  role: '',
  profilePicture: ''
})

const studentStats = ref({
  gpa: '3.47',
  credits: '45/120',
  rank: 15
})

const lecturerStats = ref({
  courses: 3,
  students: 85,
  experience: 8
})

const profileForm = reactive({
  name: '',
  email: '',
  phone: '',
  matricNumber: '',
  employeeId: '',
  program: '',
  yearOfStudy: '',
  department: '',
  office: '',
  address: {
    street: '',
    city: '',
    state: '',
    postalCode: ''
  },
  emergencyContact: {
    name: '',
    relationship: '',
    phone: ''
  }
})

const passwordForm = reactive({
  current: '',
  new: '',
  confirm: ''
})

onMounted(() => {
  if (authStore.currentUser) {
    profileData.value = { ...authStore.currentUser }
    Object.assign(profileForm, {
      name: authStore.currentUser.name,
      email: authStore.currentUser.email || '',
      matricNumber: authStore.currentUser.matricNumber || '',
      // Add default values for other fields
      phone: '+60123456789',
      program: 'Computer Science',
      yearOfStudy: '2',
      department: 'Computer Science',
      office: 'Block A, Level 3',
      address: {
        street: '123 University Drive',
        city: 'Kuala Lumpur',
        state: 'Selangor',
        postalCode: '50603'
      },
      emergencyContact: {
        name: 'John Doe',
        relationship: 'Father',
        phone: '+60123456788'
      }
    })
  }
})

const getRoleBadgeColor = (role: string) => {
  const colors = {
    admin: 'bg-purple-100 text-purple-800',
    lecturer: 'bg-blue-100 text-blue-800',
    advisor: 'bg-green-100 text-green-800',
    student: 'bg-gray-100 text-gray-800'
  }
  return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const saveProfile = () => {
  // Save profile logic here
  editMode.value = false
  alert('Profile updated successfully!')
}

const cancelEdit = () => {
  editMode.value = false
  // Reset form to original values
}

const changePassword = () => {
  if (passwordForm.new !== passwordForm.confirm) {
    alert('New passwords do not match!')
    return
  }
  
  // Change password logic here
  passwordForm.current = ''
  passwordForm.new = ''
  passwordForm.confirm = ''
  alert('Password changed successfully!')
}

const toggle2FA = () => {
  twoFactorEnabled.value = !twoFactorEnabled.value
  alert(`Two-factor authentication ${twoFactorEnabled.value ? 'enabled' : 'disabled'}!`)
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    // Handle image upload logic here
    console.log('Image uploaded:', target.files[0])
  }
}
</script>