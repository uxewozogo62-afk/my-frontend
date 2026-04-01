<template>
  <div class="location-info">
    <h2 class="page-title">位置信息监护</h2>
    
    <a-row :gutter="24">
      <a-col :span="16">
        <a-card class="map-card" title="实时定位">
          <template #extra>
            <a-badge status="processing" text="实时更新中" />
          </template>
          
          <div class="mock-map">
            <div class="map-overlay">
              <div class="user-marker">
                <div class="pulse"></div>
                <img src="https://plus.unsplash.com/premium_photo-1661764832354-9449f2b84a9e?w=100&h=100&fit=crop" class="avatar-marker" />
              </div>
              <div class="fence-circle"></div>
            </div>
            <div class="map-controls">
              <a-button-group>
                <a-button @click="handleZoomIn">+</a-button>
                <a-button @click="handleZoomOut">-</a-button>
              </a-button-group>
            </div>
          </div>

          <div class="location-details">
            <a-descriptions bordered size="small" :column="2">
              <a-descriptions-item label="当前详细地址" :span="2">
                广东省深圳市南山区粤海街道科苑路15号 (距离家约 500m)
              </a-descriptions-item>
              <a-descriptions-item label="最后更新时间">14:35:20</a-descriptions-item>
              <a-descriptions-item label="定位精度">GPS (高精度) 5米</a-descriptions-item>
              <a-descriptions-item label="电子围栏状态">
                <a-tag color="success">安全区域内</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="移动状态">
                <a-tag color="blue">静止</a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </div>
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card title="电子围栏" class="side-card">
          <div class="fence-settings">
            <div class="setting-item">
              <span>开启守护范围</span>
              <a-switch v-model:checked="fenceEnabled" size="small" />
            </div>
            <div class="setting-item">
              <span>中心点：</span>
              <span class="value-text">中心花园</span>
            </div>
            <div class="setting-item">
              <span>预警半径：</span>
              <a-select v-model:value="fenceRadius" size="small" style="width: 100px">
                <a-select-option value="500">500米</a-select-option>
                <a-select-option value="1000">1公里</a-select-option>
                <a-select-option value="2000">2公里</a-select-option>
              </a-select>
            </div>
          </div>
        </a-card>

        <a-card title="今日行动轨迹" class="side-card" style="margin-top: 24px">
          <a-timeline>
            <a-timeline-item color="green">
              <p>14:30 离开 中心公园</p>
            </a-timeline-item>
            <a-timeline-item color="blue">
              <p>12:15 停留 社区食堂 (45分钟)</p>
            </a-timeline-item>
            <a-timeline-item color="blue">
              <p>10:00 离开 居家住址</p>
            </a-timeline-item>
            <a-timeline-item color="gray">
              <p>08:00 监测到 晨练活动</p>
            </a-timeline-item>
          </a-timeline>
          <a-button block @click="showFullHistory">查看更多历史轨迹</a-button>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { message } from 'ant-design-vue';

// 静态状态控制
const fenceEnabled = ref(true);
const fenceRadius = ref('500');

// 模拟操作
const handleZoomIn = () => message.info('模拟地图放大');
const handleZoomOut = () => message.info('模拟地图缩小');
const showFullHistory = () => message.info('跳转至完整历史记录页面');

</script>

<style scoped>
.location-info { padding: 24px; }
.map-card { margin-bottom: 24px; }

/* 模拟地图样式 */
.mock-map {
  width: 100%;
  height: 450px;
  background: #e5e3df; /* 模拟地图底色 */
  background-image: 
    linear-gradient(#d1d1d1 1px, transparent 1px),
    linear-gradient(90deg, #d1d1d1 1px, transparent 1px);
  background-size: 50px 50px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
  border: 1px solid #d9d9d9;
}

.map-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.user-marker {
  position: relative;
  z-index: 2;
}

.avatar-marker {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
}

.pulse {
  position: absolute;
  width: 40px;
  height: 40px;
  background: rgba(24, 144, 255, 0.4);
  border-radius: 50%;
  animation: mapPulse 2s infinite;
  top: 0;
  left: 0;
}

@keyframes mapPulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(3); opacity: 0; }
}

.fence-circle {
  position: absolute;
  width: 260px;
  height: 260px;
  background: rgba(82, 196, 26, 0.1);
  border: 2px dashed #52c41a;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.map-controls {
  position: absolute;
  right: 20px;
  bottom: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.value-text { font-weight: bold; color: #1890ff; }
.side-card { border-radius: 12px; }
</style>