<template>
  <div class="emergency-contact">
    <div class="header-section" style="margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <h2 style="margin: 0; font-weight: bold;">紧急预警与联系人管理</h2>
        <a-badge status="processing" text="体征实时扫描中" />
      </div>
      <a-button type="primary" @click="loadEmergencyData" :loading="loading">
        立即刷新数据
      </a-button>
    </div>

    <a-row :gutter="16" style="margin-bottom: 24px;">
      <a-col :span="24">
        <a-card size="small" :headStyle="{ background: '#fff1f0' }">
          <a-statistic 
            title="当前检测到异常人数" 
            :value="alertList.length" 
            :value-style="{ color: alertList.length > 0 ? '#cf1322' : '#3f963f' }" 
          />
        </a-card>
      </a-col>
    </a-row>

    <a-card title="待处理预警名单" :loading="loading">
      <a-table :columns="columns" :data-source="alertList" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'level'">
            <a-tag :color="record.level === 'high' ? 'red' : (record.level === 'medium' ? 'orange' : 'blue')">
              {{ record.level === 'high' ? '高危' : (record.level === 'medium' ? '注意' : '提示') }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="primary" size="small" @click="handleCall(record)">
                拨打紧急电话
              </a-button>
              <a-button size="small" @click="markResolved(record.id)">
                标记已处理
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../../utils/request'
import { message, Modal } from 'ant-design-vue'

const loading = ref(false)
const alertList = ref([])
// 删除了 resolvedCount 定义

const columns = [
  { title: '老人姓名', dataIndex: 'name', key: 'name' },
  { title: '预警事件', dataIndex: 'title', key: 'title' },
  { title: '详情', dataIndex: 'description', key: 'description' },
  { title: '严重程度', key: 'level' },
  { title: '联系人', dataIndex: 'contactName', key: 'contactName' },
  { title: '联系电话', dataIndex: 'contactPhone', key: 'contactPhone' },
  { title: '操作', key: 'action' }
]

const loadEmergencyData = async () => {
  loading.value = true
  try {
    const [warnings, elderlyList] = await Promise.all([
      request.get('/admin/warnings/unresolved'),
      request.get('/admin/elderly')
    ])

    alertList.value = warnings.map(w => {
      const person = elderlyList.find(p => p._id == w.elderly_id) || {}
      return {
        id: w._id, 
        name: person.name || '未知老人',
        title: w.title,
        description: w.description,
        level: w.severity, 
        contactName: person.emergency_contact || '未录入',
        contactPhone: person.emergency_phone || '未录入'
      }
    })
  } catch (err) {
    console.error('紧急数据同步失败:', err)
  } finally {
    loading.value = false
  }
}

const markResolved = async (id) => {
  try {
    await request.post(`/admin/warnings/resolve/${id}`)
    alertList.value = alertList.value.filter(item => item.id !== id)
    // 删除了 resolvedCount++ 逻辑
    message.success('预警已归档')
  } catch (err) {
    message.error('操作失败')
  }
}

const handleCall = (record) => {
  Modal.confirm({
    title: `呼叫确认`,
    content: `确认拨打 ${record.name} 的紧急联系人 ${record.contactName} (${record.contactPhone})？`,
    onOk() { message.success('通话已建立') }
  })
}

onMounted(loadEmergencyData)
</script>

<style scoped>
.emergency-contact {
  padding: 24px;
}
</style>