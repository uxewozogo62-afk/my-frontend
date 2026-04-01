<template>
  <div class="admin-layout">
    <header class="admin-header">
      <div class="header-left">
        <h1 class="header-title">智慧养老监护系统 - 管理员端</h1>
      </div>
      <div class="header-right">
        <span class="user-info">
          <UserOutlined /> 欢迎您，{{ currentUserName }}
        </span>
        <a-button type="primary" danger @click="handleLogout">
          <LogoutOutlined /> 退出登录
        </a-button>
      </div>
    </header>
    
    <div class="layout-content">
      <aside class="admin-sidebar" :class="{ collapsed: collapsed }">
        <div class="sidebar-header">
          <a-button type="text" @click="toggleCollapse" class="collapse-btn">
            <MenuUnfoldOutlined v-if="collapsed" />
            <MenuFoldOutlined v-else />
          </a-button>
        </div>
        
        <ul class="sidebar-menu">
          <li :class="{ active: $route.path === '/admin/dashboard' }">
            <router-link to="/admin/dashboard">
              <DashboardOutlined />
              <span v-if="!collapsed">系统概览</span>
            </router-link>
          </li>
          
          <li :class="{ active: $route.path.includes('/admin/elderly') }">
            <router-link to="/admin/elderly-list">
              <TeamOutlined />
              <span v-if="!collapsed">老人管理</span>
            </router-link>
          </li>
          
          <li :class="{ active: $route.path === '/admin/emergency' }">
            <router-link to="/admin/emergency">
              <AlertOutlined />
              <span v-if="!collapsed">预警中心</span>
            </router-link>
          </li>

          <li :class="{ active: $route.path === '/admin/batch-operation' }">
            <router-link to="/admin/batch-operation">
              <AppstoreOutlined />
              <span v-if="!collapsed">批量操作</span>
            </router-link>
          </li>

          <li :class="{ active: $route.path === '/admin/data-stats' }">
            <router-link to="/admin/data-stats">
              <BarChartOutlined />
              <span v-if="!collapsed">统计分析</span>
            </router-link>
          </li>

          <li :class="{ active: $route.path === '/admin/permission' }">
            <router-link to="/admin/permission">
              <SettingOutlined />
              <span v-if="!collapsed">账号管理</span>
            </router-link>
          </li>
        </ul>
      </aside>
      
      <main class="admin-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { 
  DashboardOutlined, TeamOutlined, AlertOutlined, 
  BarChartOutlined, MenuUnfoldOutlined, MenuFoldOutlined,
  UserOutlined, LogoutOutlined, AppstoreOutlined, SettingOutlined 
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import request from '../../utils/request'

const router = useRouter()
const route = useRoute()

// 控制侧边栏折叠状态
const collapsed = ref(false)
const currentUserName = ref('管理员')

// 初始化：从本地存储获取登录信息
onMounted(() => {
  const name = localStorage.getItem('username')
  if (name) {
    currentUserName.value = name
  }
})

// 切换折叠
const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

// 退出登录逻辑：清理缓存并跳转
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('username')
  message.success('已安全退出系统')
  router.push('/')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 60px;
  background-color: #001529;
  color: white;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.layout-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.admin-sidebar {
  width: 200px;
  background-color: #fff;
  border-right: 1px solid #e8e8e8;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
  display: flex;
  flex-direction: column;
}

.admin-sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-menu {
  list-style: none;
  padding: 8px 0;
  margin: 0;
  flex: 1;
}

.sidebar-menu li {
  margin: 4px 0;
}

.sidebar-menu a {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: #595959;
  text-decoration: none;
  transition: all 0.3s;
  white-space: nowrap;
}

.sidebar-menu .anticon {
  font-size: 18px;
  margin-right: 12px;
}

.sidebar-menu .active a {
  background-color: #e6f7ff;
  color: #1890ff;
  border-right: 3px solid #1890ff;
}

.admin-sidebar.collapsed .sidebar-menu a {
  padding: 12px 0;
  justify-content: center;
}

.admin-sidebar.collapsed .anticon {
  margin-right: 0;
}

.admin-main {
  flex: 1;
  padding: 24px;
  background-color: #f0f2f5;
  overflow-y: auto;
}
</style>