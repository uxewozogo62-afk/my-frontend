<template>
  <div class="connected-devices">
    <h2 class="page-title">设备管理与连接</h2>
    <a-card title="当前绑定的老人与手环" :bordered="false" class="device-card">
      <template #extra>
        <a-button type="primary" @click="showBindModal = true">
          <plus-outlined v-if="!hasBinding" />
          {{ hasBinding ? '更换/重新绑定' : '添加设备' }}
        </a-button>
      </template>
      <div v-if="hasBinding" class="device-display">
        <div class="device-header">
          <div class="device-main">
            <span class="device-icon">⌚</span>
            <div class="name-zone">
              <div class="device-name">智能监护手环</div>
              <div class="device-sn">序列号：{{ deviceInfo.device_id_str }}</div>
            </div>
          </div>
          <a-tag :color="deviceInfo.status === 'online' ? 'success' : 'default'">
            {{ deviceInfo.status === 'online' ? '在线' : '离线' }}
          </a-tag>
        </div>
        <a-divider />
        <div class="device-details">
          <a-row :gutter="[16, 24]">
            <a-col :span="12">
              <div class="detail-item">
                <span class="label">当前使用者</span>
                <span class="value">{{ deviceInfo.name }}</span>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <span class="label">设备电量</span>
                <a-progress :percent="deviceInfo.battery || 85" size="small" status="active" />
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <span class="label">固件版本</span>
                <span class="value">v1.2.4 (最新)</span>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <a-button size="small" @click="handleRestart" :disabled="deviceInfo.status !== 'online'">
                  远程重启设备
                </a-button>
              </div>
            </a-col>
          </a-row>
        </div>
      </div>
      <div v-else class="empty-device">
        <a-empty description="暂无连接中的设备">
          <p>请点击右上角按钮开始绑定老人与监护手环</p>
        </a-empty>
      </div>
    </a-card>
    <a-modal
      v-model:open="showBindModal"
      :title="hasBinding ? '更换绑定设备' : '绑定新设备'"
      @ok="handleFullSetup"
      :confirmLoading="confirmLoading"
      okText="确认提交"
      cancelText="取消"
    >
      <a-alert v-if="hasBinding" message="更换设备将覆盖原有的绑定关系" type="warning" show-icon style="margin-bottom: 20px;" />
      <a-form layout="vertical">
        <a-form-item label="老人姓名" required>
          <a-input v-model:value="form.name" placeholder="请输入老人姓名" />
        </a-form-item>
        <a-form-item label="设备序列号 (S/N)" required>
          <a-input v-model:value="form.deviceId" placeholder="请输入手环背面的 S/N 码" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="年龄"><a-input-number v-model:value="form.age" style="width: 100%" /></a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="您的关系"><a-input v-model:value="form.relation" placeholder="如：女儿" /></a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>
<script setup>
import { ref, onMounted, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import request from '../../utils/request';

const userId = localStorage.getItem('userId');
const hasBinding = ref(false);
const deviceInfo = ref({});
const showBindModal = ref(false);
const confirmLoading = ref(false);
const form = reactive({ name: '', age: 70, deviceId: '', relation: '亲属' });

// 获取数据
const fetchStatus = async () => {
  try {
    // 检查是否有用户ID
    if (!userId) return;

    // 发送请求
    const res = await request.get(`/family/my-elderly/${userId}`);
    
    // 调试打印：如果编译成功，你可以在浏览器 F12 看到这个
    console.log('数据返回成功:', res);

    // 适配拦截器剥离后的数据 (res 直接就是数组)
    if (res && Array.isArray(res) && res.length > 0) {
      hasBinding.value = true;
      const info = res[0];
      
      // 字段兼容性处理
      deviceInfo.value = {
        ...info,
        device_id_str: info.device_id_str || info.id || '无序列号'[cite: 4]
      };
      
      // 填充表单
      form.name = info.name || '';
      form.age = info.age || 70;
    } else {
      hasBinding.value = false;
    }
  } catch (e) {
    console.error('获取状态失败:', e);
    hasBinding.value = false;
  }
};

const handleFullSetup = async () => {
  if (!form.name || !form.deviceId) return message.warning('请填写必要信息');
  confirmLoading.value = true;
  try {
    await request.post('/family/full-setup', {
      elderly: { name: form.name, age: form.age },
      deviceId: form.deviceId,
      userId: userId,
      relation: form.relation
    });
    message.success('操作成功！');
    showBindModal.value = false;
    fetchStatus(); // 刷新当前页
  } catch (e) {
    message.error('操作失败，请重试');
  } finally {
    confirmLoading.value = false;
  }
};

const handleRestart = () => message.success('指令已发送');
onMounted(fetchStatus);
</script>
<style scoped>
.connected-devices { padding: 24px; }
.page-title { font-size: 24px; font-weight: bold; margin-bottom: 24px; color: #333; }
.device-card { box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-radius: 8px; }
.device-header { display: flex; justify-content: space-between; align-items: flex-start; }
.device-main { display: flex; align-items: center; gap: 15px; }
.device-icon { font-size: 32px; background: #e6f7ff; padding: 10px; border-radius: 50%; }
.device-name { font-size: 18px; font-weight: bold; color: #333; }
.device-sn { color: #999; font-size: 13px; }
.detail-item { display: flex; flex-direction: column; gap: 5px; }
.label { color: #8c8c8c; font-size: 13px; }
.value { font-weight: 500; font-size: 15px; }
.empty-device { padding: 40px 0; }
</style>
