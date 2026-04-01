<template>
  <div class="doll-interaction">
    <h2 class="page-title">AI 伴侣互动</h2>
    
    <a-row :gutter="24">
      <a-col :span="14">
        <a-card title="发送互动" :bordered="false">
          <template #extra>
            <a-tag color="success">玩偶在线</a-tag>
          </template>
          
          <div class="interaction-modes">
            <a-tabs v-model:activeKey="activeMode">
              <a-tab-pane key="text" tab="文字推送">
                <a-textarea
                  v-model:value="messageText"
                  placeholder="输入想对老人说的话..."
                  :rows="6"
                />
              </a-tab-pane>
              <a-tab-pane key="voice" tab="语音互动">
                <div class="voice-center">
                  <div class="voice-icon" :class="{ 'is-recording': isRecording }">
                    <audio-outlined v-if="!isRecording" />
                    <span v-else class="recording-dot"></span>
                  </div>
                  <p>{{ isRecording ? '正在录音...' : '点击下方按钮录制语音' }}</p>
                  <a-button 
                    :type="isRecording ? 'danger' : 'primary'" 
                    shape="round" 
                    @click="toggleRecording"
                  >
                    {{ isRecording ? '停止并发送' : '开始录音' }}
                  </a-button>
                </div>
              </a-tab-pane>
            </a-tabs>
            
            <div class="submit-bar" v-if="activeMode === 'text'">
              <a-button type="primary" block size="large" @click="handleSend">
                推送给 AI 玩偶
              </a-button>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :span="10">
        <a-card title="互动轨迹" :bordered="false">
          <a-timeline>
            <a-timeline-item v-for="log in history" :key="log.id" :color="log.color">
              <p>{{ log.time }}</p>
              <p><strong>{{ log.content }}</strong></p>
              <span class="status-text">状态：{{ log.status }}</span>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { AudioOutlined } from '@ant-design/icons-vue';

const activeMode = ref('text');
const messageText = ref('');
const isRecording = ref(false);

// 初始历史数据
const history = ref([
  { id: 1, time: '10:00', content: '提醒老人按时吃药', status: '已送达', color: 'green' },
  { id: 2, time: '昨天', content: '语音：注意保暖', status: '已播放', color: 'blue' }
]);

const handleSend = () => {
  if (!messageText.value) return message.warning('请输入内容');
  
  const newMsg = {
    id: Date.now(),
    time: '刚刚',
    content: messageText.value,
    status: '传输中...',
    color: 'orange'
  };
  
  history.value.unshift(newMsg);
  message.success('已发送至 AI 玩偶');
  messageText.value = '';

  // 模拟2秒后状态改变
  setTimeout(() => {
    history.value[0].status = '已播放';
    history.value[0].color = 'green';
  }, 2000);
};

const toggleRecording = () => {
  if (!isRecording.value) {
    isRecording.value = true;
  } else {
    isRecording.value = false;
    messageText.value = '语音消息 (0:05)';
    handleSend();
  }
};
</script>

<style scoped>
.doll-interaction { padding: 24px; }
.voice-center { text-align: center; padding: 40px 0; }
.voice-icon { font-size: 48px; color: #bfbfbf; margin-bottom: 16px; transition: all 0.3s; }
.is-recording { color: #ff4d4f; transform: scale(1.2); }
.submit-bar { margin-top: 24px; }
.status-text { font-size: 12px; color: #999; }
.recording-dot {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: #ff4d4f;
  border-radius: 50%;
  animation: pulse 1s infinite;
}
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}
</style>