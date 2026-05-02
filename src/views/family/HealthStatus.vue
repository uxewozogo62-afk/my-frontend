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
            <!-- 动态步数进度条[cite: 4] -->
            <a-progress :percent="Math.min(100, Math.floor(todaySteps/8000*100))" size="small" />
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
import { useRoute } from 'vue-router' // 引入路由对象[cite: 4]
import { message } from 'ant-design-vue'
import { StepForwardOutlined } from '@ant-design/icons-vue'
import * as echarts from 'echarts'
import { healthApi } from '../../api/index'

const route = useRoute();

// 状态定义
const hasWarning = ref(false)
const warningLevel = ref('low')
const lastUpdateTime = ref('--:--:--')
const todaySteps = ref(0) // 初始设为 0[cite: 4]
const timeRange = ref('week')
const selectedMetrics = ref(['heartRate', 'bloodOxygen'])
const isEmergencyModalOpen = ref(false)

// 健康指标数据：初始状态统一为 normal[cite: 4]
const healthMetrics = ref([
  { label: '心率', value:'--', unit: 'bpm', status: 'normal', key: 'heartRate' },
  { label: '血氧', value: '--', unit: '%', status: 'normal', key: 'bloodOxygen' },
  { label: '血压', value: '--', unit: 'mmHg', status: 'normal', key: 'bloodPressure' },
  { label: '体温', value: '--', unit: '℃', status: 'normal', key: 'bodyTemperature' }
])

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

// 核心逻辑：获取数据库信息并渲染[cite: 4]
const fetchHealthData = async () => {
  try {
    // 1. 获取 Dashboard 传过来的 ID[cite: 4]
    const elderlyId = route.query.id as string || '1'; 
    const realtime = await healthApi.getRealtime(elderlyId);
    
    if (realtime) {
      // 2. 动态同步核心指标[cite: 4]
      healthMetrics.value.forEach(metric => {
        if (realtime[metric.key] !== undefined) {
          metric.value = realtime[metric.key];
          
          // 动态判断状态：心率 60-100 为正常[cite: 4]
          if (metric.key === 'heartRate') {
            metric.status = (metric.value > 100 || metric.value < 60) ? 'abnormal' : 'normal';
          }
        }
      });

      // 3. 同步今日步数[cite: 4]
      todaySteps.value = realtime.activitySteps || realtime.steps || 0;

      // 4. 更新预警条状态
      hasWarning.value = healthMetrics.value.some(m => m.status === 'abnormal');
      
      if (realtime.timestamp) {
        lastUpdateTime.value = new Date(realtime.timestamp).toLocaleTimeString();
      }
    }
  } catch (error: any) {
    console.error('获取健康数据失败:', error);
  }
}

// 图表初始化逻辑
let activityChart: echarts.ECharts | null = null
let healthChart: echarts.ECharts | null = null

const initActivityChart = () => {
  const chartDom = document.getElementById('activityChart')
  if (chartDom) {
    activityChart = echarts.init(chartDom)
    activityChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '今日'] },
      yAxis: { type: 'value', name: '步数' },
      series: [{
        name: '步数',
        type: 'bar',
        data: [4200, 5100, 6300, 4800, 7200, 5432, todaySteps.value], // 最后一天显示实时步数[cite: 4]
        itemStyle: { color: '#1890ff' }
      }]
    })
  }
}

onMounted(async () => {
  await fetchHealthData(); // 先加载数据[cite: 4]
  initActivityChart();
})
</script>

<style scoped>
.health-status { display: flex; flex-direction: column; gap: 24px; }
.page-title { font-size: 24px; font-weight: bold; margin: 0 0 16px 0; color: #333; }
.metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.metric-item { padding: 16px; background-color: #f9f9f9; border-radius: 8px; text-align: center; transition: all 0.3s; }
.metric-value { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 8px; }
.metric-status { font-size: 12px; padding: 2px 8px; border-radius: 10px; display: inline-block; }
.metric-status.normal { background-color: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.metric-status.abnormal { background-color: #fff2f0; color: #f5222d; border: 1px solid #ffccc7; }
.activity-item { display: flex; align-items: center; padding: 24px; background-color: #f9f9f9; border-radius: 8px; }
.activity-icon { font-size: 48px; color: #1890ff; margin-right: 16px; }
</style>
