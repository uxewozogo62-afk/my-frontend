<template>
  <div class="elderly-detail" v-if="!loading">
    <div class="detail-header" style="margin-bottom: 24px; display: flex; align-items: center; gap: 16px;">
      <a-button @click="$router.back()">返回列表</a-button>
      <h2 style="margin: 0;">老人详细档案：{{ elderlyInfo.name }}</h2>
    </div>
    
    <a-card class="basic-info-card" title="基本信息">
      <a-descriptions bordered :column="2">
        <a-descriptions-item label="姓名">{{ elderlyInfo.name }}</a-descriptions-item>
        <a-descriptions-item label="年龄">{{ elderlyInfo.age }} 岁</a-descriptions-item>
        <a-descriptions-item label="性别">{{ elderlyInfo.gender || '未录入' }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ elderlyInfo.phone }}</a-descriptions-item>
        <a-descriptions-item label="所属社区">{{ elderlyInfo.community }}</a-descriptions-item>
        <a-descriptions-item label="居住地址">
          {{ elderlyInfo.building || '' }} {{ elderlyInfo.room || '' }}
        </a-descriptions-item>
        <a-descriptions-item label="健康标签" :span="2">
          <a-tag v-for="tag in elderlyInfo.healthTags" :key="tag" color="blue">
            {{ tag }}
          </a-tag>
          <span v-if="!elderlyInfo.healthTags?.length" style="color: #bfbfbf;">暂无标签</span>
        </a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-row :gutter="16" style="margin-top: 24px;">
      <a-col :span="8">
        <a-card title="实时心率">
          <div :style="{ fontSize: '28px', color: getHeartRateColor(healthData.heartRate), fontWeight: 'bold' }">
            {{ healthData.heartRate || '--' }} <small style="font-size: 14px;">bpm</small>
          </div>
          <div :style="{ color: getStatusColor(healthData.heartRate, 60, 100), marginTop: '8px' }">
            ● {{ getStatusText(healthData.heartRate, 60, 100) }}
          </div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="血氧浓度">
          <div style="font-size: 28px; color: #1890ff; font-weight: bold;">
            {{ healthData.bloodOxygen || '--' }} <small style="font-size: 14px;">%</small>
          </div>
          <div :style="{ color: getStatusColor(healthData.bloodOxygen, 95, 100), marginTop: '8px' }">
            ● {{ healthData.bloodOxygen >= 95 ? '浓度优秀' : '浓度偏低' }}
          </div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="采集状态">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">
            数据采集自：智能手环
          </div>
          <div style="color: #8c8c8c;">最后更新：{{ lastUpdateTime }}</div>
        </a-card>
      </a-col>
    </a-row>
  </div>
  
  <div v-else style="text-align: center; padding: 100px;">
    <a-spin size="large" tip="正在调取云端档案..." />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import request from '../../utils/request'
import { message } from 'ant-design-vue'

const route = useRoute()
const loading = ref(true)
const elderlyInfo = ref({})
const healthData = ref({
  heartRate: null,
  bloodOxygen: null,
  timestamp: null
})
const lastUpdateTime = ref('等待更新...')
let refreshTimer = null

const getHeartRateColor = (val) => {
  if (!val) return '#bfbfbf'
  return (val > 100 || val < 60) ? '#cf1322' : '#52c41a'
}

const getStatusColor = (val, min, max) => {
  if (!val) return '#bfbfbf'
  return (val >= min && val <= max) ? '#52c41a' : '#cf1322'
}

const getStatusText = (val, min, max) => {
  if (!val) return '加载中'
  return (val >= min && val <= max) ? '状态正常' : '指标异常'
}

const fetchDetail = async () => {
  try {
    const id = route.params.id
    const data = await request.get(`/admin/elderly/${id}`)
    elderlyInfo.value = data
  } catch (error) {
    console.error('获取详情失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchRealtimeHealth = async () => {
  try {
    const id = route.params.id
    // 调用家属端同款实时数据接口
    const data = await request.get(`/health/realtime/${id}`)
    if (data) {
      healthData.value = data
      if (data.timestamp) {
        const date = new Date(data.timestamp)
        lastUpdateTime.value = date.toLocaleTimeString('zh-CN', { hour12: false })
      }
    }
  } catch (error) {
    console.error('实时数据同步失败:', error)
  }
}

onMounted(() => {
  const id = route.params.id
  if (id) {
    fetchDetail()
    fetchRealtimeHealth()
    // 开启 5 秒轮询
    refreshTimer = setInterval(fetchRealtimeHealth, 5000)
  } else {
    message.error('未找到有效的老人 ID')
    loading.value = false
  }
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.elderly-detail {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}
.basic-info-card {
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
</style>
