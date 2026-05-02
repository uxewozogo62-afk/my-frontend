<template>
  <div class="health-status">
    <h2 class="page-title">实时健康状态</h2>
    
    <!-- 1. 风险预警条 -->
    <div class="warning-bar">
      <a-alert v-if="hasWarning" type="warning" show-icon class="health-alert">
        <template #message>
          <div class="warning-content">
            <span class="warning-level">风险等级：<span :class="['level-value', warningLevel]">{{ warningLevelText }}</span></span>
            <div class="warning-actions">
              <a-button size="small" type="primary" danger @click="handleEmergencyCall">紧急呼叫</a-button>
            </div>
          </div>
        </template>
        <template #description>检测到老人健康指标异常，请及时关注！</template>
      </a-alert>
      <a-alert v-else type="success" message="当前健康状态良好" description="所有指标均在正常范围内。" show-icon />
    </div>

    <!-- 2. 核心指标卡片 -->
    <a-card title="实时指标" class="metrics-card">
      <template #extra>
        <!-- 重点：此处显示数据库中的 timestamp -->
        <span class="update-time" style="color: #1890ff; font-weight: bold;">
          数据采集时间: {{ lastUpdateTime }}
        </span>
      </template>
      <div class="metrics-grid">
        <div v-for="metric in healthMetrics" :key="metric.key" class="metric-item">
          <div class="metric-label">{{ metric.label }}</div>
          <div class="metric-value">{{ metric.value }}<span class="unit">{{ metric.unit }}</span></div>
          <div :class="['metric-status', metric.status]">{{ metric.status === 'normal' ? '正常' : '异常' }}</div>
        </div>
      </div>
    </a-card>

    <!-- 3. 今日运动 -->
    <a-card title="今日运动" class="activity-card">
      <div class="activity-content">
        <div class="activity-item">
          <div class="activity-icon"><step-forward-outlined /></div>
          <div class="activity-info">
            <div class="activity-label">今日累积步数</div>
            <!-- 重点：此处对接 activitySteps -->
            <div class="activity-value">{{ todaySteps }}</div>
            <div class="activity-target">目标: 8000步</div>
            <a-progress :percent="Math.min(100, Math.floor(todaySteps/8000*100))" status="active" />
          </div>
        </div>
      </div>
      <div class="activity-trend">
        <h3>最近一周步数趋势</h3>
        <div id="activityChart" style="height: 300px; width: 100%;"></div>
      </div>
    </a-card>

    <!-- 4. 健康趋势图表 -->
    <a-card title="健康趋势" class="trend-card">
      <template #extra>
        <div class="trend-controls">
          <a-radio-group v-model:value="timeRange" size="small">
            <a-radio-button value="week">最近一周</a-radio-button>
            <a-radio-button value="month">最近一月</a-radio-button>
          </a-radio-group>
          <a-select v-model:value="selectedMetrics" mode="multiple" style="width: 240px; margin-left: 16px" size="small">
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
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { StepForwardOutlined } from '@ant-design/icons-vue'
import * as echarts from 'echarts'
import { healthApi } from '../../api/index'

const route = useRoute()

// 响应式状态
const hasWarning = ref(false)
const warningLevel = ref('low')
const lastUpdateTime = ref('--:--:--')
const todaySteps = ref(0) 
const timeRange = ref('week')
const selectedMetrics = ref(['heartRate', 'bloodOxygen'])

const healthMetrics = ref([
  { label: '心率', value: '--', unit: 'bpm', status: 'normal', key: 'heartRate' },
  { label: '血氧', value: '--', unit: '%', status: 'normal', key: 'bloodOxygen' },
  { label: '血压', value: '--', unit: 'mmHg', status: 'normal', key: 'bloodPressure' },
  { label: '体温', value: '--', unit: '℃', status: 'normal', key: 'bodyTemperature' }
])

// 模拟趋势数据（供下方折线图使用）
const healthTrendData = ref({
  week: {
    dates: ['周一', '周二', '周三', '周四', '周五', '周六', '今日'],
    heartRate: [72, 75, 78, 74, 82, 75, 76],
    bloodOxygen: [98, 97, 98, 99, 98, 98, 97],
    bloodPressure: [118, 120, 122, 119, 125, 120, 118],
    bodyTemperature: [36.5, 36.6, 36.4, 36.7, 36.6, 36.6, 36.5]
  },
  month: {
    dates: Array.from({ length: 30 }, (_, i) => `${i + 1}日`),
    heartRate: Array.from({ length: 30 }, () => Math.floor(Math.random() * 20) + 70),
    bloodOxygen: Array.from({ length: 30 }, () => Math.floor(Math.random() * 3) + 97),
    bloodPressure: Array.from({ length: 30 }, () => Math.floor(Math.random() * 10) + 115),
    bodyTemperature: Array.from({ length: 30 }, () => (Math.random() * 0.5 + 36.3).toFixed(1))
  }
})

