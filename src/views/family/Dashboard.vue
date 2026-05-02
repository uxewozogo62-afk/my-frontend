<template>
  <div class="dashboard-container">
    <!-- 如果有绑定老人，循环渲染列表 -->
    <div v-if="hasBinding" class="elderly-grid">
      <a-card 
        v-for="item in elderlyList" 
        :key="item._id" 
        :title="`监护对象：${item.name}`" 
        class="status-card"
      >
        <div class="card-content">
          <div class="info-row">
            <span class="label">年龄：</span>
            <span>{{ item.age || '未知' }} 岁</span>
          </div>
          
          <!-- 预警等级显示 -->
          <div class="warning-box" :class="item.warningLevel || 'low'">
            <div class="level-label">实时状态</div>
            <div class="level-value">{{ getWarningText(item.warningLevel || 'low') }}</div>
          </div>

          <div class="device-status">
            设备状态：
            <a-tag :color="item.deviceStatus === 'online' ? 'green' : 'red'">
              {{ item.deviceStatus === 'online' ? '在线' : '离线' }}
            </a-tag>
          </div>

          <a-button 
            type="primary" 
            block 
            @click="$router.push(`/family/health/${item._id}`)"
            style="margin-top: 16px;"
          >
            详情报表
          </a-button>
        </div>
      </a-card>
    </div>

    <!-- 无数据时的显示 -->
    <div v-else class="empty-state">
      <a-empty description="当前账号下未发现关联老人">
        <p>请确保数据库中 familyUserId 已正确设置为您的 ID</p>
        <a-button type="primary" @click="$router.push('/family/devices')">
          去连接设备
        </a-button>
      </a-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '../../utils/request';

const hasBinding = ref(false);
const elderlyList = ref([]); // 存储 13 个老人的数组

// 预警文字映射
const getWarningText = (level) => {
  const map = { 'low': '安全', 'medium': '注意', 'high': '紧急' };
  return map[level] || '未知';
};

const checkStatus = async () => {
  // 优先级：先尝试获取特定的 userId，否则从 userInfo 对象读取
  let userId = localStorage.getItem('userId');
  if (!userId || userId === 'null') {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    userId = userInfo._id;
  }

  if (!userId) {
    console.error("未发现有效的用户登录信息");
    return;
  }

  try {
    // 发送请求，注意路径必须包含 /api
    const res = await request.get(`/api/family/my-elderly/${userId}`);
    
    if (res && res.length > 0) {
      hasBinding.value = true;
      elderlyList.value = res; // 将完整的 13 人数组存入变量
      console.log(`成功加载 ${res.length} 位老人数据`);
    } else {
      hasBinding.value = false;
    }
  } catch (e) {
    console.error("获取数据失败:", e);
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

/* 网格布局，每行显示多个卡片 */
.elderly-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.status-card {
  border-radius: 8px;
  transition: all 0.3s;
}

.status-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.warning-box {
  padding: 20px;
  border-radius: 8px;
  margin: 16px 0;
  text-align: center;
}

.warning-box.low {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.level-value {
  font-size: 24px;
  font-weight: bold;
}

.empty-state {
  margin-top: 100px;
  text-align: center;
}
</style>
