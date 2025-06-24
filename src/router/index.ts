import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import StudentDashboard from '../views/StudentDashboard.vue'
import StudentGrades from '../views/StudentGrades.vue'
import StudentProgress from '../views/StudentProgress.vue'
import LecturerDashboard from '../views/LecturerDashboard.vue'
import AdvisorDashboard from '../views/AdvisorDashboard.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import UserManagement from '../views/UserManagement.vue'
import Reports from '../views/Reports.vue'
import Profile from '../views/Profile.vue'

const router = createRouter({
<<<<<<< Updated upstream
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/login'
        },
        {
            path: '/login',
            name: 'Login',
            component: Login
        },
        {
            path: '/student',
            name: 'StudentDashboard',
            component: StudentDashboard,
            meta: { requiresAuth: true, role: 'student' }
        },
        {
            path: '/student/grades',
            name: 'StudentGrades',
            component: StudentGrades,
            meta: { requiresAuth: true, role: 'student' }
        },
        {
            path: '/student/progress',
            name: 'StudentProgress',
            component: StudentProgress,
            meta: { requiresAuth: true, role: 'student' }
        },
        {
            path: '/lecturer',
            name: 'LecturerDashboard',
            component: LecturerDashboard,
            meta: { requiresAuth: true, role: 'lecturer' }
        },
        {
            path: '/advisor',
            name: 'AdvisorDashboard',
            component: AdvisorDashboard,
            meta: { requiresAuth: true, role: 'advisor' }
        },
        {
            path: '/advisor/reports',
            name: 'Reports',
            component: Reports,
            meta: { requiresAuth: true, role: 'advisor' }
        },
        {
            path: '/admin',
            name: 'AdminDashboard',
            component: AdminDashboard,
            meta: { requiresAuth: true, role: 'admin' }
        },
        {
            path: '/admin/users',
            name: 'UserManagement',
            component: UserManagement,
            meta: { requiresAuth: true, role: 'admin' }
        },
        {
            path: '/profile',
            name: 'Profile',
            component: Profile,
            meta: { requiresAuth: true }
        }
    ]
=======
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/student',
      name: 'StudentDashboard',
      component: StudentDashboard,
      // meta: { requiresAuth: true, role: 'student' }
    },
    {
      path: '/student/grades',
      name: 'StudentGrades',
      component: StudentGrades,
      // meta: { requiresAuth: true, role: 'student' }
    },
    {
      path: '/student/progress',
      name: 'StudentProgress',
      component: StudentProgress,
      // meta: { requiresAuth: true, role: 'student' }
    },
    {
      path: '/lecturer',
      name: 'LecturerDashboard',
      component: LecturerDashboard,
      // meta: { requiresAuth: true, role: 'lecturer' }
    },
    {
      path: '/advisor',
      name: 'AdvisorDashboard',
      component: AdvisorDashboard,
      // meta: { requiresAuth: true, role: 'advisor' }
    },
    {
      path: '/advisor/reports',
      name: 'Reports',
      component: Reports,
      // meta: { requiresAuth: true, role: 'advisor' }
    },
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: AdminDashboard,
      // meta: { requiresAuth: true, role: 'admin' }
    },
    {
      path: '/admin/users',
      name: 'UserManagement',
      component: UserManagement,
      // meta: { requiresAuth: true, role: 'admin' }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      meta: { requiresAuth: true }
    }
  ]
>>>>>>> Stashed changes
})

router.beforeEach((to, from, next) => {
    const isAuthenticated = !!sessionStorage.getItem('token')

    let userRole: string = ''

    if (isAuthenticated) {
        const userString = sessionStorage.getItem('user')
        if (userString) {
            try {
                const user = JSON.parse(userString)
                userRole = user?.role || ''
            } catch (e) {
                console.error('Failed to parse user data from sessionStorage:', e)
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                next('/login');
            }
        }
    }

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login')
    }
    else if (to.meta.role && userRole !== to.meta.role) {
        next('/login')
    }
    else {
        next()
    }
})

export default router
