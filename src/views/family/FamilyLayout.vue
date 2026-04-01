<template>
  <div class="family-layout">
    <!-- 顶部导航栏 -->
    <header class="family-header">
      <h1 class="header-title">智慧养老监护系统</h1>
      <div class="header-right">
        <span class="user-info">家属用户</span>
        <a-button type="primary" @click="handleLogout">退出登录</a-button>
      </div>
    </header>
    
    <div class="layout-content">
      <!-- 侧边导航 -->
      <aside class="family-sidebar" :class="{ collapsed: collapsed }">
        <div class="sidebar-header">
          <a-button type="text" @click="toggleCollapse" class="collapse-btn">
            <span v-if="collapsed">展开</span>
            <span v-else>收起</span>
          </a-button>
        </div>
        <ul class="sidebar-menu">
          <li :class="{ active: $route.path === '/family/dashboard' }">
          <router-link to="/family/dashboard">
            <DashboardOutlined />
            <span v-if="!collapsed">首页</span>
          </router-link>
        </li>
        <li :class="{ active: $route.path === '/family/health' }">
          <router-link to="/family/health">
            <HeartOutlined />
            <span v-if="!collapsed">健康状态</span>
          </router-link>
        </li>
        <li :class="{ active: $route.path === '/family/location' }">
          <router-link to="/family/location">
            <EnvironmentOutlined />
            <span v-if="!collapsed">位置信息</span>
          </router-link>
        </li>
        <li :class="{ active: $route.path === '/family/interaction' }">
          <router-link to="/family/interaction">
            <MessageOutlined />
            <span v-if="!collapsed">玩偶互动</span>
          </router-link>
        </li>
        <li :class="{ active: $route.path === '/family/history' }">
          <router-link to="/family/history">
            <HistoryOutlined />
            <span v-if="!collapsed">历史记录</span>
          </router-link>
        </li>
        <li :class="{ active: $route.path === '/family/devices' }">
          <router-link to="/family/devices">
            <WifiOutlined />
            <span v-if="!collapsed">连接设备</span>
          </router-link>
        </li>
        <li :class="{ active: $route.path === '/family/settings' }">
          <router-link to="/family/settings">
            <SettingOutlined />
            <span v-if="!collapsed">设置</span>
          </router-link>
        </li>
        </ul>
      </aside>
      
      <!-- 主内容区 -->
      <main class="family-main" :class="{ 'sidebar-collapsed': collapsed }">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'

import { HeartOutlined, EnvironmentOutlined, MessageOutlined, HistoryOutlined, WifiOutlined, SettingOutlined, DashboardOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const collapsed = ref(false)

const handleLogout = () => {
  router.push('/')
}

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}
</script>

<style scoped>
.family-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-size: 16px;
}

.family-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
  background-color: #1890ff;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.header-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  font-size: 14px;
}

.layout-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.family-sidebar {
  width: 200px;
  background-color: #fff;
  border-right: 1px solid #e8e8e8;
  flex-shrink: 0;
  overflow-y: auto;
  transition: width 0.3s ease;
}

.family-sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  padding: 0 16px 16px;
  border-bottom: 1px solid #e8e8e8;
}

.collapse-btn {
  width: 100%;
  justify-content: center;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  margin: 0;
}

.sidebar-menu a {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  color: #333;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 16px;
}

.sidebar-menu a:hover {
  background-color: #f0f0f0;
}

.sidebar-menu .active a {
  background-color: #e6f7ff;
  color: #1890ff;
}

.sidebar-menu a span {
  margin-left: 12px;
}

.family-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 24px;
  background-color: #f5f5f5;
  transition: all 0.3s ease;
}

.family-main.sidebar-collapsed {
  padding-left: 16px;
}
</style>