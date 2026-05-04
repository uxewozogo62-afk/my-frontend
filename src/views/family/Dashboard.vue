<template>
  <div class="dashboard-container">
    <div v-if="hasBinding" class="stats-content">
      <a-card title="实时监护状态" :bordered="false" class="status-card">
        <div class="elder-name">当前监护对象：<strong>{{ elderlyInfo.name }}</strong></div>
        
        <div class="warning-display" :class="warningLevel">
          <div class="level-label">预警等级</div>
          <div class="level-value">{{ getWarningText(warningLevel) }}</div>
        </div>

        <a-button type="primary" @click="goToHealthReport" block size="large">
          查看详细健康报表
        </a-button>
      </a-card>
    </div>

    <div v-else class="empty-state">
      <a-empty description="当前尚未关联老人设备">
        <p style="color: #999;">请前往左侧菜单【连接设备】完成绑定</p>
        <a-button type="primary" @click="$router.push('/family/devices')">
          去连接设备
        </a-button>
      </a-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import request from '../../utils/request';

const router = useRouter();
const hasBinding = ref(false);
const elderlyInfo = ref({});
const warningLevel = ref('low');
const userId = localStorage.getItem('userId');

const getWarningText = (level) => {
  const map = { 'low': '安全', 'medium': '注意', 'high': '紧急' };
  return map[level] || '未知';
};

const goToHealthReport = () => {
  if (elderlyInfo.value && elderlyInfo.value._id) {
    router.push({
      path: '/family/health',
      query: { id: elderlyInfo.value._id }
    });
  } else {
    router.push('/family/health');
  }
};

const checkStatus = async () => {
  if (!userId) return;
  try {
    const res = await request.get(`/family/my-elderly/${userId}`);
    if (res && res.length > 0) {
      hasBinding.value = true;
      elderlyInfo.value = res[0];
    } else {
      hasBinding.value = false;
    }
  } catch (e) { 
    console.error('检查绑定状态失败:', e);
    hasBinding.value = false;
  }
};

onMounted(() => {
  checkStatus();
  // 5秒自动刷新一次绑定状态
  const timer = setInterval(checkStatus, 5000);
  onUnmounted(() => clearInterval(timer));
});
</script>

<style scoped>
.status-card { text-align: center; max-width: 500px; margin: 40px auto; }
.elder-name { font-size: 18px; margin-bottom: 24px; }
.warning-display { 
  padding: 40px; border-radius: 12px; margin-bottom: 24px; 
  transition: all 0.3s;
}
.warning-display.low { background: #f6ffed; color: #52c41a; border: 2px solid #b7eb8f; }
.level-value { font-size: 48px; font-weight: bold; }
</style>
