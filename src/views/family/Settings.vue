<template>
  <div class="settings">
    <h2 class="page-title">设置</h2>
    
    <!-- 设置标签页 -->
    <a-tabs v-model:active-key="activeTab">
      <!-- 基础账号安全 -->
      <a-tab-pane key="account" tab="基础账号安全">
        <a-card class="settings-card">
          <a-form layout="vertical">
            <a-form-item label="修改密码">
              <a-button type="primary" @click="openPasswordModal">修改密码</a-button>
            </a-form-item>
            <a-form-item label="修改手机号">
              <a-button type="primary" @click="openPhoneModal">修改手机号</a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-tab-pane>
      
      <!-- 消息通知 -->
      <a-tab-pane key="notification" tab="消息通知">
        <a-card class="settings-card">
          <a-form layout="vertical">
            <a-form-item label="预警推送方式">
              <a-checkbox-group v-model:value="notificationSettings.pushMethods">
                <a-checkbox value="sms">短信</a-checkbox>
                <a-checkbox value="app">APP推送</a-checkbox>
                <a-checkbox value="email">邮件</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
            <a-form-item label="推送频率">
              <a-select v-model:value="notificationSettings.frequency">
                <a-option value="realtime">实时</a-option>
                <a-option value="daily">每日汇总</a-option>
                <a-option value="weekly">每周汇总</a-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="saveNotificationSettings">保存设置</a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-tab-pane>
      
      <!-- 隐私设置 -->
      <a-tab-pane key="privacy" tab="隐私设置">
        <a-card class="settings-card">
          <a-form layout="vertical">
            <a-form-item label="位置信息">
              <a-switch v-model:checked="privacySettings.location" />
              <span class="switch-label">允许获取位置信息</span>
            </a-form-item>
            <a-form-item label="健康数据">
              <a-switch v-model:checked="privacySettings.healthData" />
              <span class="switch-label">允许共享健康数据</span>
            </a-form-item>
            <a-form-item label="设备数据">
              <a-switch v-model:checked="privacySettings.deviceData" />
              <span class="switch-label">允许收集设备数据</span>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="savePrivacySettings">保存设置</a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-tab-pane>
      
      <!-- 监护设置 -->
      <a-tab-pane key="monitoring" tab="监护设置">
        <a-card class="settings-card">
          <a-form layout="vertical">
            <a-form-item label="预警阈值设置">
              <div class="threshold-item">
                <span class="threshold-label">心率：</span>
                <a-input-number v-model:value="monitoringSettings.heartRate.min" style="width: 80px;" /> - 
                <a-input-number v-model:value="monitoringSettings.heartRate.max" style="width: 80px;" />
                <span class="threshold-unit">bpm</span>
              </div>
              <div class="threshold-item">
                <span class="threshold-label">血氧：</span>
                <a-input-number v-model:value="monitoringSettings.bloodOxygen.min" style="width: 80px;" /> - 
                <a-input-number v-model:value="monitoringSettings.bloodOxygen.max" style="width: 80px;" />
                <span class="threshold-unit">%</span>
              </div>
              <div class="threshold-item">
                <span class="threshold-label">体温：</span>
                <a-input-number v-model:value="monitoringSettings.bodyTemperature.min" style="width: 80px;" :step="0.1" /> - 
                <a-input-number v-model:value="monitoringSettings.bodyTemperature.max" style="width: 80px;" :step="0.1" />
                <span class="threshold-unit">°C</span>
              </div>
            </a-form-item>
            <a-form-item label="电子围栏范围">
              <a-slider v-model:value="monitoringSettings.fenceRadius" :min="50" :max="1000" :step="50" />
              <div class="slider-value">{{ monitoringSettings.fenceRadius }}米</div>
            </a-form-item>
            <a-form-item label="服药提醒时间">
              <a-time-picker v-model:value="monitoringSettings.medicationTime" style="width: 150px;" />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="saveMonitoringSettings">保存设置</a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-tab-pane>
      
      <!-- 玩偶设置 -->
      <a-tab-pane key="doll" tab="玩偶设置">
        <a-card class="settings-card">
          <a-form layout="vertical">
            <a-form-item label="音量">
              <a-slider v-model:value="dollSettings.volume" :min="0" :max="100" />
              <div class="slider-value">{{ dollSettings.volume }}%</div>
            </a-form-item>
            <a-form-item label="问候频率">
              <a-select v-model:value="dollSettings.greetingFrequency">
                <a-option value="high">高频</a-option>
                <a-option value="medium">中频</a-option>
                <a-option value="low">低频</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="偏好标签">
              <a-tag v-for="tag in dollSettings.preferenceTags" :key="tag" closable @close="removeTag(tag)">
                {{ tag }}
              </a-tag>
              <a-input
                v-model:value="newTag"
                placeholder="输入标签后按回车添加"
                @keyup.enter="addTag"
                style="width: 200px; margin-left: 8px;"
              />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="saveDollSettings">保存设置</a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-tab-pane>
      
      <!-- 快捷联系人 -->
      <a-tab-pane key="contacts" tab="快捷联系人">
        <a-card class="settings-card">
          <div class="contacts-list">
            <div class="contact-item" v-for="(contact, index) in contacts" :key="index">
              <div class="contact-info">
                <div class="contact-name">{{ contact.name }}</div>
                <div class="contact-phone">{{ contact.phone }}</div>
              </div>
              <div class="contact-actions">
                <a-button @click="editContact(index)">编辑</a-button>
                <a-button danger @click="deleteContact(index)">删除</a-button>
              </div>
            </div>
          </div>
          <div class="add-contact">
            <a-button type="primary" @click="openAddContactModal">添加联系人</a-button>
          </div>
        </a-card>
      </a-tab-pane>
    </a-tabs>
    
    <!-- 修改密码模态框 -->
    <a-modal
      title="修改密码"
      v-model:open="passwordModalVisible"
      @ok="savePassword"
      @cancel="passwordModalVisible = false"
    >
      <a-form layout="vertical">
        <a-form-item label="旧密码">
          <a-input-password v-model:value="passwordForm.oldPassword" />
        </a-form-item>
        <a-form-item label="新密码">
          <a-input-password v-model:value="passwordForm.newPassword" />
        </a-form-item>
        <a-form-item label="确认新密码">
          <a-input-password v-model:value="passwordForm.confirmPassword" />
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 修改手机号模态框 -->
    <a-modal
      title="修改手机号"
      v-model:open="phoneModalVisible"
      @ok="savePhone"
      @cancel="phoneModalVisible = false"
    >
      <a-form layout="vertical">
        <a-form-item label="新手机号">
          <a-input v-model:value="phoneForm.newPhone" />
        </a-form-item>
        <a-form-item label="验证码">
          <a-input v-model:value="phoneForm.code" />
          <a-button type="primary" style="margin-left: 8px;">获取验证码</a-button>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 添加联系人模态框 -->
    <a-modal
      title="添加联系人"
      v-model:open="addContactModalVisible"
      @ok="saveContact"
      @cancel="addContactModalVisible = false"
    >
      <a-form layout="vertical">
        <a-form-item label="姓名">
          <a-input v-model:value="contactForm.name" />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input v-model:value="contactForm.phone" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Tabs, Card, Form, Input, Button, Switch, Select, Checkbox, InputNumber, Slider, Tag, Modal, TimePicker } from 'ant-design-vue'


