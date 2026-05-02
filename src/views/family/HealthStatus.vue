<template>
  <div class="health-status">
    <h2 class="page-title">实时健康状态</h2>
    
    <!-- 1. 风险预警条 -->
    <div class="warning-bar">
      <a-alert
        v-if="hasWarning"
        type="warning"
        show-icon
        class="health-alert"
      >
        <template #message>
          <div class="warning-content">
            <span class="warning-level">风险等级：<span :class="['level-value', warningLevel]">{{ warningLevelText }}</span></span>
            <div class="warning-actions">
              <a-button size="small" type="primary" danger @click="handleEmergencyCall">紧急呼叫</a-button>
              <a-button size="small" @click="handleIgnoreWarning">忽略警告</a-button>
            </div>
          </div>
        </template>
        <template #description>
          检测到老人心率异常（105bpm），请及时关注！
        </template>
      </a-alert>
      <a-alert
        v-else
        type="success"
        message="当前健康状态良好"
        description="所有指标均在正常范围内，未检测到异常风险。"
        show-icon
      />
    </div>

    <!-- 2. 核心健康指标卡片 -->
    <a-card title="实时指标" class="metrics-card">
      <template #extra>
        <span class="update-time">最后更新: {{ lastUpdateTime }}</span>
      </template>
      <div class="metrics-grid">
        <div v-for="metric in healthMetrics" :key="metric.key" class="metric-item">
          <div class="metric-label">{{ metric.label }}</div>
          <div class="metric-value">
            {{ metric.value }}<span class="unit">{{ metric.unit }}</span>
          </div>
          <div :class="['metric-status', metric.status]">
            {{ metric.status === 'normal' ? '正常' : '异常' }}
          </div>
        </div>
      </div>
    </a-card>

    <!-- 3. 运动数据（仅保留步数）[cite: 2] -->
    <a-card title="今日运动" class="activity-card">
      <div class="activity-content">
        <div class="activity-item">
          <div class="activity-icon">
            <step-forward-outlined />
          </div>
          <div class="activity-info">
            <div class="activity-label">今日步数</div>
            <div class="activity-value">{{ todaySteps }}</div>
            <div class="activity-target">目标: 8000步</div>
            <a-progress :percent="Math.floor(todaySteps/8000*100)" size="small" />
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
          <a-radio-group v-model:value="timeRange" size="small" class="time-range-group">
            <a-radio-button value="week">最近一周</a-radio-button>
            <a-radio-button value="month">最近一月</a-radio-button>
          </a-radio-group>
          <a-select
            v-model:value="selectedMetrics"
            mode="multiple"
            placeholder="选择指标"
            style="width: 200px; margin-left: 16px"
            size="small"
          >
            <a-select-option value="heartRate">心率</a-select-option>
            <a-select-option value="bloodOxygen">血氧</a-select-option>
            <a-select-option value="bloodPressure">血压</a-select-option>
            <a-select-option value="bodyTemperature">体温</a-select-option>
          </a-select>
        </div>
      </template>
      <div id="healthChart" style="height: 400px; width: 100%;"></div>
    </a-card>

    <!-- 紧急呼叫确认弹窗 -->
    <a-modal
      v-model:open="isEmergencyModalOpen"
      title="紧急呼叫确认"
      @ok="confirmEmergencyCall"
      ok-text="确认呼叫"
      cancel-text="取消"
      :ok-button-props="{ danger: true }"
    >
      <p>系统将立即联系社区医生和您的紧急联系人，并开启双向语音通话。是否继续？</p>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import { StepForwardOutlined } from '@ant-design/icons-vue'
import * as echarts from 'echarts'
import { healthApi } from '../../api/index'

// 状态定义
const hasWarning = ref(true)
const warningLevel = ref('medium')
const lastUpdateTime = ref('14:25:30')
const todaySteps = ref(5432) //[cite: 2]
const timeRange = ref('week')
const selectedMetrics = ref(['heartRate', 'bloodOxygen'])
const isEmergencyModalOpen = ref(false)

// 健康指标数据
const healthMetrics = ref([
  { label: '心率', value: 105, unit: 'bpm', status: 'abnormal', key: 'heartRate' },
  { label: '血氧', value: 98, unit: '%', status: 'normal', key: 'bloodOxygen' },
  { label: '血压', value: '120/80', unit: 'mmHg', status: 'normal', key: 'bloodPressure' },
  { label: '体温', value: 36.6, unit: '℃', status: 'normal', key: 'bodyTemperature' }
])

// 步数趋势数据[cite: 2]
const activityTrendData = ref([
  { day: '周一', steps: 4200 },
  { day: '周二', steps: 5100 },
  { day: '周三', steps: 6300 },
  { day: '周四', steps: 4800 },
  { day: '周五', steps: 7200 },
  { day: '周六', steps: 5432 },
  { day: '周日', steps: 0 }
])

