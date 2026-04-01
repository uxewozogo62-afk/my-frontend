import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  // 管理员端路由配置
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue')
      },
      {
        path: 'elderly-list',
        name: 'ElderlyList',
        component: () => import('../views/admin/ElderlyList.vue')
      },
      {
        path: 'elderly-detail/:id',
        name: 'ElderlyDetail',
        component: () => import('../views/admin/ElderlyDetail.vue')
      },
      {
        path: 'emergency',
        name: 'EmergencyContact',
        component: () => import('../views/admin/EmergencyContact.vue')
      },
      {
        path: 'data-stats',
        name: 'DataStatistics',
        component: () => import('../views/admin/DataStatistics.vue')
      },
      {
        path: 'batch-operation',
        name: 'BatchOperation',
        component: () => import('../views/admin/BatchOperation.vue')
      },
      {
        path: 'permission',
        name: 'PermissionManagement',
        component: () => import('../views/admin/PermissionManagement.vue')
      }
    ]
  },
  {
    path: '/family',
    name: 'Family',
    component: () => import('../views/family/FamilyLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'FamilyDashboard',
        component: () => import('../views/family/Dashboard.vue')
      },
      {
        path: 'health',
        name: 'FamilyHealth',
        component: () => import('../views/family/HealthStatus.vue')
      },
      {
        path: 'location',
        name: 'FamilyLocation',
        component: () => import('../views/family/LocationInfo.vue')
      },
      {
        path: 'devices',
        name: 'FamilyDevices',
        component: () => import('../views/family/ConnectedDevices.vue')
      },
      {
        path: 'interaction',
        name: 'FamilyDoll',
        component: () => import('../views/family/DollInteraction.vue')
      },
      {
        path: 'history',
        name: 'FamilyHistory',
        component: () => import('../views/family/HistoryRecord.vue')
      },
      {
        path: 'settings',
        name: 'FamilySettings',
        component: () => import('../views/family/Settings.vue')
      }
    ]
  }
]
const router = createRouter({
  history: createWebHistory(),
  routes
})
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path.startsWith('/admin') && !token) {
    next('/')
  } else {
    next()
  }
})
export default router