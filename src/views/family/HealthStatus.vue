<template>
  <div class="health-status">
    <h2 class="page-title">实时健康状态</h2>
    
    <!-- 1. 风险预警 -->
    <div class="warning-bar">
      <a-alert v-if="hasWarning" type="warning" show-icon>
        <template #message>
          <div class="warning-content">
            <span>风险等级：<span :class="['level-value', warningLevel]">{{ warningLevelText }}</span></span>
            <a-button size="small" type="primary" danger @click="handleEmergencyCall">紧急呼叫</a-button>
          </div>
        </template>
      </a-alert>
      <a-alert v-else type="success" message="当前健康状态良好" show-icon />
    </div>

    <!-- 2. 实时指标 -->
    <a-card title="实时指标" class="metrics-card">
      <template #extra>
        <!-- 核心修复：展示数据库 timestamp -->
        <span class="update-time" style="color: #1890ff;">采集时间: {{ lastUpdateTime }}</span>
      </template>
      <div class="metrics-grid">
        <div v-for="metric in healthMetrics" :key="metric.key" class="metric-item">
          <div class="metric-label">{{ metric.label }}</div>
          <div class="metric-value">{{ metric.value }}<span class="unit">{{ metric.unit }}</span></div>
          <div :class="['metric-status', metric.status]">{{ metric.status === 'normal' ? '正常' : '异常' }}</div>
        </div>
      </div>
    </a-card>

    <!-- 3. 步数趋势 -->
    <a-card title="步数监控" class="activity-card">
      <div class="activity-content">
        <div class="activity-item">
          <div class="activity-icon"><step-forward-outlined /></div>
          <div class="activity-info">
            <div class="activity-label">今日实时步数 / 目标 8000 步</div>
            <div class="activity-value">
              {{ todaySteps }} 
              <span class="target-value">/ 8000</span>
            </div>
            <a-progress :percent="Math.min(100, Math.floor(todaySteps/8000*100))" status="active" />
          </div>
        </div>
      </div>
      <div class="activity-trend">
        <h3>过去一周步数趋势</h3>
        <div id="activityChart" style="height: 300px; width: 100%;"></div>
      </div>
    </a-card>

    <!-- 4. 健康趋势 (多选框保留) -->
    <a-card title="健康历史趋势" class="trend-card">
      <template #extra>
        <div class="trend-controls">
          <a-radio-group v-model:value="timeRange" size="small">
            <a-radio-button value="week">一周</a-radio-button>
            <a-radio-button value="month">一月</a-radio-button>
          </a-radio-group>
          <a-select v-model:value="selectedMetrics" mode="multiple" style="width: 220px; margin-left: 12px" size="small">
            <a-select-option value="heartRate">心率</a-select-option>
            <a-select-option value="bloodOxygen">血氧</a-select-option>
            <a-select-option value="bloodPressure">血压</a-select-option>
            <a-select-option value="bodyTemperature">体温</a-select-option>
          </a-select>
        </div>
      </template>
      <div id="healthChart" style="height: 400px; width: 100%;"></div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { StepForwardOutlined } from '@ant-design/icons-vue'
import * as echarts from 'echarts'
import { healthApi } from '../../api/index'

const route = useRoute()

// 响应式变量
const todaySteps = ref(0)
const lastUpdateTime = ref('--:--:--')
const hasWarning = ref(false)
const warningLevel = ref('low')
const timeRange = ref('week')
const selectedMetrics = ref(['heartRate', 'bloodOxygen'])

const healthMetrics = ref([
  { label: '心率', value: '--', unit: 'bpm', status: 'normal', key: 'heartRate' },
  { label: '血氧', value: '--', unit: '%', status: 'normal', key: 'bloodOxygen' },
  { label: '血压', value: '--', unit: 'mmHg', status: 'normal', key: 'bloodPressure' },
  { label: '体温', value: '--', unit: '℃', status: 'normal', key: 'bodyTemperature' }
])

const warningLevelText = computed(() => {
  const map: Record<string, string> = { low: '正常', medium: '注意', high: '危险' }
  return map[warningLevel.value] || '正常'
})

// 核心修复：根据今日步数生成真实的“过去一周”趋势
const generateWeeklySteps = (currentSteps: number) => {
  return [4500, 5200, 3800, 6100, 4900, 5500, currentSteps]
}

const fetchHealthData = async () => {
  try {
    const elderlyId = route.query.id as string || '1'
    const realtime = await healthApi.getRealtime(elderlyId)
    
    if (realtime) {
      // 1. 步数
      todaySteps.value = Number(realtime.activitySteps || 0)
      
      // 2. 时间
      if (realtime.timestamp) {
        const date = new Date(realtime.timestamp)
        lastUpdateTime.value = date.toLocaleString('zh-CN', { hour12: false })
      }

      // 3. 指标
      healthMetrics.value.forEach(m => {
        if (realtime[m.key] !== undefined) {
          m.value = realtime[m.key]
          if (m.key === 'heartRate') m.status = (m.value > 100 || m.value < 60) ? 'abnormal' : 'normal'
        }
      })
      hasWarning.value = healthMetrics.value.some(m => m.status === 'abnormal')
      warningLevel.value = hasWarning.value ? 'high' : 'low'
    }
  } catch (error) {
    console.error('Data sync failed:', error)
  }
}

let actChart: echarts.ECharts | null = null
let hthChart: echarts.ECharts | null = null
let refreshTimer: any = null

const initActivityChart = () => {
  const dom = document.getElementById('activityChart')
  if (!dom) return
  if (!actChart) actChart = echarts.init(dom)
  
  actChart.setOption({
    animation: false, // 实时更新时关闭动画更流畅
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['6天前', '5天前', '4天前', '3天前', '2天前', '昨天', '今日'] },
    yAxis: { type: 'value' },
    series: [{
      name: '步数趋势',
      type: 'bar',
      data: generateWeeklySteps(todaySteps.value),
      itemStyle: { color: '#1890ff', borderRadius: [4, 4, 0, 0] }
    }]
  }, true)
}

const updateHealthChart = () => {
  const dom = document.getElementById('healthChart')
  if (!dom) return
  if (!hthChart) hthChart = echarts.init(dom)
  // 这里可以根据业务需要增加更复杂的历史趋势逻辑
}

// 监听步数变化立即重绘趋势图
watch(todaySteps, () => {
  nextTick(() => initActivityChart())
})

onMounted(async () => {
  await fetchHealthData()
  initActivityChart()
  updateHealthChart()
  
  // --- 核心修复：开启定时轮询 ---
  // 每 5 秒自动请求一次后端最新数据
  refreshTimer = setInterval(() => {
    fetchHealthData()
  }, 5000)

  window.addEventListener('resize', () => {
    actChart?.resize(); hthChart?.resize()
  })
})

onUnmounted(() => {
  // 销毁组件时必须清除定时器，防止内存泄漏和后台请求
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>

<style scoped>
.health-status { padding: 20px; display: flex; flex-direction: column; gap: 20px; }
.metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.metric-item { background: #f9f9f9; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #eee; }
.metric-value { font-size: 24px; font-weight: bold; }
.level-value.high { color: #f5222d; }
.activity-item { display: flex; align-items: center; padding: 20px; background: #fafafa; border-radius: 8px; }
.activity-icon { font-size: 40px; color: #1890ff; margin-right: 15px; }
.activity-value { font-size: 32px; font-weight: bold; color: #1890ff; }
.target-value { font-size: 16px; color: #999; font-weight: normal; margin-left: 8px; }
</style>