// 模拟健康趋势数据
const healthTrendData = ref({
  week: {
    dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    heartRate: [72, 75, 78, 74, 82, 105, 76],
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

const handleEmergencyCall = () => { isEmergencyModalOpen.value = true }
const confirmEmergencyCall = () => {
  message.loading('正在呼叫紧急联系人...', 2)
  setTimeout(() => {
    message.success('呼叫成功，请保持电话畅通')
    isEmergencyModalOpen.value = false
  }, 2000)
}
const handleIgnoreWarning = () => {
  hasWarning.value = false
  message.info('已忽略本次警告')
}

const fetchHealthData = async () => {
  try {
    const elderlyId = '1'; 
    const realtime = await healthApi.getRealtime(elderlyId);
    if (realtime) {
      healthMetrics.value.forEach(metric => {
        if (realtime[metric.key] !== undefined) {
          metric.value = realtime[metric.key];
        }
      });
      if (realtime.activitySteps !== undefined) {
        todaySteps.value = realtime.activitySteps; //[cite: 2]
      }
      if (realtime.timestamp) {
        const date = new Date(realtime.timestamp);
        lastUpdateTime.value = date.toLocaleTimeString();
      }
    }
  } catch (error: any) {
    console.error('获取健康数据失败:', error);
  }
}

// 图表初始化（已移除运动时长相关配置）[cite: 2]
let activityChart: echarts.ECharts | null = null
let healthChart: echarts.ECharts | null = null

const initActivityChart = () => {
  const chartDom = document.getElementById('activityChart')
  if (chartDom) {
    activityChart = echarts.init(chartDom)
    const option = {
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: activityTrendData.value.map((item: any) => item.day)
      },
      yAxis: { type: 'value', name: '步数' },
      series: [
        {
          name: '步数',
          type: 'bar',
          data: activityTrendData.value.map((item: any) => item.steps),
          itemStyle: { color: '#1890ff' }
        }
      ]
    }
    activityChart.setOption(option)
  }
}

const initHealthChart = () => {
  const chartDom = document.getElementById('healthChart')
  if (chartDom) {
    healthChart = echarts.init(chartDom)
    updateHealthChart()
  }
}

const updateHealthChart = () => {
  if (!healthChart) return
  const data = healthTrendData.value[timeRange.value as 'week' | 'month']
  const series = selectedMetrics.value.map(metric => ({
    name: { heartRate: '心率', bloodOxygen: '血氧', bloodPressure: '血压', bodyTemperature: '体温' }[metric as keyof typeof healthTrendData.value.week],
    type: 'line',
    data: (data as any)[metric]
  }))
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: series.map(item => item.name) },
    xAxis: { type: 'category', boundaryGap: false, data: data.dates },
    yAxis: { type: 'value' },
    series
  }
  healthChart.setOption(option)
}

watch([timeRange, selectedMetrics], () => { updateHealthChart() })

onMounted(async () => {
  await fetchHealthData()
  initActivityChart()
  initHealthChart()
  window.addEventListener('resize', () => {
    activityChart?.resize()
    healthChart?.resize()
  })
})
</script>

<style scoped>
.health-status { display: flex; flex-direction: column; gap: 24px; }
.page-title { font-size: 24px; font-weight: bold; margin: 0 0 16px 0; color: #333; }
.warning-bar { margin-bottom: 24px; }
.warning-content { display: flex; justify-content: space-between; align-items: center; }
.warning-level { font-size: 18px; font-weight: bold; }
.level-value { margin-left: 8px; padding: 4px 12px; border-radius: 12px; color: white; }
.level-value.low { background-color: #52c41a; }
.level-value.medium { background-color: #faad14; }
.level-value.high { background-color: #f5222d; }
.warning-actions { display: flex; gap: 16px; }
.metrics-card { margin-bottom: 24px; }
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.metric-item { padding: 16px; background-color: #f9f9f9; border-radius: 8px; text-align: center; transition: all 0.3s; }
.metric-item:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); transform: translateY(-2px); }
.metric-label { font-size: 14px; color: #666; margin-bottom: 8px; }
.metric-value { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 8px; }
.unit { font-size: 14px; color: #666; margin-left: 4px; }
.metric-status { font-size: 12px; padding: 2px 8px; border-radius: 10px; display: inline-block; }
.metric-status.normal { background-color: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.metric-status.abnormal { background-color: #fff2f0; color: #f5222d; border: 1px solid #ffccc7; }
.activity-card { margin-bottom: 24px; }
.activity-content { display: flex; gap: 24px; margin-bottom: 24px; }
.activity-item { flex: 1; display: flex; align-items: center; padding: 24px; background-color: #f9f9f9; border-radius: 8px; }
.activity-icon { font-size: 48px; color: #1890ff; margin-right: 16px; }
.activity-info { flex: 1; }
.activity-label { font-size: 14px; color: #666; margin-bottom: 8px; }
.activity-value { font-size: 32px; font-weight: bold; color: #333; margin-bottom: 4px; }
.activity-target { font-size: 12px; color: #999; }
.activity-trend h3 { font-size: 16px; font-weight: bold; margin-bottom: 16px; color: #333; }
.trend-card { margin-bottom: 24px; }
.trend-controls { display: flex; align-items: center; margin-bottom: 24px; }
</style>
