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

    <!-- 3. 步数监控 -->
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

    <!-- 4. 健康历史趋势 -->
    <a-card title="健康历史趋势" class="trend-card">
      <template #extra>
        <div class="trend-controls">
          <a-select v-model:value="selectedMetrics" mode="multiple" style="width: 300px;" size="small" placeholder="选择展示指标">
            <a-select-option value="heartRate">心率</a-select-option>
            <a-select-option value="bloodOxygen">血氧</a-select-option>
            <a-select-option value="bodyTemperature">体温</a-select-option>
            <a-select-option value="bloodPressure">血压</a-select-option>
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
const selectedMetrics = ref(['heartRate', 'bloodOxygen', 'bloodPressure'])
const historyData = ref([])

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

const fetchHealthData = async () => {
  try {
    const elderlyId = route.query.id as string || '1'
    const realtime = await healthApi.getRealtime(elderlyId)
    
    if (realtime) {
      todaySteps.value = Number(realtime.activitySteps || 0)
      if (realtime.timestamp) {
        const date = new Date(realtime.timestamp)
        lastUpdateTime.value = date.toLocaleString('zh-CN', { hour12: false })
      }
      healthMetrics.value.forEach(m => {
        if (realtime[m.key] !== undefined) {
          m.value = realtime[m.key]
          if (m.key === 'heartRate') m.status = (m.value > 100 || m.value < 60) ? 'abnormal' : 'normal'
        }
      })
      hasWarning.value = healthMetrics.value.some(m => m.status === 'abnormal')
      warningLevel.value = hasWarning.value ? 'high' : 'low'
    }

    const trends = await healthApi.getHistory(elderlyId)
    console.log('raw trends:', trends)
    historyData.value = Array.isArray(trends) ? trends : []
    
    nextTick(() => {
      renderActivityChart()
      renderHealthChart()
    })
  } catch (error) {
    console.error('Data sync failed:', error)
    nextTick(() => {
      renderActivityChart()
      renderHealthChart()
    })
  }
}

let actChart: echarts.ECharts | null = null
let hthChart: echarts.ECharts | null = null
let refreshTimer: any = null

const renderActivityChart = () => {
  const dom = document.getElementById('activityChart')
  if (!dom) return
  if (!actChart) actChart = echarts.init(dom)
  
  const days = []
  const steps = []
  const now = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const label = i === 0 ? '今日' : `${d.getMonth() + 1}/${d.getDate()}`
    days.push(label)
    
    const dateStr = d.toISOString().split('T')[0]
    const dayData = historyData.value.filter(item => item.timestamp && item.timestamp.includes(dateStr))
    if (dayData.length > 0) {
      // 取当天最后一条记录的步数（即当天的最终步数）
      steps.push(dayData[0].activitySteps || 0) // 因为后端返回的是 reverse() 后的数据，第一条就是最新的
    } else {
      steps.push(0)
    }
  }

  actChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '40', right: '20', bottom: '30', top: '20' },
    xAxis: { type: 'category', data: days },
    yAxis: { type: 'value' },
    series: [{
      name: '步数',
      type: 'bar',
      data: steps,
      itemStyle: { color: '#1890ff', borderRadius: [4, 4, 0, 0] }
    }]
  }, true)
}

const renderHealthChart = () => {
  const dom = document.getElementById('healthChart')
  if (!dom) return
  if (!hthChart) hthChart = echarts.init(dom)

  const days = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }

  const series: any[] = []
  
  selectedMetrics.value.forEach(metric => {
    if (metric === 'bloodPressure') {
      // 血压拆分为收缩压和舒张压
      const sysData = days.map(day => {
        const dayData = historyData.value.filter(item => item.timestamp && item.timestamp.includes(day))
        if (dayData.length === 0) return 0
        const values = dayData.map(item => parseInt(String(item.bloodPressure || '0/0').split('/')[0]))
        return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      })
      const diaData = days.map(day => {
        const dayData = historyData.value.filter(item => item.timestamp && item.timestamp.includes(day))
        if (dayData.length === 0) return 0
        const values = dayData.map(item => parseInt(String(item.bloodPressure || '0/0').split('/')[1]))
        return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      })
      series.push({ name: '收缩压', type: 'line', smooth: true, data: sysData })
      series.push({ name: '舒张压', type: 'line', smooth: true, data: diaData })
    } else {
      const metricInfo = healthMetrics.value.find(m => m.key === metric)
      const data = days.map(day => {
        const dayData = historyData.value.filter(item => item.timestamp && item.timestamp.includes(day))
        if (dayData.length === 0) return 0
        const values = dayData.map(item => parseFloat(item[metric]) || 0)
        return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
      })
      series.push({ name: metricInfo?.label || metric, type: 'line', smooth: true, data })
    }
  })

  hthChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    grid: { left: '40', right: '20', bottom: '30', top: '60' },
    xAxis: { 
      type: 'category', 
      data: days.map(d => `${d.split('-')[1]}/${d.split('-')[2]}`)
    },
    yAxis: { type: 'value', scale: true },
    series: series
  }, true)
}

watch(selectedMetrics, () => renderHealthChart())

onMounted(async () => {
  await fetchHealthData()
  window.addEventListener('resize', () => {
    actChart?.resize(); hthChart?.resize()
  })
  refreshTimer = setInterval(fetchHealthData, 5000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
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
