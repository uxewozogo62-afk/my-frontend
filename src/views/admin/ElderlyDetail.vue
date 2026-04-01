<template>
  <div class="elderly-detail" v-if="!loading">
    <div class="detail-header" style="margin-bottom: 24px; display: flex; align-items: center; gap: 16px;">
      <a-button @click="$router.back()">返回列表</a-button>
      <h2 style="margin: 0;">老人详细档案：{{ elderlyInfo.name }}</h2>
    </div>
    
    <a-card class="basic-info-card" title="基本信息">
      <a-descriptions bordered :column="2">
        <a-descriptions-item label="姓名">{{ elderlyInfo.name }}</a-descriptions-item>
        <a-descriptions-item label="年龄">{{ elderlyInfo.age }} 岁</a-descriptions-item>
        <a-descriptions-item label="性别">{{ elderlyInfo.gender || '未录入' }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ elderlyInfo.phone }}</a-descriptions-item>
        <a-descriptions-item label="所属社区">{{ elderlyInfo.community }}</a-descriptions-item>
        <a-descriptions-item label="居住地址">
          {{ elderlyInfo.building || '' }} {{ elderlyInfo.room || '' }}
        </a-descriptions-item>
        <a-descriptions-item label="健康标签" :span="2">
          <a-tag v-for="tag in elderlyInfo.healthTags" :key="tag" color="blue">
            {{ tag }}
          </a-tag>
          <span v-if="!elderlyInfo.healthTags?.length" style="color: #bfbfbf;">暂无标签</span>
        </a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-row :gutter="16" style="margin-top: 24px;">
      <a-col :span="8">
        <a-card title="实时心率">
          <div style="font-size: 28px; color: #cf1322; font-weight: bold;">
            78 <small style="font-size: 14px;">bpm</small>
          </div>
          <div style="color: #52c41a; margin-top: 8px;">● 状态正常</div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="血氧浓度">
          <div style="font-size: 28px; color: #1890ff; font-weight: bold;">
            98 <small style="font-size: 14px;">%</small>
          </div>
          <div style="color: #52c41a; margin-top: 8px;">● 浓度优秀</div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="当前位置">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">
            {{ elderlyInfo.community }}内
          </div>
          <div style="color: #8c8c8c;">最后更新：刚刚</div>
        </a-card>
      </a-col>
    </a-row>
  </div>
  
  <div v-else style="text-align: center; padding: 100px;">
    <a-spin size="large" tip="正在调取云端档案..." />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
// 替换为统一的请求工具
import request from '../../utils/request'
import { message } from 'ant-design-vue'

const route = useRoute()
const loading = ref(true)
const elderlyInfo = ref({})

/**
 * 获取老人详细信息
 */
const fetchDetail = async () => {
  loading.value = true
  try {
    // 这里的 ID 是从路由参数中获取的
    const id = route.params.id
    // 拦截器已处理 code 判断和 data 剥离
    const data = await request.get(`/admin/elderly/${id}`)
    
    // 直接赋值给响应式变量
    elderlyInfo.value = data
  } catch (error) {
    // 拦截器会自动通过 message.error 弹出后端传回的错误信息
    console.error('获取详情失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (route.params.id) {
    fetchDetail()
  } else {
    message.error('未找到有效的老人 ID')
    loading.value = false
  }
})
</script>

<style scoped>
.elderly-detail {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}
.basic-info-card {
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
</style>