// 激活的标签页
const activeTab = ref('account')

// 密码修改表单
const passwordModalVisible = ref(false)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 手机号修改表单
const phoneModalVisible = ref(false)
const phoneForm = ref({
  newPhone: '',
  code: ''
})

// 消息通知设置
const notificationSettings = ref({
  pushMethods: ['sms', 'app'],
  frequency: 'realtime'
})

// 隐私设置
const privacySettings = ref({
  location: true,
  healthData: true,
  deviceData: true
})

// 监护设置
const monitoringSettings = ref({
  heartRate: {
    min: 60,
    max: 100
  },
  bloodOxygen: {
    min: 95,
    max: 100
  },
  bodyTemperature: {
    min: 36.0,
    max: 37.3
  },
  fenceRadius: 200,
  medicationTime: null
})

// 玩偶设置
const dollSettings = ref({
  volume: 70,
  greetingFrequency: 'medium',
  preferenceTags: ['音乐', '散步', '聊天']
})

const newTag = ref('')

// 联系人列表
const contacts = ref([
  { name: '张三', phone: '13800138000' },
  { name: '李四', phone: '13900139000' }
])

// 添加联系人表单
const addContactModalVisible = ref(false)
const contactForm = ref({
  name: '',
  phone: ''
})

// 方法
const openPasswordModal = () => {
  passwordModalVisible.value = true
}

const savePassword = () => {
  console.log('保存密码:', passwordForm.value)
  passwordModalVisible.value = false
}

const openPhoneModal = () => {
  phoneModalVisible.value = true
}

const savePhone = () => {
  console.log('保存手机号:', phoneForm.value)
  phoneModalVisible.value = false
}

const saveNotificationSettings = () => {
  console.log('保存消息通知设置:', notificationSettings.value)
}

const savePrivacySettings = () => {
  console.log('保存隐私设置:', privacySettings.value)
}

const saveMonitoringSettings = () => {
  console.log('保存监护设置:', monitoringSettings.value)
}

const addTag = () => {
  if (newTag.value && !dollSettings.value.preferenceTags.includes(newTag.value)) {
    dollSettings.value.preferenceTags.push(newTag.value)
    newTag.value = ''
  }
}

const removeTag = (tag: string) => {
  dollSettings.value.preferenceTags = dollSettings.value.preferenceTags.filter(t => t !== tag)
}

const saveDollSettings = () => {
  console.log('保存玩偶设置:', dollSettings.value)
}

const openAddContactModal = () => {
  addContactModalVisible.value = true
}

const saveContact = () => {
  if (contactForm.value.name && contactForm.value.phone) {
    contacts.value.push({ ...contactForm.value })
    contactForm.value = { name: '', phone: '' }
    addContactModalVisible.value = false
  }
}

const editContact = (index: number) => {
  console.log('编辑联系人:', index)
}

const deleteContact = (index: number) => {
  contacts.value.splice(index, 1)
}
</script>

<style scoped>
.settings {
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

.settings-card {
  margin-bottom: 24px;
}

.switch-label {
  margin-left: 8px;
  font-size: 16px;
  color: #666;
}

.threshold-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.threshold-label {
  font-size: 16px;
  color: #666;
  width: 80px;
}

.threshold-unit {
  font-size: 14px;
  color: #666;
  margin-left: 8px;
}

.slider-value {
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}

.contacts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.contact-info {
  flex: 1;
}

.contact-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.contact-phone {
  font-size: 14px;
  color: #666;
}

.contact-actions {
  display: flex;
  gap: 8px;
}

.add-contact {
  text-align: right;
}
</style>