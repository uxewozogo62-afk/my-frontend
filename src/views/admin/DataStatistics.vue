<template>
  <div class="data-statistics">
    <h2 class="page-title">全域健康大数据分析</h2>
    
    <a-row :gutter="16" style="margin-bottom: 24px;">
      <a-col :span="6">
        <a-card>
          <a-statistic title="档案总数" :value="realStats.totalElderly" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic 
            title="待处理预警" 
            :value="realStats.todayWarnings" 
            :value-style="{ color: realStats.todayWarnings > 0 ? '#cf1322' : '#3f963f' }" 
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="设备在线率" :value="realStats.onlineRate" suffix="%" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="全员平均心率" :value="realStats.avgHeartRate" suffix="bpm" />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="12">
        <a-card title="各社区老人分布 (动态统计)">
          <div id="communityChart" style="height: 350px;"></div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="全域平均心率趋势 (实时)">
          <div id="trendChart" style="height: 350px;"></div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import request from '../../utils/request'

// 响应式数据状态
const realStats = ref({
  totalElderly: 0,
  todayWarnings: 0,
  onlineRate: 0,
  avgHeartRate: 0,
  communityData: [],
  trendData: []
})

/**
 * 从后端调取真实数据
 */
const fetchRealData = async () => {
  try {
    // 1. 获取社区分布（通过全量列表统计）
    const list = await request.get('/admin/elderly');
    const counts = {};
    list.forEach(item => {
      counts[item.community] = (counts[item.community] || 0) + 1;
    });
    realStats.value.communityData = Object.keys(counts).map(name => ({
      name: name,
      value: counts[name]
    }));

    // 2. 获取顶部卡片汇总统计
    const summary = await request.get('/admin/stats/all');
    realStats.value.totalElderly = summary.totalElderly;
    realStats.value.todayWarnings = summary.todayWarnings;
    realStats.value.onlineRate = summary.onlineRate;
    realStats.value.avgHeartRate = summary.avgHeartRate;
    realStats.value.trendData = summary.trendData;

    // 3. 渲染/更新图表
    nextTick(() => {
      renderCharts();
    });
    
  } catch (e) {
    console.error('统计页面加载失败:', e);
  }
}

/**
 * 渲染 ECharts 图表
 */
const renderCharts = () => {
  // 饼图：社区分布
  const commDom = document.getElementById('communityChart')
  if (commDom) {
    const commChart = echarts.init(commDom)
    commChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
      legend: { bottom: '0' },
      series: [{
        name: '社区分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        data: realStats.value.communityData
      }]
    })
  }

  // 折线图：健康趋势
  const trendDom = document.getElementById('trendChart')
  if (trendDom) {
    const trendChart = echarts.init(trendDom)
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: { type: 'value', min: 60 },
      series: [{
        data: realStats.value.trendData,
        type: 'line',
        smooth: true,
        color: '#1890ff',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24,144,255,0.3)' },
            { offset: 1, color: 'rgba(24,144,255,0)' }
          ])
        }
      }]
    })
  }
}

onMounted(() => {
  fetchRealData();
})
</script>

<style scoped>
.data-statistics {
  padding: 24px;
}
.page-title {
  margin-bottom: 24px;
  font-weight: bold;
}
</style>