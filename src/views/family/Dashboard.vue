<template>
  <div class="dashboard-container">
    <!-- 状态 A：已关联老人，显示实时监护卡片 -->
    <div v-if="hasBinding" class="stats-content">
      <a-card title="实时监护状态" :bordered="false" class="status-card">
        <div class="elder-name">
          当前监护对象：<strong>{{ elderlyInfo.name }}</strong>
        </div>
        
        <div class="warning-display" :class="warningLevel">
          <div class="level-label">预警等级</div>
          <div class="level-value">{{ getWarningText(warningLevel) }}</div>
        </div>

        <div class="info-details">
          <p>年龄：{{ elderlyInfo.age }} 岁</p>
          <p>设备状态：
            <a-tag :color="elderlyInfo.deviceStatus === 'online' ? 'green' : 'red'">
              {{ elderlyInfo.deviceStatus === 'online' ? '在线' : '离线' }}
            </a-tag>
          </p>
        </div>

        <a-button type="primary" @click="$router.push('/family/health')" block size="large">
          查看详细健康报表
        </a-button>
      </a-card>
    </div>

    <!-- 状态 B：尚未关联老人，显示空状态 -->
    <div v-else class="empty-state">
      <a-empty description="当前尚未关联老人设备">
        <p style="color: #999;">请确认数据库中该家属已绑定老人，或前往【连接设备】完成绑定</p>
        <a-button type="primary" @click="$router.push('/family/devices')">
          去连接设备
        </a-button>
      </a-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// 导入你补全后的 API 对象[cite: 8]
import { familyApi } from '../../api/index_4'; 

const hasBinding = ref(false);
const elderlyInfo = ref({});
const warningLevel = ref('low'); // 默认正常
const userId = localStorage.getItem('userId');

/**
 * 翻译预警等级文字
 */
const getWarningText = (level) => {
  const map = { 'low': '安全', 'medium': '注意', 'high': '紧急' };
  return map[level] || '未知';
};

/**
 * 核心逻辑：检查绑定状态并加载数据
 */
const checkStatus = async () => {
  // 1. 验证 userId 存在性，防止 Network 出现 "null" 请求[cite: 8]
  if (!userId || userId === 'null') {
    console.warn("未发现登录用户 ID，请重新登录");
    hasBinding.value = false;
    return;
  }

  try {
    // 2. 调用 familyApi，它会自动拼接成 /api/family/my-elderly/6[cite: 8]
    const res = await familyApi.getMyElderly(userId);
    
    // 3. 判断返回数据[cite: 6, 9]
    if (res && res.length > 0) {
      hasBinding.value = true;
      // 默认取第一个老人（如张建国）进行展示
      elderlyInfo.value = res[0]; 
      console.log('老人数据加载成功:', res);
    } else {
      // 如果数据库返回 []，说明该用户下确实没老人
      hasBinding.value = false;
    }
  } catch (e) { 
    console.error('获取老人数据失败，请检查后端路由或 Network 面板:', e);
    hasBinding.value = false; 
  }
};

onMounted(checkStatus);
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}
.status-card { 
  text-align: center; 
  max-width: 500px; 
  margin: 40px auto; 
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.elder-name { font-size: 20px; margin-bottom: 24px; }
.warning-display { 
  padding: 40px; 
  border-radius: 12px; 
  margin-bottom: 24px; 
  transition: all 0.3s;
}
/* 正常状态颜色 */
.warning-display.low { 
  background: #f6ffed; 
  color: #52c41a; 
  border: 2px solid #b7eb8f; 
}
.level-value { font-size: 48px; font-weight: bold; }
.info-details {
  margin-bottom: 24px;
  color: #666;
  line-height: 2;
}
.empty-state {
  margin-top: 100px;
}
</style>
