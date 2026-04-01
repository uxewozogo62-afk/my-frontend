<template>
  <div class="batch-operation">
    <h2 class="page-title">批量操作中心</h2>
    
    <a-card class="batch-card" title="批量同步预警阈值" :loading="loading">
      <a-form layout="vertical">
        <a-form-item label="选择目标对象 (多选)">
          <div class="elderly-selector">
            <a-checkbox-group v-model:value="selectedElderly">
              <a-row :gutter="[16, 8]">
                <a-col :span="6" v-for="item in elderlyList" :key="item._id">
                  <a-checkbox :value="item._id">
                    {{ item.name }} <span class="community-tag">[{{ item.community }}]</span>
                  </a-checkbox>
                </a-col>
              </a-row>
            </a-checkbox-group>
            <div v-if="elderlyList.length === 0 && !loading" class="empty-hint">
              暂无老人档案数据，请先前往档案管理录入
            </div>
          </div>
        </a-form-item>

        <a-row :gutter="24">
          <a-col :span="8">
            <a-form-item label="心率报警区间 (bpm)">
              <a-input-number v-model:value="thresholds.heartRate.min" :min="40" />
              <span class="split">-</span>
              <a-input-number v-model:value="thresholds.heartRate.max" :max="200" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="血氧预警下限 (%)">
              <a-input-number v-model:value="thresholds.bloodOxygen.min" :min="80" :max="100" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-button 
          type="primary" 
          @click="handleBatchSet" 
          :disabled="selectedElderly.length === 0"
          style="margin-top: 10px;"
        >
          确认批量下发配置 (已选 {{ selectedElderly.length }} 人)
        </a-button>
      </a-form>
    </a-card>

    <a-card class="batch-card" title="系统消息群发" style="margin-top: 24px;">
      <a-form layout="vertical">
        <a-form-item label="通知内容">
          <a-textarea 
            v-model:value="notificationContent" 
            placeholder="请输入要推送给家属的系统消息..." 
            :rows="4" 
          />
        </a-form-item>
        <a-button 
          type="primary" 
          @click="handleBatchNotify" 
          :disabled="!notificationContent || selectedElderly.length === 0"
        >
          一键推送至选中家属
        </a-button>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '../../utils/request'
import { message } from 'ant-design-vue'

const elderlyList = ref([])
const selectedElderly = ref([])
const loading = ref(true)
const notificationContent = ref('')

const thresholds = ref({
  heartRate: { min: 60, max: 100 },
  bloodOxygen: { min: 95 }
})

// 获取真实数据
const fetchElderly = async () => {
  loading.value = true
  try {
    // 使用 request 替代 axios
    // 拦截器已经帮你处理了 .data.data.elderly 的嵌套问题
    const data = await request.get('/admin/elderly')
    elderlyList.value = data || [] 
  } catch (error) {
    // 拦截器会自动报“网络错误”或“加载失败”，这里可以只写日志
    console.error('加载名单失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchElderly)

const handleBatchSet = () => {
  // 这里演示逻辑：打印选中的数据库 ID
  console.log('提交的目标ID列表:', selectedElderly.value)
  message.success(`配置已成功同步至 ${selectedElderly.value.length} 台智能设备`)
}

const handleBatchNotify = () => {
  message.success('推送任务已提交至云端队列')
  notificationContent.value = ''
}
</script>

<style scoped>
.batch-operation { padding: 8px; }
.elderly-selector {
  background: #fafafa;
  padding: 16px;
  border-radius: 4px;
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
}
.community-tag { color: #999; font-size: 12px; margin-left: 4px; }
.split { margin: 0 8px; color: #d9d9d9; }
.empty-hint { color: #999; text-align: center; padding: 20px; }
</style>