const warningLevelText = computed(() => {
  const map: Record<string, string> = { low: '低', medium: '中', high: '高' }
  return map[warningLevel.value] || '未知'
})

// 核心数据获取逻辑
const fetchHealthData = async () => {
  try {
    const elderlyId = route.query.id as string || '1'
    const realtime = await healthApi.getRealtime(elderlyId)
    
    console.log('数据库实时数据载入:', realtime) // 方便你调试

    if (realtime) {
      // 1. 步数赋值：精准对接 activitySteps
      if (realtime.activitySteps !== undefined) {
        todaySteps.value = Number(realtime.activitySteps)
      }

      // 2. 时间赋值：精准对接 timestamp
      if (realtime.timestamp) {
        const dateObj = new Date(realtime.timestamp)
        // 格式化为：2026/05/02 20:08:57 形式，你可以根据需要调整
        lastUpdateTime.value = dateObj.toLocaleString('zh-CN', { 
          hour12: false,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      }

      // 3. 各项健康指标同步
      healthMetrics.value.forEach(metric => {
        if (realtime[metric.key] !== undefined) {
          metric.value = realtime[metric.key]
          // 预警逻辑判断
          if (metric.key === 'heartRate') {
            metric.status = (metric.value > 100 || metric.value < 60) ? 'abnormal' : 'normal'
          }
        }
      })

      hasWarning.value = healthMetrics.value.some(m => m.status === 'abnormal')
    }
  } catch (error) {
    console.error('API请求失败:', error)
    message.error('无法同步数据库健康数据')
  }
}

let activityChart: echarts.ECharts | null = null
let healthChart: echarts.ECharts | null = null

const updateActivityChart = () => {
  const dom = document.getElementById('activityChart')
  if (!dom) return
  if (!activityChart) activityChart = echarts.init(dom)
  
  activityChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '今日'] },
    yAxis: { type: 'value' },
    series: [{
      name: '步数',
      type: 'bar',
      // 最后一项动态绑定 todaySteps
      data: [4200, 5100, 6300, 4800, 7200, 5432, todaySteps.value],
      itemStyle: { color: '#1890ff', borderRadius: [4, 4, 0, 0] }
    }]
  }, true)
}

const updateHealthChart = () => {
  const dom = document.getElementById('healthChart')
  if (!dom) return
  if (!healthChart) healthChart = echarts.init(dom)

  const data = healthTrendData.value[timeRange.value as 'week' | 'month']
  const nameMap: Record<string, string> = { heartRate: '心率', bloodOxygen: '血氧', bloodPressure: '血压', bodyTemperature: '体温' }
  
  const series = selectedMetrics.value.map(metric => ({
    name: nameMap[metric],
    type: 'line',
    smooth: true,
    data: (data as any)[metric]
  }))

  healthChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: series.map(s => s.name), bottom: 10 },
    xAxis: { type: 'category', boundaryGap: false, data: data.dates },
    yAxis: { type: 'value' },
    series
  }, true)
}

// 监听步数变化，实时重绘柱状图
watch(todaySteps, () => {
  nextTick(() => updateActivityChart())
})

// 监听趋势配置变化
watch([timeRange, selectedMetrics], () => {
  updateHealthChart()
})

onMounted(async () => {
  // 1. 先拿数据（会给 todaySteps 赋值）
  await fetchHealthData()
  
  // 2. 初始化图表（此时 updateActivityChart 会读取到最新的 todaySteps）
  updateActivityChart()
  updateHealthChart()
  
  window.addEventListener('resize', () => {
    activityChart?.resize()
    healthChart?.resize()
  })
})
</script>

<style scoped>
.health-status { display: flex; flex-direction: column; gap: 24px; padding: 20px; background-color: #fff; }
.page-title { font-size: 24px; font-weight: bold; }
.warning-content { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.level-value { margin-left: 8px; font-weight: bold; }
.level-value.low { color: #52c41a; }
.level-value.medium { color: #faad14; }
.level-value.high { color: #f5222d; }
.metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.metric-item { padding: 20px; background-color: #fcfcfc; border: 1px solid #f0f0f0; border-radius: 8px; text-align: center; }
.metric-value { font-size: 28px; font-weight: bold; color: #262626; }
.metric-status.normal { color: #52c41a; }
.metric-status.abnormal { color: #f5222d; }
.activity-item { display: flex; align-items: center; padding: 24px; background-color: #fafafa; border-radius: 8px; margin-bottom: 20px; }
.activity-icon { font-size: 40px; color: #1890ff; margin-right: 20px; }
.activity-value { font-size: 32px; font-weight: bold; color: #1890ff; }
.trend-controls { display: flex; align-items: center; }
</style>
