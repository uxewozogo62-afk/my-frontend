<template>
  <div class="history-record">
    <h2 class="page-title">历史监控记录</h2>
    
    <!-- 筛选条件 -->
    <a-card class="filter-card">
      <div class="filter-content">
        <div class="filter-item">
          <span class="filter-label">日期范围：</span>
          <a-range-picker v-model:value="dateRange" />
        </div>
        <div class="filter-item">
          <span class="filter-label">记录类型：</span>
          <a-select v-model:value="recordType" style="width: 150px;">
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="warning">预警记录</a-select-option>
            <a-select-option value="system">系统提示</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">预警等级：</span>
          <a-select v-model:value="warningLevel" style="width: 150px;">
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="low">低</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="high">高</a-select-option>
          </a-select>
        </div>
        <div class="filter-actions">
          <a-button type="primary" @click="searchRecords">查询</a-button>
          <a-button @click="resetFilters">重置</a-button>
        </div>
      </div>
    </a-card>
    
    <!-- 记录列表 -->
    <a-card class="records-card" title="记录列表">
      <a-table :columns="columns" :data-source="filteredRecords" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            {{ record.type === 'warning' ? '预警记录' : '系统提示' }}
          </template>
          <template v-if="column.key === 'level'">
            <span :class="['level-text', record.level]">{{ getLevelText(record.level) }}</span>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">{{ record.statusText }}</a-tag>
          </template>
          <template v-if="column.key === 'result'">
            <span v-if="record.result">{{ record.result }}</span>
            <span v-else>-</span>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 模拟数据
const records = ref([
  {
    id: 1,
    type: 'warning',
    level: 'medium',
    title: '心率异常',
    content: '老人心率持续偏高，当前值为105bpm',
    time: '2026-03-18 14:25:30',
    status: 'handled',
    statusText: '已处理',
    result: '家属确认，已联系老人'
  },
  {
    id: 2,
    type: 'system',
    level: 'low',
    title: '设备连接',
    content: '手环已成功连接',
    time: '2026-03-18 10:15:20',
    status: 'normal',
    statusText: '正常',
    result: ''
  },
  {
    id: 3,
    type: 'warning',
    level: 'high',
    title: '跌倒检测',
    content: '检测到老人跌倒，位置在客厅',
    time: '2026-03-17 18:30:45',
    status: 'handled',
    statusText: '已处理',
    result: '社区网格员已介入'
  },
  {
    id: 4,
    type: 'system',
    level: 'low',
    title: '服药提醒',
    content: '提醒老人服用降压药',
    time: '2026-03-17 08:00:00',
    status: 'normal',
    statusText: '正常',
    result: ''
  },
  {
    id: 5,
    type: 'warning',
    level: 'low',
    title: '睡眠不足',
    content: '老人昨晚睡眠时长不足6小时',
    time: '2026-03-17 06:30:00',
    status: 'pending',
    statusText: '待处理',
    result: ''
  }
])

// 筛选条件
const dateRange = ref<any>([])
const recordType = ref('all')
const warningLevel = ref('all')

// 表格列定义
const columns = [
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content'
  },
  {
    title: '预警等级',
    dataIndex: 'level',
    key: 'level'
  },
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '处理结果',
    dataIndex: 'result',
    key: 'result'
  }
]

// 过滤记录
const filteredRecords = computed(() => {
  return records.value.filter(record => {
    // 类型过滤
    if (recordType.value !== 'all' && record.type !== recordType.value) {
      return false
    }
    // 预警等级过滤
    if (warningLevel.value !== 'all' && record.level !== warningLevel.value) {
      return false
    }
    // 时间范围过滤
    if (dateRange.value && dateRange.value.length === 2) {
      const recordTime = new Date(record.time)
      const start = dateRange.value[0]
      const end = dateRange.value[1]
      if (recordTime < start || recordTime > end) {
        return false
      }
    }
    return true
  })
})

// 方法
const searchRecords = () => {
  console.log('查询记录', { dateRange: dateRange.value, recordType: recordType.value, warningLevel: warningLevel.value })
}

const resetFilters = () => {
  dateRange.value = []
  recordType.value = 'all'
  warningLevel.value = 'all'
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    handled: 'green',
    normal: 'blue',
    pending: 'orange'
  }
  return colorMap[status] || 'default'
}

const getLevelText = (level: string) => {
  const levelMap: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return levelMap[level] || '-'
}
</script>

<style scoped>
.history-record {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.page-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 16px 0;
  color: #333;
}
.filter-card {
  margin-bottom: 24px;
}
.filter-content {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}
.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-label {
  font-size: 16px;
  color: #666;
  white-space: nowrap;
}
.filter-actions {
  margin-left: auto;
  display: flex;
  gap: 16px;
}
.records-card {
  margin-bottom: 24px;
}
.level-text.high {
  color: #f5222d;
  font-weight: bold;
}
.level-text.medium {
  color: #faad14;
}
.level-text.low {
  color: #52c41a;
}
</style>