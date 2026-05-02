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
          检测到老人健康指标异常，请及时关注！
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

    <!-- 3. 运动数据 -->
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
            <a-progress :percent="Math.min(100, Math.floor(todaySteps/8000*100))" size="small" />
          </div>
        </div>
      </div>
      <div class="activity-trend">
        <h3>最近一周步数趋势</h3>
        <div id="activityChart" style="height: 300px; width: 100%;"></div>
      </div>
    </a-card>

    <!-- 4. 健康趋势图表 (多选框已彻底回归) -->
    <a-card title="健康趋势" class="trend-card">
      <template #extra>
        <div class="trend-controls">
          <a-radio-group v-model:value="timeRange" size="small" class="time-range-group">
            <a-radio-button value="week">最近一周</a-radio-button>
            <a-radio-button value="month">最近一月</a-radio-button>
          </a-radio-group>
          <!-- 核心：多选切换逻辑 -->
          <a-select
            v-model:value="selectedMetrics"
            mode="multiple"
            placeholder="选择指标"
            style="width: 240px; margin-left: 16px"
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
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { StepForwardOutlined } from '@ant-design/icons-vue'
import * as echarts from 'echarts'
import { healthApi } from '../../api/index'

const route = useRoute()

// 状态变量定义
const hasWarning = ref(false)
const warningLevel = ref('low')
const lastUpdateTime = ref('--:--:--')
const todaySteps = ref(0) 
const timeRange = ref('week')
const selectedMetrics = ref(['heartRate', 'bloodOxygen']) // 默认选中心率和血氧
const isEmergencyModalOpen = ref(false)

// 基础健康指标结构
const healthMetrics = ref([
  { label: '心率', value: '--', unit: 'bpm', status: 'normal', key: 'heartRate' },
  { label: '血氧', value: '--', unit: '%', status: 'normal', key: 'bloodOxygen' },
  { label: '血压', value: '--', unit: 'mmHg', status: 'normal', key: 'bloodPressure' },
  { label: '体温', value: '--', unit: '℃', status: 'normal', key: 'bodyTemperature' }
])

// 模拟趋势数据 (保留用于渲染折线图)
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

// 数据交互函数
const handleEmergencyCall = () => { isEmergencyModalOpen.value = true }
const confirmEmergencyCall = () => {
  message.loading('正在呼叫紧急联系人...', 1.5)
  setTimeout(() => {
    message.success('呼叫成功，请保持电话畅通')
    isEmergencyModalOpen.value = false
  }, 1500)
}
const handleIgnoreWarning = () => {
  hasWarning.value = false
  message.info('已忽略本次警告')
}

// 核心：对接后端数据并刷新步数
const fetchHealthData = async () => {
  try {
    const elderlyId = route.query.id as string || '1'; 
    const realtime = await healthApi.getRealtime(elderlyId);
    
    if (realtime) {
      // 1. 同步指标值
      healthMetrics.value.forEach(metric => {
        if (realtime[metric.key] !== undefined) {
          metric.value = realtime[metric.key];
          // 心率范围判断
          if (metric.key === 'heartRate') {
            metric.status = (metric.value > 100 || metric.value < 60) ? 'abnormal' : 'normal';
          }
        }
      });
      
      // 2. 核心：同步步数（处理多种可能的字段名）
      todaySteps.value = realtime.activitySteps ?? realtime.steps ?? realtime.todaySteps ?? 0;
      
      // 3. 强制触发步数图表重绘
      await nextTick();
      if (activityChart) {
        updateActivityChart();
      }

      hasWarning.value = healthMetrics.value.some(m => m.status === 'abnormal');
      if (realtime.timestamp) {
        lastUpdateTime.value = new Date(realtime.timestamp).toLocaleTimeString();
      }
    }
  } catch (error: any) {
    console.error('获取健康数据失败:', error);
  }
}

// 图表逻辑管理
let activityChart: echarts.ECharts | null = null
let healthChart: echarts.ECharts | null = null

const initCharts = () => {
  const actDom = document.getElementById('activityChart');
  const hthDom = document.getElementById('healthChart');
  
  if (actDom) {
    activityChart = echarts.init(actDom);
    updateActivityChart();
  }
  if (hthDom) {
    healthChart = echarts.init(hthDom);
    updateHealthChart();
  }
}

const updateActivityChart = () => {
  if (!activityChart) return;
  activityChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '今日'] },
    yAxis: { type: 'value', name: '步数' },
    series: [{
      name: '步数',
      type: 'bar',
      // 这里确保最后一位是实时获取的 todaySteps.value
      data: [4200, 5100, 6300, 4800, 7200, 5432, todaySteps.value],
      itemStyle: { color: '#1890ff', borderRadius: [4, 4, 0, 0] }
    }]
  }, true);
}

const updateHealthChart = () => {
  if (!healthChart) return;
  const data = healthTrendData.value[timeRange.value as 'week' | 'month'];
  const metricNameMap: Record<string, string> = {
    heartRate: '心率',
    bloodOxygen: '血氧',
    bloodPressure: '血压',
    bodyTemperature: '体温'
  };

  const series = selectedMetrics.value.map(metric => ({
    name: metricNameMap[metric],
    type: 'line',
    smooth: true,
    data: (data as any)[metric]
  }));

  healthChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: series.map(s => s.name), bottom: 10 },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: data.dates },
    yAxis: { type: 'value' },
    series
  }, true);
}

// 监听控制变量
watch([timeRange, selectedMetrics], () => { 
  updateHealthChart(); 
})

onMounted(async () => {
  await fetchHealthData(); // 优先拿数据
  initCharts();
  window.addEventListener('resize', () => {
    activityChart?.resize();
    healthChart?.resize();
  });
})
</script>

<style scoped>
.health-status { display: flex; flex-direction: column; gap: 24px; padding: 20px; background-color: #fff; min-height: 100vh; }
.page-title { font-size: 24px; font-weight: bold; color: #333; margin: 0; }
.warning-bar { margin-bottom: 8px; }
.warning-content { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.level-value { margin-left: 8px; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
.level-value.low { color: #52c41a; }
.level-value.medium { color: #faad14; }
.level-value.high { color: #f5222d; }
.metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.metric-item { padding: 20px; background-color: #fcfcfc; border: 1px solid #f0f0f0; border-radius: 8px; text-align: center; }
.metric-label { color: #8c8c8c; margin-bottom: 8px; }
.metric-value { font-size: 28px; font-weight: bold; color: #262626; }
.unit { font-size: 14px; margin-left: 4px; color: #8c8c8c; }
.metric-status { margin-top: 8px; font-size: 12px; }
.metric-status.normal { color: #52c41a; }
.metric-status.abnormal { color: #f5222d; }
.activity-item { display: flex; align-items: center; padding: 24px; background-color: #fafafa; border-radius: 8px; margin-bottom: 20px; }
.activity-icon { font-size: 40px; color: #1890ff; margin-right: 20px; }
.activity-info { flex: 1; }
.activity-value { font-size: 32px; font-weight: bold; color: #1890ff; }
.trend-controls { display: flex; align-items: center; }
</style>
