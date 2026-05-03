<template>
  <div class="admin-dashboard">
    <h2 class="page-title">系统实时概览</h2>
    
    <div class="dashboard-cards">
      <a-card class="dashboard-card">
        <div class="card-content">
          <div class="card-title">今日预警数</div>
          <div class="card-value">{{ dashboardStats.warningCount }}</div>
          <div class="card-details">
            <span class="detail-item">待处理: {{ dashboardStats.unresolved }}</span>
            <span class="detail-item">高危: {{ dashboardStats.highSeverity }}</span>
          </div>
        </div>
      </a-card>

      <a-card class="dashboard-card">
        <div class="card-content">
          <div class="card-title">设备在线率</div>
          <div class="card-value">{{ onlineRate }}%</div>
          <div class="card-details">
            <span class="detail-item">在线: {{ dashboardStats.onlineDevices }}</span>
            <span class="detail-item">离线: {{ dashboardStats.offlineDevices }}</span>
          </div>
        </div>
      </a-card>

      <a-card class="dashboard-card">
        <div class="card-content">
          <div class="card-title">健康提醒</div>
          <div class="card-value">{{ dashboardStats.healthWarnings }}</div>
          <div class="card-details">条未读消息</div>
        </div>
      </a-card>
    </div>
    
    <a-card class="elderly-list-card" title="最新档案动态">
      <a-table 
        :columns="columns" 
        :data-source="elderlyList" 
        :pagination="false"
        row-key="_id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a @click="viewDetail(record._id)">查看详情</a>
          </template>
        </template>
      </a-table>
      <div style="margin-top: 16px; text-align: right;">
        <a-button @click="$router.push('/admin/elderly-list')">查看全部档案</a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import request from '../../utils/request'

const router = useRouter()

// 状态指标数据
const dashboardStats = ref({
  warningCount: 0,
  unresolved: 0,
  highSeverity: 0,
  onlineDevices: 0,
  offlineDevices: 0,
  healthWarnings: 0,
  elderlyCount: 0
})

const elderlyList = ref([])

const columns = [
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '年龄', dataIndex: 'age', key: 'age' },
  { title: '所属社区', dataIndex: 'community', key: 'community' },
  { title: '联系电话', dataIndex: 'phone', key: 'phone' },
  { title: '操作', key: 'action' }
]

/**
 * 方案一：前端自动计算在线率
 * 逻辑：在线 / (在线 + 离线) * 100
 */
const onlineRate = computed(() => {
  const online = Number(dashboardStats.value.onlineDevices) || 0
  const offline = Number(dashboardStats.value.offlineDevices) || 0
  const total = online + offline
  
  if (total === 0) return '0'
  const rate = (online / total) * 100
  // 整数显示无小数，非整数保留1位
  return rate % 1 === 0 ? rate.toString() : rate.toFixed(1)
})
/**
 * 获取数据库真实数据
 */
const fetchData = async () => {
  try {
    // 1. 获取最新 5 条档案
    const elderlyData = await request.get('/admin/elderly')
    elderlyList.value = elderlyData.slice(0, 5)
    dashboardStats.value.elderlyCount = elderlyData.length

    // 2. 获取预警统计 (对应卡片 1 和 卡片 3)
    try {
      const warnStats = await request.get('/warnings/stats/summary')
      dashboardStats.value.warningCount = warnStats.total || 0
      dashboardStats.value.unresolved = warnStats.unresolved || 0
      dashboardStats.value.highSeverity = warnStats.highSeverity || 0
      dashboardStats.value.healthWarnings = warnStats.healthCount || 0
    } catch (e) {
      console.error('预警统计接口异常')
    }

    // 3. 获取设备状态 (对应卡片 2)
    try {
      const deviceStats = await request.get('/devices/stats/summary')
      // 只要这里赋值了，上面的 computed 就会自动算出百分比
      dashboardStats.value.onlineDevices = deviceStats.online || 0
      dashboardStats.value.offlineDevices = deviceStats.offline || 0
    } catch (e) {
      console.error('设备统计接口异常')
    }

  } catch (error) {
    console.error('数据加载失败:', error)
  }
}

let refreshTimer: any = null

onMounted(() => {
  fetchData()
  // 每 10 秒刷新一次全局概览数据
  refreshTimer = setInterval(fetchData, 10000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})

const viewDetail = (id: any) => {
  router.push(`/admin/elderly-detail/${id}`)
}
</script>

<style scoped>
.admin-dashboard {
  padding: 24px;
}

.page-title {
  margin-bottom: 24px;
  font-weight: bold;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.dashboard-card {
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border-radius: 8px;
}

.card-title {
  color: #8c8c8c;
  margin-bottom: 8px;
  font-size: 14px;
}

.card-value {
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #1890ff;
}

.card-details {
  color: #595959;
  font-size: 14px;
}

.detail-item {
  margin-right: 12px;
}

.elderly-list-card {
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
</style>